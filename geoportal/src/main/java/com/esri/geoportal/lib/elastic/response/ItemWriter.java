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
package com.esri.geoportal.lib.elastic.response;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.lib.elastic.request.GetItemRequest;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.elasticsearch.action.get.GetResponse;
/**
 * Response item writer.
 */
public class ItemWriter {
  
  /** Constructor. */
  public ItemWriter() {
    super();
  }
  
  /**
   * Make the JSON response string for a get item request.
   * @param request the request
   * @param getResponse the response
   * @return the response string
   * @throws Exception
   */
  public String makeGetResponseString(GetItemRequest request, GetResponse getResponse) 
      throws Exception {
    JsonObjectBuilder jsoRoot = Json.createObjectBuilder();
    jsoRoot.add("_index", getResponse.getIndex());
    jsoRoot.add("_type", getResponse.getType());
    jsoRoot.add("_id", getResponse.getId());
    jsoRoot.add("_version", getResponse.getVersion());
    jsoRoot.add("found", getResponse.isExists());
    
    String jsonSource = getResponse.getSourceAsString();
    JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(jsonSource);
    JsonObjectBuilder jsoSource = JsonUtil.newObjectBuilder(jso);
    if (request.getIncludeMetadata() && request.getXml() != null) {
      jsoSource.add(request.getXmlField(),request.getXml()); 
    }
    jsoRoot.add("_source",jsoSource);
    String json = JsonUtil.toJson(jsoRoot.build(),request.getPretty());
    /*
    if (request.getPretty() && json != null && json.length() > 0) {
      json = JsonUtil.toJson(JsonUtil.toJsonStructure(json),true); // TODO ??
    }
    */
    return json;
  }
  
  /**
   * Write a get response.
   * @param request the request
   * @param response the app response
   * @param getResponse the GetResponse
   * @throws Exception
   */
  public void write(GetItemRequest request, AppResponse response, GetResponse getResponse) 
      throws Exception {
    String json = makeGetResponseString(request,getResponse);
    request.writeOk(response,json);
  }
   
}
