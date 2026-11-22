package com.apigateway.api_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "route_header_rules")
@NoArgsConstructor
@AllArgsConstructor
public class RouteHeaderRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_pk", nullable = false)
    private ApiRoute route;

    private String direction;
    private String action;
    private String headerName;
    private String headerValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
