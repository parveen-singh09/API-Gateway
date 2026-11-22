package com.apigateway.api_management.repository;

import com.apigateway.api_management.entity.ApiRoute;
import com.apigateway.api_management.entity.OrganizationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApiRouteRepository extends JpaRepository<ApiRoute,Long> {
    boolean existsByOrganization_IdAndRouteId(Long id, String routeId);

    List<ApiRoute> findAllByOrganizationId(Long id);

    Optional<ApiRoute> findByIdAndOrganizationId(Long id, Long orgid);

    List<ApiRoute> findAllByActiveTrueAndOrganizationStatus(OrganizationStatus organizationStatus);
}
