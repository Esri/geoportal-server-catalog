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

/**
 * An error that occurred during validation.
 */
public class ValidationError {
  
  /** Reason code envelope is invalid = "envelopeIsInvalid" */
  public static final String REASONCODE_ENVELOPE_ISINVALID = "envelopeIsInvalid";
    
  /** Reason code parameter is invalid = "parameterIsInvalid" */
  public static final String REASONCODE_PARAMETER_ISINVALID = "parameterIsInvalid";
    
  /** Reason code parameter is required = "parameterIsRequired" */
  public static final String REASONCODE_PARAMETER_ISREQUIRED = "parameterIsRequired";
  
  /** Reason code Schematron exception = "schematronException" */
  public static final String REASONCODE_SCHEMATRON_EXCEPTION = "schematronException";
  
  /** Reason code Schematron rule violation = "schematronViolation" */
  public static final String REASONCODE_SCHEMATRON_VIOLATION = "schematronViolation";
  
  /** Reason code title is required = "titleIsRequired" */
  public static final String REASONCODE_TITLE_ISREQUIRED = "titleIsRequired";
  
  /** Reason code XML document is invalid = "xmlIsInvalid" */
  public static final String REASONCODE_XML_ISINVALID = "xmlIsInvalid";
  
  /** Reason code XSD reference is invalid = "xsdIsInvalid" */
  public static final String REASONCODE_XSD_ISINVALID = "xsdIsInvalid";
  
  /** Reason code XSD rule violation = "xsdViolation" */
  public static final String REASONCODE_XSD_VIOLATION = "xsdViolation";
    
  /** Instance variables. */
  protected String location;
  private String message;
  private String reasonCode = ValidationError.REASONCODE_PARAMETER_ISINVALID;
    
  /** Constructor. */
  public ValidationError() {}

  /**
   * Gets the message.
   * @return the message
   */
  public String getMessage() {
    return message;
  }
  /**
   * Sets the message.
   * @param message the message
   */
  public void setMessage(String message) {
    this.message = message;
  }

  /**
   * Gets the reason code.
   * @return the reason code
   */
  public String getReasonCode() {
    return reasonCode;
  }
  /**
   * Sets the reason code.
   * @param code the reason code
   */
  public void setReasonCode(String code) {
    reasonCode = code;
    if ( reasonCode == null || reasonCode.equals("")) {
      reasonCode = ValidationError.REASONCODE_PARAMETER_ISINVALID;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_ENVELOPE_ISINVALID)) {
      reasonCode = ValidationError.REASONCODE_ENVELOPE_ISINVALID;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_PARAMETER_ISREQUIRED)) {
      reasonCode = ValidationError.REASONCODE_PARAMETER_ISREQUIRED;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_PARAMETER_ISINVALID)) {
      reasonCode = ValidationError.REASONCODE_PARAMETER_ISINVALID;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_SCHEMATRON_EXCEPTION)) {
      reasonCode = ValidationError.REASONCODE_SCHEMATRON_EXCEPTION;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_SCHEMATRON_VIOLATION)) {
      reasonCode = ValidationError.REASONCODE_SCHEMATRON_VIOLATION;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_TITLE_ISREQUIRED)) {
      reasonCode = ValidationError.REASONCODE_TITLE_ISREQUIRED;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_XML_ISINVALID)) {
      reasonCode = ValidationError.REASONCODE_XML_ISINVALID;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_XSD_ISINVALID)) {
      reasonCode = ValidationError.REASONCODE_XSD_ISINVALID;
    } else if (reasonCode.equalsIgnoreCase(ValidationError.REASONCODE_XSD_VIOLATION)) {
      reasonCode = ValidationError.REASONCODE_XSD_VIOLATION;
    } else {
      reasonCode = ValidationError.REASONCODE_PARAMETER_ISINVALID;
    }
  }

}

