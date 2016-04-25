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
package com.esri.geoportal.context;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.UriInfo;

/**
 * App request.
 */
public abstract class AppRequest {
  
  /** Instance variables. */
  private String baseUrl;
  private Map<String,Object> data = new LinkedHashMap<String,Object>();
  private boolean pretty;
  private AppUser user;
  
  /** Constructor. */
  public AppRequest() {}
  
  /** The base url for the application (null if not set). */
  public String getBaseUrl() {
    return baseUrl;
  }
  /** The base url for the application */
  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  /** A free form object map associated with this request. */
  public Map<String,Object> getData() {
    return data;
  }
  /** A free form object map associated with this request. */
  public void setData(Map<String,Object> data) {
    this.data = data;
  }
  
  /** True for a pretty print json response. */
  public boolean getPretty() {
    return pretty;
  }
  /** True for a pretty print json response. */
  public void setPretty(boolean pretty) {
    this.pretty = pretty;
  } 

  /** The active user. */
  public AppUser getUser() {
    return user;
  }
  /** The active user. */
  public void setUser(AppUser user) {
    this.user = user;
  }
  
  /** Methods =============================================================== */
  
  /**
   * Execute the request.
   * @return the response
   * @throws Exception is an exception occurs
   */
  public abstract AppResponse execute() throws Exception;
  
  /**
   * Initialize.
   * @param user the active user
   * @param pretty True for a pretty print json response
   */
  public void init(AppUser user, boolean pretty) {
    this.setUser(user);
    this.setPretty(pretty);
  }
  
  /**
   * Initialize the base url.
   * @param hsr the request
   * @param uriInfo the uri info
   */
  public void initBaseUrl(HttpServletRequest hsr, UriInfo uriInfo) {
    // TODO reverse proxy?

    // X-Forwarded-For
    // Forwarded: for=192.0.2.60; proto=http; by=203.0.113.43
    // X-Forwarded-Proto (http vs https)
    // "reverseProxy.baseContextPath"
    
    StringBuffer requestURL = hsr.getRequestURL();
    String ctxPath = hsr.getContextPath();
    String baseUrl = requestURL.substring(0,requestURL.indexOf(ctxPath)+ctxPath.length());
    this.setBaseUrl(baseUrl);
  }
  
}
