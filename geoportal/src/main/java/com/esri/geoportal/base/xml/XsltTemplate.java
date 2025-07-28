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
package com.esri.geoportal.base.xml;
import com.esri.geoportal.base.util.ResourcePath;
import com.esri.geoportal.context.GeoportalContext;

import javax.xml.XMLConstants;
import javax.xml.transform.*;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URL;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Represents a compiled XSLT transformation stylesheet.
 */
public class XsltTemplate {

  /** Instance variables. */
  private String systemId  = "";
  private Templates templates = null;

  /** Default constructor. */
  public XsltTemplate() {}

  /**
   * Gets the system id for the XSLT.
   * @return the system id
   */
  protected String getSystemId() {
    return systemId;
  }

  /**
   * Sets the system id for the XSLT.
   * @param systemId the system id
   */
  protected void setSystemId(String systemId) {
    this.systemId = systemId;
  }

  /**
   * Gets the compiled transformer templates.
   * @return the compiled templates
   */
  protected Templates getTemplates() {
    return templates;
  }

  /**
   * Sets the compiled transformer templates.
   * @param templates compiled templates
   */
  protected void setTemplates(Templates templates) {
    this.templates = templates;
  }

  /**
   * Compiles the XSLT based upon a relative resource path.
   * <br>The resource path should be relative to the WEB-INF/classes folder. If
   * the XSLT is located at:
   * <br>[deployment folder]/WEB-INF/classes/somefolder/somefile.xslt
   * then supply a relative resource path of:
   * <br>somefolder/somefile.xslt
   * @param resourcePath the relative resource path to XSLT file
   * @throws IOException if the is an io problem with the XSLT file
   * @throws TransformerConfigurationException if a configuration exception occurs
   */
  protected void compileFromResourcePath(String resourcePath)
          throws IOException, TransformerConfigurationException {
    URL url = (new ResourcePath()).makeUrl(resourcePath);
    compileFromSystemId(url.toExternalForm());
  }

