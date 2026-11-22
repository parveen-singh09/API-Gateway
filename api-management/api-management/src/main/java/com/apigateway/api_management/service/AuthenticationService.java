package com.apigateway.api_management.service;

import com.apigateway.api_management.dto.requestdto.LoginRequest;
import com.apigateway.api_management.dto.responsedto.LoginResponse;
import com.apigateway.api_management.entity.ManagementUser;
import com.apigateway.api_management.entity.OrganizationStatus;
import com.apigateway.api_management.exception.ApiException;
import com.apigateway.api_management.repository.ManagementUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthenticationService {

    private final ManagementUserRepository managementUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expiresInSeconds;

    public AuthenticationService(ManagementUserRepository managementUserRepository, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder,@Value("${security.jwt.expiration-seconds}")  long expiresInSeconds) {
        this.managementUserRepository = managementUserRepository;

        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.expiresInSeconds = expiresInSeconds;
    }
    @Transactional(readOnly=true)
    public LoginResponse login(LoginRequest loginRequest) {

        ManagementUser user = managementUserRepository.findByUsername(loginRequest.getUsername()).orElseThrow(() -> invalidCredentials());

        if(!user.isEnabled() || !passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())){
            throw invalidCredentials();
        }

        if(user.getOrganizations() != null && user.getOrganizations().getStatus() != OrganizationStatus.ACTIVE){
            throw new ApiException(HttpStatus.FORBIDDEN, "Inactive Organization");
        }

        Instant issuedAt = Instant.now();
        String role  = user.getRole().getName();
        Long organizationId = user.getOrganizations() == null ? null : user.getOrganizations().getId();

        JwtClaimsSet.Builder claims  =  JwtClaimsSet.builder()
                .issuer("gatekeeper-api-management")
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plusSeconds(expiresInSeconds))
                .subject(loginRequest.getUsername())
                .claim("role", role);

        if(organizationId != null){
            claims.claim("organizationId", organizationId);
        }

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims.build())).getTokenValue();

        return new LoginResponse(token, "Bearer", expiresInSeconds, role, organizationId);

    }

    private RuntimeException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
}
