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
package com.esri.geoportal.base.security;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;

/**
 * Provides LDAP user details.
 */
public class LdapUserContextMapper extends LdapUserDetailsMapper {
  
  private static final Logger LOGGER = LoggerFactory.getLogger(LdapUserContextMapper.class);
  
  /** Instance variables. */
  private String defaultRole;
  private Map<String,String> roleMap;
  
  /** Constructor. */
  public LdapUserContextMapper() {
    super();
  }
  
  /** The default role. */
  public String getDefaultRole() {
    return defaultRole;
  }
  /** The default role. */
  public void setDefaultRole(String defaultRole) {
    this.defaultRole = defaultRole;
  }
  
  /** Maps LDAP groups to Geoportal roles (ADMIN,PUBLISHER). */
  public Map<String, String> getRoleMap() {
    return roleMap;
  }
  /** Maps LDAP groups to Geoportal roles (ADMIN,PUBLISHER). */
  public void setRoleMap(Map<String, String> roleMap) {
    this.roleMap = roleMap;
  }

  @Override
  public UserDetails mapUserFromContext(DirContextOperations ctx, String username, 
      Collection<? extends GrantedAuthority> authorities) {
    LOGGER.debug("LdapUserContextMapper::mapUserFromContext");
    UserDetails user = null;

    if (username != null && username.length() > 0) {
      List<GrantedAuthority> newAuthorities = new ArrayList<GrantedAuthority>();
      List<String> newRoles = new ArrayList<>();
      Map<String,String> hasRoles = new HashMap<>();
      Map<String,String> map = this.getRoleMap();
      if (map != null && map.size() > 0 && authorities != null && authorities.size() > 0) {
        for (GrantedAuthority authority: authorities) {
          newAuthorities.add(authority);
          hasRoles.put(authority.getAuthority().toUpperCase(),"y");
          for (Map.Entry<String,String> entry: map.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(authority.getAuthority())) {
              for (String v: entry.getValue().split(",")) {
                if (v.trim().length() > 0) {
                  newRoles.add(v);
                }
              }
            }
          }
        }
      }
      if (getDefaultRole() != null && getDefaultRole().length() > 0) {
        newRoles.add(getDefaultRole());
      }
      for (String v: newRoles) {
        if (!hasRoles.containsKey(v.toUpperCase())) {
          newAuthorities.add(this.createAuthority(v));
          hasRoles.put(v.toUpperCase(),"y");
        }
      }
      user = super.mapUserFromContext(ctx, username, newAuthorities);
    } else {
      user = super.mapUserFromContext(ctx, username, authorities);
    }
    return user;
  }

}
