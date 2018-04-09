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
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

/**
 * Set the access level for one or more items.
 */
public class SetAccessRequest extends BulkEditRequest {
  
  /** Constructor. */
  public SetAccessRequest() {
    super();
  }
  
  @Override
  public AppResponse execute() throws Exception {
    /*
    http://localhost:8080/geoportal/rest/metadata/setAccess?id=68e65338e166458d8425775114487b31&access=private&group=g1&group=g2
    
    access=&group=&group=
    */
    
    setAdminOnly(false);
    setProcessMessage("SetAccess");
    AppResponse response = new AppResponse();
    if (!GeoportalContext.getInstance().getSupportsGroupBasedAccess()) {
      String msg = "Not implemented";
      response.writeNotImplemented(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    
    boolean hasGroups = false;
    String[] groups = getParameterValues("group");
    if (groups != null && groups.length == 1) {
      // TODO check comma delimited?
    }
    JsonArrayBuilder jsaGroups = Json.createArrayBuilder();
    if (groups != null) {
      for (String group: groups) {
        if (group != null) group = group.trim();
        if (group != null && group.length() > 0) {
          jsaGroups.add(group);
          hasGroups = true;
        }
      }         
    }
    
    String access = getParameter("access");
    if (access != null) access = access.trim();
    if (access == null || access.length() == 0) {
      if (hasGroups) {
        access = "private";
      } else {
        response.writeMissingParameter(this,"access");
        return response;
      }
    }
    access = access.toLowerCase();
    if (!access.equals("public") && !access.equals("private")) {
      String msg = "access must be public or private";
      response.writeBadRequest(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    /*
    // TODO should this be enforced? 
    if (access.equals("public") && hasGroups) {
      String msg = "access must be private when groups are specified";
      response.writeBadRequest(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    */
    
    JsonObjectBuilder jso = Json.createObjectBuilder();
    jso.add(FieldNames.FIELD_SYS_ACCESS,access);
    if (hasGroups) {
      jso.add(FieldNames.FIELD_SYS_ACCESS_GROUPS,jsaGroups);
    } else {
      // TODO? is null or empty array better?
      jso.addNull(FieldNames.FIELD_SYS_ACCESS_GROUPS);
    }
    
    //jso.add(FieldNames.FIELD_SYS_MODIFIED,DateUtil.nowAsString()); // TODO should this be set?
    setUpdateSource(jso.build().toString());
    
    //System.err.println("updateSource="+this.getUpdateSource());
    //if (true) throw new RuntimeException("SetAccessRequest: temporary stop");
    return super.execute();
  }
  
}
