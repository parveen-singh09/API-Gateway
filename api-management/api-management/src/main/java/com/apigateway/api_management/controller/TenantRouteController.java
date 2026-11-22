package com.apigateway.api_management.controller;

import com.apigateway.api_management.dto.requestdto.RouteRequest;
import com.apigateway.api_management.dto.requestdto.RouteStatusRequest;
import com.apigateway.api_management.dto.responsedto.AuditRecordResponse;
import com.apigateway.api_management.dto.responsedto.RouteResponse;
import com.apigateway.api_management.dto.responsedto.RouteVersionResponse;
import com.apigateway.api_management.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//d ((
@RestController
@RequestMapping("/api/tenant")
public class TenantRouteController {
    //crud operation
    private final RouteService routeService;
    public TenantRouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/routes")
    public ResponseEntity<RouteResponse> create (@Valid @RequestBody RouteRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(routeService.create(request));
    }

    @GetMapping("/routes")
    public ResponseEntity<List<RouteResponse>> findAll(){
        return ResponseEntity.ok(routeService.findAllForTenant());
    }

    @PutMapping("/routes/{id}")
    public ResponseEntity<RouteResponse> update(@PathVariable Long id,
                                                @Valid @RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.update(id, request));
    }

    @GetMapping("/routes/{id}")
    public ResponseEntity<RouteResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.findById(id));
    }

    @PatchMapping("/routes/{id}")
    public ResponseEntity<RouteResponse> changeStatus(@PathVariable Long id, @Valid @RequestBody RouteStatusRequest request){
        return ResponseEntity.ok(routeService.changeStatus(id, request));
    }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        routeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/route-versions/{routeId}")
    public ResponseEntity<List<RouteVersionResponse>> getVersion(@PathVariable String routeId){
        return ResponseEntity.ok(routeService.getVersions(routeId));
    }

    @GetMapping("/audit-records")
    public ResponseEntity<List<AuditRecordResponse>> getAuditRecords() {
        return ResponseEntity.ok(routeService.getAuditRecords());
    }
}
