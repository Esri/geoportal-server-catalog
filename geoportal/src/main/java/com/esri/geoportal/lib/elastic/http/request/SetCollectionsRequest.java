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
import com.esri.geoportal.lib.elastic.request.BulkEditRequest;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import java.util.Arrays;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

/**
 * Set the access level for one or more items.
 */
public class SetCollectionsRequest extends BulkEditRequest {
  
  /** Constructor. */
  public SetCollectionsRequest() {
    super();
    this.setUseHttpClient(true);
  }
  
  @Override
  public AppResponse execute() throws Exception {
    /*
    http://localhost:8080/geoportal/rest/metadata/setCollections?id=68e65338e166458d8425775114487b31&collections=collection1,collection2
    
    collections=
    */
    
    setAdminOnly(false);
    setProcessMessage("SetCollections");
    AppResponse response = new AppResponse();
    if (!GeoportalContext.getInstance().getSupportsCollections()) {
      String msg = "Not implemented";
      response.writeNotImplemented(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    
    JsonObjectBuilder jso = Json.createObjectBuilder();
    
    String collectionsStr = getParameter("collections");
    if (collectionsStr != null) {
      collectionsStr = collectionsStr.trim();
      String [] collections = collectionsStr.split(",");
      
      JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
      Arrays.stream(collections).forEach(coll -> arrBuilder.add(coll));
      
      jso.add(FieldNames.FIELD_SYS_COLLECTIONS,arrBuilder);
    }
    
    setUpdateSource(jso.build().toString());
    return super.execute();
  }
  
}
