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
package com.esri.geoportal.search.test;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Map;
import javax.servlet.http.HttpSession;

/**
 * Provides an implementation facade for an HttpServletRequest.
 */
@SuppressWarnings({"unchecked", "rawtypes"})
public class HttpServletRequestFacade extends HttpServletRequestImpl {
  
  public String contextPath = "/geoportal";
  public Hashtable parameters = new Hashtable();
  public String queryString = null;
  public String remoteAddr = "ip.remote.address";
  public String requestURL = "/geoportal";
  public HttpSession session = null;

  /**
   * Constructs with a supplied query string.
   * @param queryString the query string
   */
  public HttpServletRequestFacade(String requestURL) {
    this.requestURL = requestURL;
    
    String queryString = null;
    if (requestURL != null) {
      int idx = requestURL.indexOf("?");
      if (idx != -1) {
        queryString = requestURL.substring(idx+1);
        this.requestURL = requestURL.substring(0,idx);
      }
    }
    
    this.queryString = queryString;
    if (queryString != null) {
      String[] pairs = queryString.split("&");
      for (String pair: pairs) {
        String key = null;
        String value = null;
        int idx = pair.indexOf("=");
        if (idx > 0) {
          key = pair.substring(0,idx);
          value = pair.substring(idx+1);
        }
        if (key != null) {
          String[] values = (String[])this.parameters.get(key);
          if (values == null) {
            this.parameters.put(key,new String[]{value});
          } else {
            ArrayList<String> al = new ArrayList<String>();
            for (String v: values) {
              if ((value != null) && (value.length() > 0)) {
                al.add(v);
              }
            }
            al.add(value);
            this.parameters.put(key,al.toArray(new String[0]));
          }
        }
      }
    }
    
  }
  
  /**
   * Gets the context path.
   * @return the context path
   */
  @Override
  public String getContextPath() {
    return this.contextPath;
  }
  
  /**
   * Gets the first parameter values associated with a name.
   * @param parameterName the parameter name
   * @return the parameter value
   */
  @Override
  public String getParameter(String parameterName) {
    String[] values = this.getParameterValues(parameterName);
    if ((values != null) && (values.length > 0)) {
      return values[0];
    }
    return null;
  }
  
  /**
   * Gets the parameter map.
   * @return the parameter map
   */
  @Override
  public Map getParameterMap() {
    return this.parameters;
  }
  
  /**
   * Gets the parameter names.
   * @return the parameter names
   */
  @Override
  public Enumeration getParameterNames() {
    return this.parameters.keys();
  }
  
  /**
   * Gets the parameter values associated with a name.
   * @param parameterName the parameter name
   * @return the associated values
   */
  @Override
  public String[] getParameterValues(String parameterName) {
    return (String[])this.parameters.get(parameterName);
  }
  
  /**
   * Gets the query string.
   * @return the query string
   */
  @Override
  public String getQueryString() {
    return this.queryString;
  }
  

  @Override
  public String getRemoteAddr() {
    return this.remoteAddr;
  }
  public void setRemoteAddr(String remoteAddr) {
    this.remoteAddr = remoteAddr;
  }
  
  @Override
  public String getRequestURI() {
    return "";
  }

  @Override
  public StringBuffer getRequestURL() {
    return new StringBuffer(this.requestURL);
  }
  
  /**
   * Gets the session.
   * @return the session
   */
  @Override
  public HttpSession getSession() {
    return this.session;
  }

  /**
   * Gets the session.
   * @param create a new session if necessary
   * @return the session
   */
  @Override
  public HttpSession getSession(boolean create) {
    return this.session;
  }

}
