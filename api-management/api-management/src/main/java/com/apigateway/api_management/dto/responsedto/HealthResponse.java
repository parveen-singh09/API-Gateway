package com.apigateway.api_management.dto.responsedto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class HealthResponse {
    private String servicestatus;
    private String dbstatus;
    private LocalDateTime timestamp;
}
