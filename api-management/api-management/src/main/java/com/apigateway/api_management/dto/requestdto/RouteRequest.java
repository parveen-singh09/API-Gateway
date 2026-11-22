package com.apigateway.api_management.dto.requestdto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data

public class RouteRequest {
    @NotBlank
    @Size(max=100)
    private String routeId;

    @NotBlank
    @Size(max=200)
    private String name;

    @NotBlank
    @Size(max=500)
    private String pathPattern;

    @NotBlank
    @Size(max=1000)
    private String targetBaseUrl;

    @NotBlank
    @Size(max=500)
    private String targetPathPrefix;

    @Min(1)
    private Integer requestsPerMinute;

    @NotNull
    @Min(1)
    private Integer responseTimeoutMs;

    private boolean idempotencyEnabled;
    private boolean active;

    @NotEmpty
    private Set<@NotBlank String> allowedMethods = new HashSet<>();

    @NotNull
    private List<@Valid HeaderRuleRequest> headerRules = new ArrayList<HeaderRuleRequest>();
}
