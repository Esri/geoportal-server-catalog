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
import com.esri.geoportal.base.metadata.MetadataType;
import com.esri.geoportal.base.util.Val;

import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import javax.xml.XMLConstants;
import javax.xml.transform.Source;
import javax.xml.transform.sax.SAXSource;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Validator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.ErrorHandler;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

/**
 * Validates a document against an XML Schema Definition file.
 */
public class XsdValidator implements ErrorHandler {

  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(XsdValidator.class);
  
  /** Cache the XSDS */
  private static HashMap<String,javax.xml.validation.Schema>XSDS;
  
  /** Instance variables. */
  private ValidationErrors validationErrors;
  private String _xsdLocation = null;
  
  /** static initialization */
  static {
    XSDS = new HashMap<String,javax.xml.validation.Schema>();
  }
  
  /** Constructor. */
  public XsdValidator() {}
  
  /**
   * Gets the validation errors.
   * @return the validation errors
   */
  protected ValidationErrors getValidationErrors() {
    return validationErrors;
  }
  /**
   * Sets the validation errors.
   * @param validationErrors validation errors
   */
  protected void setValidationErrors(ValidationErrors validationErrors) {
    this.validationErrors = validationErrors;
  }
  
  // methods =====================================================================
  
  /**
   * Append an XSD validation error to the error collection.
   * <br/>The error is captured and an exception is thrown. 
   * @param e the associated SAX exception
   */
  private void appendError(SAXParseException e) {
    int nLine = e.getLineNumber();
    int nCol = e.getColumnNumber();
    String sMsg = e.getMessage();
    if (sMsg == null || sMsg.length() == 0) {
      sMsg = e.toString();
    }
    if ((nLine > 0) && (nCol > 0)) {
      sMsg = "Line "+nLine+" Column "+nCol+" "+sMsg;
    } else if (nLine > 0) {
      sMsg = "Line "+sMsg;
    } 
    ValidationError error = new ValidationError();
    error.setMessage(sMsg);
    error.setReasonCode(ValidationError.REASONCODE_XSD_VIOLATION);
    getValidationErrors().add(error);
  }
  
  /**
   * Caches a reference to an XSD for a schema.
   * @param type the subject metadata type
   */
  public static void cacheXsdReference(MetadataType type) {
    try {
      XsdValidator xsdv = new XsdValidator();
      xsdv.newValidator(type);
    } catch (ValidationException e) {
      // ignore the exception, it's been logged by the newValidator() method
    }
  }
  
  /**
   * Triggered when a SAX fatal error occurs during XSD validation.
   * <br>The error is captured and an exception is thrown. 
   * @param e the associated SAX exception
   * @throws SAXException the supplied SAXParseException is thrown to end the process
   */
  public void fatalError(SAXParseException e) throws SAXException {
    appendError(e);
    throw e;
  }
  
  /**
   * Triggered when a SAX error occurs during XSD validation.
   * <br>The error is captured bu no exception is thrown. 
   * @param e the associated SAX exception
   * @throws SAXException part of the implemented method signature but never thrown
   */
  public void error(SAXParseException e) throws SAXException {
    appendError(e);
  }
  
