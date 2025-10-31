package com.esri.geoportal.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtDecoder jwtDecoder;
    private final ConfigProperties securityProperties;

    public JwtAuthenticationFilter(JwtDecoder jwtDecoder,ConfigProperties securityProperties) {
        this.jwtDecoder = jwtDecoder;
		this.securityProperties = securityProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
    	String token = null;
    	//if security context already has an authenticated user, skip
    	if(request.getUserPrincipal()!=null) {
    		filterChain.doFilter(request, response);
			return;
    	}
        String authHeader = request.getHeader("Authorization");
        if(authHeader != null && authHeader.startsWith("Bearer ")){
        	token = authHeader.substring(7);
		}
        
        if(authHeader == null && request.getParameter("access_token")!=null) {
			token = request.getParameter("access_token");
			token = decodeURIComponent(token);
		}  
        if (!StringUtils.hasText(token)) {
			filterChain.doFilter(request, response);
			return;
		}
        try {
            Jwt jwt = jwtDecoder.decode(token);
            if(jwt.getAudience()!=null && jwt.getAudience().contains("geoportal-simple-client")) //Simple Authentication client token, SecurityContext is already set
            {
            	filterChain.doFilter(request, response);
    			return;
            }
            String username = jwt.getSubject();
            List<String> authorities = jwt.getClaimAsStringList("authorities");
            if (authorities == null) authorities = List.of();
            List<SimpleGrantedAuthority> grantedAuthorities = authorities.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
            Authentication authentication = new UsernamePasswordAuthenticationToken(username, null, grantedAuthorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException e) {
            // Invalid token, clear context
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }

	private String decodeURIComponent(String token) {
		return URLDecoder.decode(token, StandardCharsets.UTF_8);
		
	}
}
