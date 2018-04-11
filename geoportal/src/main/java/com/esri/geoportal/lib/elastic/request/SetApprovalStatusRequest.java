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
import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

/**
 * Set the approval status for one or more items.
 */
public class SetApprovalStatusRequest extends BulkEditRequest {
  
  /** Constructor. */
  public SetApprovalStatusRequest() {
    super();
  }
  
  @Override
  public AppResponse execute() throws Exception {
    /*
    http://localhost:8080/geoportal/rest/metadata/setApprovalStatus?id=68e65338e166458d8425775114487b31&approvalStatus=draft
    
    approvalStatus=
    */
    
    setAdminOnly(false);
    setProcessMessage("SetApprovalStatus");
    AppResponse response = new AppResponse();
    if (!GeoportalContext.getInstance().getSupportsApprovalStatus()) {
      String msg = "Not implemented";
      response.writeNotImplemented(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    
    String status = getParameter("approvalStatus");
    if (status != null) status = status.trim();
    if (status == null || status.length() == 0) {
      response.writeMissingParameter(this,"approvalStatus");
      return response;
    }
    status = status.toLowerCase();
    if (!status.equals("approved") && !status.equals("reviewed") &&
        !status.equals("disapproved") && !status.equals("incomplete") && 
        !status.equals("posted") && !status.equals("draft")) {
      String msg = "approvalStatus must be approved, reviewed, disapproved, incomplete, posted or draft";
      response.writeBadRequest(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    if (status.equals("approved") || status.equals("reviewed") || status.equals("disapproved")) {
      setAdminOnly(true);
    }
    
    JsonObjectBuilder jso = Json.createObjectBuilder();
    jso.add(FieldNames.FIELD_SYS_APPROVAL_STATUS,status);
    //jso.add(FieldNames.FIELD_SYS_MODIFIED,DateUtil.nowAsString()); // TODO should this be set?
    setUpdateSource(jso.build().toString());
    
    //System.err.println("updateSource="+this.getUpdateSource());
    //if (true) throw new RuntimeException("SetApprovalStatusRequest: temporary stop");
    return super.execute();
  }
  
}
