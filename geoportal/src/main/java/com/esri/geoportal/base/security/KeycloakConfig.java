package com.esri.geoportal.base.security;

public class KeycloakConfig {
    private String keycloakTokenUrl;
    private String keycloakAuthUrl;
    private String clientId;
    private String clientSecret;
    private String redirectUrl;
    private String rolePrefix;
    private String jwtSigningKey;
    public String getKeycloakTokenUrl() {
        return keycloakTokenUrl;
    }
    public void setKeycloakTokenUrl(String keycloakTokenUrl) {
        this.keycloakTokenUrl = keycloakTokenUrl;
    }
    public String getKeycloakAuthUrl() {
        return keycloakAuthUrl;
    }
    public void setKeycloakAuthUrl(String keycloakAuthUrl) {
        this.keycloakAuthUrl = keycloakAuthUrl;
    }
    public String getClientId() {
        return clientId;
    }
    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
    public String getClientSecret() {
        return clientSecret;
    }
    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
    public String getRedirectUrl() {
        return redirectUrl;
    }
    public void setRedirectUrl(String redirectUri) {
        this.redirectUrl = redirectUri;
    }
    public String getJwtSigningKey() {
        return jwtSigningKey;
    }
    public void setJwtSigningKey(String jwtSigningKey) {
        this.jwtSigningKey = jwtSigningKey;
    }
}
