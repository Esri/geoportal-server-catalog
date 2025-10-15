package com.esri.geoportal.base.security;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private ArcgisAuthService arcgisAuthService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/arcgis")
    @ResponseBody
    public ResponseEntity<?> authenticateWithArcgis(@RequestParam("arcgis_token") String accessToken)  {       
		
	    if (accessToken == null || accessToken.isEmpty()) {
	        return ResponseEntity.badRequest().body("Missing 'arcgis_token' in request body");
	    }
        
        String arcgisUsername = arcgisAuthService.getArcgisUsername(accessToken);
        List<GrantedAuthority> roles = arcgisAuthService.getRoles(arcgisUsername, accessToken);
        Jwt jwtToken = jwtService.issueToken(arcgisUsername, roles.stream()
                				.map(GrantedAuthority::getAuthority)
                				.collect(Collectors.toList()));

        Map<String, Object> response = new HashMap<>();
        response.put("access_token", jwtToken.getTokenValue());
        response.put("scope", jwtToken.getClaims().get("scope"));
        response.put("authorities", roles);
        response.put("expires_in", jwtToken.getExpiresAt() != null ? jwtToken.getExpiresAt().toString() : null);  

        return ResponseEntity.ok(response);

    }
}