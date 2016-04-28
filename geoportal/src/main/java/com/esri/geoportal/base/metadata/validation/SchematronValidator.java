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
import com.esri.geoportal.base.xml.DomUtil;
import com.esri.geoportal.base.xml.XmlNamespaceContext;
import com.esri.geoportal.base.xml.XsltTemplate;
import com.esri.geoportal.base.xml.XsltTemplates;

import java.util.HashMap;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Validates a document against a Schematron XSLT.
 * <br>
 * The XSLT must produce an SVRL document (Schematron Validation Report Language).
 */
public class SchematronValidator {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(SchematronValidator.class);
  
  /** Instance variables. */
  private ValidationErrors validationErrors;
  
  /** Constructor. */
  public SchematronValidator() {}
  
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
    
  /**
   * Validates an XML string against a Schematron XSLT associated with a metadata type.
   * @param type the metadata type being validated
   * @param xml the XML string to be validated
   * @throws ValidationException if validation errors were located
   */
  public void validate(MetadataType type, String xml) throws ValidationException {
    setValidationErrors(new ValidationErrors());
    String schematronXslt = type.getSchematronXslt(); // TODO
    
    if (schematronXslt != null && schematronXslt.trim().length() > 0) {  
      String xslt = null;
      try {
        
        String[] tokens = schematronXslt.split(",");
        for (String token: tokens) {
          xslt = token.trim();
          if (xslt.length() == 0) continue;
          
          // transform
          XsltTemplate xsltTemplate = XsltTemplates.getCompiledTemplate(xslt);
          String result = xsltTemplate.transform(xml);
          
          // load the result SVRL document
          Document dom = DomUtil.makeDom(result,true);
          HashMap<String,String> namespaces = new HashMap<String,String>();
          namespaces.put("svrl","http://purl.oclc.org/dsdl/svrl");
          XmlNamespaceContext nsc = new XmlNamespaceContext(namespaces);
          XPath xpath = XPathFactory.newInstance().newXPath();
          xpath.setNamespaceContext(nsc);
          
          // check for failed assertions
          NodeList nl = (NodeList)xpath.evaluate("//svrl:failed-assert",dom,XPathConstants.NODESET);
          for (int i=0;i<nl.getLength();i++) {
            Node nd = nl.item(i);
            String sText = xpath.evaluate("svrl:text",nd);
            if (sText == null || sText.length() == 0) {
              sText = "Untitled Schematron assertion failure.";
            }
            ValidationError error = new ValidationError();
            //error.location = xpath.evaluate("@location",nd);
            error.setMessage(sText);
            error.setReasonCode(ValidationError.REASONCODE_SCHEMATRON_VIOLATION);
            getValidationErrors().add(error);
          }
        }
        
      } catch (Exception e) {
        String sMsg = "Error executing schematron validation, metadataType="+type.getKey()+" schematronXslt="+xslt;
        LOGGER.error(sMsg,e);
        ValidationError error = new ValidationError();
        error.setMessage(sMsg);
        error.setReasonCode(ValidationError.REASONCODE_SCHEMATRON_EXCEPTION);
        getValidationErrors().add(error);
        throw new ValidationException(type.getKey(),sMsg,getValidationErrors());
      }
    }
    if (getValidationErrors().size() > 0) {
      throw new ValidationException(type.getKey(),"Schematron violation.",getValidationErrors());
    }
  }

}
