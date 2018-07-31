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
package com.esri.geoportal.lib.elastic.http.util;

import java.util.Map;

import javax.json.JsonObject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;

import com.esri.geoportal.context.AppUser;

/**
 * Access utilities.
 */
public class AccessUtil {
  
  /** Logger. */
  public static final Logger LOGGER = LoggerFactory.getLogger(AccessUtil.class);
  
  /** Instance variables. */
  protected String accessDeniedMessage = "Access denied.";
  protected String notOwnerMessage = "Access denied - not owner.";
  
  /** Constructor */
  public AccessUtil() {}
  
  /**
   * Determines an item id
   * @param id the id
   * @return the item id
   */
  public String determineId(String id) {
    // TODO
    return id;
  }
  
  /**
   * Ensure that a user has an Admin role.
   * @param user the user
   * @throws AccessDeniedException if not
   */
  public void ensureAdmin(AppUser user) {
    if (user == null || user.getUsername() == null || user.getUsername().length() == 0) {
      throw new AccessDeniedException(accessDeniedMessage);
    }
    if (!user.isAdmin()) throw new AccessDeniedException(accessDeniedMessage);
  }
  
  /**
   * Ensures that a user owns an item.
   * @param user the user
   * @param ownerField the owner field name (username)
   * @param source the Elasticsearch item source
   * @throws AccessDeniedException if not
   */
  public void ensureOwner(AppUser user, String ownerField, JsonObject source) {
    // TODO
    if (!user.isAdmin()) {
      String owner = null;
      if (source != null && source.containsKey(ownerField)) {
        owner = source.getString(ownerField,null);
      }
      boolean ok = (owner != null) && (owner.equalsIgnoreCase(user.getUsername()));
      if (!ok) throw new AccessDeniedException(notOwnerMessage);
    }
  }
  
  /**
   * Ensure that a user has a Publisher role.
   * @param user the user
   * @throws AccessDeniedException if not
   */
  public void ensurePublisher(AppUser user) {
    if (user == null || user.getUsername() == null || user.getUsername().length() == 0) {
      throw new AccessDeniedException(accessDeniedMessage);
    }
    if (!user.isAdmin() && !user.isPublisher()) {
      throw new AccessDeniedException(accessDeniedMessage);
    }
  }
  
  /**
   * Ensure that a user has read access to an item.
   * @param user the user
   * @param id the item id
   * @throws AccessDeniedException if not
   */
  public void ensureReadAccess(AppUser user, String id) {
    if (user.isAdmin()) return;
    // TODO
  }
  
  /**
   * Ensure that a user has write access to an item.
   * @param user the user
   * @param id the item id
   * @throws AccessDeniedException if not
   */
  public void ensureWriteAccess(AppUser user, String id) {
    // TODO
  }

}
