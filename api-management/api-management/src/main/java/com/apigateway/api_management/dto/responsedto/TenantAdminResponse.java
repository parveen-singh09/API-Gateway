package com.apigateway.api_management.dto.responsedto;

import com.apigateway.api_management.entity.ManagementUser;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TenantAdminResponse {
    private Long id;
    private Long OrganizationId;
    private String username;
    private boolean enabled;

    public static TenantAdminResponse from(ManagementUser managementUser) {
        return new TenantAdminResponse(managementUser.getId(), managementUser.getOrganizations().getId(), managementUser.getUsername(), managementUser.isEnabled());
    }
}
