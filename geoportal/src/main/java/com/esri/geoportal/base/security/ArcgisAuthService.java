package com.esri.geoportal.base.security;

import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.URLEncoder;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.client.RestTemplate;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.context.GeoportalContext;

import jakarta.json.JsonArray;
import jakarta.json.JsonObject;

public class ArcgisAuthService {
	
	/** Instance variables. */
	  private boolean allUsersCanPublish = false;
	  private String appId;
	  private String authorizeUrl; 
	  private String createAccountUrl;
	  private int expirationMinutes = 120;
	  private String geoportalAdministratorsGroupId;
	  private String geoportalPublishersGroupId;  
	  private String rolePrefix;
	  private boolean showMyProfileLink = false;

	  /** True if all authenticated users should have a Publisher role. */
	  public boolean getAllUsersCanPublish() {
	    return allUsersCanPublish;
	  }
	  /** True if all authenticated users should have a Publisher role. */
	  public void setAllUsersCanPublish(boolean allUsersCanPublish) {
	    this.allUsersCanPublish = allUsersCanPublish;
	  }

	  /** The ArcGIS application item id that will be used for OAuthe authentication. */
	  public String getAppId() {
	    return appId;
	  }
	  /** The ArcGIS application item id that will be used for OAuth authentication. */
	  public void setAppId(String appId) {
	    this.appId = appId;
	  }

	  /** The ArcGIS OAuth authorize URL. */
	  public String getAuthorizeUrl() {
	    return authorizeUrl;
	  }
	  /** The ArcGIS OAuth authorize URL. */
	  public void setAuthorizeUrl(String authorizeUrl) {
	    this.authorizeUrl = authorizeUrl;
	  }

	  /** The create account URL. */
	  public String getCreateAccountUrl() {
	    return createAccountUrl;
	  }
	  /** The create account URL. */
	  public void setCreateAccountUrl(String createAccountUrl) {
	    this.createAccountUrl = createAccountUrl;
	  }
	  
	  /** Token expiration minutes. */
	  public int getExpirationMinutes() {
	    return expirationMinutes;
	  }
	  /** Token expiration minutes. */
	  public void setExpirationMinutes(int expirationMinutes) {
	    this.expirationMinutes = expirationMinutes;
	  }

	  /** The id of the ArcGIS group containing Geoportal administrators (optional). */
	  public String getGeoportalAdministratorsGroupId() {
	    return geoportalAdministratorsGroupId;
	  }
	  /** The id of the ArcGIS group containing Geoportal administrators (optional). */
	  public void setGeoportalAdministratorsGroupId(String geoportalAdministratorsGroupId) {
	    this.geoportalAdministratorsGroupId = geoportalAdministratorsGroupId;
	  }

	  /** The id of the ArcGIS group containing Geoportal publishers (optional). */
	  public String getGeoportalPublishersGroupId() {
	    return geoportalPublishersGroupId;
	  }
	  /** The id of the ArcGIS group containing Geoportal publishers (optional). */
	  public void setGeoportalPublishersGroupId(String geoportalPublishersGroupId) {
	    this.geoportalPublishersGroupId = geoportalPublishersGroupId;
	  }
	  
	  /** The Spring role prefix. */
	  public String getRolePrefix() {
	    return rolePrefix;
	  }
	  /** The Spring role prefix. */
	  public void setRolePrefix(String rolePrefix) {
	    this.rolePrefix = rolePrefix;
	  }
	  
	  /** If true, show My Profile link. */
	  public boolean getShowMyProfileLink() {
	    return showMyProfileLink;
	  }
	  /** If true, show My Profile link. */
	  public void setShowMyProfileLink(boolean showMyProfileLink) {
	    this.showMyProfileLink = showMyProfileLink;
	  }

	
	private final RestTemplate restTemplate = new RestTemplate();

	public String getArcgisUsername(String accessToken) {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);
		HttpEntity<?> entity = new HttpEntity<>(headers);

