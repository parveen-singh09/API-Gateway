package com.apigateway.api_management.repository;

import com.apigateway.api_management.entity.RouteConfigurationVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteConfigurationVersionRepository extends JpaRepository<RouteConfigurationVersion,Long> {

    List<RouteConfigurationVersion> findAllByOrganizations_IdAndRouteIdOrderByVersionNumberDesc(Long id, String routeId);


}
