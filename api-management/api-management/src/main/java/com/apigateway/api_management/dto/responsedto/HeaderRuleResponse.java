package com.apigateway.api_management.dto.responsedto;

import com.apigateway.api_management.entity.RouteHeaderRule;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HeaderRuleResponse {
    private Long id;
    private String direction;
    private String action;
    private String headerName;
    private String headerValue;

    public static HeaderRuleResponse from (RouteHeaderRule rule){
        return  new HeaderRuleResponse(rule.getId(), rule.getDirection(), rule.getAction(), rule.getHeaderName(), rule.getHeaderValue());
    }
}
