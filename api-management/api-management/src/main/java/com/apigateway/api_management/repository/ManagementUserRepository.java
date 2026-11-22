package com.apigateway.api_management.repository;

import com.apigateway.api_management.entity.ManagementUser;
import com.apigateway.api_management.entity.Organizations;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ManagementUserRepository extends JpaRepository<ManagementUser, Long> {
    Optional<ManagementUser> findByUsername(String username);

    Optional<ManagementUser> findByOrganizationsId(Long organizationId);

    boolean existsByUsername(@NotBlank @Size(max=100) String name);
}
