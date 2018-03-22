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
import java.util.Iterator;
import java.util.List;

import javax.ws.rs.core.SecurityContext;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

/**
 * The user associated with a request.
 */
public class AppUser {

  /* Instance variables. */
  private String[] groupNames;
  private boolean isAdmin;
  private boolean isAnonymous;
  private boolean isPublisher;
  private String username;
  
  /** Constructor */
  public AppUser() {}
  
  /**
   * Constructor.
   * @param sc the security context
   */
  public AppUser(SecurityContext sc) {
    init(sc);
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
  
  /** The group names to which this use belongs. */
  public String[] getGroupNames() {
    return groupNames;
  }
  
  /** The username. */
  public String getUsername() {
    return username;
  }
  
  /** True is this user has an ADMIN role. */
  public boolean isAdmin() {
    return isAdmin;
  }
  
  /** True is this user is anonymous. */
  public boolean isAnonymous() {
    return isAnonymous;
  }
  
  /** True is this user has a PUBLISHER role */
  public boolean isPublisher() {
    return isPublisher;
  }
  
  /**
   * Initialize based upon a security context.
   * @param sc the security context
   */
  private void init(SecurityContext sc) {
    init(null,false,false);
    if (sc == null) return;
    Principal p = sc.getUserPrincipal();
    if (p == null) return;
    username = p.getName();
    if (username != null && username.length() > 0) {
      isAnonymous = false;
      isAdmin = sc.isUserInRole("ADMIN");
      isPublisher = sc.isUserInRole("PUBLISHER");
    } else {
      isAnonymous = true;
    }
    
    String pfx = "ROLE_";
    String[] gtpRoles = {"ADMIN","PUBLISHER","USER"};
    List<String> gptRoleList = Arrays.asList(gtpRoles);
    ArrayList<String> grpNames = new ArrayList<String>();
    Collection<GrantedAuthority> authorities = null;
    if (p instanceof UsernamePasswordAuthenticationToken) {
      UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken)p;
      if (auth.isAuthenticated()) authorities = auth.getAuthorities();
    } else if (p instanceof OAuth2Authentication) {
      OAuth2Authentication auth = (OAuth2Authentication)p;
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
                //System.err.println("authority: "+name);
                grpNames.add(name);
              }
            }
          }
        }          
      }
    }
    if (grpNames.size() > 0) {
      groupNames = grpNames.toArray(new String[grpNames.size()]);
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
