package com.apigateway.api_management.service;

import com.apigateway.api_management.dto.requestdto.HeaderRuleRequest;
import com.apigateway.api_management.dto.requestdto.RouteRequest;
import com.apigateway.api_management.dto.requestdto.RouteStatusRequest;
import com.apigateway.api_management.dto.responsedto.AuditRecordResponse;
import com.apigateway.api_management.dto.responsedto.RouteResponse;
import com.apigateway.api_management.dto.responsedto.RouteVersionResponse;
import com.apigateway.api_management.entity.*;
import com.apigateway.api_management.exception.ApiException;
import com.apigateway.api_management.repository.ApiRouteRepository;
import com.apigateway.api_management.repository.ControlPlaneAuditRecordRepository;
import com.apigateway.api_management.repository.RouteConfigurationVersionRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RouteService {
    private final ApiRouteRepository apiRouteRepository;
    private final TenantContext  tenantContext;
    private final ObjectMapper objectMapper;
    private final RouteConfigurationVersionRepository routeConfigurationVersionRepository;
    private final AuditService auditService;
    private final ControlPlaneAuditRecordRepository auditRecordRepository;
    public RouteService(ApiRouteRepository apiRouteRepository, TenantContext tenantContext, ObjectMapper objectMapper, RouteConfigurationVersionRepository routeConfigurationVersionRepository, AuditService auditService, ControlPlaneAuditRecordRepository auditRecordRepository) {
        this.apiRouteRepository = apiRouteRepository;
        this.tenantContext = tenantContext;
        this.objectMapper = objectMapper;
        this.routeConfigurationVersionRepository = routeConfigurationVersionRepository;
        this.auditService = auditService;
        this.auditRecordRepository = auditRecordRepository;
    }

    @Transactional
    public RouteResponse create(@Valid RouteRequest request) {
        long startedAt = System.nanoTime();
        Organizations organizations = tenantContext.getOrganization();

        validate(request, organizations);

        if(apiRouteRepository.existsByOrganization_IdAndRouteId(organizations.getId(), request.getRouteId())){
            throw new ApiException(HttpStatus.CONFLICT, "Route ID already exists for this organization");
        }

        ApiRoute route = new ApiRoute();
        route.setOrganization(organizations);
        route.setConfigurationVersion(1L);
        route.setCreatedAt(LocalDateTime.now());

        apply(route, request);
        apiRouteRepository.save(route);

        saveVersion(route, "CREATED");

        auditService.record(organizations,
                "CREATE_ROUTE",
                "API_ROUTE",
                route.getId().toString(),
                startedAt, "Route created: " + route.getRouteId()
        );
        return RouteResponse.from(route);

    }
    @Transactional(readOnly = true)
    public List<RouteResponse> findAllForTenant() {
        Organizations organization = tenantContext.getOrganization();
        return toResponse(apiRouteRepository.findAllByOrganizationId(organization.getId()));
    }

    @Transactional(readOnly = true)
    public RouteResponse findById(Long id) {
        Organizations organization = tenantContext.getOrganization();
        return RouteResponse.from(getOwnedRoute(id, organization.getId()));
    }

    @Transactional
    public RouteResponse update(Long id, @Valid RouteRequest request) {
        long startedAt = System.nanoTime();

        Organizations organization = tenantContext.getOrganization();
        ApiRoute route = getOwnedRoute(id, organization.getId());

        if(!route.getRouteId().equals(request.getRouteId())){
            throw new ApiException(HttpStatus.BAD_REQUEST, "routeId cannot be changed");
        }

        validate(request, organization);

        route.setConfigurationVersion(route.getConfigurationVersion() + 1);

        apply(route, request);

        saveVersion(route, "UPDATED");

        auditService.record(organization,
                "UPDATE_ROUTE",
                "API_ROUTE",
                route.getId().toString(),
                startedAt, "Route updated: " + route.getRouteId()
        );
        return  RouteResponse.from(route);
    }

    @Transactional
    public RouteResponse changeStatus(Long id, RouteStatusRequest request) {
        long startedAt = System.nanoTime();
        Organizations organization = tenantContext.getOrganization();
        ApiRoute route = getOwnedRoute(id, organization.getId());

        route.setActive(request.getActive());
        route.setConfigurationVersion(route.getConfigurationVersion() + 1);
        route.setUpdatedAt(LocalDateTime.now());

        String changeType = request.getActive() ? "ACTIVATED"  : "DEACTIVATED";
        saveVersion(route, changeType);

        auditService.record(organization,
                "CHANGE_ROUTE_STATUS",
                "API_ROUTE",
                route.getId().toString(),
                startedAt, "Route status changed to " + changeType
        );
        return RouteResponse.from(route);
    }
    @Transactional
    public void delete(Long id) {
        long startedAt = System.nanoTime();

        Organizations organization = tenantContext.getOrganization();
        ApiRoute route = getOwnedRoute(id, organization.getId());

        route.setConfigurationVersion(route.getConfigurationVersion() + 1);
        route.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization,
                "DELETE_ROUTE",
                "API_ROUTE",
                route.getId().toString(),
                startedAt, "Route deleted: " + route.getRouteId()
        );

        apiRouteRepository.delete(route);
    }

    private void validate(RouteRequest request, Organizations organizations) {
        String tenantPrefix = "/" + organizations.getSlug() + "/";

        if(!request.getPathPattern().startsWith(tenantPrefix)){
            throw new ApiException(HttpStatus.BAD_REQUEST, "Path patern must start with tenant prefix" + tenantPrefix);
        }

        if(!request.getTargetPathPrefix().startsWith("/")){
            throw new ApiException(HttpStatus.BAD_REQUEST, "TargetPathPrefix must start with /");
        }

        try{
            URI uri = URI.create(request.getTargetBaseUrl());
            if(!"http".equalsIgnoreCase(uri.getScheme()) && !"https".equalsIgnoreCase(uri.getScheme())){
                throw new IllegalArgumentException();
            }
        }
        catch(IllegalArgumentException e){
            throw new ApiException(HttpStatus.BAD_REQUEST, "TargetBaseUrl must be a valid HTTP or HTTPS URL");
        }

        normalizeMethods(request.getAllowedMethods());

        for(HeaderRuleRequest rule : request.getHeaderRules()){
            String direction = rule.getDirection().toUpperCase(Locale.ENGLISH);
            String action = rule.getAction().toUpperCase(Locale.ENGLISH);

            if(!"REQUEST".equals(direction) && !"RESPONSE".equals(direction)){
                throw new ApiException(HttpStatus.BAD_REQUEST, "Header direction must be REQUEST or RESPONSE");
            }

            if(!"ADD".equals(action) && !"REMOVE".equals(action)){
                throw new ApiException(HttpStatus.BAD_REQUEST, "Header action must be ADD or REMOVE");
            }

            if("ADD".equals(action) && (rule.getHeaderValue() == null || rule.getHeaderValue().trim().isEmpty())){
                throw new ApiException(HttpStatus.BAD_REQUEST, "ADD header rules require headerValue");
            }
        }
    }

    private ApiRoute getOwnedRoute(Long id, Long orgid) {
        return apiRouteRepository.findByIdAndOrganizationId(id, orgid)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Route not found"));
    }

    private List<RouteResponse> toResponse(List<ApiRoute> routes) {
        List<RouteResponse> response = new ArrayList<>();
        for(ApiRoute route : routes){
            response.add(RouteResponse.from(route));
        }
        return response;
    }

    private Set<String> normalizeMethods(Set<String> methods) {
        Set<String> normalized = new HashSet<>();
        for(String method : methods){
            String value = method.toUpperCase(Locale.ENGLISH);
            try{
                HttpMethod.valueOf(value);
            }
            catch(IllegalArgumentException e){
                throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported HTTP or HTTPS" + method);
            }
            normalized.add(value);
        }
        return normalized;
    }

    private void apply(ApiRoute route, RouteRequest request) {
        route.setRouteId(request.getRouteId());
        route.setName(request.getName());
        route.setPathPattern(request.getPathPattern());
        route.setTargetBaseUrl(request.getTargetBaseUrl());
        route.setTargetPathPrefix(request.getTargetPathPrefix());
        route.setRequestsPerMinute(request.getRequestsPerMinute());
        route.setResponseTimeoutMs(request.getResponseTimeoutMs());
        route.setIdempotencyEnabled(request.isIdempotencyEnabled());
        route.setActive(request.isActive());
        route.setUpdatedAt(LocalDateTime.now());
        route.setAllowedMethods(normalizeMethods(request.getAllowedMethods()));

        route.getHeaderRules().clear();
        for(HeaderRuleRequest ruleRequest : request.getHeaderRules()) {
            RouteHeaderRule rule = new RouteHeaderRule();
            rule.setRoute(route);
            rule.setDirection(ruleRequest.getDirection().toUpperCase(Locale.ENGLISH));
            rule.setAction(ruleRequest.getAction().toUpperCase(Locale.ENGLISH));
            rule.setHeaderName(ruleRequest.getHeaderName());
            rule.setHeaderValue(ruleRequest.getHeaderValue());
            rule.setCreatedAt(LocalDateTime.now());
            rule.setUpdatedAt(LocalDateTime.now());
            route.getHeaderRules().add(rule);
        }
    }

    private void saveVersion(ApiRoute route, String changeType) {
        RouteConfigurationVersion version = new RouteConfigurationVersion();

        version.setChangeType(changeType);
        version.setRouteId(route.getRouteId());
        version.setOrganizations(route.getOrganization());
        version.setVersionNumber(route.getConfigurationVersion());
        version.setConfigurationSnapshot(objectMapper.writeValueAsString(RouteResponse.from(route)));
        version.setCreatedAt(LocalDateTime.now());

        routeConfigurationVersionRepository.save(version);
    }

    @Transactional(readOnly = true)
    public List<RouteVersionResponse> getVersions(String routeId) {
        Organizations organization = tenantContext.getOrganization();

        List<RouteVersionResponse> response = new ArrayList <>();
        List<RouteConfigurationVersion> versions = routeConfigurationVersionRepository
                .findAllByOrganizations_IdAndRouteIdOrderByVersionNumberDesc(organization.getId(), routeId);

        for(RouteConfigurationVersion version : versions) {
            response.add(RouteVersionResponse.from(version));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<AuditRecordResponse> getAuditRecords() {
        Organizations organization = tenantContext.getOrganization();

        List<AuditRecordResponse> response = new ArrayList<AuditRecordResponse>();

        List<ControlPlaneAuditRecord> records = auditRecordRepository
                .findAllByOrganizations_IdOrderByCreatedAtDesc(organization.getId());

        for(ControlPlaneAuditRecord record : records) {
            response.add(AuditRecordResponse.from(record));
        }
        return response;
    }

    //gateway methods
    @Transactional(readOnly = true)
    public List<RouteResponse> findAllActiveForGateway(){
        return toResponse(
                apiRouteRepository.findAllByActiveTrueAndOrganizationStatus(OrganizationStatus.ACTIVE)
        );
    }
}
