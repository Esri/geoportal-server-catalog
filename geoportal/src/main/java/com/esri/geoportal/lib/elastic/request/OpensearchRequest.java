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

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Paths;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;

/**
 * An Opensearch request.
 */
public class OpensearchRequest extends SearchRequest {

  /** Instance variables . */
  private String descriptionFile = "search/opensearch-description.xml";

  /** Constructor */
  public OpensearchRequest() {
    super();
  }
 
  /** The description file (default=search/opensearch-description.xml). */
  public String getDescriptionFile() {
    return descriptionFile;
  }
  /** The description file (default=search/opensearch-description.xml). */
  public void setDescriptionFile(String descriptionFile) {
    this.descriptionFile = descriptionFile;
  }

  /** Methods =============================================================== */

  /**
   * Generate an Opensearch description response.
   * @return the response
   * @throws Exception if an exception occurs
   */
  public AppResponse description() throws Exception {
    AppResponse response = new AppResponse();
    String baseUrl = this.getBaseUrl();
    String opensearchUrl = baseUrl+"/opensearch";
    ResourcePath rp = new ResourcePath();
    URI uri = rp.makeUrl(descriptionFile).toURI();
    String xml = new String(Files.readAllBytes(Paths.get(uri)),"UTF-8");
    xml = xml.replaceAll("\\{opensearch.url\\}",XmlUtil.escape(opensearchUrl));
    xml = xml.replaceAll("\\{base.url\\}",XmlUtil.escape(baseUrl));

    //xml = xml.replaceAll("\\{csw.url\\}",XmlUtil.escape(cswUrl));
    //xml = xml.replaceAll("\\{opensearch.url\\}",XmlUtil.escape(openSearchUrl));
    //xml = xml.replaceAll("\\{opensearch.shortName\\}",XmlUtil.escape(shortName));
    //xml = xml.replaceAll("\\{opensearch.description\\}",XmlUtil.escape(name));
    //xml = xml.replaceAll("\\{opensearch.tags\\}",XmlUtil.escape(""));
    //xml = xml.replaceAll("\\{opensearch.contact\\}",XmlUtil.escape(""));

    response.setEntity(xml);
    response.setMediaType(MediaType.APPLICATION_XML_TYPE.withCharset("UTF-8"));
    response.setStatus(Response.Status.OK);
    return response;
  }

  @Override
  public AppResponse execute() throws Exception {
    setDefaultF();
    this.setInputIndexOffset(1);
    String[] ids = getParameterValues("id");
    if (ids != null && ids.length == 1) {
      ids = Val.tokenize(ids[0],",",false);
    }
    if (ids != null && ids.length == 1) {
      this.setIsItemByIdRequest(true);
    }
    return super.execute();
  }
  
  protected void setDefaultF() {
    this.setF("atom");
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
    this.setIsItemByIdRequest(false); // TODO is this correct??
    writer.write(this,response,searchResponse);
  }

}
