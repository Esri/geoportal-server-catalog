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
import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.search.SearchHit;

import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.lib.elastic.ElasticContext;


/**
 * Delete one or more items.
 */
public class DeleteItemsRequest extends BulkEditRequest {
  
  /** Constructor. */
  public DeleteItemsRequest() {
    super();
    this.setResponseStatusAction("deleted");
  }
  
  @Override
  protected void appendHit(ElasticContext ec, BulkRequestBuilder request, SearchHit hit) {
    request.add(ec.getTransportClient().prepareDelete(
      ec.getItemIndexName(),ec.getActualItemIndexType(),hit.getId())
    );
    request.add(ec.getTransportClient().prepareDelete(
      ec.getItemIndexName(),ec.getXmlIndexType(),hit.getId()+"_xml")
    );
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
