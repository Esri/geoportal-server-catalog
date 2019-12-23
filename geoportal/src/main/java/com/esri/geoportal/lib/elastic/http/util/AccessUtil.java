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
import com.esri.geoportal.base.security.Group;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import java.io.FileNotFoundException;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonValue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;

/**
 * Access utilities.
 */
public class AccessUtil {
  
  /** Logger. */
  public static final Logger LOGGER = LoggerFactory.getLogger(AccessUtil.class);
  
  /** Instance variables. */
  protected String accessDeniedMessage = "Access denied.";
  protected JsonObject lastItem;
  protected String notOwnerMessage = "Access denied - not owner.";
  
  /** Constructor */
  public AccessUtil() {}
  
  /**
   * Determines an item id
   * @param id the id
   * @return the item id
   */
  public String determineId(String id) throws Exception {
    JsonObject item;
    try {
      item = this.readItem(id);
      if (item != null) return id;
    } catch (FileNotFoundException e) {
    }
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    ItemUtil itemUtil = new ItemUtil();
    item = itemUtil.searchForFileId(ec.getIndexName(),ec.getActualItemIndexType(),id);
    if (item != null) {
      this.lastItem = item;
      return item.getString("_id");
    }
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
  public void ensureReadAccess(AppUser user, String id) throws Exception {
    if (user.isAdmin()) return;

    GeoportalContext gc = GeoportalContext.getInstance();
    if (gc.getSupportsApprovalStatus() || gc.getSupportsGroupBasedAccess()) {
      String v;
      JsonObject source = null;
      try {
        source = this.readItemSource(id);
      } catch (FileNotFoundException e) {}
      if (source != null) {
        
        String username = user.getUsername();
        if (username != null && username.length() > 0) {
          v = JsonUtil.getString(source,FieldNames.FIELD_SYS_OWNER);
          if (v != null && v.equalsIgnoreCase(username)) {
            return;
          }
        }
        
        if (gc.getSupportsApprovalStatus()) {
          v = JsonUtil.getString(source,FieldNames.FIELD_SYS_APPROVAL_STATUS);
          if (v != null && v.length() > 0) {
            if (!v.equalsIgnoreCase("approved") && !v.equalsIgnoreCase("reviewed")) {
              throw new AccessDeniedException(accessDeniedMessage);
            }
          };
        }
        
        if (gc.getSupportsGroupBasedAccess()) {
          v = JsonUtil.getString(source,FieldNames.FIELD_SYS_ACCESS);
          if (v != null && v.equalsIgnoreCase("private")) {
            boolean ok = false;
            JsonArray itemGroups = null;
            if (source.containsKey(FieldNames.FIELD_SYS_ACCESS_GROUPS)) {
              JsonValue jv = source.getOrDefault(FieldNames.FIELD_SYS_ACCESS_GROUPS,null);
              if (jv != null) {
                if (jv.getValueType() == JsonValue.ValueType.STRING) {
                  itemGroups = Json.createArrayBuilder().add(jv).build();
                } else if (jv.getValueType() == JsonValue.ValueType.ARRAY) {
                  itemGroups = (JsonArray)jv;
                } else {
                  LOGGER.error("Field "+FieldNames.FIELD_SYS_ACCESS_GROUPS+" for item "+id+" is not a List.");
                  throw new AccessDeniedException(accessDeniedMessage);
                }
              }
            }
            if (itemGroups != null && itemGroups.size() > 0) {
              List<Group> groups = user.getGroups();
              if (groups != null) {
                for (Group group: groups) {
                  for (int i=0;i<itemGroups.size();i++) {
                    String groupId = itemGroups.getString(i);
                    if (groupId != null && groupId.length() > 0) {
                      if (group.id.equals(groupId)) {
                        ok = true;
                        break;
                      }
                    }
                  }
                  if (ok) break;
                }         
              }
            }
            if (!ok) throw new AccessDeniedException(accessDeniedMessage);
          }
        }
        
      }
    }
  }
  
  /**
   * Ensure that a user has write access to an item.
   * @param user the user
   * @param id the item id
   * @throws AccessDeniedException if not
   */
  public void ensureWriteAccess(AppUser user, String id) throws Exception {
    if (user == null || user.getUsername() == null || user.getUsername().length() == 0) {
      throw new AccessDeniedException(accessDeniedMessage);
    }
    if (user.isAdmin()) return;
    if (!user.isPublisher()) throw new AccessDeniedException(accessDeniedMessage);
    
    String owner = null;
    String ownerField = FieldNames.FIELD_SYS_OWNER;
    JsonObject source = this.readItemSource(id);
    if (source != null && source.containsKey(ownerField)) {
      owner = JsonUtil.getString(source,ownerField);
    }
    boolean ok = (owner != null) && (owner.equalsIgnoreCase(user.getUsername()));
    if (!ok) throw new AccessDeniedException(notOwnerMessage);
  }
  
  /**
   * Get the last item accessed.
   * return the last item
   */
  public JsonObject getLastItem() {
    return this.lastItem;
  }
  
  /**
   * Read an item.
   * @param id the item id
   * @return the item
   * @throws Exception if an exception occurs
   */
  private JsonObject readItem(String id) throws Exception {
    if (this.lastItem != null) return this.lastItem;
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    ItemUtil itemUtil = new ItemUtil();
    this.lastItem = itemUtil.readItemJson(ec.getIndexName(),ec.getActualItemIndexType(),id);
    return this.lastItem;
  }
  
  /**
   * Read an item's _source.
   * @param id the item id
   * @return the item's _source
   * @throws Exception if an exception occurs
   */
  private JsonObject readItemSource(String id) throws Exception {
    ItemUtil itemUtil = new ItemUtil();
    return itemUtil.getItemSource(readItem(id));
  }

}
