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
package com.esri.geoportal.search;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

public class SearchRequest {
  
  public AsyncResponse asyncResponse;
  public Response response;
  
  /** The script engines. */
  protected static ScriptEngines ENGINES = new ScriptEngines();
  
  /** Instance variables. */
  private String javascriptFile = "gs/context/nashorn/execute.js";

  /** Constructor. */
  public SearchRequest() {
  }
  
  public SearchRequest(AsyncResponse asyncResponse) {
    this.asyncResponse = asyncResponse;
  }
  
  /** Get a cached script engine. */
  protected ScriptEngine getCachedEngine() throws URISyntaxException, IOException, ScriptException {
    return ENGINES.getCachedEngine(javascriptFile);
  }
  
  /**
   * Get the base url.
   * @param hsr the request
   */
  public String getBaseUrl(HttpServletRequest hsr) {
    // TODO reverse proxy?
    // X-Forwarded-For
    // Forwarded: for=192.0.2.60; proto=http; by=203.0.113.43
    // X-Forwarded-Proto (http vs https)
    // "reverseProxy.baseContextPath"
    
    StringBuffer requestURL = hsr.getRequestURL();
    String ctxPath = hsr.getContextPath();
    String baseUrl = requestURL.substring(0,requestURL.indexOf(ctxPath)+ctxPath.length());
    return baseUrl;
  }

  /** The JavaScript file name. */
  public String getJavascriptFile() {
    return javascriptFile;
  }
  /** The JavaScript file name. */
  public void setJavascriptFile(String javascriptFile) {
    this.javascriptFile = javascriptFile;
  }
  
  private JsonObjectBuilder getHeaderMap(HttpServletRequest hsr) {
    JsonObjectBuilder headers = Json.createObjectBuilder();
    Enumeration<String> names = hsr.getHeaderNames();
    if (names != null) {
      while (names.hasMoreElements()) {
        String key = names.nextElement();
        Enumeration<String> values = hsr.getHeaders(key);
        if (values != null) {
          JsonArrayBuilder jArray = Json.createArrayBuilder();
          while (values.hasMoreElements()) {
            String v = values.nextElement();
            jArray.add(v);
          }
          headers.add(key,jArray);
        } else {
          headers.addNull(key);
        }
      }      
    }
    return headers;
  }
  
  private JsonObjectBuilder getParameterMap(HttpServletRequest hsr) {
    JsonObjectBuilder params = Json.createObjectBuilder();
    Map<String, String[]> requestParams = hsr.getParameterMap();
    if (requestParams != null) {
      for (Map.Entry<String, String[]> e : requestParams.entrySet()) {
        String key = e.getKey();
        String[] values = e.getValue();
        if (values != null) {
          JsonArrayBuilder jArray = Json.createArrayBuilder();
          for (String v: values) jArray.add(v);
          params.add(key,jArray);
        } else {
          params.addNull(key);
        }
      }
    }
    return params;
  }
  
  private JsonObjectBuilder getParameterMap(MultivaluedMap<String, String> requestParams) {
    JsonObjectBuilder params = Json.createObjectBuilder();
    if (requestParams != null) {
      for (Map.Entry<String,List<String>> e : requestParams.entrySet()) {
        String key = e.getKey();
        List<String> values = e.getValue();
        if (values == null) {
          params.addNull(key);
        } else {
          JsonArrayBuilder jArray = Json.createArrayBuilder();
          for (String v: values) jArray.add(v);
          params.add(key,jArray);
        }
      }
    }
    return params;
  }
  
  private JsonObjectBuilder getTaskOptions(HttpServletRequest hsr) {
    JsonObjectBuilder options = Json.createObjectBuilder();
    options.add("async",(this.asyncResponse != null));
    return options;
  }
  
  public void execute(HttpServletRequest hsr) {
    this.execute(hsr,null);
  }
  
  public void execute(HttpServletRequest hsr, MultivaluedMap<String, String> requestParams) {
    try {
      String url = hsr.getRequestURL().toString();
      String qstr = hsr.getQueryString();
      if (qstr != null && qstr.length() > 0) {
        url += "?" + qstr;
      }
      JsonObjectBuilder info = Json.createObjectBuilder();
      info.add("requestUrl",url);
      info.add("baseUrl",this.getBaseUrl(hsr));
      info.add("headerMap",this.getHeaderMap(hsr));
      if (requestParams != null) {
        info.add("parameterMap",this.getParameterMap(requestParams));
      } else {
        info.add("parameterMap",this.getParameterMap(hsr));
      }
      info.add("taskOptions",this.getTaskOptions(hsr));
      String sRequestInfo = info.build().toString();
      
      ScriptEngine engine = this.getCachedEngine();
      Invocable invocable = (Invocable)engine;
      invocable.invokeFunction("execute",this,sRequestInfo);
    } catch (Throwable t) {
      t.printStackTrace();
      String msg = "{\"error\": \"Error processing request.\"}";
      putResponse(500,MediaType.APPLICATION_JSON,msg);
    }
  }
  
  public void putResponse(int status, String mediaType, String entity) {
    //System.err.println(entity);
    //System.err.println(entity.substring(0,1000));
    Status rStatus = Status.fromStatusCode(status);
    MediaType rMediaType = MediaType.valueOf(mediaType).withCharset("UTF-8");
    this.response = Response.status(rStatus).entity(entity).type(rMediaType).build();
    if (this.asyncResponse != null) {
      this.asyncResponse.resume(this.response);
    }
  }
  
}
