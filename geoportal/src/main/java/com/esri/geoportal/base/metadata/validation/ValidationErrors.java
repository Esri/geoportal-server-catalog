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
package com.esri.geoportal.base.metadata.validation;
import java.util.ArrayList;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

/**
 * A list of validation errors.
 */
@SuppressWarnings("serial")
public class ValidationErrors extends ArrayList<ValidationError> {

  /** Constructor. */
  public ValidationErrors() {}
  
  /** 
   * Add json errors.
   * @param jsonBuilder the parent json object
   */
  public void appendToJson(JsonObjectBuilder jsonBuilder) {
    if (this.size() == 0) return;
    JsonArrayBuilder arrayBuilder = Json.createArrayBuilder();
    for (ValidationError error: this) {
      String code = error.getReasonCode();
      String text = error.getMessage();
      if (code == null) code = "unspecified";
      JsonObjectBuilder jsonErr = Json.createObjectBuilder();
      jsonErr.add("reason",code);
      if (text != null && text.length() > 0) {
        jsonErr.add("details",text);
      }
      arrayBuilder.add(jsonErr);
    }
    jsonBuilder.add("validationErrors",arrayBuilder);
  }
    
}

