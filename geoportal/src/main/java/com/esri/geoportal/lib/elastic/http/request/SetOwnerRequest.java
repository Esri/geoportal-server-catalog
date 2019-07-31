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
import com.esri.geoportal.lib.elastic.util.FieldNames;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

/**
 * Set the owner for one or more items.
 */
public class SetOwnerRequest extends com.esri.geoportal.lib.elastic.request.SetOwnerRequest {
 
  
  /** Constructor. */
  public SetOwnerRequest() {
    super();
    this.setUseHttpClient(true);
  }

  /** Methods =============================================================== */

  @Override
  public AppResponse execute() throws Exception {
    /*
    http://localhost:8080/geoportal/rest/metadata/setOwner?id=68e65338e166458d8425775114487b31&newOwner=publisher
    
    newOwner=
    */
    
    setAdminOnly(true);
    setProcessMessage("SetOwner");
    AppResponse response = new AppResponse();
    
    String newOwner = getParameter("newOwner");
    if (newOwner != null) newOwner = newOwner.trim();
    if (newOwner == null || newOwner.length() == 0) {
      response.writeMissingParameter(this,"newOwner");
      return response;
    }
    
    JsonObjectBuilder jso = Json.createObjectBuilder();
    jso.add(FieldNames.FIELD_SYS_OWNER,newOwner);
    jso.add(FieldNames.FIELD_SYS_OWNER_TXT,newOwner);
    //jso.add(FieldNames.FIELD_SYS_MODIFIED,DateUtil.nowAsString()); // TODO should this be set?
    setUpdateSource(jso.build().toString());
    
    //System.err.println("updateSource="+this.getUpdateSource());
    //if (true) throw new RuntimeException("SetOwnerRequest: temporary stop");
    return super.execute();
  }

}
