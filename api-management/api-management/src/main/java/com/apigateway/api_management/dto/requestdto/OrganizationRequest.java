package com.apigateway.api_management.dto.requestdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrganizationRequest {
    @NotEmpty
    @Size(max=150)
    private String name;

    @NotBlank
    @Size(max=100)
    @Pattern(regexp="^[a-z0-9]+( ?:- [a-z0-9]+)*$", message = "slug must contain lowercase letters, numbers and single hyphens")
    private String slug;

}
