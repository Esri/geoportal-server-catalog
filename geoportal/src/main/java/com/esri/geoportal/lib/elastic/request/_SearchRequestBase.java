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
import com.esri.geoportal.context.AppRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Search for items (base).
 */
public abstract class _SearchRequestBase extends AppRequest {

  /** Instance variables . */
  private String body;
  private String f;
  private int inputIndexOffset = 0;
  private boolean isItemByIdRequest;
  private Map<String,String> overrideParameters = new HashMap<String,String>();
  private Map<String,String[]> parameterMap;

  /** Constructor */
  public _SearchRequestBase() {
    super();
  }

  /** The request body. */
  public String getBody() {
    return body;
  }
  /** The request body. */
  public void setBody(String body) {
    this.body = body;
  }

  /** The response format. */
  public String getF() {
    return f;
  }
  /** The response format. */
  public void setF(String f) {
    this.f = f;
  }
  
  /** The index number of the first overall search result when specifying the from parameter (0 or 1, 0 is the default). */
  public int getInputIndexOffset() {
    return inputIndexOffset;
  }
  /** The index number of the first overall search result when specifying the from parameter (0 or 1, 0 is the default). */
  public void setInputIndexOffset(int inputIndexOffset) {
    this.inputIndexOffset = inputIndexOffset;
  }
  
  /** True if the request is for an item by id. */
  public boolean getIsItemByIdRequest() {
    return isItemByIdRequest;
  }
  /** True if the request is for an item by id. */
  public void setIsItemByIdRequest(boolean isItemByIdRequest) {
    this.isItemByIdRequest = isItemByIdRequest;
  }

  /** The override parameters. */
  public Map<String, String> getOverrideParameters() {
    return overrideParameters;
  }
  /** The override parameters. */
  public void setOverrideParameters(Map<String, String> overrideParameters) {
    this.overrideParameters = overrideParameters;
  }

  /** The request parameter map. */
  public Map<String, String[]> getParameterMap() {
    return parameterMap;
  }
  /** The request parameter map. */
  public void setParameterMap(Map<String, String[]> parameterMap) {
    this.parameterMap = parameterMap;
  }

  /** Methods =============================================================== */

  /**
   * Get a request parameter.
   * @param name the parameter name
   * @return the value
   */
  public String getParameter(String name) {  
    String[] a = getParameterValues(name);
    if (a != null) {
      if (a.length == 0) return "";
      else return a[0];
    }
    return null;
  }

  /**
   * Get a request parameter values.
   * @param name the parameter name
   * @return the values
   */
  public String[] getParameterValues(String name) {
    if (getParameterMap() == null) return null;
    if (this.getOverrideParameters() != null) {
      for (Map.Entry<String,String> entry: getOverrideParameters().entrySet()) {
        if (entry.getKey().equalsIgnoreCase(name)) {
          return new String[]{entry.getValue()};
        }
      }
    }
    for (Map.Entry<String,String[]> entry: getParameterMap().entrySet()) {
      if (entry.getKey().equalsIgnoreCase(name)) {
        return entry.getValue();
      }
    }
    return null;
  }
}