  /**
   * Compiles the XSLT based upon a system path.
   * <br>systemId examples:
   * <br>c:/somefolder/somefile.xslt
   * <br>file:///c:/somefolder/somefile.xslt
   * @param systemId the system path to XSLT file
   * @throws TransformerConfigurationException if a configuration exception occurs
   */
  protected void compileFromSystemId(String systemId)
          throws TransformerConfigurationException {
    setSystemId(systemId);
    TransformerFactory factory = TransformerFactory.newInstance();

    /* The default XSLT library, xalan,  does not have some features
     This enables the use a version of Saxon (older opensource, or newer licensed)
    https://stackoverflow.com/questions/45152707/transformerfactory-and-xalan-dependency-conflict
    and
    https://docs.oracle.com/javase/tutorial/jaxp/properties/usingProps.html
     */
    try {
      factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
    } catch (IllegalArgumentException e) {
      //jaxp 1.5 feature not supported
    }
    try {
      factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET,"file");
    } catch (IllegalArgumentException e) {
      //jaxp 1.5 feature not supported
    }
    //factory.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
    factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, false);
    //factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
    setTemplates(factory.newTemplates(new StreamSource(getSystemId())));
  }

  /**
   * Makes a compiled XSLT template based upon a relative resource path.
   * <br>The resource path should be relative to the WEB-INF/classes folder. If
   * the XSLT is located at:
   * <br>[deployment folder]/WEB-INF/classes/somefolder/somefile.xslt
   * then supply a relative resource path of:
   * <br>somefolder/somefile.xslt
   * @param resourcePath the relative resource path to XSLT file
   * @return the XSLT template
   * @throws TransformerConfigurationException if a configuration exception occurs
   */
  public static XsltTemplate makeFromResourcePath(String resourcePath)
          throws IOException, TransformerConfigurationException {
    XsltTemplate template = new XsltTemplate();
    template.compileFromResourcePath(resourcePath);
    return template;
  }

  /**
   * Makes a compiled XSLT template based upon a system path.
   * <br>systemId examples:
   * <br>c:/somefolder/somefile.xslt
   * <br>file:///c:/somefolder/somefile.xslt
   * @param systemId the system path to XSLT file
   * @return the XSLT template
   * @throws TransformerConfigurationException if a configuration exception occurs
   */
  public static XsltTemplate makeFromSystemId(String systemId)
          throws TransformerConfigurationException {
    XsltTemplate template = new XsltTemplate();
    template.compileFromSystemId(systemId);
    return template;
  }

  /**
   * Makes a template by trying out various mechanisms to find the correct path
   * @param path or system id
   * @return XsltTemplate
   * @throws TransformerConfigurationException when template cannot be made
   */
  public static XsltTemplate makeTemplate(String path)
          throws TransformerConfigurationException{
    XsltTemplate template = null;
    List<Exception> exceptions = new LinkedList<Exception>();
    path = path.trim();
    try {
      template = makeFromResourcePath(path);
      return template;
    } catch (TransformerConfigurationException e) {
      exceptions.add(e);
    } catch (IOException e) {
      exceptions.add(e);
    }
    try {
      template = makeFromSystemId(path);
      return template;
    } catch (TransformerConfigurationException e) {
      exceptions.add(e);
    }
    if (!path.startsWith("/")) {
      path = "/" + path;
      return makeTemplate(path);
    }
    /*
    for (Exception e: exceptions) {
      // TODO:logging??      
      //LOGGER.log(Level.SEVERE,"Error while making template from " + path, e);
    }
    */
    // if we reach here the template was not created
    GeoportalContext.LOGGER.warn("Could not make xslt template from: "+path);
    throw new TransformerConfigurationException("Could not make xslt template from "+path);
  }

  /**
   * Transforms an xml document using the parameters specifiled.
   * @param xml document to be transformed
   * @return resulting xml document
   * @throws TransformerException if an exception occurs during transformation
   * @throws TransformerConfigurationException if a configuration exception occurs
   */
  public String transform(String xml)
          throws TransformerException, TransformerConfigurationException {
    return transform(xml,null);
  }

  /**
   * Transforms an xml document using the parameters specified.
   * @param xml document to be transformed
   * @param mapParams parameters to be used for transformation (can be null)
   * @return resulting xml document
   * @throws TransformerException if an exception occurs during transformation
   * @throws TransformerConfigurationException if a configuration exception occurs
   */
  @SuppressWarnings("rawtypes")
  public String transform(String xml, Map mapParams)
          throws TransformerException, TransformerConfigurationException {
    StringReader reader = new StringReader(xml);
    StringWriter writer = new StringWriter();
    this.transform(new StreamSource(reader), new StreamResult(writer), mapParams);
    return writer.toString();
  }

  /**
   * Transforms an xml document using the parameters specified.
   * @param source the source
   * @param result the result
   * @param mapParams the map params (can be null)
   * @return the result
   * @throws TransformerException the transformer exception
   * @throws TransformerConfigurationException the transformer configuration exception
   */
  @SuppressWarnings("rawtypes")
  public Result transform(Source source, Result result, Map mapParams)
          throws TransformerException, TransformerConfigurationException {
    if (getTemplates() == null) {
      String sMsg = "The XsltTemplate has not been compiled: "+getSystemId();
      throw new TransformerConfigurationException(sMsg);
    }
    
    TransformerFactory factory = TransformerFactory.newInstance();
    factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
    factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");
    factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
    
    Transformer transformer = factory.newTransformer(); //getTemplates().newTransformer();
    if (mapParams != null) {
      for (Iterator it = mapParams.entrySet().iterator();it.hasNext();) {
        Map.Entry entry = (Map.Entry)it.next();
        transformer.setParameter(entry.getKey().toString(),entry.getValue().toString());
      }
    }
    transformer.transform(source,result);
    return result;
  }

  /**
   * Transforms an xml document using the parameters specified.
   * @param xsl the xsl transformation string
   * @param xml document to be transformed
   * @param mapParams parameters to be used for transformation (can be null)
   * @return resulting xml document
   * @throws TransformerException if an exception occurs during transformation
   * @throws TransformerConfigurationException if a configuration exception occurs
   */
  @SuppressWarnings("rawtypes")
  public String transform(String xsl, String xml, Map mapParams)
          throws TransformerException, TransformerConfigurationException {
    StringReader xslReader = new StringReader(xsl);
    TransformerFactory factory = TransformerFactory.newInstance();
    factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD,"");
    factory.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
    factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
    
    Templates templates = factory.newTemplates(new StreamSource(xslReader));
    Transformer transformer = templates.newTransformer();
    if (mapParams != null) {
      for (Iterator it = mapParams.entrySet().iterator();it.hasNext();) {
        Map.Entry entry = (Map.Entry)it.next();
        transformer.setParameter(entry.getKey().toString(),entry.getValue().toString());
      }
    }
    StringReader reader = new StringReader(xml);
    StringWriter writer = new StringWriter();
    StreamSource source = new StreamSource(reader);
    Result result = new StreamResult(writer);
    transformer.transform(source,result);
    return writer.toString();
  }

}
