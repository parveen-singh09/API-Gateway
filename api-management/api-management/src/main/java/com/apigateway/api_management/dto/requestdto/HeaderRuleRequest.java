package com.apigateway.api_management.dto.requestdto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HeaderRuleRequest {
    @NotBlank
    @Size(max = 20)
    private String direction;

    @NotBlank
    @Size(max = 20)
    private String action;

    @NotBlank
    @Size(max = 200)
    private String headerName;

    @Size(max = 2000)
    private String headerValue;
}
