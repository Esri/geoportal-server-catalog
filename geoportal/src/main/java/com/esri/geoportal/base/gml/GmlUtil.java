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
package com.esri.geoportal.base.gml;

import java.io.StringReader;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * GML utility class.
 */
public class GmlUtil {
  private static final String XML = 
"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
"<feed xmlns=\"http://www.w3.org/2005/Atom\" \n" +
"      xmlns:georss=\"http://www.georss.org/georss\" \n" +
"      xmlns:gml=\"http://www.opengis.net/gml\">\n" +
"   <title>Earthquakes</title>\n" +
"\n" +
"   <subtitle>International earthquake observation labs</subtitle>\n" +
"   <link href=\"http://example.org/\"/>\n" +
"   <updated>2005-12-13T18:30:02Z</updated>\n" +
"   <author>\n" +
"      <name>Dr. Thaddeus Remor</name>\n" +
"      <email>tremor@quakelab.edu</email>\n" +
"   </author>\n" +
"   <id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id>\n" +
"   <entry>\n" +
"      <title>M 3.2, Mona Passage</title>\n" +
"      <link href=\"http://example.org/2005/09/09/atom01\"/>\n" +
"      <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>\n" +
"      <updated>2005-08-17T07:02:32Z</updated>\n" +
"      <summary>We just had a big one.</summary>\n" +
"\n" +
"      <georss:where>\n" +
"         <gml:Point>\n" +
"            <gml:pos>45.256 -71.92</gml:pos>\n" +
"         </gml:Point>\n" +
"      </georss:where>\n" +
"   </entry>\n" +
"</feed>";
  
  private static final String LS = "<LineString>\n" +
"        <coordinates>\n" +
"                24824.045318333192,38536.15071012041\n" +
"                26157.378651666528,37567.42733944659 26666.666,36000.0\n" +
"                26157.378651666528,34432.57266055341\n" +
"                24824.045318333192,33463.84928987959\n" +
"                23175.954681666804,33463.84928987959\n" +
"                21842.621348333472,34432.57266055341 21333.333,36000.0\n" +
"                21842.621348333472,37567.42733944659\n" +
"                23175.954681666808,38536.15071012041\n" +
"        </coordinates>\n" +
"  </LineString>";
  private static final String PT_CO = "<Point><coordinates>10.0,10.0</coordinates></Point>";
  private static final String PT_POS = "<Point><pos>10.0 10.0</pos></Point>";
  
  public static void main(String[] args) throws Exception {
    DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    factory.setNamespaceAware(true);
    DocumentBuilder builder = factory.newDocumentBuilder();
    InputSource is = new InputSource(new StringReader(XML));
    Document xml =  builder.parse(is);
    
    traverse(xml.getDocumentElement());
  }
  
  private static void traverse(Node nd) throws Exception {
    if (nd.getNodeType()!=1) return;
    
    System.out.println(String.format("%d, %s '%s' [%s]", nd.getNodeType(), nd.getNodeName(), nd.getLocalName(), nd.getNamespaceURI()));
    
    if (nd.getNamespaceURI()!=null && nd.getNamespaceURI().startsWith("http://www.opengis.net/gml")) {
    } else {
      NodeList childNodes = nd.getChildNodes();
      for (int i=0; i<childNodes.getLength(); i++) {
        traverse(childNodes.item(i));
      }
    }
  }
}
