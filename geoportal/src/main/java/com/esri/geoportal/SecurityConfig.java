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
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configuration.OAuth2AuthorizationServerConfiguration;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.settings.AuthorizationServerSettings;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

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
																								// 1.0
		).authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated())
				// Redirect to the login page when not authenticated from the
				// authorization endpoint
				.exceptionHandling((exceptions) -> exceptions.defaultAuthenticationEntryPointFor(
						new LoginUrlAuthenticationEntryPoint("/login"),
						new MediaTypeRequestMatcher(MediaType.TEXT_HTML)));

		return http.build();
	}

	@Bean
	@Order(2)
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/elastic/metadata/_count/**").permitAll()
				.requestMatchers("/elastic/metadata/*/_count/**").permitAll()
				.requestMatchers("/elastic/metadata/_search/**").permitAll()
				.requestMatchers("/elastic/metadata/*/_search/**").permitAll()
				.requestMatchers("/elastic/metadata/_mappings/**").permitAll()
				.requestMatchers("/elastic/metadata/*/_mappings/**").permitAll()
				.requestMatchers("/elastic/_search/scroll/**").permitAll()
				.requestMatchers(HttpMethod.GET, "/stac/collections/**").permitAll()
				//.requestMatchers(HttpMethod.GET, "/stac/api/**").hasAuthority("SCOPE_api.read").anyRequest()
				.requestMatchers(HttpMethod.GET, "/stac/api/**").hasAnyAuthority("SCOPE_api.read", "ROLE_ADMIN").anyRequest()
				//TODO Make this external configurable for all the URLs as per app-security.xml
				
				.authenticated() // All requests require authentication

		).oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults()))
		 .httpBasic(Customizer.withDefaults()); // Enable HTTP Basic authentication; useful for Postman testing
		// with default settings
		return http.build();
	}

	public BCryptPasswordEncoder bcryptPassEncoder() {
		return new BCryptPasswordEncoder(); 
	}

	@Bean
	public InMemoryRegisteredClientRepository registeredClientRepository() {

		// 1. Catalog Client (Authorization Code + PKCE)
		RegisteredClient uiAppClient = RegisteredClient.withId(UUID.randomUUID().toString()).clientId("spa-client")
				// No client secret for SPA (public client)
				.clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
				.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
				.authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
				.redirectUri("http://localhost:8080/callback") // SPA redirect
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

//	@Bean 
//	public RegisteredClientRepository registeredClientRepository() {
//		RegisteredClient oidcClient = RegisteredClient.withId(UUID.randomUUID().toString())
//				.clientId("oidc-client")
//				.clientSecret("{noop}secret")
//				.clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
//				.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE) //for Catalog App
//				.authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS) //for API access
//				.redirectUri("http://localhost:8080/login/oauth2/code/oidc-client")
//				.postLogoutRedirectUri("http://localhost:8080/")
//				.scope(OidcScopes.OPENID)
//				.scope(OidcScopes.PROFILE)
////				.clientSettings(ClientSettings.builder()
////		                .requireProofKey(true)  // enforce PKCE
////		                .requireAuthorizationConsent(true)
////		                .build())
//				.clientSettings(ClientSettings.builder().requireAuthorizationConsent(false).build())
//				.build();
//
//		return new InMemoryRegisteredClientRepository(oidcClient);
//	}

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
	public AuthorizationServerSettings authorizationServerSettings() {
		return AuthorizationServerSettings.builder().build();
	}

	@Bean
	public org.springframework.web.servlet.handler.HandlerMappingIntrospector mvcHandlerMappingIntrospector() {
		return new org.springframework.web.servlet.handler.HandlerMappingIntrospector();
	}

}