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
package com.esri.geoportal.lib.elastic.response;

import com.esri.geoportal.base.xml.XmlUtil;

/**
 * An OGC-OWS related exception.
 */
@SuppressWarnings("serial")
public class OwsException extends RuntimeException {

  /** "InvalidFormat" - Request specifies a Format not offered by this server.*/
  public static final String OWSCODE_InvalidFormat = "InvalidFormat";

  /** "InvalidParameterValue" - Request contains an invalid parameter value. */
  public static final String OWSCODE_InvalidParameterValue = "InvalidParameterValue";

  /** "MissingParameterValue" - Request does not include a parameter value, and this server did not declare a default value for that parameter. */
  public static final String OWSCODE_MissingParameterValue = "MissingParameterValue";

  /** "NoApplicableCode" - A code representing this exception has not been defined. */
  public static final String OWSCODE_NoApplicableCode = "NoApplicableCode";

  /** "OperationNotSupported" - Request is for an operation that is not supported by this server. */
  public static final String OWSCODE_OperationNotSupported = "OperationNotSupported";

  /** "VersionNegotiationFailed" - List of versions in "acceptVersions" parameter value did not include any version supported by this server. */
  public static final String OWSCODE_VersionNegotiationFailed = "VersionNegotiationFailed";

  /** The code. */ 
  private String code = null;

  /** The locator. */
  private String locator = null;

  /** The text. */
  private String text = null;

  /**
   * Construct based upon a code, a locator and a text message.
   * @param code the error code
   * @param locator the locator
   * @param text the error message
   */
  public OwsException(String code, String locator, String text) {
    super();
    this.code = code;
    this.locator = locator;
    this.text = text;
    if ((this.locator != null) && this.locator.startsWith("@")) {
      this.locator = this.locator.substring(1);
    }
  }

  /**
   * Construct based upon an error message.
   * @param text the error message
   */
  public OwsException(String text) {
    super();
    this.code = OwsException.OWSCODE_NoApplicableCode;
    this.text = text;
  }

  /**
   * Construct based upon a cause.
   * @param cause the cause
   */
  public OwsException(Throwable cause) {
    this(null,cause);
  }

  /**
   * Construct based upon an error message and a cause.
   * @param text the error message
   * @param cause the cause
   */
  public OwsException(String text, Throwable cause) {
    super(cause);
    this.code = OwsException.OWSCODE_NoApplicableCode;
    this.text = text;
    if ((this.text == null) || (this.text.length() == 0)) {
      this.text = cause.getMessage();
    }
    if ((this.text == null) || (this.text.length() == 0)) {
      this.text = cause.toString();
    }
  }

  /** properties ============================================================== */

  /**
   * Gets the code.
   * @return the code
   */
  public String getCode() {
    return this.code;
  }

  /**
   * Gets the locator.
   * @return the locator
   */
  public String getLocator() {
    return this.locator;
  }

  /**
   * Gets the message associated with this exception.
   * @return the error message
   */
  @Override
  public String getMessage() {
    StringBuilder sb = new StringBuilder();
    sb.append(this.code);
    if ((this.locator != null) && (this.locator.length() > 0)) {
      sb.append(": ").append(this.locator);
    }
    if ((this.text != null) && (this.text.length() > 0)) {
      sb.append(": ").append(this.text);
    }
    return sb.toString();
  }

  /**
   * Creation an OWS ExceptionReport string (XML).
   * @return the exception report string
   */
  public String getReport() {
    String p1 = ResponseUtil.NL;
    String p2 = p1+"\t";
    String p3 = p2+"\t";

    if (this.code == null) {
      this.code = OwsException.OWSCODE_NoApplicableCode;
    }
    String version = "3.0.0";
    StringBuilder sb = new StringBuilder(ResponseUtil.XML_HEADER);
    sb.append("\r\n<ExceptionReport");  
    sb.append(" version=\"").append(XmlUtil.escape(version)).append("\"");
    sb.append(" xmlns=\"").append(XmlUtil.escape(ResponseUtil.URI_OWS)).append("\"");
    sb.append(">\r\n<Exception");
    sb.append(" exceptionCode=\"").append(XmlUtil.escape(this.code)).append("\"");
    if ((this.locator != null) && (this.locator.length() > 0)) {
      sb.append(" locator=\"").append(XmlUtil.escape(this.locator)).append("\"");
    }
    sb.append(">");

    sb.append(p3).append("<ExceptionText>");
    String txt = this.text;
    if (txt == null) txt = "";
    if (txt.startsWith("<![CDATA[")) {
      sb.append(p1).append(txt);
    } else {
      sb.append(p1).append(XmlUtil.escape(txt));
    }
    sb.append(p3).append("</ExceptionText>");

    sb.append(p2).append("</Exception>");
    sb.append(p1).append("</ExceptionReport>");
    return sb.toString();
  }

}
