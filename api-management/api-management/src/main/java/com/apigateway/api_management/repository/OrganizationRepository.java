package com.apigateway.api_management.repository;

import com.apigateway.api_management.entity.OrganizationStatus;
import com.apigateway.api_management.entity.Organizations;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organizations, Long> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlugIgnoreCase(String slug);

    Organizations[] findAllByStatusNot(OrganizationStatus organizationStatus);


    Optional<Organizations> findByIdAndStatusNot(Long id, OrganizationStatus organizationStatus);
}
