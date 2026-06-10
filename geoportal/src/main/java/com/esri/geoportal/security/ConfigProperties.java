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

    // RSA key configuration for JWT signing (Base64-encoded PKCS#8 format)
    // Required for load-balanced / multi-instance deployments
    // If not set, keys will be generated dynamically (dev mode only)
    @Value("${security.jwt.rsa.publicKey:}")
    private String rsaPublicKeyBase64;

    @Value("${security.jwt.rsa.privateKey:}")
    private String rsaPrivateKeyBase64;

    // Fixed key ID for consistent JWK across instances (optional but recommended)
    @Value("${security.jwt.rsa.keyId:}")
    private String rsaKeyId;

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

    public String getRsaPublicKeyBase64() {
        return rsaPublicKeyBase64;
    }

    public String getRsaPrivateKeyBase64() {
        return rsaPrivateKeyBase64;
    }

    public String getRsaKeyId() {
        return rsaKeyId;
    }

    /**
     * Check if external RSA keys are configured via environment/config.
     * When true, keys will be loaded from Base64 config instead of generated dynamically.
     * Required for load-balanced / multi-instance deployments.
     */
    public boolean hasExternalRsaKeys() {
        return rsaPublicKeyBase64 != null && !rsaPublicKeyBase64.trim().isEmpty()
                && rsaPrivateKeyBase64 != null && !rsaPrivateKeyBase64.trim().isEmpty();
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