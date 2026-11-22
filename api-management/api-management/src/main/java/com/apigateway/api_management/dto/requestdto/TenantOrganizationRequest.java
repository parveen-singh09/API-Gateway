package com.apigateway.api_management.dto.requestdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TenantOrganizationRequest {
    @NotBlank
    @Size(max=150)
    private String name;
}
