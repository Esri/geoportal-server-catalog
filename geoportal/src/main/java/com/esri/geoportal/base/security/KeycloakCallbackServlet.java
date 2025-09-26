package com.esri.geoportal.base.security;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet(name = "keycloakCallbackServlet", urlPatterns = "/keycloak-callback")
public class KeycloakCallbackServlet extends HttpServlet {

    private KeycloakConfig config;

    public void setKeycloakConfig(KeycloakConfig config) {
        this.config = config;
    }

    @Override
    public void init() throws ServletException {
        WebApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(getServletContext());
        this.config = ctx.getBean(KeycloakConfig.class);
    }

    @SuppressWarnings("unchecked")
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String code = request.getParameter("code");
        if (code == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing code");
            return;
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "authorization_code");
            form.add("code", code);
            form.add("client_id", config.getClientId());
            form.add("client_secret", config.getClientSecret());
            form.add("redirect_uri", config.getRedirectUrl());

            RestTemplate rest = new RestTemplate();
            Map<String, Object> tokenResponse = rest.postForObject(config.getKeycloakTokenUrl(), form, Map.class);

            String accessToken = (String) tokenResponse.get("access_token");
            if (accessToken == null) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "No access token returned by Keycloak");
                return;
            }
            SignedJWT jwt = SignedJWT.parse(accessToken);
            JWTClaimsSet kcClaims = jwt.getJWTClaimsSet();
            List<String> roles = (List<String>) ((Map<String, Object>) kcClaims.getJSONObjectClaim("realm_access")).get("roles");
            roles = roles.stream().map(role -> "ROLE_" + role).collect(Collectors.toList());
            JWTClaimsSet legacyClaims = new JWTClaimsSet.Builder()
                .claim("exp", kcClaims.getDateClaim("exp"))
                .claim("user_name", kcClaims.getStringClaim("preferred_username"))
                .claim("authorities", roles)
                .claim("jti", kcClaims.getStringClaim("jti"))
                .claim("client_id", "geoportal-client")
                .claim("scope", Arrays.asList("read","write"))
                .build();
            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build();
            SignedJWT legacyJwt = new SignedJWT(header, legacyClaims);
            legacyJwt.sign(new MACSigner(config.getJwtSigningKey()));
            String legacyTokenString = legacyJwt.serialize();
            String redirectPage = "/catalog/keycloak-redirect.html";
            String redirectUrl = String.format("%s?at=%s", // Don't call it "access_token" or Keycloak will intercept it
                    redirectPage,
                    URLEncoder.encode(legacyTokenString, StandardCharsets.UTF_8));
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            throw new ServletException("Failed to handle Keycloak callback", e);
        }
    }
}
