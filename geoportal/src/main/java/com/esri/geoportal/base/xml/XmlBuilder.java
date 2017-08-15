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
import java.io.StringWriter;

import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

/**
 * Support for building an XML.
 */
public class XmlBuilder {
  
  /** MIMETYPE_ATOM - application/atom+xml */
  public static final String MIMETYPE_ATOM = "application/atom+xml";

  /** URI__ATOM - http://www.w3.org/2005/Atom */
  public static final String URI_ATOM = "http://www.w3.org/2005/Atom";

  /** URI_CSW - http://www.opengis.net/cat/csw/3.0 */
  public static final String URI_CSW = "http://www.opengis.net/cat/csw/3.0";

  /** URI_DC - http://purl.org/dc/elements/1.1/ */
  public static final String URI_DC = "http://purl.org/dc/elements/1.1/";

  /** URI_DCT - http://purl.org/dc/terms/ */
  public static final String URI_DCT = "http://purl.org/dc/terms/";

  /** URI_GEO - http://a9.com/-/opensearch/extensions/geo/1.0/ */
  public static final String URI_GEO = "http://a9.com/-/opensearch/extensions/geo/1.0/";

  /** URI_GEOPOS - http://www.w3.org/2003/01/geo/wgs84_pos# */
  public static final String URI_GEOPOS = "http://www.w3.org/2003/01/geo/wgs84_pos#";

  /** URI_GEORSS - http://www.georss.org/georss */
  public static final String URI_GEORSS = "http://www.georss.org/georss";

  /** URI_GEORSS - http://www.georss.org/georss/10 */
  public static final String URI_GEORSS10 = "http://www.georss.org/georss/10";

  /** URI_TIME - http://a9.com/-/opensearch/extensions/time/1.0/ */
  public static final String URI_TIME = "http://a9.com/-/opensearch/extensions/time/1.0/";

  /** URI_OPENSEARCH - http://a9.com/-/spec/opensearch/1.1/ */
  public static final String URI_OPENSEARCH = "http://a9.com/-/spec/opensearch/1.1/";

  /** URI_OWS - http://www.opengis.net/ows/2.0 */
  public static final String URI_OWS = "http://www.opengis.net/ows/2.0";

  /** XML_HEADER - &lt;?xml version="1.0" encoding="UTF-8" ?&gt; */
  public static final String XML_HEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
  
  /** The XML stream writer. */
  public XMLStreamWriter writer;
  
  /** The XML string writer. */
  private StringWriter xml;

  /** Constructor. */
  public XmlBuilder() {}
  
  /**
   * Get the xml string.
   * @return the xml
   */
  public String getXml() {
    return xml.toString();
  }
  
  /**
   * Initialize the builder.
   * @throws Exception
   */
  public void init() throws Exception {
    XMLOutputFactory factory = XMLOutputFactory.newInstance();
    xml = new StringWriter();
    writer = factory.createXMLStreamWriter(xml);
  }
  
  /**
   * Write an element.
   * @param localName the local name
   * @param value the text value
   * @throws XMLStreamException
   */
  public void writeElement(String localName, String value) throws XMLStreamException {
    if (value == null) return;
    writer.writeStartElement(localName);
    writer.writeCharacters(value);
    writer.writeEndElement();
  }
  
  /**
   * Write an element.
   * @param namespaceURI the namespace uri
   * @param localName the local name
   * @param value the text value
   * @throws XMLStreamException
   */
  public void writeElement(String namespaceURI, String localName, String value) throws XMLStreamException {
    if (value == null) return;
    writer.writeStartElement(namespaceURI,localName);
    writer.writeCharacters(value);
    writer.writeEndElement();
  }
  
  /**
   * End the document.
   * @throws XMLStreamException
   */
  public void writeEndDocument() throws XMLStreamException {
    writer.writeEndDocument();
  }
  
  /**
   * Start the document.
   * @throws XMLStreamException
   */
  public void writeStartDocument() throws XMLStreamException {
    writer.writeStartDocument("UTF-8","1.0");
  }
  
  
}
