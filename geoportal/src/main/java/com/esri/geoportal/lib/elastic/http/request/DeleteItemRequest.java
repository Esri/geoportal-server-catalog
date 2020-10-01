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
package com.esri.geoportal.lib.elastic.http.request;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.http.util.AccessUtil;

import java.io.FileNotFoundException;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 * Get an item.
 */
public class DeleteItemRequest extends com.esri.geoportal.lib.elastic.request.DeleteItemRequest {
  
  /** Instance variables. */
  private String id;
  
  /** Constructor. */
  public DeleteItemRequest() {
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

  /** Methods =============================================================== */
  
  private boolean checkResult(String result) { 
    JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(result);
    if (jso.containsKey("result")) {
      String v = jso.getString("result");
      return (v.equals("deleted"));
    }
    return false;
  }

  @Override
  public AppResponse execute() throws Exception {    
    AppResponse response = new AppResponse();
    String id = getId();
    if (id == null || id.length() == 0) {
      response.writeIdIsMissing(this);
      return response;
    }
    AccessUtil au = new AccessUtil();
    id = au.determineId(id); // TODO
    au.ensureWriteAccess(getUser(),id); // TODO
    
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    ElasticClient client = ElasticClient.newClient();
    String url = client.getItemUrl(ec.getIndexName(),ec.getActualItemIndexType(),id);
    boolean useSeparateXmlItem = ec.getUseSeparateXmlItem();
    boolean deletingXml = false;
    
    try {
      String result = client.sendDelete(url);
      if (checkResult(result)) {
        if (useSeparateXmlItem) {
          deletingXml = true;
          String url2 = client.getXmlUrl(ec.getIndexName(),ec.getXmlIndexType(),id);
          String result2 = client.sendDelete(url2);
          if (checkResult(result2)) {
            this.writeOk(response,id);
          } else {
            throw new Exception("Error deleting item.");
          }
        } else {
          this.writeOk(response,id);
        }
      } else {
        throw new Exception("Error deleting XML for item.");
      }
    } catch (FileNotFoundException e) {
      if (deletingXml) {
        this.writeOk(response,id);
      } else {
        response.writeIdNotFound(this,id);
      }
    }
    return response;
  }
  
  /**
   * Initialize.
   * @param id the item id
   */
  public void init(String id) {
    this.setId(id);
  }
  
  /**
   * Write the response. 
   * @param response the response
   * @param id the item id
   */
  public void writeOk(AppResponse response, String id) {
    JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
    jsonBuilder.add("id",id);
    jsonBuilder.add("status","deleted");
    response.writeOkJson(this,jsonBuilder);
  }

}
