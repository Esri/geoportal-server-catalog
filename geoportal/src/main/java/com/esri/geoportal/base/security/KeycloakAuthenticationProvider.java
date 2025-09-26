package com.esri.geoportal.base.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jwt.SignedJWT;

public class KeycloakAuthenticationProvider implements AuthenticationProvider {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private KeycloakConfig config;

    public void setKeycloakConfig(KeycloakConfig config) {
        this.config = config;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        String accessToken = requestToken(username, password);

        SignedJWT signedJWT;
        try {
            signedJWT = SignedJWT.parse(accessToken);
        } catch (Exception e) {
            throw new BadCredentialsException("Failed to parse JWT", e);
        }

        if (!verifyJwt(signedJWT)) {
            throw new BadCredentialsException("JWT signature validation failed");
        }

        List<GrantedAuthority> authorities = extractRoles(signedJWT);

        return new UsernamePasswordAuthenticationToken(username, password, authorities);
    }

    private String requestToken(String username, String password) {
        String body = "";
        try {
            body = "grant_type=password&client_id=" + config.getClientId() +
                    "&username=" + username +
                    "&password=" + password +
                    (config.getClientSecret() != null && !config.getClientSecret().isEmpty() ? "&client_secret=" + config.getClientSecret() : "");

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(config.getKeycloakTokenUrl()))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new BadCredentialsException("Invalid credentials or Keycloak error: " + response.body());
            }

            JsonNode node = objectMapper.readTree(response.body());
            return node.get("access_token").asText();

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            throw new BadCredentialsException("Failed to obtain token from Keycloak from request:\n" + body + "\n" + e.getMessage(), e);
        }
    }

    private boolean verifyJwt(SignedJWT jwt) {
        try {
            final String keycloakJwksUrl = config.getKeycloakTokenUrl().replace("/protocol/openid-connect/token", "/protocol/openid-connect/certs");

            String jwksJson = httpClient.send(
                    HttpRequest.newBuilder().uri(URI.create(keycloakJwksUrl)).GET().build(),
                    HttpResponse.BodyHandlers.ofString()
            ).body();

            JWKSet jwkSet = JWKSet.parse(jwksJson);
            String kid = jwt.getHeader().getKeyID();
            JWK jwk = jwkSet.getKeyByKeyId(kid);

            if (jwk == null) return false;

            RSASSAVerifier verifier = new RSASSAVerifier(jwk.toRSAKey());
            return jwt.verify(verifier);
        } catch (IOException | InterruptedException | JOSEException | java.text.ParseException e) {
            e.printStackTrace();
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    private List<GrantedAuthority> extractRoles(SignedJWT jwt) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        try {
            Map<String, Object> claims = jwt.getPayload().toJSONObject();

            Map<String, Object> realmAccess = (Map<String, Object>) claims.get("realm_access");
            if (realmAccess != null) {
                List<String> roles = (List<String>) realmAccess.get("roles");
                if (roles != null) {
                    for (String role : roles) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return authorities;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
