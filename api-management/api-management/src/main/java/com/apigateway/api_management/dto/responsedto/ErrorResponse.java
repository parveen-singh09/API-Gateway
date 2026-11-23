package com.apigateway.api_management.dto.responsedto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@AllArgsConstructor
public class ErrorResponse {
    public int status;
    private String message;
    private Map<String, String> errors;
    private LocalDateTime timestamp;
}
