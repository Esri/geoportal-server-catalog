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
package com.esri.geoportal.lib.elastic.http.request;
import com.esri.geoportal.base.metadata.Evaluator;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.base.xml.XsltTemplate;
import com.esri.geoportal.base.xml.XsltTemplates;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.util.AccessUtil;
import com.esri.geoportal.lib.elastic.http.util.ItemUtil;
import com.esri.geoportal.lib.elastic.util.FieldNames;

import java.io.FileNotFoundException;

import javax.json.JsonObject;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 * Transform metadata.
 */
public class TransformMetadataRequest extends com.esri.geoportal.lib.elastic.request.TransformMetadataRequest {
  
  /** Instance variables. */
  private boolean forItemDetails;
  private String id;
  private String xml;
  private String xslt;
    
  /** Constructor. */
  public TransformMetadataRequest() {
    super();
  }
  
  /** True if the transformation is for the item details */
  public boolean getForItemDetails() {
    return forItemDetails;
  }
  /** True if the transformation is for the item details */
  public void setForItemDetails(boolean forItemDetails) {
    this.forItemDetails = forItemDetails;
  }

  /** The item id. */
  public String getId() {
    return id;
  }
  /** The item id. */
  public void setId(String id) {
    this.id = id;
  }

  /** The metadata xml. */
  public String getXml() {
    return xml;
  }
  /** The metadata xml */
  public void setXml(String xml) {
    this.xml = xml;
  }
  
  /** The path to the transformation xslt (under resources/metadata) */
  public String getXslt() {
    return xslt;
  }
  /** The path to the transformation xslt (under resources/metadata) */
  public void setXslt(String xslt) {
    this.xslt = xslt;
  }
  
  @Override
  public AppResponse execute() throws Exception {
    if (!getForItemDetails()) {
      return this.transform();
    }
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
    
    try {
      ItemUtil itemUtil = new ItemUtil();
      JsonObject item = itemUtil.readItemJson(ec.getIndexName(),ec.getActualItemIndexType(),id);
      if (item == null) {
        response.writeIdNotFound(this,id);
      } else {
        String err = null, key = null, xml = null;
        if (ec.getUseSeparateXmlItem()) {
          xml = itemUtil.readXml(ec.getIndexName(),id,itemUtil.getItemSource(item));
        } else {
          try {
            xml = item.getJsonObject("_source").getString(FieldNames.FIELD_SYS_XML);
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
        if (xml == null || xml.length() == 0) {
          err = "Empty item XML.";
        } else {
          try {
            key = item.getJsonObject("_source").getString(FieldNames.FIELD_SYS_METADATATYPE);
          } catch (Exception e) {
            e.printStackTrace();
          }
          if (key == null || key.length() == 0) {
            err = "Empty item "+FieldNames.FIELD_SYS_METADATATYPE;
          } else {
            Evaluator evaluator = GeoportalContext.getInstance().getBeanIfDeclared(
                "metadata.Evaluator",Evaluator.class,new Evaluator());
            String xslt = evaluator.getDetailsXslt(key);
            if (xslt == null || xslt.length() == 0) {
              err = "The detailsXslt was not configured for this metadata type: "+key;
            } else {
              setXml(xml);
              setXslt(xslt);
              return this.transform();
            }
          }
        }
        String json = JsonUtil.newErrorResponse(err,getPretty());
        response.writeNotImplemented(this,json);
      }
    } catch (FileNotFoundException e) {
      response.writeIdNotFound(this,id);
    }
    
    return response;
  }
  
  /**
   * Transform.
   * @return the response
   * @throws Exception
   */
  protected AppResponse transform() throws Exception {
    AppResponse response = new AppResponse();
    String xml = XmlUtil.identity(this.getXml());
    String xslt = getXslt();
    if (xslt == null || xslt.length() == 0) {
      response.writeMissingParameter(this,"xslt");
      return response;
    }
    
    if (!xslt.startsWith("metadata/")) xslt = "metadata/"+xslt;
    XsltTemplate xsltTemplate = XsltTemplates.getCompiledTemplate(xslt);
    String result = xsltTemplate.transform(xml);
    writeOk(response,result);
    return response;
  }
  
  /**
   * Write the response. 
   * @param response the response
   * @param result the result
   */
  public void writeOk(AppResponse response, String result) {
    // TODO determine the mime type
    response.setEntity(result);
    if (getForItemDetails()) {
      response.setMediaType(MediaType.TEXT_HTML_TYPE.withCharset("UTF-8"));
    } else {
      response.setMediaType(MediaType.APPLICATION_XML_TYPE.withCharset("UTF-8"));
    }
    response.setStatus(Response.Status.OK);
  } 
  
}
