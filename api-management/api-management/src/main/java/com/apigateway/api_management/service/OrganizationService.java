package com.apigateway.api_management.service;

import com.apigateway.api_management.dto.requestdto.OrganizationRequest;
import com.apigateway.api_management.dto.requestdto.OrganizationStatusRequest;
import com.apigateway.api_management.dto.requestdto.TenantAdminRequest;
import com.apigateway.api_management.dto.requestdto.TenantOrganizationRequest;
import com.apigateway.api_management.dto.responsedto.OrganizationResponse;
import com.apigateway.api_management.dto.responsedto.TenantAdminResponse;
import com.apigateway.api_management.entity.ManagementUser;
import com.apigateway.api_management.entity.OrganizationStatus;
import com.apigateway.api_management.entity.Organizations;
import com.apigateway.api_management.entity.Role;
import com.apigateway.api_management.exception.ApiException;
import com.apigateway.api_management.repository.ManagementUserRepository;
import com.apigateway.api_management.repository.OrganizationRepository;
import com.apigateway.api_management.repository.RoleRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final ManagementUserRepository managementUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantContext tenantContext;
    private final AuditService auditService;
    public OrganizationService(TenantContext tenantContext , OrganizationRepository organizationRepository, ManagementUserRepository managementUserRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.organizationRepository = organizationRepository;
        this.managementUserRepository = managementUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantContext = tenantContext;
        this.auditService = auditService;
    }

    @Transactional
    public OrganizationResponse create(@Valid OrganizationRequest request) {
        long startedat = System.nanoTime();

        checkUnique(request.getName(), request.getSlug(), null);

        Organizations organization = new Organizations();
        organization.setName(request.getName());
        organization.setSlug(request.getSlug());
        organization.setStatus(OrganizationStatus.PENDING);
        organization.setCreatedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());

        organizationRepository.save(organization);

        auditService.record(organization,
                "CREATE_ORGANIZATION",
                "ORGANIZATION",
                organization.getId().toString(),
                startedat, "Organization created in Pending Status"
        );

        return OrganizationResponse.from(organization);
    }
    @Transactional(readOnly = true)
    public List<OrganizationResponse> findAll() {
        long startedat = System.nanoTime();
        List<OrganizationResponse> response = new ArrayList<>();

        for (Organizations organization : organizationRepository.findAllByStatusNot(OrganizationStatus.DELETED)){
            response.add(OrganizationResponse.from(organization));
        }

        return response;
    }
    @Transactional(readOnly = true)
    public OrganizationResponse findById(Long id) {
        return OrganizationResponse.from(getOrganization(id));
    }

    @Transactional// no need to write .save
    public OrganizationResponse update(Long id, @Valid OrganizationRequest request) {
        long startedAt = System.nanoTime();
        Organizations organization = getOrganization(id);

        checkUnique(request.getSlug(), request.getSlug(), id);

        organization.setName(request.getName());
        organization.setSlug(request.getSlug());
        organization.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization,
                "UPDATE_ORGANIZATION",
                "ORGANIZATION",
                id.toString(),
                startedAt, "Organization name and slug updated"
        );
        return OrganizationResponse.from(organization);
    }
    @Transactional
    public OrganizationResponse changeStatus(Long id, @Valid OrganizationStatusRequest request) {
        long startedAt = System.nanoTime();
        Organizations organization = getOrganization(id);

        if(request.getStatus().equals(OrganizationStatus.DELETED)){
            throw new ApiException(HttpStatus.BAD_REQUEST, "Use DELETE to soft delete organization");
        }
        organization.setStatus(request.getStatus());
        organization.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization,
                "CHAGNE_ORGANIZATION_STATUS",
                "ORGANIZATION",
                id.toString(),
                startedAt, "Status changed to " + request.getStatus()
        );
        return OrganizationResponse.from(organization);
    }
    @Transactional
    public void delete(Long id) {
        long startedAt = System.nanoTime();
        Organizations organization = getOrganization(id);
        organization.setStatus(OrganizationStatus.DELETED);
        organization.setDeletedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization,
                "DELETE_ORGANIZATION",
                "ORGANIZATION",
                id.toString(),
                startedAt, "Organization deleted softly"
        );
    }



    private Organizations getOrganization(Long id) {
        return (Organizations) organizationRepository.findByIdAndStatusNot(id, OrganizationStatus.DELETED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Organization not found"));
    }
    private void checkUnique(String name, String slug, Long currentId){
        if(organizationRepository.existsByNameIgnoreCase(name)){
            Organizations current = currentId == null ? null : organizationRepository.findById(currentId).orElse(null);

            if(current == null || !current.getName().equalsIgnoreCase(name)){
                throw new ApiException(HttpStatus.CONFLICT, "Organization name already exists");
            }
        }
        if(organizationRepository.existsBySlugIgnoreCase(slug)){
            Organizations current = currentId == null ? null : organizationRepository.findById(currentId).orElse(null);

            if(current == null || !current.getSlug().equalsIgnoreCase(slug)){
                throw new ApiException(HttpStatus.CONFLICT, "Organization slug already exists");
            }
        }


    }
    @Transactional
    public TenantAdminResponse createTenantAdmin(Long organizationId, @Valid TenantAdminRequest request) {
        long startedAt = System.nanoTime();
        Organizations organization = getOrganization(organizationId);
        if(managementUserRepository.findByOrganizationsId(organizationId).isPresent()){
            throw new ApiException(HttpStatus.CONFLICT, "This organizaton already has tenant admin");
        }
        if(managementUserRepository.findByUsername(request.getName()).isPresent()){
            throw new ApiException(HttpStatus.CONFLICT, "This username already exists");
        }
        Role role = roleRepository.findByName("TENANT_ADMIN")
                    .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "TENANT_ADMIN role not found"));

        ManagementUser user = new ManagementUser();
        user.setOrganizations(organization);
        user.setRole(role);
        user.setUsername(request.getName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(request.isEnabled());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        managementUserRepository.save(user);

        auditService.record(organization,
                "CREATE_TENANT_ADMIN",
                "MANAGEMENT_USER",
                user.getId().toString(),
                startedAt, "Tenant admin created"
        );
        return TenantAdminResponse.from(user);
    }

    @Transactional
    public TenantAdminResponse getTenantAdmin(Long organizationId) {
        long startedAt = System.nanoTime();
        return TenantAdminResponse.from(getTenantAdminEntity(organizationId));
    }
    @Transactional(readOnly = true)
    public ManagementUser getTenantAdminEntity(Long organizationId) {
        long startedAt = System.nanoTime();
        getOrganization(organizationId);

        return managementUserRepository.findByOrganizationsId(organizationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tenant admin not found"));
    }

    @Transactional
    public TenantAdminResponse updateTenantAdmin(Long organizationId, @Valid TenantAdminRequest request) {
        long startedAt = System.nanoTime();
        ManagementUser user = getTenantAdminEntity(organizationId);
        if(!user.getUsername().equals(request.getName()) && managementUserRepository.existsByUsername(request.getName())){
            throw new ApiException(HttpStatus.CONFLICT, "This username already exists");
        }
        user.setUsername(request.getName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(request.isEnabled());
        user.setUpdatedAt(LocalDateTime.now());

        auditService.record(user.getOrganizations(),
                "UPDATE_TENANT_ADMIN",
                "MANAGEMENT_USER",
                user.getId().toString(),
                startedAt, "Tenant admin updated"
        );
        return TenantAdminResponse.from(user);
    }

    @Transactional
    public void deleteTenantAdmin(Long organizationId) {
        long startedAt = System.nanoTime();
        ManagementUser user = getTenantAdminEntity(organizationId);

        auditService.record(user.getOrganizations(),
                "DELETE_TENANT_ADMIN",
                "MANAGEMENT_USER",
                user.getId().toString(),
                startedAt, "Tenant admin deleted"
        );

        managementUserRepository.delete(user);
    }

    //methods for tenant admin
    @Transactional(readOnly = true)
    public OrganizationResponse getOwnOrganization() {
        long startedAt = System.nanoTime();
        return OrganizationResponse.from(tenantContext.getOrganization());
    }

    @Transactional
    public OrganizationResponse updateOwnOrganization(TenantOrganizationRequest req) {
        long startedAt = System.nanoTime();

        Organizations organization = tenantContext.getOrganization();

        if(!organization.getName().equals(req.getName()) && organizationRepository.existsByNameIgnoreCase(req.getName())){
            throw new ApiException(HttpStatus.CONFLICT, "Organization name already exists");
        }

        organization.setName(req.getName());
        organization.setUpdatedAt(LocalDateTime.now());

        auditService.record(organization,
                "UPDATE_OWN_ORGANIZATION",
                "ORGANIZATION",
                organization.getId().toString(),
                startedAt, "Organization name updated by tenant admin"
        );
        return OrganizationResponse.from(organization);
    }
}
