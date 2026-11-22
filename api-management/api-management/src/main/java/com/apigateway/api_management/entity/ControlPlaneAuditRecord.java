package com.apigateway.api_management.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "control_plane_audit_records")
@Data
public class ControlPlaneAuditRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organizations organizations;

    private String actor;
    private String action;
    private String resourceType;
    private String resourceId;
    private String correlationId;
    private Long durationMs;
    private String result;
    private String details;
    private LocalDateTime createdAt;
}
