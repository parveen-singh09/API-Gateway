package com.apigateway.api_management.dto.requestdto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteStatusRequest {
    @NotNull
    private Boolean active;
}
