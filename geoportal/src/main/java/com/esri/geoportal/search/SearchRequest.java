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
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

public class SearchRequest {
  
  /** The script engines. */
  private static Map<String,ScriptEngine> ENGINES = Collections.synchronizedMap(new HashMap<String,ScriptEngine>());
  
  /** Instance variables. */
  private AsyncResponse asyncResponse;
  private String javascriptFile = "gs/context/nashorn/execute.js";
  private Response response;

  /** Constructor. */
  public SearchRequest() {}
  
  /** Construct with an async response. */
  public SearchRequest(AsyncResponse asyncResponse) {
    this.asyncResponse = asyncResponse;
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
  
  /** Get a cached script engine. */
  protected ScriptEngine getCachedEngine(String javascriptFile) 
      throws URISyntaxException, IOException, ScriptException {
    ScriptEngine engine = null;
    synchronized(ENGINES) {
      engine = ENGINES.get(javascriptFile);
      if (engine == null) {
        URL url = Thread.currentThread().getContextClassLoader().getResource(javascriptFile);
        URI uri = url.toURI();
        String script = new String(Files.readAllBytes(Paths.get(uri)),"UTF-8");
        ScriptEngineManager engineManager = new ScriptEngineManager();
        engine = engineManager.getEngineByName("nashorn");
        engine.eval(script);
        ENGINES.put(javascriptFile,engine);
      }
    }
    return engine;
  }
  
  /** Get the Elasticsearch _search url */
  private String getGeoportalElasticsearchUrl() {
    String[] nodes = null;
    int port = 9200;
    try {
      nodes = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().nodesToArray();
      port = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getHttpPort();
    } catch (Throwable t) {
      t.printStackTrace();
    }
    if ((nodes != null) && (nodes.length > 0)) {
      for (String node: nodes) {
        // TODO configure this a different way?
        String url = "http://"+node+":"+port+"/metadata/item/_search";
        return url;
      }
    }
    return null;
  }
  
  /** Get the request header map. */
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
  
  /** The JavaScript file name. */
  public String getJavascriptFile() {
    return javascriptFile;
  }
  /** The JavaScript file name. */
  public void setJavascriptFile(String javascriptFile) {
    this.javascriptFile = javascriptFile;
  }
  
  /** Get the request parameter map from the servlet request. */
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
  
  /** Get the request parameter map from the rest parameters. */
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
  
  /** Get the task options. */
  private JsonObjectBuilder getTaskOptions(HttpServletRequest hsr) {
    JsonObjectBuilder options = Json.createObjectBuilder();
    options.add("async",(this.asyncResponse != null));
    return options;
  }
  
  /**
   * Execute the request.
   * @param hsr the servlet request
   */
  public void execute(HttpServletRequest hsr) {
    this.execute(hsr,null,null);
  }
  
  /**
   * Execute the request.
   * @param hsr the servlet request
   * @param requestParams the rest parameters
   */
  public void execute(HttpServletRequest hsr, MultivaluedMap<String, String> requestParams) {
    this.execute(hsr,requestParams,null);
  }
  
  /**
   * Execute the request.
   * @param hsr the servlet request
   * @param body the request body
   */
  public void execute(HttpServletRequest hsr, String body) {
    this.execute(hsr,null,body);
  }
  
  /**
   * Execute the request.
   * @param hsr the servlet request
   * @param requestParams the rest parameters
   * @param body the request body
   */
  public void execute(HttpServletRequest hsr, MultivaluedMap<String, String> requestParams, String body) {
    try {
      String geoportalElasticsearchUrl = getGeoportalElasticsearchUrl();
      String url = hsr.getRequestURL().toString();
      String qstr = hsr.getQueryString();
      if (qstr != null && qstr.length() > 0) {
        url += "?" + qstr;
      }
      JsonObjectBuilder info = Json.createObjectBuilder();
      info.add("requestUrl",url);
      if (body ==null) info.addNull("requestBody");
      else info.add("requestBody",body);
      info.add("baseUrl",this.getBaseUrl(hsr));
      info.add("headerMap",this.getHeaderMap(hsr));
      if (requestParams != null) {
        info.add("parameterMap",this.getParameterMap(requestParams));
      } else {
        info.add("parameterMap",this.getParameterMap(hsr));
      }
      if (geoportalElasticsearchUrl != null) {
        info.add("geoportalElasticsearchUrl",geoportalElasticsearchUrl);
      }
      info.add("taskOptions",this.getTaskOptions(hsr));
      String sRequestInfo = info.build().toString();
      
      ScriptEngine engine = this.getCachedEngine(this.javascriptFile);
      Invocable invocable = (Invocable)engine;
      invocable.invokeFunction("execute",this,sRequestInfo);
    } catch (Throwable t) {
      t.printStackTrace();
      String msg = "{\"error\": \"Error processing request.\"}";
      putResponse(500,MediaType.APPLICATION_JSON,msg);
    }
  }
  
  /**
   * Put the response.
   * @param status the status
   * @param mediaType the media type 
   * @param entity the response body
   */
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
