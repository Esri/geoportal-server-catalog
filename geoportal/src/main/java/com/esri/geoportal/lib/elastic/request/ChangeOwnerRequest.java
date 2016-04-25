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
package com.esri.geoportal.lib.elastic.request;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

import org.elasticsearch.action.update.UpdateRequestBuilder;
import org.elasticsearch.action.update.UpdateResponse;
import org.elasticsearch.index.engine.DocumentMissingException;

/**
 * Change an item owner.
 */
public class ChangeOwnerRequest extends AppRequest {
  
  /** Instance variables. */
  private String id;
  private String newOwner;
    
  /** Constructor. */
  public ChangeOwnerRequest() {
    super();
  }
  
  /** The item id. */
  public String getId() {
    return id;
  }
  /** The item id. */
  public void setId(String id) {
    this.id = id;
  }
  
  /** The new owner. */
  public String getNewOwner() {
    return newOwner;
  }
  /** The new owner. */
  public void setNewOwner(String newOwner) {
    this.newOwner = newOwner;
  }
  
  /** Methods =============================================================== */
  
  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();
    String id = getId();
    if (id == null || id.length() == 0) {
      response.writeIdIsMissing(this);
      return response;
    }
    String newOwner = getNewOwner();
    if (newOwner == null || newOwner.length() == 0) {
      response.writeMissingParameter(this,"newOwner");
      return response;
    }
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    AccessUtil au = new AccessUtil();
    id = au.determineId(id);
    au.ensureAdmin(getUser());
    
    String ownerField = FieldNames.FIELD_SYS_OWNER;
    UpdateRequestBuilder updateRequest = ec.getTransportClient().prepareUpdate(
        ec.getItemIndexName(),ec.getItemIndexType(),getId());
    updateRequest.setDoc(ownerField,newOwner);
    
    try {
      UpdateResponse updateResponse = updateRequest.get();
      this.writeOk(response,updateResponse.getId());
    } catch (DocumentMissingException e) {
      response.writeIdNotFound(this,id);
    }
    return response;
  }
  
  /**
   * Initialize.
   * @param id the item id
   * @param newOwner the new owner
   */
  public void init(String item, String newOwner) {
    this.setId(item);
    this.setNewOwner(newOwner);
  }
  
  /**
   * Write the response. 
   * @param response the response
   * @param id the item id
   */
  public void writeOk(AppResponse response, String id) {
    JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
    jsonBuilder.add("id",id);
    jsonBuilder.add("status","updated");
    response.writeOkJson(this,jsonBuilder);
  }
  
}
