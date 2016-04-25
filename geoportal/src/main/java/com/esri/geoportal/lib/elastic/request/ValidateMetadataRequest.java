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
import javax.json.Json;
import javax.json.JsonObjectBuilder;

import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.base.metadata.validation.ValidationException;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;

/**
 * Validate metadata.
 */
public class ValidateMetadataRequest extends AppRequest {
  
  /** Instance variables. */
  private String xml;
    
  /** Constructor. */
  public ValidateMetadataRequest() {
    super();
  }

  /** The metadata xml. */
  public String getXml() {
    return xml;
  }
  /** The metadata xml */
  public void setXml(String xml) {
    this.xml = xml;
  }
  
  /** Methods =============================================================== */

  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();
    try {
      MetadataDocument mdoc = new MetadataDocument();
      mdoc.setXml(this.getXml());
      mdoc.interrogate();
      mdoc.evaluate();
      mdoc.validate();
      writeOk(response,null);
    } catch (ValidationException e) {
      writeOk(response,e);
    }
    return response;
  }
  
  /**
   * Initialize.
   * @param xml the xml
   */
  public void init(String xml) {
    this.setXml(xml);
  }
  
  /**
   * Write the response. 
   * @param response the response
   * @param e the validation exception (if invalid)
   */
  public void writeOk(AppResponse response, ValidationException e) {
    JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
    jsonBuilder.add("isValid",(e == null));
    if (e != null && e.getValidationErrors() != null) {
      e.getValidationErrors().appendToJson(jsonBuilder);
    }
    response.writeOkJson(this,jsonBuilder);
  }
  
}
