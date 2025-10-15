package com.esri.geoportal;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

import com.esri.geoportal.security.JwtAuthenticationFilter;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

@Configuration
@EnableWebSecurity

@ImportResource("classpath:config/authentication-simple.xml")
public class SecurityConfig {

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
			new LoginUrlAuthenticationEntryPoint("/login"),
			new MediaTypeRequestMatcher(MediaType.TEXT_HTML)));

		return http.build();
	}

	@Bean
	@Order(2)
	public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
		http
			.csrf(csrf -> csrf.disable()) // Disable CSRF protection
			.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())) // Allow framing from same origin
			.authorizeHttpRequests(authorize -> authorize
				// Only permit static resources and public endpoints
				.requestMatchers("/index.html", "/standalone-metadata-editor.html", "/geoportal", "/oauth-callback.html", 
						"/login", "/oauth2/**","/auth/arcgis").permitAll()

				.requestMatchers("/lib/**","/app/**","/api/**","/custom/**","/images/**","/rest/**").permitAll()
				.requestMatchers("/elastic/metadata/_count/**").permitAll()
				.requestMatchers("/elastic/metadata/*/_count/**").permitAll()
				.requestMatchers("/elastic/metadata/_search/**").permitAll()
				.requestMatchers("/elastic/metadata/*/_search/**").permitAll()
				.requestMatchers("/elastic/metadata/_mappings/**").permitAll()
				.requestMatchers("/elastic/metadata/*/_mappings/**").permitAll()
				.requestMatchers("/elastic/_search/scroll/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/stac/collections/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/stac/api/**").hasAnyAuthority("SCOPE_api.read", "ROLE_ADMIN")
				.anyRequest().authenticated() // All other requests require authentication
			)
			.exceptionHandling((exceptions) -> exceptions.defaultAuthenticationEntryPointFor(
				new LoginUrlAuthenticationEntryPoint("/login"),
				new MediaTypeRequestMatcher(MediaType.TEXT_HTML)))
			.formLogin(Customizer.withDefaults())
			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
			.oauth2ResourceServer(oauth2 -> 
	            oauth2.jwt(jwt -> {
	                jwt.decoder(jwtDecoder(jwkSource()));
	                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter());
            })
        )
			 .httpBasic(Customizer.withDefaults()); // Enable HTTP Basic authentication; useful for Postman testing
		return http.build();
	}

	public BCryptPasswordEncoder bcryptPassEncoder() {
		return new BCryptPasswordEncoder(); 
	}

	@Bean
	public InMemoryRegisteredClientRepository registeredClientRepository() {

		// 1. Catalog Client (Authorization Code + PKCE) Simple Authentication
		RegisteredClient uiAppClient = RegisteredClient.withId(UUID.randomUUID().toString()).clientId("geoportal-simple-client")
				// No client secret for SPA (geoportal client)
				.clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
				.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
				.authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)				
				.redirectUri("http://localhost:8080/geoportal/callback.html") // Allow HTML callback
				
				.scope("openid").scope("profile").scope("api.read").build();

		// 2. API Client (Read + Write)
		RegisteredClient apiClientRW = RegisteredClient.withId(UUID.randomUUID().toString()).clientId("admin")
				.clientSecret("{bcrypt}$2a$12$td99FHa4zQbWVUwJwJ9k1ea9CR4oPTUKCQgacLwjefCFxxil0jZ9.") // confidential
																										// client
				.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
				.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
				.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
				.scope("api.read").scope("api.write")
				.build();

		// 3. API Client (Read Only)
		RegisteredClient apiClientRead = RegisteredClient.withId(UUID.randomUUID().toString()).clientId("api-read-client")
				.clientSecret("{noop}api-read") // confidential
																										
				.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_POST)
				.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
				.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
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
	    JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
	    grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities");
	    grantedAuthoritiesConverter.setAuthorityPrefix(""); // Optional: remove "ROLE_" prefix if already present
	
	    JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
	    authenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
	    return authenticationConverter;
	}


	@Bean
	public AuthorizationServerSettings authorizationServerSettings() {
		return AuthorizationServerSettings.builder().build();
	}

	@Bean
	public org.springframework.web.servlet.handler.HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
		return new org.springframework.web.servlet.handler.HandlerMappingIntrospector();
	}

	@Bean
	public JwtAuthenticationFilter jwtAuthenticationFilter(JwtDecoder jwtDecoder) {
	    return new JwtAuthenticationFilter(jwtDecoder);
	}

}