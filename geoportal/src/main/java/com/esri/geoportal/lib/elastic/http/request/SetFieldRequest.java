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
import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 * Set a field value for one or more items.
 */
public class SetFieldRequest extends com.esri.geoportal.lib.elastic.request.SetFieldRequest {
  
  /** Constructor. */
  public SetFieldRequest() {
    super();
    this.setUseHttpClient(true);
  }
  
  @Override
  public AppResponse execute() throws Exception {
    /*
    http://localhost:8080/geoportal/rest/metadata/setField?id=68e65338e166458d8425775114487b31&field=myField&value=myValue
    
    field=value=
    */
    
    setAdminOnly(false);
    setProcessMessage("SetField");
    AppResponse response = new AppResponse();
    boolean underConstruction = false;
    if (underConstruction) {
      String msg = "Not implemented";
      response.writeNotImplemented(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    
    String field = getParameter("field");
    if (field != null) field = field.trim();
    if (field == null || field.length() == 0) {
      response.writeMissingParameter(this,"field");
      return response;
    }
    // TODO validate that the field is writable (_ src_ app_ user_)
    if (field.toLowerCase().startsWith("sys_")) {
      String msg = "Cannot set sys_ field values.";
      response.writeBadRequest(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    } else if (field.toLowerCase().startsWith("src_")) {
      String msg = "Cannot set src_ field values.";
      response.writeBadRequest(this,JsonUtil.newErrorResponse(msg,getPretty()));
      return response;
    }
    
    JsonObjectBuilder jso = Json.createObjectBuilder();
    String value = getParameter("value");
    if (value != null) {
      try {
        if (value.startsWith("[") && value.endsWith("]")) {
          JsonArray jsaValue = (JsonArray)JsonUtil.toJsonStructure(value);
          jso.add(field,jsaValue);
        } else if (value.startsWith("{") && value.endsWith("}")) {
          JsonObject jsoValue = (JsonObject)JsonUtil.toJsonStructure(value);
          jso.add(field,jsoValue);
        } else {
          if (value.length() == 0) {
            //jso.add(field,value);
            jso.addNull(field);
          } else if (value.equalsIgnoreCase("null")) {
            jso.addNull(field);
          } else if (field.endsWith("_b")) {
            jso.add(field, Boolean.parseBoolean(value));
          } else if (field.endsWith("_d")) {
            jso.add(field,Double.parseDouble(value));
          } else if (field.endsWith("_f")) {
            jso.add(field,Float.parseFloat(value));
          } else if (field.endsWith("_i")) {
            jso.add(field,Integer.parseInt(value));
          } else if (field.endsWith("_l")) {
            jso.add(field,Long.parseLong(value));
          } else {
            // _s _txt _dt _geo _pt _nst _obj _clob _blob
            jso.add(field,value);
          }
        }        
      } catch (Exception e) {
        String msg = e.getMessage();
        if (msg == null || msg.length() == 0) msg = e.toString();
        msg = "Invalid value parameter: "+msg;
        response.writeBadRequest(this,JsonUtil.newErrorResponse(msg,getPretty()));
        return response;
      }
    } else {
      // TODO how to set null or empty value? null=parameter not on url
      response.writeMissingParameter(this,"value");
      return response;
    }
  
    /*
    String prop = "user_tags_s";
    String v = "blue";
    String src = "ctx._source."+prop+".add(params.value)";
    HashMap<String,Object> params = new HashMap<String,Object>();
    params.put("value",v);
    Script script = new Script(ScriptType.INLINE,"painless",src,params);
    this.setUpdateScript(script);
    */
        
    jso.add(FieldNames.FIELD_SYS_MODIFIED,DateUtil.nowAsString()); // TODO should this be set?
    setUpdateSource(jso.build().toString());
    
    //System.err.println("updateSource="+this.getUpdateSource());
    //if (true) throw new RuntimeException("SetField: temporary stop");
    return super.execute();
  }
  
}
