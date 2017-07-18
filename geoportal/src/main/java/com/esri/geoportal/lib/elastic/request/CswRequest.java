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
package com.esri.geoportal.lib.elastic.request;
import com.esri.geoportal.base.util.ResourcePath;
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.lib.elastic.response.ItemWriter;
import com.esri.geoportal.lib.elastic.response.OwsException;
import com.esri.geoportal.lib.elastic.response.QField;
import com.esri.geoportal.lib.elastic.response.QFields;
import com.esri.geoportal.lib.elastic.response.ResponseUtil;

import java.io.StringReader;
import java.io.StringWriter;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * A CSW request.
 */
public class CswRequest extends SearchRequest {
  
  /*
    TODO
    all shards failed if bbox outside -180 -90 180 90
    indexOffset 0 vs 1
    escaping q=
   */

  /** Instance variables . */
  public String acceptHeader;

  public String capabilitiesFile = "search/csw-capabilities.xml";

  /** The elementSetName. */
  public String elementSetName = null;

  /** KVP namespace prefixes keyed by namespace URI. */
  public Map<String,String> kvpNsPrefixByUri = new HashMap<String,String>();

  /** KVP namespace URIs keyed by namespace prefix. */
  public Map<String,String> kvpNsUriByPrefix = new HashMap<String,String>();

  /** The response recordTypeName */
  public String recordTypeName = "Record";

  /** The requested response fields. */
  public QFields responseFields = null;

  /** Constructor */
  public CswRequest() {
    super();
  }

  /** The HTTP "accept" header value. */
  public String getAcceptHeader() {
    return acceptHeader;
  }
  /** The HTTP "accept" header value. */
  public void setAcceptHeader(String acceptHeader) {
    this.acceptHeader = acceptHeader;
  }

  /** The capabilities file (default=search/csw-capabilities.xml). */
  public String getCapabilitiesFile() {
    return capabilitiesFile;
  }
  /** The capabilities file (default=search/csw-capabilities.xml). */
  public void setCapabilitiesFile(String capabilities) {
    this.capabilitiesFile = capabilities;
  }
  
  /** The element set name. */
  public String getElementSetName() {
    return elementSetName;
  }
  /** The element set name. */
  public void setElementSetName(String elementSetName) {
    this.elementSetName = elementSetName;
  }

  /** Methods =============================================================== */

  @Override
  public AppResponse execute() throws Exception {
    String service = Val.trim(getParameter("service"));
    String request = Val.trim(getParameter("request"));
    String version = Val.trim(getParameter("version"));

    if (service == null) {
      String msg = "CSW: The service parameter is missing.";
      throw new OwsException(OwsException.OWSCODE_MissingParameterValue,"service",msg);               
    } else if (!service.equalsIgnoreCase("csw")) {
      String msg = "CSW: The service parameter must be CSW.";
      throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"service",msg);       
    }

