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
package com.esri.geoportal.base.util.exception;

/**
 * An invalid parameter exception.
 */
@SuppressWarnings("serial")
public class InvalidParameterException extends RuntimeException {
  
  /** Instance variables. */
  private String parameterName;
  
  /**
   * Constructor.
   * @param parameterName the parameter name
   */
  public InvalidParameterException(String parameterName) {
    super("Invalid parameter: "+parameterName);
    this.parameterName = parameterName;
  }
  
  /**
   * Constructor.
   * @param parameterName the parameter name
   * @param message the message
   */
  public InvalidParameterException(String parameterName, String message) {
    super(message);
    this.parameterName = parameterName;
  }

  /** The parameter name. */
  public String getParameterName() {
    return parameterName;
  }
  /** The parameter name. */
  public void setParameterName(String parameterName) {
    this.parameterName = parameterName;
  }
  
}
