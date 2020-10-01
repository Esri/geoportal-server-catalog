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
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.lib.elastic.ElasticContext;
import javax.json.Json;
import javax.json.JsonObjectBuilder;

/**
 * Delete one or more items.
 */
public class DeleteItemsRequest extends com.esri.geoportal.lib.elastic.request.DeleteItemsRequest {
  
  /** Constructor. */
  public DeleteItemsRequest() {
    super();
    this.setResponseStatusAction("deleted");
    this.setUseHttpClient(true);
  }
    
  /**
   * Append the scroller hit to the bulk request (HTTP).
   * @param ec the Elastic context
   * @param request the request
   * @param hit the hit
   */
  protected void appendHit(ElasticContext ec, StringBuilder data, com.esri.geoportal.lib.elastic.http.util.SearchHit hit) {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
    JsonObjectBuilder line1 = Json.createObjectBuilder();
    JsonObjectBuilder joBuilder = Json.createObjectBuilder()
            .add("_id",hit.getId());
    if (!ec.getIs7Plus()) {
      joBuilder =joBuilder.add("_type",ec.getActualItemIndexType());
    }
    line1.add("delete", joBuilder);
    data.append(line1.build().toString()).append("\n");
    if (ec.getUseSeparateXmlItem()) {
      JsonObjectBuilder line2 = Json.createObjectBuilder();
      line2.add("delete", Json.createObjectBuilder()
        .add("_id",hit.getId()+"_xml")
        .add("_type",ec.getXmlIndexType())
      );
      data.append(line2.build().toString()).append("\n");
    }
  }
  
  @Override
  public AppResponse execute() throws Exception {
    /*
    http://localhost:8080/geoportal/rest/metadata/deteteItems?id=68e65338e166458d8425775114487b31
    */
    
    setAdminOnly(false);
    setProcessMessage("DeleteItems");
    //if (true) throw new RuntimeException("DeleteItemsRequest: temporary stop");
    return super.execute();
  }
  
}
