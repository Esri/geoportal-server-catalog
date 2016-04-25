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
import javax.ws.rs.core.SecurityContext;

/**
 * The user associated with a request.
 */
public class AppUser {

  /* Instance variables. */
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
