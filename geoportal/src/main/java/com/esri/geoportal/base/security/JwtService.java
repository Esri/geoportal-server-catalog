package com.esri.geoportal.base.security;

import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

	@Autowired
	JwtEncoder jwtEncoder;
	
	@Autowired
    private JwtDecoder jwtDecoder;

    public Jwt decodeToken(String token) {
        return jwtDecoder.decode(token);
    }
    
    public Jwt issueToken(String username, List<String> roles) {
        
    	
    	JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(new Date().toInstant())
                .expiresAt(new Date().toInstant().plus(1, ChronoUnit.HOURS)) // Example: token valid for 1 hour
                .subject(username)
                .claim("scope", "api.read")
                .claim("authorities", roles)// Include roles/authorities
                .build();
    	
    	Jwt jwtToken = jwtEncoder.encode(JwtEncoderParameters.from(claims));
    	//System.out.println("JWT token: " + jwtToken.getTokenValue());
        return jwtToken;
    }
}
