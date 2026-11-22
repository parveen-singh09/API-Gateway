package com.apigateway.api_management.controller;

//import com.apigateway.gateway_service.dto.responsedto.HealthResponse;
import com.apigateway.api_management.service.HealthService;
import com.apigateway.api_management.dto.responsedto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/health")
public class HealthController {
    public final HealthService healthServie;
    public HealthController(HealthService healthService){
        this.healthServie = healthService;
    }
    @GetMapping
    public ResponseEntity<HealthResponse> health(){
        String dbstatus = healthServie.getHealth();
        return ResponseEntity.ok(new HealthResponse("server is up", dbstatus, LocalDateTime.now()));
    }

}