  /**
   * Creates a new javax.xml.validation.Validator for a metadata type.
   * <p/>
   * A validator will only be created if an XSD has been configured for
   * the metadata type.
   * <p/>
   * The XSD is cached for subsequent use.
   * @param type the metadata type
   * @return the validator (null if an XSD has not been configured for the metadata type)
   * @throws ValidationException if the XSD cannot be accessed
   */
  private javax.xml.validation.Validator newValidator(MetadataType type) throws ValidationException {
    String xsdLocation = Val.trim(_xsdLocation);
    if (xsdLocation == null || xsdLocation.length() == 0) {
      xsdLocation = Val.trim(type.getXsdLocation());
    }
    if (xsdLocation != null && xsdLocation.length() > 0) {
      String sMsg;
      ValidationError error;
      
      // find a cached XSD reference,
      // if none was found, create the reference and cache
      javax.xml.validation.Schema xsd = XSDS.get(xsdLocation);
      if (xsd == null) {
        javax.xml.validation.SchemaFactory factory = 
          javax.xml.validation.SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI); 
        factory.setResourceResolver(new RedirectingResourceResolver());
        try {
          String [] xsdLocations = xsdLocation.split(",");
          if (xsdLocations!=null && xsdLocations.length>1) {
            ArrayList<StreamSource> streamSources = new ArrayList<StreamSource>();
            for (String systemId : xsdLocations) {
              streamSources.add(new StreamSource(systemId));
            }
            xsd = factory.newSchema(streamSources.toArray(new StreamSource[streamSources.size()]));
            XSDS.put(xsdLocation,xsd);
          } else {
            URL url = new URL(xsdLocation);
            xsd = factory.newSchema(url);
            XSDS.put(xsdLocation,xsd);
          }
        } catch (MalformedURLException e) {
          sMsg = "Malformed XSD URL, metadataType="+type.getKey()+" xsdLocation="+xsdLocation;
          LOGGER.error(sMsg,e);
          error = new ValidationError();
          error.setMessage(sMsg);
          error.setReasonCode(ValidationError.REASONCODE_XSD_ISINVALID);
          getValidationErrors().add(error);
          throw new ValidationException(type.getKey(),sMsg,getValidationErrors());
        } catch (SAXException e) {
          sMsg = "Error parsing XSD, metadataType="+type.getKey()+" xsdLocation="+xsdLocation;
          LOGGER.error(sMsg,e);
          error = new ValidationError();
          error.setMessage(sMsg);
          error.setReasonCode(ValidationError.REASONCODE_XSD_ISINVALID);
          getValidationErrors().add(error);
          throw new ValidationException(type.getKey(),sMsg,getValidationErrors());
        }
      }
      Validator validator = xsd.newValidator();
      validator.setResourceResolver(new RedirectingResourceResolver());
      return validator;
    }
    return null;
  }
  
  /**
   * Validates a document source against the XML Schema Definition file 
   * associated with a metadata type.
   * @param type the metadata type being validated
   * @param source the source for the document being validated
   * @throws ValidationException if validation errors were located
   */
  public void validate(MetadataType type, Source source) throws ValidationException {
    setValidationErrors(new ValidationErrors());
    String xsdLocation = Val.trim(type.getXsdLocation()); 
    if (xsdLocation != null && xsdLocation.length() > 0) {    
      try {
        javax.xml.validation.Validator validator = newValidator(type);
        validator.setErrorHandler(this);
        validator.validate(source);
      } catch (SAXException e) {
        // ignore the SAXException, 
        // it's already been captured  by the error handling methods
        // of this class (fatalError, error, warning)
      } catch (IOException e) {
        String sMsg = e.getMessage();
        if (sMsg.length() == 0) {
          sMsg = e.toString();
        }
        sMsg = "Error parsing XML document: "+sMsg;
        ValidationError error = new ValidationError();
        error.setMessage(sMsg);
        error.setReasonCode(ValidationError.REASONCODE_XML_ISINVALID);
        getValidationErrors().add(error);
        throw new ValidationException(type.getKey(),sMsg,getValidationErrors());
      }
    }
    if (getValidationErrors().size() > 0) {
      throw new ValidationException(type.getKey(),"XSD violation.",getValidationErrors());
    }
  }
  
  /**
   * Validates an XML string against the XML Schema Definition file 
   * associated with a metadata type.
   * @param type the metadata type being validated
   * @param xml the XML string to be validated
   * @throws ValidationException if validation errors were located
   */
  public void validate(MetadataType type, String xml) throws ValidationException {
    _xsdLocation = null;
    setValidationErrors(new ValidationErrors());
    String sXsd = Val.trim(type.getXsdLocation());
    if (sXsd != null && sXsd.length() > 0) {
      int nIdx = sXsd.indexOf("[GML32]");
      if (nIdx != -1) {
        String sLeft = Val.trim(sXsd.substring(0,nIdx));
        String sRight = Val.trim(sXsd.substring(nIdx+7));
        sXsd = "";
        if ((sLeft.length() > 0) && (sRight.length() > 0)) {
          sXsd = sLeft;
          if (xml != null) {
            if (xml.contains("\"http://www.opengis.net/gml/3.2\"") ||
                xml.contains("'http://www.opengis.net/gml/3.2'")) {
              sXsd = sRight;
            }
          }
        } else if (sLeft.length() > 0) {
          sXsd = sLeft;
        } else if (sRight.length() > 0) {
          sXsd = sRight;
        }
      }
    }
    if (sXsd.length() > 0) {
      _xsdLocation = sXsd;
      StringReader reader = new StringReader(xml);
      Source source = new SAXSource(new InputSource(reader));
      validate(type,source);
    }
  }
  
  /**
   * Triggered when a SAX warning occurs during XSD validation.
   * <br>Warnings are ignored.
   * @param e the associated SAX exception
   * @throws SAXException part of the implemented method signature but never thrown
   */
  public void warning(SAXParseException e) throws SAXException {}

}
