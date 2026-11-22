package com.apigateway.api_management.dto.responsedto;

import com.apigateway.api_management.entity.RouteConfigurationVersion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RouteVersionResponse {
    private Long id;
    private String routeId;
    private Long versionNumber;
    private String changeType;
    private String configurationSnapshot;
    private LocalDateTime createdAt;

    public static RouteVersionResponse from(RouteConfigurationVersion version) {
        return new RouteVersionResponse(version.getId(), version.getRouteId(), version.getVersionNumber(),
                version.getChangeType(), version.getConfigurationSnapshot(), version.getCreatedAt());
    }
}
