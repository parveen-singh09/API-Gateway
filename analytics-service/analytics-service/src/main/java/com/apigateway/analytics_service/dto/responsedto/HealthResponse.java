package com.apigateway.analytics_service.dto.responsedto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class HealthResponse {
    private String serviceName;
    private String serviceDescription;
    private String serviceStatus;
}
