/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.esri.geoportal.context;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.SecurityContext;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import com.esri.geoportal.base.security.Group;

/**
 * The user associated with a request.
 */
public class AppUser {

  /* Instance variables. */
  private List<Group> groups;
  private boolean isAdmin;
  private boolean isAnonymous;
  private boolean isPublisher;
  private String username;
  
  /** Constructor */
  public AppUser() {}
  
  /**
   * Constructor.
   * @param request the request
   * @param sc the security context
   */
  public AppUser(HttpServletRequest request, SecurityContext sc) {
    init(request);
  }
  
  /**
   * Constructor.
   * @param username the username 
   * @param isAdmin True is this user has an ADMIN role
   * @param isPublisher True is this user has an PUBLISHER role
   */
  public AppUser(String username, boolean isAdmin, boolean isPublisher) {
    init(username,isAdmin,isPublisher);
  }
  
  /** The groups to which this use belongs. */
  public List<Group> getGroups() {
    return groups;
  }
  
  /** The username. */
  public String getUsername() {
    return username;
  }
  
  /** True if this user has an ADMIN role. */
  public boolean isAdmin() {
    return isAdmin;
  }
  
  /** True if this user is anonymous. */
  public boolean isAnonymous() {
    return isAnonymous;
  }
  
  /** True if this user has a PUBLISHER role */
  public boolean isPublisher() {
    return isPublisher;
  }
  
  /**
   * Initialize based upon an HTTP request.
   * @param request the request
   */
  private void init(HttpServletRequest request) {
    init(null,false,false);
    if (request == null) return;
    Principal p = request.getUserPrincipal();
    if (p == null) return;
    groups = new ArrayList<Group>();
    username = p.getName();
    if (username != null && username.length() > 0) {
      isAnonymous = false;
      isAdmin = request.isUserInRole("ADMIN");
      isPublisher = request.isUserInRole("PUBLISHER");
    } else {
      isAnonymous = true;
    }
    String pfx = "ROLE_";
    String[] gtpRoles = {"ADMIN","PUBLISHER","USER"};
    List<String> gptRoleList = Arrays.asList(gtpRoles);
    Collection<GrantedAuthority> authorities = null;
    if (p instanceof UsernamePasswordAuthenticationToken) {
      UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken)p;
      if (auth.isAuthenticated()) authorities = auth.getAuthorities();
    } else if (p instanceof OAuth2AuthenticationToken) {
      OAuth2AuthenticationToken auth = (OAuth2AuthenticationToken)p;
      if (auth.isAuthenticated()) authorities = auth.getAuthorities();
    }
    if (authorities != null) {
      Iterator<GrantedAuthority> iterator = authorities.iterator();
      if (iterator != null) {
        while (iterator.hasNext()){
          GrantedAuthority authority = iterator.next();
          if (authority != null) {
            String name = authority.getAuthority();
            if (name != null) {
              if (name.indexOf(pfx) == 0) name = name.substring(pfx.length());
              if (gptRoleList.indexOf(name.toUpperCase()) == -1) {
                groups.add(new Group(name));
              }
            }
          }
        }          
      }
    }
    GeoportalContext gc = GeoportalContext.getInstance();
    HashMap<String,ArrayList<Group>> userGroupMap = gc.getUserGroupMap();
    if(userGroupMap.containsKey(username))
    {
      groups.addAll(userGroupMap.get(username));
    }
  }
  
  /**
   * Initialize.
   * @param username the username 
   * @param isAdmin True is this user has an ADMIN role
   * @param isPublisher True is this user has an PUBLISHER role
   */
  private void init(String username, boolean isAdmin, boolean isPublisher) {
    this.username = username;
    if (this.username != null && this.username.length() > 0) {
      this.isAnonymous = false;
      this.isAdmin = isAdmin;
      this.isPublisher = isPublisher;
    } else {
      isAnonymous = true;
      this.isAdmin = false;
      this.isPublisher = false;
    }
    
  }
  
}