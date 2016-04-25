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
import com.esri.geoportal.base.util.JsonUtil;
import javax.json.Json;
import javax.json.JsonObjectBuilder;

/**
 * An exception encountered while validating metadata.
 */
@SuppressWarnings("serial")
public class ValidationException extends Exception {
  
  /** Instance variables. */
  private String key;  
  private ValidationErrors validationErrors;

  /**
   * Construct based upon an error message.
   * @param key the metadata type key
   * @param msg the error message
   * @param validationErrors the validation errors
   */
  public ValidationException(String key, String msg, ValidationErrors validationErrors) {
    super(msg);
    setKey(key);
    setValidationErrors(validationErrors);
  }

  /**
   * Gets metadata type key.
   * @return metadata type key
   */
  public String getKey() {
    return key;
  }
  /**
   * Sets metadata type key.
   * @param key metadata type key
   */
  public void setKey(String key) {
    this.key = key;
  }
  
  /**
   * Gets the validation errors.
   * @return the validation errors
   */
  public ValidationErrors getValidationErrors() {
    return validationErrors;
  }
  /**
   * Sets the validation errors.
   * @param validationErrors the validation errors
   */
  public void setValidationErrors(ValidationErrors validationErrors) {
    this.validationErrors = validationErrors;
  }
  
  /**
   * Create a json string.
   * @param pretty true for pretty json
   * @return the string
   */
  public String toJson(boolean pretty) {
    String msg = getMessage();
    if (msg == null || msg.length() == 0) {
      msg = "Exception: "+toString();
    }
    ValidationErrors verrors = getValidationErrors();
    if (verrors != null && verrors.size() > 0) {
      JsonObjectBuilder jb = Json.createObjectBuilder();
      jb.add("message",msg);
      verrors.appendToJson(jb);
      JsonObjectBuilder je = Json.createObjectBuilder();
      je.add("error",jb);
      return JsonUtil.toJson(je.build(),pretty);
    } else {
      return JsonUtil.newErrorResponse(msg,pretty);
    }
  }

}