    if (version != null && version.length() > 0 && !version.equals("3.0.0")) {
      String msg = "CSW: version must be 3.0.0";
      throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"version",msg);
    }

    if (request == null) {
      String msg = "CSW: The request parameter is missing.";
      throw new OwsException(OwsException.OWSCODE_MissingParameterValue,"request",msg);
      
    } else if (request.equalsIgnoreCase("GetCapabilities")) {
      if (!request.equals("GetCapabilities")) {
        String msg = "CSW: Case sensitive issue, use request=GetCapabilities";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"request",msg);
      }
      return this.getCapabilities();

    } else if (request.equalsIgnoreCase("GetRecordById")) {
      this.setIsItemByIdRequest(true);
      String id = Val.trim(getParameter("id"));
      if (id == null) {
        String msg = "CSW: The Id parameter is missing.";
        throw new OwsException(OwsException.OWSCODE_MissingParameterValue,"Id",msg);
      } else if (id.trim().length() == 0) {
        String msg = "CSW: The Id parameter is empty.";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"Id",msg);
      }
      this.setF("csw");
      parseKvp();
      getData().put("recordTypeName",recordTypeName);
      getData().put("elementSetName",elementSetName);
      return super.execute();

    } else if (request.equalsIgnoreCase("GetRecords")) {
      // TODO CSW InputIndexOffset ???
      this.setInputIndexOffset(1);
      String startPosition = Val.trim(getParameter("startPosition"));
      if (startPosition != null && startPosition.length() > 0) {
        int from = Val.chkInt(startPosition,-1);
        // TODO should this be >= 1
        if (from >= 1) {
          //from = from - 1; // TODO is this correct indexOffset??
          getOverrideParameters().put("from",""+from);
        }
      }
      String maxRecords = Val.trim(getParameter("maxRecords"));
      if (maxRecords != null && maxRecords.length() > 0) {
        if (!maxRecords.equalsIgnoreCase("unlimited")) {
          int size = Val.chkInt(maxRecords,-1);
          if (size >= 0) getOverrideParameters().put("size",""+size);
        }
      }
      this.setF("csw");
      parseKvp();
      getData().put("recordTypeName",recordTypeName);
      getData().put("elementSetName",elementSetName);
      return super.execute();

    } else {
      String msg = "CSW: The request parameter is invalid.";
      throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"request",msg);
    }

  }

  /**
   * Generate an GetCapabilities response.
   * @return the response
   * @throws Exception if an exception occurs
   */
  public AppResponse getCapabilities() throws Exception {
    AppResponse response = new AppResponse();

    String mime = null;
    boolean hasTextXml = false;
    boolean hasAppXml = false;
    boolean hasOther = false;
    String[] acceptFormats = getParameterValues("acceptFormats");
    if (acceptFormats != null && acceptFormats.length == 1) {
      acceptFormats = Val.tokenize(acceptFormats[0],",",false);
    }
    if (acceptFormats != null) {
      for (String s: acceptFormats) {
        if (s.equalsIgnoreCase("application/xml")) {
          hasAppXml = true;
        } else if (s.equalsIgnoreCase("text/xml")) {
          hasTextXml = true;
        } else if (s.length() > 0) {
          hasOther = true;
        }
      }
    }
    String accept = getAcceptHeader();
    if (accept != null) {
      if (accept.equals("text/xml")) {
        hasTextXml = true;
      }
    }
    if (!hasAppXml && hasTextXml) {
      mime = "text/xml";
    } else if (!hasAppXml && !hasTextXml && hasOther) {
      String msg = "CSW: The acceptFormats parameter is invalid.";
      throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"acceptFormats",msg);
    }    

    String[] acceptVersions = getParameterValues("acceptVersions");
    if (acceptVersions != null && acceptVersions.length == 1) {
      acceptVersions = Val.tokenize(acceptVersions[0],",",false);
    }
    if (acceptVersions != null && acceptVersions.length > 0) {
      boolean has30 = false;
      for (String s: acceptVersions) {
        if (s.equalsIgnoreCase("3.0.0")) {
          has30 = true;
          break;
        }
      }
      if (!has30) {
        String msg = "CSW: The acceptVersions parameter is invalid, 3.0.0 is required";
        throw new OwsException(OwsException.OWSCODE_VersionNegotiationFailed,"acceptVersions",msg);
      }
    }

    String baseUrl = this.getBaseUrl();
    String cswUrl = baseUrl+"/csw";
    String opensearchDscUrl = baseUrl+"/opensearch/description";
    ResourcePath rp = new ResourcePath();
    URI uri = rp.makeUrl(capabilitiesFile).toURI();
    String xml = new String(Files.readAllBytes(Paths.get(uri)),"UTF-8");
    xml = xml.replaceAll("\\{csw.url\\}",XmlUtil.escape(cswUrl));
    xml = xml.replaceAll("\\{opensearch.description.url\\}",XmlUtil.escape(opensearchDscUrl));
    String sections = Val.trim(getParameter("sections"));
    if ((sections != null) && (sections.length() > 0)) {
      if (sections.equalsIgnoreCase("all")) {
      } else if (sections.equalsIgnoreCase("Filter_Capabilities")) {
        xml = removeAllButFilter(xml);
      } else {
        String msg = "CSW: The sections parameter must be All or Filter_Capabilities.";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"sections",msg);
      }
    }
    
    response.setEntity(xml);
    response.setMediaType(MediaType.APPLICATION_XML_TYPE.withCharset("UTF-8"));
    if (mime != null && mime.equals("text/xml")) {
      response.setMediaType(MediaType.TEXT_XML_TYPE.withCharset("UTF-8"));
    }
    response.setStatus(Response.Status.OK);
    return response;
  }

  /**
   * Check for a valid "bbox" parameter value.
   */
  protected void checkBBoxParameter() {
    String bbox = Val.trim(getParameter("bbox"));
    if ((bbox == null) || (bbox.length() == 0)) return;
    String[] a = bbox.split(",");
    if (a.length == 5) {
      String s = a[4].trim();
      if (!s.equals("4326") && !s.equalsIgnoreCase("urn:ogc:def:crs:EPSG::4326")) {
        String msg = "CSW: The bbox CRS is not supported, use urn:ogc:def:crs:EPSG::4326.";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"bbox",msg);
      }
    } 
    if ((a.length == 4) || (a.length == 5)) {
      double n = 1;
      try {
        n = Double.parseDouble(a[0].trim());
      } catch (Exception e) {
        n = 1;
      }
      if (n > 10000) {
        String msg = "CSW: The bbox coordinates should be WGS84.";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"bbox",msg);
      }
    }
  }

  /** Parse URL key-value pairs. */
  protected void parseKvp() {
    checkBBoxParameter();
    parseKvpOutput();
    parseKvpNamespace();
    parseKvpTypeNames();
    parseKvpElementNames(); // TODO field names
    //parseKvpSortBy();     // TODO sortBy differences, field names
    //parseKvpTime();       // TODO validation OwsExceptions?? 
  }

  /**
   * Parse the "elementNames" and "elementSetName" parameters.
   */
  private void parseKvpElementNames() {
    String defaultSetName = elementSetName;
    elementSetName = Val.trim(getParameter("ElementSetName"));
    String[] elementNames = getParameterValues("ElementName");
    if (elementNames != null && elementNames.length == 1) {
      elementNames = Val.tokenize(elementNames[0],",",false);
    }
    if (elementNames != null && elementNames.length > 0) {
      if (elementSetName != null && elementSetName.length() > 0) {
        String msg = "CSW: Either an ElementSetName parameter OR one or more ElementName parameters shall be specified in a query.";
        throw new OwsException(OwsException.OWSCODE_NoApplicableCode,"ElementSetName",msg);
      }
    }

    if (elementSetName != null && elementSetName.length() > 0) {
      elementSetName = elementSetName.toLowerCase();
      if (elementSetName.equalsIgnoreCase("brief")) {
        recordTypeName = "BriefRecord";
      } else if (elementSetName.equalsIgnoreCase("summary")) {
        recordTypeName = "SummaryRecord";
      } else if (elementSetName.equalsIgnoreCase("full")) {
        recordTypeName = "Record";
      } else {
        String msg = "CSW: The ElementSetName parameter must be brief, summary or full.";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"ElementSetName",msg);
      }
    } else if (elementNames != null && elementNames.length > 0) {
      elementSetName = "summary";
      recordTypeName = "SummaryRecord";
      QFields all = QFields.makeAll();
      QFields matched = new QFields();
      for (String name: elementNames) {
        name = name.trim();
        if (name.length() > 0) {
          QField f = new QField(name,kvpNsUriByPrefix);
          QField match = all.match(f);
          if (match != null) {
            matched.add(match);
          } else {
            String msg = "CSW: An ElementName is invalid.";
            throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"ElementName",msg);
          }
        }
      }
      if (matched.size() > 0) {
        responseFields = matched;
        elementSetName = null;
        recordTypeName = "Record";
      }
    } else {
      if ((defaultSetName != null) && defaultSetName.equals("brief")) {
        elementSetName = "brief";
        recordTypeName = "BriefRecord";
      } else if ((defaultSetName != null) && defaultSetName.equals("full")) {
        elementSetName = "full";
        recordTypeName = "Record";
      } else {
        elementSetName = "summary";
        recordTypeName = "SummaryRecord";
      }
    }       
  }

  /**
   * Parse the "namespace" parameter.
   */
  protected void parseKvpNamespace() {
    // pattern: namespace=xmlns(ogc=http://www.opengis.net/ogc),xmlns(gml=http://www.opengis.net/gml)...
    String[] namespace = getParameterValues("namespace");
    if (namespace != null && namespace.length == 1) {
      namespace = Val.tokenize(namespace[0],",",false);
    }
    if (namespace != null) {
      for (String ns: namespace) {
        String nsPfx = null;
        String nsUri = null;
        if (ns.toLowerCase(Locale.ENGLISH).startsWith("xmlns(")) {
          ns = ns.substring(6);
          if (ns.endsWith(")")) {
            ns = ns.substring(0,ns.length() - 1);
          }
          if (ns.length() > 0) {
            String[] pair = ns.split("=");
            if (pair.length == 1) {
              nsUri = pair[0];
            } else if (pair.length == 2) {
              nsPfx = pair[0];
              nsUri = pair[1];
            }
          }
        }
        if ((nsPfx == null) || (nsPfx.length() == 0) || (nsUri == null) || (nsUri.length() == 0)) {
          String msg = "The namespace must follow the following pattern:";
          msg += " xmlns(pfx1=uri1),xmlns(pfx2=uri2),...";
          throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"namespace",msg);
        } else {
          if ((nsPfx != null) && (nsPfx.length() > 0)) {
            kvpNsUriByPrefix.put(nsPfx,nsUri);
            kvpNsPrefixByUri.put(nsUri,nsPfx);
            //if (nsUri.equals(Util.URI_CSW)) this._cswKvpNsPrefix = nsPfx;
          }
        }
      }
    }   
  }

  /**
   * Parse the "outputSchema" parameter.
   */
  protected void parseKvpOutput() {
    String outputSchema = Val.trim(getParameter("outputSchema"));
    String outputFormat = Val.trim(getParameter("outputFormat"));
    String f = Val.trim(getParameter("f"));
    if (outputSchema != null && outputSchema.length() > 0) {
      if (outputSchema.equalsIgnoreCase(ResponseUtil.URI_CSW)) {
        outputSchema = ResponseUtil.URI_CSW;
      } else if (outputSchema.equalsIgnoreCase(ResponseUtil.URI_ATOM)) {
        outputSchema = ResponseUtil.URI_ATOM;
      } else {
        String msg = "CSW: The outputSchema parameter must be "+ResponseUtil.URI_CSW+" or "+ResponseUtil.URI_ATOM;
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"outputSchema",msg);
      }
    } else if (outputFormat != null && outputFormat.length() > 0) {
      if (outputFormat.equalsIgnoreCase("application/xml")) {
        outputSchema = ResponseUtil.URI_CSW;
      } else if (outputFormat.equalsIgnoreCase("application/atom+xml")) {
        outputSchema = ResponseUtil.URI_ATOM;
      } else {
        String msg = "CSW: The outputFormat parameter must be application/xml or application/atom+xml";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"outputFormat",msg);
      }
    } else if (f == null || f.length() == 0) {
      outputSchema = ResponseUtil.URI_CSW;
    }
    if (outputSchema != null && outputSchema.length() > 0) {
      this.getOverrideParameters().put("outputSchema",outputSchema);
    }
  }

  /**
   * Parse the "typeNames" parameter.
   */
  protected void parseKvpTypeNames() {
    String typeNames = getParameter("typeNames");
    if (typeNames != null) {
      boolean ok = false;
      if (typeNames.equalsIgnoreCase("Record") || typeNames.equalsIgnoreCase("csw:Record")) {
        ok = true;
      } else {
        String pfx = this.kvpNsPrefixByUri.get(ResponseUtil.URI_CSW);
        if (pfx != null) {
          if (typeNames.equalsIgnoreCase(pfx+":Record")) {
            ok = true;
          }
        }
      }
      if (!ok) {
        String msg = "CSW: The typeNames parameter must be csw:Record";
        throw new OwsException(OwsException.OWSCODE_InvalidParameterValue,"typeNames",msg);
      }
    }
  }

  /**
   * Remove all but the Filter_Capabilities section from the capabilities response.
   * @param content the capabilities
   * @return the modified capabilities
   */
  protected String removeAllButFilter(String content) {
    StringWriter sw = new StringWriter();
    try {
      InputSource inputSource = new InputSource(new StringReader(content));
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setNamespaceAware(true);
      factory.setExpandEntityReferences(false);
      factory.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
      //factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true); 
      DocumentBuilder builder = factory.newDocumentBuilder();
      Document dom = builder.parse(inputSource);

      Node root = dom.getDocumentElement();
      NodeList nl = root.getChildNodes();
      for (int i=0;i<nl.getLength();i++) {
        Node nd = nl.item(i);
        if (nd.getNodeType() == Node.ELEMENT_NODE) {
          if (!nd.getLocalName().equals("Filter_Capabilities")) {
            root.removeChild(nd);
          }
        } else if (nd.getNodeType() == Node.COMMENT_NODE) {
          root.removeChild(nd);
        } else if (nd.getNodeType() == Node.TEXT_NODE) {
        }
      }
      
      TransformerFactory tFactory = TransformerFactory.newInstance();
      tFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD,"");
      tFactory.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
      //tFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
      Transformer transformer = tFactory.newTransformer();
      transformer.setOutputProperty(OutputKeys.ENCODING,"UTF-8");
      transformer.setOutputProperty(OutputKeys.INDENT,"yes");
      StreamResult streamResult = new StreamResult(sw);
      DOMSource domSource = new DOMSource(dom);
      transformer.transform(domSource,streamResult);
      String result = sw.toString();

      return result;
    } catch (Exception e) {
      return content;
    } finally {
      try {if (sw != null) sw.close();} catch (Throwable t) {}
    }
  }

  @Override
  public void writeResponse(AppResponse response, SearchResponse searchResponse) throws Exception {
    ItemWriter writer = newWriter();
    SearchHits searchHits = searchResponse.getHits();
    SearchHit[] hits = searchHits.getHits();
    if (this.getIsItemByIdRequest()) {
      if (searchHits.getTotalHits() == 0) {
        // TODO OWS Exception???
        response.writeIdNotFound(this,Val.trim(getParameter("id")));
        return;
      } else if (hits.length == 1) {
        // ok
      } else if (hits.length == 0) {
        // TODO OwsException ??
      } else {
        // TODO OwsException ??
      }
    }
    writer.write(this,response,searchResponse);
  }

}
