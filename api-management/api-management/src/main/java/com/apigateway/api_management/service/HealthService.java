package com.apigateway.api_management.service;

import com.apigateway.api_management.dto.responsedto.HealthResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HealthService {
    public final JdbcTemplate jdbcTemplate;
    public  String getHealth() {
        String status = "Down";

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (Integer.valueOf(1).equals(result)) {
                status = "Up";
            }
        }
        catch (Exception e) {
            System.out.println("MySql Health check failed" + e.getMessage());
        }

        return status;
    }
}
