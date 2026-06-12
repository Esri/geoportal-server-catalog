package com.esri.geoportal.security;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger LOG = LoggerFactory.getLogger(SecurityConfig.class);

    // Use SecurityProperties component to hold configuration loaded from config.properties
    private final ConfigProperties configProperties;
    
    @Autowired
    private SecurityEndPointProp securityEndPointProp;

    public SecurityConfig(ConfigProperties securityProperties) {    	
        this.configProperties = securityProperties;
    }
   
    
    @Bean
    @Order(1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer = OAuth2AuthorizationServerConfigurer
                .authorizationServer();

        http.securityMatcher(authorizationServerConfigurer.getEndpointsMatcher()).with(authorizationServerConfigurer,
                (authorizationServer) -> authorizationServer.oidc(Customizer.withDefaults()) // Enable OpenID Connect
        )
        .authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated())
        .exceptionHandling((exceptions) -> exceptions.defaultAuthenticationEntryPointFor(
            new LoginUrlAuthenticationEntryPoint("/login.html"),
            new MediaTypeRequestMatcher(MediaType.TEXT_HTML)));

        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        Set<String> csrfExemptEndpoints = new HashSet<>(configProperties.getPublicEndpointsList());
        for (EndpointSecurityConfig rule : securityEndPointProp.getSecuredEndpoints()) {
            if (rule != null && rule.getPattern() != null && !rule.getPattern().trim().isEmpty()) {
                csrfExemptEndpoints.add(rule.getPattern().trim());
            }
        }

        http
            .csrf(csrf -> {
                csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
                if (!csrfExemptEndpoints.isEmpty()) {
                    csrf.ignoringRequestMatchers(csrfExemptEndpoints.toArray(new String[0]));
                }
            })
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())) // Allow framing from same origin
            .authorizeHttpRequests(authorize -> {
                // Apply configured public endpoints (permitAll)
                for (String pattern : configProperties.getPublicEndpointsList()) {
                    authorize.requestMatchers(pattern).permitAll();
                }
                // Apply secured endpoint rules (indexed or CSV) if present
                for (EndpointSecurityConfig rule : securityEndPointProp.getSecuredEndpoints()) {
                    String pattern = rule.getPattern();
                    String method= rule.getMethod();
                    String roles = rule.getRoles();
                   
                    roles = (roles == null) ? "" : roles.trim();

                    // If roles indicate permitAll or authenticated
                    boolean isPermitAll = "permitAll".equalsIgnoreCase(roles);
                    boolean isAuthenticated = "authenticated".equalsIgnoreCase(roles);

                    if (method == null || method.trim().isEmpty()) {
                        if (isPermitAll) {
                            authorize.requestMatchers(pattern).permitAll();
                        } else if (isAuthenticated) {
                            authorize.requestMatchers(pattern).authenticated();
                        } else if (!roles.isEmpty()) {
                            String[] auths = splitCsv(roles);
                            authorize.requestMatchers(pattern).hasAnyAuthority(auths);
                        }
                    } else {
                        String[] methods = splitCsv(method);
                        for (String m : methods) {
                            HttpMethod httpMethod;
                            try {
                                httpMethod = HttpMethod.valueOf(m.trim().toUpperCase());
                            } catch (IllegalArgumentException ex) {
                                // skip invalid method
                                continue;
                            }
                            if (isPermitAll) {
                                authorize.requestMatchers(httpMethod, pattern).permitAll();
                            } else if (isAuthenticated) {
                                authorize.requestMatchers(httpMethod, pattern).authenticated();
                            } else if (!roles.isEmpty()) {
                                String[] auths = splitCsv(roles);
                                authorize.requestMatchers(httpMethod, pattern).hasAnyAuthority(auths);
                            }
                        }
                    }
                }
                // All other requests require authentication
                authorize.anyRequest().authenticated();
            })
            .exceptionHandling((exceptions) -> exceptions.defaultAuthenticationEntryPointFor(
                new LoginUrlAuthenticationEntryPoint("/login.html"),
                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)))

            .formLogin(form -> form
                    .loginPage("/login.html") // Point to static HTML
                    .loginProcessingUrl("/login") // Form submits here
                    .permitAll())


            // Conditionally add JWT authentication filter based on property
            .oauth2ResourceServer(oauth2 -> 
                oauth2.jwt(jwt -> {
                    jwt.decoder(jwtDecoder(jwkSource()));
                    jwt.jwtAuthenticationConverter(jwtAuthenticationConverter());
            })
        )
         .httpBasic(Customizer.withDefaults()); // Enable HTTP Basic authentication; useful for Postman testing
       
        //Add JWT Authentication Filter
         http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

         // Force token resolution so CookieCsrfTokenRepository emits XSRF-TOKEN for SPA requests.
         http.addFilterAfter((request, response, filterChain) -> {
             CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
             if (csrfToken != null) {
                 csrfToken.getToken();
             }
             filterChain.doFilter(request, response);
         }, BasicAuthenticationFilter.class);
        
        return http.build();
    }

    private String[] splitCsv(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }

    public BCryptPasswordEncoder bcryptPassEncoder() {
        return new BCryptPasswordEncoder(); 
    }

    @Bean
    public InMemoryRegisteredClientRepository registeredClientRepository() {

		TokenSettings tokenSettings = TokenSettings.builder()
		    .accessTokenTimeToLive(Duration.ofMinutes(120)) // Set to 5 hours
		    .build();

    	
        // 1. Catalog Client (Authorization Code + PKCE) Simple Authentication
        RegisteredClient uiAppClient = RegisteredClient.withId(UUID.randomUUID().toString()).clientId(configProperties.getUiClientId())
                // No client secret for SPA (geoportal client)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)                
                .redirectUri(configProperties.getUiRedirectUri()) // Allow HTML callback
                .tokenSettings(tokenSettings)
                .scope("openid").scope("profile").scope("api.read").scope("read").build();

        // 2. API Client (Read + Write)
        RegisteredClient apiClientRW = RegisteredClient.withId(UUID.randomUUID().toString()).clientId(configProperties.getApiAdminClientId())
                .clientSecret(configProperties.getApiAdminClientSecret()) // confidential client
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .tokenSettings(tokenSettings)
                .scope("api.read").scope("api.write").scope("write").scope("read")
                .build();

        // 3. API Client (Read Only)
        RegisteredClient apiClientRead = RegisteredClient.withId(UUID.randomUUID().toString()).clientId(configProperties.getApiReadClientId())
                .clientSecret(configProperties.getApiReadClientSecret()) // confidential
                                                
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .tokenSettings(tokenSettings)
                .scope("api.read").scope("read")
                .build();

        return new InMemoryRegisteredClientRepository(uiAppClient, apiClientRW, apiClientRead);
    }


    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        RSAPublicKey publicKey;
        RSAPrivateKey privateKey;
        String keyId;

        if (configProperties.hasExternalRsaKeys()) {
            // Load RSA keys from environment/config (required for load-balanced deployments)
            LOG.info("Loading RSA keys from configuration (load-balancer safe mode)");
            try {
                publicKey = loadPublicKeyFromBase64(configProperties.getRsaPublicKeyBase64());
                privateKey = loadPrivateKeyFromBase64(configProperties.getRsaPrivateKeyBase64());
                // Use configured key ID or generate a fixed one from key material
                String configuredKeyId = configProperties.getRsaKeyId();
                keyId = (configuredKeyId != null && !configuredKeyId.trim().isEmpty()) 
                        ? configuredKeyId.trim() 
                        : UUID.nameUUIDFromBytes(publicKey.getEncoded()).toString();
            } catch (Exception ex) {
                throw new IllegalStateException("Failed to load RSA keys from configuration. " +
                        "Ensure security.jwt.rsa.publicKey and security.jwt.rsa.privateKey are valid Base64-encoded keys.", ex);
            }
        } else {
            // Generate RSA keys dynamically (development mode only - NOT suitable for load balancers)
            LOG.warn("RSA keys not configured - generating dynamically. " +
                    "This is NOT suitable for load-balanced deployments. " +
                    "Set security.jwt.rsa.publicKey and security.jwt.rsa.privateKey for production.");
            KeyPair keyPair = generateRsaKey();
            publicKey = (RSAPublicKey) keyPair.getPublic();
            privateKey = (RSAPrivateKey) keyPair.getPrivate();
            keyId = UUID.randomUUID().toString();
        }

        RSAKey rsaKey = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(keyId)
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
    }

    /**
     * Load RSA public key from Base64-encoded X.509 format.
     * The value should be the raw Base64 content (no PEM headers/footers).
     */
    private RSAPublicKey loadPublicKeyFromBase64(String base64Key) throws Exception {
        String cleanedKey = base64Key.replaceAll("\\s+", "")
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "");
        byte[] keyBytes = Base64.getDecoder().decode(cleanedKey);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return (RSAPublicKey) keyFactory.generatePublic(keySpec);
    }

    /**
     * Load RSA private key from Base64-encoded PKCS#8 format.
     * The value should be the raw Base64 content (no PEM headers/footers).
     */
    private RSAPrivateKey loadPrivateKeyFromBase64(String base64Key) throws Exception {
        String cleanedKey = base64Key.replaceAll("\\s+", "")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "");
        byte[] keyBytes = Base64.getDecoder().decode(cleanedKey);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
    }

    private static KeyPair generateRsaKey() {
        KeyPair keyPair;
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            keyPair = keyPairGenerator.generateKeyPair();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
        return keyPair;
    }

    @Bean
    public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {        
        return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
    }
    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        // Default converter: maps 'scope' or 'scp' claim to authorities prefixed with 'SCOPE_'
        JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

        // Custom converter: read 'authorities' claim and don't add any prefix
        JwtGrantedAuthoritiesConverter customConverter = new JwtGrantedAuthoritiesConverter();
        customConverter.setAuthoritiesClaimName("authorities");
        customConverter.setAuthorityPrefix("");

        // Combined converter: merge authorities produced by both converters (avoid duplicates)
        Converter<org.springframework.security.oauth2.jwt.Jwt, Collection<GrantedAuthority>> combined = jwt -> {
            Collection<GrantedAuthority> a1 = defaultConverter.convert(jwt);
            Collection<GrantedAuthority> a2 = customConverter.convert(jwt);
            if (a1 == null && a2 == null) {
                return new ArrayList<>();
            }
            Set<GrantedAuthority> merged = new HashSet<>();
            if (a1 != null) merged.addAll(a1);
            if (a2 != null) merged.addAll(a2);
            return new ArrayList<>(merged);
        };

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(combined);
        return authenticationConverter;
    }


    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder().issuer(configProperties.getIssuer()).build();
    }

    @Bean
    public org.springframework.web.servlet.handler.HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
        return new org.springframework.web.servlet.handler.HandlerMappingIntrospector();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtDecoder jwtDecoder) {
        return new JwtAuthenticationFilter(jwtDecoder,configProperties);
    }

}