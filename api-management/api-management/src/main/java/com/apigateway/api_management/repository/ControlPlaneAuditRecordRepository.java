package com.apigateway.api_management.repository;

import com.apigateway.api_management.entity.ControlPlaneAuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ControlPlaneAuditRecordRepository extends JpaRepository<ControlPlaneAuditRecord,Integer> {
    List<ControlPlaneAuditRecord> findAllByOrganizations_IdOrderByCreatedAtDesc(Long id);
}
