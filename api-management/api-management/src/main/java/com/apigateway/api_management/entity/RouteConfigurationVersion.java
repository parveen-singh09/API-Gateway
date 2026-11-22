package com.apigateway.api_management.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_configuration_versions")
@Data
@NoArgsConstructor
public class RouteConfigurationVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organizations organizations;

    private String routeId;
    private Long versionNumber;
    private String changeType;

    @Column(columnDefinition = "LONGTEXT")
    private String configurationSnapshot;

    private LocalDateTime createdAt;
}
