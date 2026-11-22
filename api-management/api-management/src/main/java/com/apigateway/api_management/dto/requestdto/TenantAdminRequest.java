package com.apigateway.api_management.dto.requestdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TenantAdminRequest {
    @NotBlank
    @Size(max=100)
    private String name;
    @NotBlank
    @Size(min=8, max=100)
    private String password;

    private boolean enabled = true;
}