		ResponseEntity<Map> response = restTemplate.exchange(
				this.getRestUrl()+"/community/self?f=json", HttpMethod.GET, entity, Map.class);

		if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
			return response.getBody().get("username").toString();
		} else {
			throw new RuntimeException("Invalid ArcGIS token or failed to fetch user info");
		}
	}
	
	
	
	 /**
	   * Get the roles for a user.
	   * @param username the username 
	   * @param token the ArcGIS token
	   * @param referer the HTTP referer
	   * @return the roles
	   * @throws AuthenticationException
	   */
	  public List<GrantedAuthority> getRoles(String username, String token) 
	      throws AuthenticationException {
	    List<GrantedAuthority> grantedAuthorityList = new ArrayList<>();
	    List<String> groupKeys = new ArrayList<>();
	    String adminGroupId = this.getGeoportalAdministratorsGroupId();
	    String pubGroupId = this.getGeoportalPublishersGroupId();
	    boolean allUsersCanPublish = this.getAllUsersCanPublish();
	    boolean isInAdminGroup = false;
	    boolean isInPubGroup = false;
	    boolean hasOrgAdminRole = false;
	    boolean hasOrgPubRole = false;
	    boolean hasOrgUserRole = false; 

	    String restBaseUrl = this.getRestUrl();
	    String url = restBaseUrl+"/community/self/";
	    try {
	      url += "?f=json&token="+URLEncoder.encode(token,"UTF-8");
	    } catch (UnsupportedEncodingException e) {}
	    /*
	    String url = restBaseUrl+"/community/users/";
	    try {
	      url += URLEncoder.encode(username,"UTF-8");
	      url += "?f=json&token="+URLEncoder.encode(token,"UTF-8");
	    } catch (UnsupportedEncodingException e) {}
	    */
	    
	    RestTemplate rest = new RestTemplate();
	    HttpHeaders headers = new HttpHeaders();
	    if (this.getThisReferer() != null) {
	      headers.add("Referer",this.getThisReferer());
	    };
	    HttpEntity<String> requestEntity = new HttpEntity<String>(headers);
	    ResponseEntity<String> responseEntity = rest.exchange(url,HttpMethod.GET,requestEntity,String.class);
	    String response = responseEntity.getBody();
	    //System.err.println(response);;
	    //if (response != null) LOGGER.trace(response);
	    if (!responseEntity.getStatusCode().equals(HttpStatus.OK)) {
	      throw new AuthenticationServiceException("Error communicating with the authentication service.");
	    }
	    JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(response);

	    if (jso.containsKey("role") && !jso.isNull("role")) {
	      String role = jso.getString("role");
	      if (role.equals("org_admin") || role.equals("account_admin")) hasOrgAdminRole = true;
	      if (role.equals("org_publisher") || role.equals("account_publisher")) hasOrgPubRole = true;
	      if (role.equals("org_user") || role.equals("account_user")) hasOrgUserRole = true;
	    }

	    if (jso.containsKey("orgId") && !jso.isNull("orgId")) {
	      String orgId = StringUtils.trimToEmpty(jso.getString("orgId"));
	      if (!orgId.isEmpty()) {
	        String orgKey = orgId+"_..._"+"My Organization";
	        groupKeys.add(orgKey);
	      }
	    }
	    
	    if (jso.containsKey("groups") && !jso.isNull("groups")) {
	      JsonArray jsoGroups = jso.getJsonArray("groups");
	      for (int i=0;i<jsoGroups.size();i++) {
	        JsonObject jsoGroup = jsoGroups.getJsonObject(i);
	        String groupId = jsoGroup.getString("id");
	        String groupName = jsoGroup.getString("title");
	        String groupKey = groupId+"_..._"+groupName;
	        groupKeys.add(groupKey);
	        if ((adminGroupId != null) && (adminGroupId.length() > 0) && adminGroupId.equals(groupId)) {
	          isInAdminGroup = true;
	        }
	        if ((pubGroupId != null) && (pubGroupId.length() > 0) && pubGroupId.equals(groupId)) {
	          isInPubGroup = true;
	        }
	      }
	    }

	    boolean isAdmin = false;
	    boolean isPublisher = false;
	    if ((adminGroupId != null) && (adminGroupId.length() > 0)) {
	      if (isInAdminGroup) isAdmin = true;
	    } else {
	      if (hasOrgAdminRole) isAdmin = true;
	    }
	    if (allUsersCanPublish) {
	      if (hasOrgAdminRole || hasOrgPubRole || hasOrgUserRole) {
	        isPublisher = true;
	      } else {
	        // This is a Public account (Facebook, ...)
	        isPublisher = true;
	      }
	    }
	    if ((pubGroupId != null) && (pubGroupId.length() > 0)) {
	      if (isInPubGroup) isPublisher = true;
	    } else {
	      if (hasOrgPubRole) isPublisher = true;
	    }

	    String pfx = Val.chkStr(this.getRolePrefix(),"").trim();
	    if (isAdmin) {
	      grantedAuthorityList.add(new SimpleGrantedAuthority(pfx+"ADMIN"));
	      if (!isPublisher) grantedAuthorityList.add(new SimpleGrantedAuthority(pfx+"PUBLISHER"));
	    }
	    if (isPublisher) {
	      grantedAuthorityList.add(new SimpleGrantedAuthority(pfx+"PUBLISHER"));
	    }
	    
	    if (jso.containsKey("username") && !jso.isNull("username")) {
	      if (!username.equals(jso.getString("username"))) {
	        throw new BadCredentialsException("Credential mismatch.");
	      }
	      grantedAuthorityList.add(new SimpleGrantedAuthority(pfx+"USER"));
	    } else {
	      throw new BadCredentialsException("Credential mis-match.");
	    }
	    
	    GeoportalContext gc = GeoportalContext.getInstance();
	    if (gc.getSupportsGroupBasedAccess()) {
	    	ArrayList<Group> groupList = new ArrayList<Group>();
	    	 Group group = null;
	      for (String groupKey: groupKeys) {
	    	 group = new Group(groupKey);
	    	 groupList.add(group);
	    	 
	    	// Do not add userGroups in Roles, rather save it in GeoportalContext
	        //roles.add(new SimpleGrantedAuthority(groupKey));
	      }
	      HashMap<String,ArrayList<Group>> userGroupMap = gc.getUserGroupMap();
	      if(!userGroupMap.containsKey(username))
	      {
	    	  userGroupMap.put(username, groupList);
	    	  gc.setUserGroupMap(userGroupMap);
	      }      
	    }

	    List<String> rolesList = grantedAuthorityList.stream()
	                 .map(GrantedAuthority::getAuthority)
	                 .collect(Collectors.toList());

	    return grantedAuthorityList;
	  }


	public UserDetails mapToLocalUser(String arcgisUsername) {
		// You can fetch from DB or create a new user
		return new User(arcgisUsername, "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
	}
	
	/**
	   * Get the local host name (to be used as a referer).
	   * @return the referer
	   */
	  private String getThisReferer() {
	    try {
	      return InetAddress.getLocalHost().getCanonicalHostName();
	    } catch (UnknownHostException ex) {
	      return "";
	    }
	  }
	  
	  /**
	   * Get the ArcGIS portal URL.
	   * @return the url
	   */
	  public String getPortalUrl() {
	    String authorizeUrl = this.getAuthorizeUrl();
	    return authorizeUrl.substring(0,authorizeUrl.indexOf("/sharing/"))+"";
	  }

	  /**
	   * Get the ArcGIS rest URL.
	   * @return the url
	   */
	  public String getRestUrl() {
	    String authorizeUrl = this.getAuthorizeUrl();
	    if (authorizeUrl.indexOf("/sharing/oauth2/") > 0) {
	      return authorizeUrl.substring(0,authorizeUrl.indexOf("/sharing/oauth2/"))+"/sharing/rest";
	    }
	    return authorizeUrl.substring(0,authorizeUrl.indexOf("/sharing/rest/oauth2/"))+"/sharing/rest";
	  }
}