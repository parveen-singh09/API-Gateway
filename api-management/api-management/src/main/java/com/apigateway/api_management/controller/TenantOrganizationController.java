package com.apigateway.api_management.controller;

import com.apigateway.api_management.dto.requestdto.OrganizationRequest;
import com.apigateway.api_management.dto.requestdto.TenantOrganizationRequest;
import com.apigateway.api_management.dto.responsedto.OrganizationResponse;
import com.apigateway.api_management.entity.Organizations;
import com.apigateway.api_management.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant/organization")
public class TenantOrganizationController {

    private final OrganizationService organizationService;
    public TenantOrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    //get org
    @GetMapping
    public ResponseEntity<OrganizationResponse> getTenantOrganization(){
        return ResponseEntity.ok(organizationService.getOwnOrganization());
    }
    //change org name
    @PutMapping
    public ResponseEntity<OrganizationResponse> updateTenantOrganization(@Valid @RequestBody TenantOrganizationRequest req){
        return ResponseEntity.ok(organizationService.updateOwnOrganization(req));
    }

}
