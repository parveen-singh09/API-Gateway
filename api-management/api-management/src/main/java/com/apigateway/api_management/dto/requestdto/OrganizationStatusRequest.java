package com.apigateway.api_management.dto.requestdto;

import com.apigateway.api_management.entity.OrganizationStatus;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
public class OrganizationStatusRequest {
    @NonNull
    private OrganizationStatus status;
}
