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
package com.esri.geoportal.base.metadata;
import com.esri.geoportal.base.metadata.validation.ValidationException;
import com.esri.geoportal.base.xml.DomUtil;
import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.base.xml.XsltTemplate;
import com.esri.geoportal.base.xml.XsltTemplates;
import com.esri.geoportal.context.GeoportalContext;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;

/**
 * A metadata document.
 */
public class MetadataDocument {
  
  /** Instance variables. */
  private Document dom;
  private String evaluatedJson;
  private boolean isDraft;
  private String itemId;
  private String json;
  private MetadataType metadataType;
  private boolean requiresXmlWrite;
  private String suppliedJson;
  private String title;
  private String xml;
  
  /** Constructor */
  public MetadataDocument() {}
  
  /** The dom. */
  public Document getDom() {
    return dom;
  }
  /** The dom. */
  public void setDom(Document dom) {
    this.dom = dom;
  }
  
  /** The metadata XML evaluated as JSON. */
  public String getEvaluatedJson() {
    return evaluatedJson;
  }
  /** The metadata XML evaluated as JSON. */
  public void setEvaluatedJson(String evaluatedJson) {
    this.evaluatedJson = evaluatedJson;
  }

  /** True if the document is a draft. */
  public boolean getIsDraft() {
    return isDraft;
  }
  /** True if the document is a draft. */
  public void setIsDraft(boolean isDraft) {
    this.isDraft = isDraft;
  }
  
  /** Get the item id. */
  public String getItemId() {
    return this.itemId;
  }
  /** The item id. */
  public void setItemId(String itemId) {
    this.itemId = itemId;
  }
  
  /** The JSON source. */
  public String getJson() {
    return this.json;
  }
  /** The JSON source. */
  public void setJson(String json) {
    this.json = json;
  }

  /** The metadata type. */
  public MetadataType getMetadataType() {
    return metadataType;
  }
  /** The metadata type. */
  public void setMetadataType(MetadataType metadataType) {
    this.metadataType = metadataType;
  }
  
  /** True if the XML should be written to the store. */
  public boolean getRequiresXmlWrite() {
    return requiresXmlWrite;
  }
  /** True if the XML should be written to the store. */
  public void setRequiresXmlWrite(boolean requiresXmlWrite) {
    this.requiresXmlWrite = requiresXmlWrite;
  }
  
  /** The json supplied with a piblication request. */
  public String getSuppliedJson() {
    return suppliedJson;
  }
  /** The json supplied with a piblication request. */
  public void setSuppliedJson(String suppliedJson) {
    this.suppliedJson = suppliedJson;
  }

  /** The title. */
  public String getTitle() {
    return title;
  }
  /** The title. */
  public void setTitle(String title) {
    this.title = title;
  }

  /** The xml. */
  public String getXml() {
    return xml;
  }
  /** The xml. */
  public void setXml(String xml) {
    this.xml = xml;
  }
  
  /** Methods =============================================================== */

  /**
   * Ensures that the dom has been created.
   * @return the dom
   * @throws ParserConfigurationException
   * @throws SAXException
   * @throws IOException
   */
  public Document ensureDom() throws ParserConfigurationException, SAXException, IOException {
    if (this.getDom() == null) {
      this.updateDom();
    }
    return this.getDom();
  }
  /**
   * Forces an update to the dom
   * @return the dom
   * @throws ParserConfigurationException
   * @throws SAXException
   * @throws IOException
   */
  public Document updateDom() throws ParserConfigurationException, SAXException, IOException {
    this.setDom(DomUtil.makeDom(this.getXml(),true));
    return this.getDom();
  }
  
  /**
   * Ensures the the minimal components.
   */
  private void ensureMinimals() {
    // TODO ensureMinimals()
    // An empty title is set to "Untitled", an invalid envelope is set to the extent of the world.
  }
  
  /**
   * Evaluate the document.
   * @throws Exception if an exception occurs
   */
  public void evaluate() throws Exception {
    Evaluator evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
        "metadata.Evaluator",Evaluator.class,new Evaluator());
    evaluator.evaluate(this);
  }

  /**
   * Evaluate the supplied JSON document.
   * @throws Exception if an exception occurs
   */
  public void evaluateSuppliedJson() throws Exception {
    Evaluator evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
        "metadata.Evaluator",Evaluator.class,new Evaluator());
    evaluator.evaluateSuppliedJson(this);
  }

  /** True if the document has evaluated json. */
  public boolean hasEvaluatedJson() {
    return (evaluatedJson != null && evaluatedJson.length() > 0);
  }
  
  /** True if the document has supplied json. */
  public boolean hasSuppliedJson() {
    return (suppliedJson != null && suppliedJson.length() > 0);
  }
  
  /** True if the document has an XML. */
  public boolean hasXml() {
    return (xml != null && xml.length() > 0);
  }
  
  /** 
   * Interrogate the metadata type.
   * @throws UnrecognizedTypeException if the type is unrecognized
   * @throws Exception if an exception occurs
   */
  public void interrogate() throws UnrecognizedTypeException, Exception {
    setXml(XmlUtil.identity(getXml())); // TODO may not be xml based
    if (hasXml()) ensureDom();
    Evaluator evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
        "metadata.Evaluator",Evaluator.class,new Evaluator());
    evaluator.interrogate(this);
    
    // execute an immediate transformation if required
    if (getMetadataType() != null) {
      String toKnownXslt = getMetadataType().getToKnownXslt();
      if (toKnownXslt != null && toKnownXslt.length() > 0) {
        XsltTemplate xsltTemplate = XsltTemplates.getCompiledTemplate(toKnownXslt);
        String result = xsltTemplate.transform(getXml());
        this.setXml(result);
        if (hasXml()) this.updateDom();;
        this.interrogate();

        //evaluator.interrogate(this);
      }
    } else {
      throw new UnrecognizedTypeException();
    }
  }  
  
  /**
   * Prepare the document for publication.
   * @param xml the metadata xml
   * @param asDraft true if this is a draft
   * @throws UnrecognizedTypeException if the metadata type cannot be determined
   * @throws ValidationException if the metadata is invalid
   * @throws Exception if an exception occurs
   */
  public void prepareForPublication(String xml, boolean asDraft) 
      throws UnrecognizedTypeException, ValidationException, Exception {
    if (asDraft) this.setIsDraft(asDraft);
    this.setXml(xml);
    this.interrogate();
    this.evaluate();
    this.validate();
    this.ensureMinimals();
  }
  
  /**
   * Validate the document.
   * @throws ValidationException if invalid
   */
  public void validate() throws ValidationException {
    // TODO globally turn off validation???
    Validator validator = GeoportalContext.getInstance().getBeanIfDeclared(
        "metadata.Validator",Validator.class,new Validator());
    validator.validate(this);
  }
  
  /**
   * Validate the title .
   * @throws ValidationException if invalid
   */
  public void validateTitle() throws ValidationException {
    Validator validator = GeoportalContext.getInstance().getBeanIfDeclared(
        "metadata.Validator",Validator.class,new Validator());
    validator.validateTitle(this);
  }
  
}
