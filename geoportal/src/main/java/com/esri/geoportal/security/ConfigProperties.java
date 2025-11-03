package com.esri.geoportal.security;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Configuration holder for security-config.properties.
 * Values are injected from property keys. The PropertySourcesPlaceholderConfigurer bean
 * (configured separately) loads config/security-config.properties where env var fallbacks
 * and defaults are defined.
 */
@Component
public class ConfigProperties {

    @Value("${security.issuer}")
    private String issuer;

    @Value("${security.ui.clientId}")
    private String uiClientId;

    @Value("${security.ui.redirectUri}")
    private String uiRedirectUri;

    @Value("${security.api.admin.clientId}")
    private String apiAdminClientId;

    @Value("${security.api.admin.clientSecret}")
    private String apiAdminClientSecret;

    @Value("${security.api.read.clientId}")
    private String apiReadClientId;

    @Value("${security.api.read.clientSecret}")
    private String apiReadClientSecret;

    @Value("${security.public-endpoints:}")
    private String publicEndpoints;

    @jakarta.annotation.PostConstruct
    private void validate() {
        StringBuilder missing = new StringBuilder();
        if (issuer == null || issuer.isEmpty()) missing.append("security.issuer, ");
        if (uiClientId == null || uiClientId.isEmpty()) missing.append("security.ui.clientId, ");
        if (uiRedirectUri == null || uiRedirectUri.isEmpty()) missing.append("security.ui.redirectUri, ");
        if (apiAdminClientId == null || apiAdminClientId.isEmpty()) missing.append("security.api.admin.clientId, ");
        if (apiAdminClientSecret == null || apiAdminClientSecret.isEmpty()) missing.append("security.api.admin.clientSecret, ");
        if (apiReadClientId == null || apiReadClientId.isEmpty()) missing.append("security.api.read.clientId, ");
        if (apiReadClientSecret == null || apiReadClientSecret.isEmpty()) missing.append("security.api.read.clientSecret, ");

        if (missing.length() > 0) {
            // remove trailing comma+space
            String list = missing.substring(0, Math.max(0, missing.length() - 2));
            throw new IllegalStateException("Missing required security properties: " + list + ". Provide them via environment variables or in config/security-config.properties.");
        }
    }

    public String getIssuer() {
        return issuer;
    }

    public String getUiClientId() {
        return uiClientId;
    }

    public String getUiRedirectUri() {
        return uiRedirectUri;
    }

    public String getApiAdminClientId() {
        return apiAdminClientId;
    }

    public String getApiAdminClientSecret() {
        return apiAdminClientSecret;
    }

    public String getApiReadClientId() {
        return apiReadClientId;
    }

    public String getApiReadClientSecret() {
        return apiReadClientSecret;
    }

    public List<String> getPublicEndpointsList() {
        List<String> publicEndpointsList = splitAndTrim(publicEndpoints);
        return publicEndpointsList;       
    }
    
    private List<String> splitAndTrim(String csv) {
        if (csv == null || csv.trim().isEmpty()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }
    
    
}