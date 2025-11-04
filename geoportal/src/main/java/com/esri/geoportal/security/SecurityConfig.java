package com.esri.geoportal.security;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

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
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

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
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF protection
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
                .scope("api.read").build();

        // 2. API Client (Read + Write)
        RegisteredClient apiClientRW = RegisteredClient.withId(UUID.randomUUID().toString()).clientId(configProperties.getApiAdminClientId())
                .clientSecret(configProperties.getApiAdminClientSecret()) // confidential client
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .tokenSettings(tokenSettings)
                .scope("api.read").scope("api.write")
                .build();

        // 3. API Client (Read Only)
        RegisteredClient apiClientRead = RegisteredClient.withId(UUID.randomUUID().toString()).clientId(configProperties.getApiReadClientId())
                .clientSecret(configProperties.getApiReadClientSecret()) // confidential
                                                
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .tokenSettings(tokenSettings)
                .scope("api.read")
                .build();

        return new InMemoryRegisteredClientRepository(uiAppClient, apiClientRW, apiClientRead);
    }


    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        KeyPair keyPair = generateRsaKey();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAKey rsaKey = new RSAKey.Builder(publicKey).privateKey(privateKey).keyID(UUID.randomUUID().toString())
                .build();
        JWKSet jwkSet = new JWKSet(rsaKey);
        return new ImmutableJWKSet<>(jwkSet);
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
