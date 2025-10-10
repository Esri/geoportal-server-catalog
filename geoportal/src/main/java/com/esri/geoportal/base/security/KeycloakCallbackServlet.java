package com.esri.geoportal.base.security;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet(name = "keycloakCallbackServlet", urlPatterns = "/keycloak-callback")
public class KeycloakCallbackServlet extends HttpServlet {

    private KeycloakConfig config;

    @Override
    public void init() throws ServletException {
        WebApplicationContext ctx = WebApplicationContextUtils.getRequiredWebApplicationContext(getServletContext());
        this.config = ctx.getBean("keycloakConfig", KeycloakConfig.class);
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
            String idToken = (String) tokenResponse.get("id_token");
            if (accessToken == null || idToken == null) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST,
                        "No tokens returned by Keycloak");
                return;
            }
            SignedJWT jwt = SignedJWT.parse(accessToken);
            JWTClaimsSet kcClaims = jwt.getJWTClaimsSet();
            List<String> roles;
            if (config.getUserDetailsService() != null) {
                // We are authorizing locally, but the user might not have any authorizations
                try {
                    UserDetails user = config.getUserDetailsService().loadUserByUsername(kcClaims.getStringClaim("preferred_username"));
                    roles = user.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList());
                } catch (UsernameNotFoundException exc){
                    roles = Collections.EMPTY_LIST;
                }
            } else {
                roles = (List<String>) ((Map<String, Object>) kcClaims.getJSONObjectClaim("realm_access"))
                        .get("roles");
                roles = roles.stream().map(role -> "ROLE_" + role).collect(Collectors.toList());
            }
            JWTClaimsSet legacyClaims = new JWTClaimsSet.Builder()
                    .claim("exp", kcClaims.getDateClaim("exp"))
                    .claim("user_name", kcClaims.getStringClaim("preferred_username"))
                    .claim("authorities", roles)
                    .claim("jti", kcClaims.getStringClaim("jti"))
                    .claim("client_id", "geoportal-client")
                    .claim("scope", Arrays.asList("read", "write"))
                    .build();
            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build();
            SignedJWT legacyJwt = new SignedJWT(header, legacyClaims);
            legacyJwt.sign(new MACSigner(config.getJwtSigningKey()));
            String legacyTokenString = legacyJwt.serialize();

            Cookie accessCookie = new Cookie("GPT_access_token", legacyTokenString);
            accessCookie.setPath("/catalog");
            accessCookie.setSecure(true);
            response.addCookie(accessCookie);

            Cookie idCookie = new Cookie("GPT_id_token", idToken);
            idCookie.setPath("/catalog");
            idCookie.setSecure(true);
            response.addCookie(idCookie);

            response.sendRedirect("/catalog");
        } catch (Exception e) {
            throw new ServletException("Failed to handle Keycloak callback", e);
        }
    }
}