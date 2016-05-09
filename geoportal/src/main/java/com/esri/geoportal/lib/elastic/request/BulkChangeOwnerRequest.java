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
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.lib.elastic.util.Scroller;

import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;

/**
 * Bulk ownership change.
 */
public class BulkChangeOwnerRequest extends BulkRequest {
  
  /** Instance variables. */
  private String owner;
  private String newOwner;
    
  /** Constructor. */
  public BulkChangeOwnerRequest() {
    super();
  }
  
  /** The new owner. */
  public String getNewOwner() {
    return newOwner;
  }
  /** The new owner. */
  public void setNewOwner(String newOwner) {
    this.newOwner = newOwner;
  }
  
  /** The owner. */
  public String getOwner() {
    return owner;
  }
  /** The owner. */
  public void setOwner(String owner) {
    this.owner = owner;
  }
  
  /** Methods =============================================================== */
  
  /**
   * Append the scroller hit to the buld request.
   * @param ec the Elastic context
   * @param request the request
   * @param hit the hit
   */
  protected void appendHit(ElasticContext ec, BulkRequestBuilder request, SearchHit hit) {
    request.add(ec.getTransportClient().prepareUpdate(
        ec.getItemIndexName(),ec.getItemIndexType(),hit.getId()
      ).setDoc(FieldNames.FIELD_SYS_OWNER,getNewOwner()));
  }
  
  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();
    String owner = getOwner();
    if (owner == null || owner.length() == 0) {
      response.writeMissingParameter(this,"owner");
      return response;
    }
    String newOwner = getNewOwner();
    if (newOwner == null || newOwner.length() == 0) {
      response.writeMissingParameter(this,"newOwner");
      return response;
    }
    this.setDocsPerRequest(10000);
    this.setAdminOnly(true);
    setProcessMessage("Bulk Change Owner: "+getOwner()+"->"+getNewOwner());
    return super.execute();
  }
  
  /**
   * Initialize.
   * @param currentOwner the current owner
   * @param newOwner the new owner
   */
  public void init(String currentOwner, String newOwner) {
    this.setOwner(currentOwner);
    this.setNewOwner(newOwner);
  }
  
  /**
   * Create the scroller.
   * @param ec the Elastic context
   * @return the scroller
   */
  protected Scroller newScroller(ElasticContext ec) {
    QueryBuilder q = QueryBuilders.matchQuery(FieldNames.FIELD_SYS_OWNER,getOwner());
    Scroller scroller = new Scroller();
    scroller.setIndexName(ec.getItemIndexName());
    scroller.setIndexType(ec.getItemIndexType());
    scroller.setQuery(q);
    scroller.setFetchSource(false);
    scroller.setPageSize(getScrollerPageSize());
    //scroller.setMaxDocs(10);
    return scroller;
  }
    
}
