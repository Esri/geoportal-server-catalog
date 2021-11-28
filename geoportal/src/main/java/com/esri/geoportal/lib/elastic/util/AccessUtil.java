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
package com.esri.geoportal.lib.elastic.util;
import com.esri.geoportal.base.security.Group;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.elasticsearch.action.get.GetRequestBuilder;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHits;
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
  protected String notOwnerMessage = "Access denied - not owner.";
  
  /** Constructor */
  public AccessUtil() {}
    
  /**
   * Determines an item id
   * @param id the id
   * @return the item id
   */
  public String determineId(String id) {
    try {
      ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
      TransportClient client = ec.getTransportClient();
      GetResponse result = client.prepareGet(
          ec.getItemIndexName(),ec.getActualItemIndexType(),id).get();
      if (result.isExists()) {
        //System.err.println("result.isExists: "+id+" - resultId = "+result.getId());
        return id;
      } else {
        SearchRequestBuilder builder = client.prepareSearch(ec.getItemIndexName());
        builder.setTypes(ec.getActualItemIndexType());
        builder.setSize(1);
        builder.setQuery(QueryBuilders.matchQuery(FieldNames.FIELD_FILEID,id));
        SearchHits hits = builder.get().getHits();
        // TODO what if there is more than one hit
        if (hits.getTotalHits() == 1) {
          //System.err.println("fileid exists: "+id+" - hitId = "+hits.getAt(0).getId());
          return hits.getAt(0).getId();
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
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
  public void ensureOwner(AppUser user, String ownerField, Map<String,Object> source) {
    if (!user.isAdmin()) {
      String owner = (String)source.get(ownerField);
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
  @SuppressWarnings({ "unchecked", "rawtypes" })
  public void ensureReadAccess(AppUser user, String id) {
    if (user.isAdmin()) return;
    GeoportalContext gc = GeoportalContext.getInstance();
    if (gc.getSupportsApprovalStatus() || gc.getSupportsGroupBasedAccess()) {
      String v;
      ElasticContext ec = gc.getElasticContext();
      GetResponse response = ec.getTransportClient().prepareGet(
          ec.getItemIndexName(),ec.getActualItemIndexType(),id).get();
      
      String username = user.getUsername();
      if (username != null && username.length() > 0) {
        v = (String)response.getSource().get(FieldNames.FIELD_SYS_OWNER);
        if (v != null && v.equalsIgnoreCase(username)) return;
      }

      if (gc.getSupportsApprovalStatus()) {
        v = (String)response.getSource().get(FieldNames.FIELD_SYS_APPROVAL_STATUS);
        if (v != null && v.length() > 0) {
          if (!v.equalsIgnoreCase("approved") && !v.equalsIgnoreCase("reviewed")) {
            throw new AccessDeniedException(accessDeniedMessage);
          }
        };
      }
      
      if (gc.getSupportsGroupBasedAccess()) {
        v = (String)response.getSource().get(FieldNames.FIELD_SYS_ACCESS);
        if (v != null && v.equalsIgnoreCase("private")) {
          boolean ok = false;
          Object o = response.getSource().get(FieldNames.FIELD_SYS_ACCESS_GROUPS);
          if (o != null) {
            List<String> l = null;
            if (o instanceof String) {
              v = (String)o;
              if (v.length() == 0) {
                ok = true;
              } else {
                l = new ArrayList<String>();
                l.add(v);
              }
            } else if (o instanceof List) {
              l = (List)o;
            } else {
              LOGGER.error("Field "+FieldNames.FIELD_SYS_ACCESS_GROUPS+" for item "+id+" is not a List.");
              throw new AccessDeniedException(accessDeniedMessage);
            }
            if (!ok) {
              if (l.size() == 0) {
                ok = true;
              } else {
                List<Group> groups = user.getGroups();
                if (groups != null) {
                  for (Group group: groups) {
                    for (String groupId: l) {
                      if (group.id.equals(groupId)) {
                        ok = true;
                        break;
                      }
                    }
                    if (ok) break;
                  }         
                }
              }              
            }
          }
          if (!ok) throw new AccessDeniedException(accessDeniedMessage);
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
  public void ensureWriteAccess(AppUser user, String id) {
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    String ownerField = FieldNames.FIELD_SYS_OWNER;
    if (user == null || user.getUsername() == null || user.getUsername().length() == 0) {
      throw new AccessDeniedException(accessDeniedMessage);
    }
    if (user.isAdmin()) return;
    if (!user.isPublisher()) throw new AccessDeniedException(accessDeniedMessage);
    
    GetRequestBuilder request = ec.getTransportClient().prepareGet(
        ec.getItemIndexName(),ec.getActualItemIndexType(),id);
    //request.setFetchSource(false);
    /* ES 2to5 */
    //request.setFields(ownerField);
    //request.setStoredFields(ownerField);
    GetResponse response = request.get();
    String owner = (String)response.getSource().get(ownerField);
    boolean ok = (owner != null) && (owner.equalsIgnoreCase(user.getUsername()));
    if (!ok) throw new AccessDeniedException(notOwnerMessage);
  }
  
}
