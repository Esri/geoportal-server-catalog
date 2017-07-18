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
import java.io.StringReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;

import javax.xml.XMLConstants;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

/**
 * XML utilities.
 */
public class XmlUtil {

  /** DEFAULT_ENCODING = "UTF-8" */
  public static final String DEFAULT_ENCODING = "UTF-8";

  /** DEFAULT_HEADER = "&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;" */
  public static final String DEFAULT_HEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

  /**
   * Check a result.
   * @param result the result
   * @return the string (trimmed, null if empty)
   */
  public static String checkResult(StringWriter result, boolean checkIndent) {
    String s = result.toString();
    if (s != null) {
      s = s.trim();
      if (checkIndent) {
        if (s.startsWith(DEFAULT_HEADER+"<")) {
          s = s.replace(DEFAULT_HEADER,DEFAULT_HEADER+"\r\n");
        }
      }
      if (s.length() == 0) s = null;
    };
    return s;
  }

  /**
   * Escapes a string.
   * @param s the string
   * @return the escaped string
   */
  public static String escape(String s) {
    return escape(s,true);
  }

  /**
   * Escapes special xml characters within a string.
   * <br/> < > & " are escaped
   * <br/> ' is escaped if escapeApostrophe is supplied as true.
   * @param s the string to escape
   * @param escapeApostrophe if true apostrophes are escaped
   * @return the escaped string
   */
  private static String escape(String s, boolean escapeApostrophe) {
    if (s == null) {
      return null;
    } else if (s.length() == 0) {
      return s;
    } else {
      char c;
      String sApostrophe = "&apos;";
      if (!escapeApostrophe) sApostrophe= "'";
      StringBuilder sb = new StringBuilder(s.length()+20);
      for (int i=0; i<s.length(); i++) {
        c = s.charAt(i);
        if      (c == '&')  sb.append("&amp;");
        else if (c == '<')  sb.append("&lt;");
        else if (c == '>')  sb.append("&gt;");
        else if (c == '\'') sb.append(sApostrophe);
        else if (c == '"')  sb.append("&quot;");
        else                sb.append(c);
      }
      return sb.toString();
    }
  }

  /**
   * Executes an identity transform.
   * @param xml the xml
   * @throws TransformerException if an exception occurs
   */
  public static String identity(String xml) throws TransformerException {
    xml = removeBOM(xml);
    if (xml != null) xml = xml.trim();
    if ((xml == null) || (xml.length() == 0)) {
      throw new TransformerException("Empty XML.");
    }
    StringWriter result = new StringWriter();
    transform(new StreamSource(new StringReader(xml)),new StreamResult(result),false);
    return checkResult(result,false);
  }
  
  public static String indent(String xml) throws TransformerException {
    xml = removeBOM(xml);
    if (xml != null) xml = xml.trim();
    if ((xml == null) || (xml.length() == 0)) {
      throw new TransformerException("Empty XML.");
    }
    StringWriter result = new StringWriter();
    transform(new StreamSource(new StringReader(xml)),new StreamResult(result),true);
    return checkResult(result,true);
  }

  /**
   * Reads a file.
   * @param systemId the system id
   * @return the content
   * @throws Exception if an exception occurs
   */
  public static String readFile(String systemId) throws Exception {
    /*
    String s = new String(Files.readAllBytes(Paths.get(path)),"UTF-8");
    if (s != null) s = s.trim();
    return s;
     */
    StringWriter result = new StringWriter();
    transform(new StreamSource(systemId),new StreamResult(result),true);
    return checkResult(result,true);
  }

  /**
   * Removes a windows byte order mark if present.
   * @param s the string to check
   * @return the string absent the byte order mark
   */
  public static String removeBOM(String s) {
    if (s != null) {
      byte[] bom = new byte[3];
      bom[0] = (byte)0xEF;
      bom[1] = (byte)0xBB; 
      bom[2] = (byte)0xBF;
      try {
        String sbom = new String(bom,"UTF-8");
        s = s.trim();
        if (s.startsWith(sbom)) {
          s = s.substring(1).trim();
        }
      } catch(UnsupportedEncodingException e) {}
    }
    return s;
  }

  /**
   * Executes a transformation.
   * <br>The output encoding is set to UTF-8
   * @param source the transformation source
   * @param result the transformation result
   * @param indent if true, the output indent key is set to "yes"
   * @throws TransformerException if an exception occurs
   */
  public static void transform(javax.xml.transform.Source source,
      javax.xml.transform.Result result, boolean indent) throws TransformerException {
    TransformerFactory factory = TransformerFactory.newInstance();
    factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD,"");
    factory.setFeature("http://javax.xml.XMLConstants/feature/secure-processing",true);
    //factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true); 
    Transformer transformer = factory.newTransformer();
    transformer.setOutputProperty(OutputKeys.ENCODING,DEFAULT_ENCODING);
    transformer.setOutputProperty(OutputKeys.METHOD,"xml");
    if (indent) {
      transformer.setOutputProperty(OutputKeys.INDENT,"yes");
      transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount","2");
    }
    transformer.transform(source,result);
  }

}
