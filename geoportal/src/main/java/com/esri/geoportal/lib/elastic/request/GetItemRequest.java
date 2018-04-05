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
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.response.ItemWriter;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import com.esri.geoportal.lib.elastic.util.ItemIO;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.elasticsearch.action.get.GetResponse;

/**
 * Get an item.
 */
public class GetItemRequest extends AppRequest {
  
  /** Instance variables. */
  private String f;
  private String id;
  private boolean includeMetadata;
  private String xml;
  private String xmlField;
  
  /** Constructor. */
  public GetItemRequest() {
    super();
  }
  
  /** The response format. */
  public String getF() {
    return f;
  }
  /** The response format. */
  public void setF(String f) {
    this.f = f;
  }
  
  /** The item id. */
  public String getId() {
    return id;
  }
  /** The item id. */
  public void setId(String id) {
    this.id = id;
  }
  
  /** If true then include metadata. */
  public boolean getIncludeMetadata() {
    return includeMetadata;
  }
  /** If true then include metadata. */
  public void setIncludeMetadata(boolean includeMetadata) {
    this.includeMetadata = includeMetadata;
  }
  
  /** The metadata xml (if requested). */
  public String getXml() {
    return xml;
  }
  /** The metadata xml (if requested). */
  public void setXml(String xml) {
    this.xml = xml;
  }
  /** The metadata xml field name (if requested). */
  public String getXmlField() {
    return xmlField;
  }
  /** The metadata xml field name (if requested). */
  public void setXmlField(String xmlField) {
    this.xmlField = xmlField;
  }  

  /** Methods =============================================================== */

  @Override
  public AppResponse execute() throws Exception {    
    AppResponse response = new AppResponse();
    String id = getId();
    if (id == null || id.length() == 0) {
      response.writeIdIsMissing(this);
      return response;
    }
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    AccessUtil au = new AccessUtil();
    id = au.determineId(id);
    au.ensureReadAccess(getUser(),id);
    
    this.setXmlField("xml");
    ItemIO itemio = new ItemIO();
    GetResponse resp = itemio.getItem(ec,id);
    if (resp.isExists()) {
      if (this.getIncludeMetadata()) {
        setXml(itemio.readXml(ec,id));
      }
      ItemWriter writer = newWriter();
      writer.write(this,response,resp);
    } else {
      response.writeIdNotFound(this,id);
    }
    return response;
  }
  
  
  /**
   * Initialize.
   * @param id the item id
   * @param f the response format
   * @param includeMetadata if true then include metadata
   */
  public void init(String id, String f, boolean includeMetadata) {
    this.setId(id);
    this.setF(f);
    this.includeMetadata = includeMetadata;
    if (f != null && f.equals("pjson")) this.setPretty(true);
  }
  
  /**
   * Create the item writer.
   * @return the item writer
   */
  public ItemWriter newWriter() {
    return new ItemWriter();
  }
  
  /**
   * Write the response. 
   * @param response the response
   * @param json the item json
   */
  public void writeOk(AppResponse response, String json) {
    response.setEntity(json);
    response.setMediaType(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    response.setStatus(Response.Status.OK);
  }

}
