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
import java.io.FileNotFoundException;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.stream.JsonParsingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.base.metadata.UnrecognizedTypeException;
import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.UuidUtil;
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.base.util.exception.UsageException;
import com.esri.geoportal.base.xml.XmlUtil;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.util.AccessUtil;
import com.esri.geoportal.lib.elastic.http.util.ItemUtil;
import com.esri.geoportal.lib.elastic.request.BulkEditRequest;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.lib.elastic.util.ItemIO;
import com.esri.geoportal.lib.elastic.util.MurmurUtil;

/**
 * Publish metadata.
 */
public class PublishMetadataRequest extends BulkEditRequest {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(PublishMetadataRequest.class);
  
  /** Instance variables. */
  private String content;
  private String id;
  private boolean isNew;
      
  /** Constructor. */
  public PublishMetadataRequest() {
    super();
  }
  
  /** The content to publish. */
  public String getContent() {
    return content;
  }
  /** The content to publish. */
  public void setContent(String content) {
    this.content = content;
  }
  
  /** The item id. */
  public String getId() {
    return id;
  }
  /** The item id. */
  public void setId(String id) {
    this.id = id;
  }

  /** True if the item is new. */
  public boolean getIsNew() {
    return isNew;
  }
  /** True if the item is new. */
  public void setIsNew(boolean isNew) {
    this.isNew = isNew;
  }
  
  /** Methods =============================================================== */
  
  @Override
  public AppResponse execute() throws Exception {
    //boolean asDraft = false; // TODO asDraft
    AppResponse response = new AppResponse();
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    AccessUtil au = new AccessUtil();
    au.ensurePublisher(getUser());
     
    ItemUtil itemUtil = new ItemUtil();
    MetadataDocument mdoc = new MetadataDocument();
    mdoc.setItemId(this.getId());
    
    String content = Val.trim(getContent());
    String json = null, xml = null;
    if (content != null && content.length() > 0) {
      if (content.startsWith("{")) {
        JsonObject jso = null;
        try {
          jso = (JsonObject)JsonUtil.toJsonStructure(content);
        } catch (JsonParsingException jpe) {
          throw new UsageException("javax.json.stream.JsonParsingException: Invalid JSON",jpe);
        }
        if (jso != null) {
          json = JsonUtil.toJson(jso,false);
          if (jso.containsKey("xml") && !jso.isNull("xml")) {
            String v = Val.trim(jso.getString("xml"));
            if (v != null && v.length() > 0) {
              xml = v;
            }
          }
        }
      } else if (content.startsWith("<")) {
        xml = content;
      }
    }
    if (json == null && xml == null) {
      throw new UnrecognizedTypeException();
    }
    
    if (xml != null) {
      if (json != null) {
        mdoc.setSuppliedJson(json);
      }
      xml = XmlUtil.identity(xml);
      mdoc.setXml(xml);
      mdoc.interrogate();
      mdoc.evaluate();
      mdoc.validate();

    } else {
      mdoc.setSuppliedJson(json);
      mdoc.evaluateSuppliedJson();
      // TODO set the title
      // mdoc.validate();
      // TODO interrogate evaluate validate
    }
    
    //mdoc.prepareForPublication(this.getContent(),asDraft); // TODO?
    
    prePublish(ec,au,response,mdoc);
    if (mdoc.getJson() == null) {
      throw new Exception("MetadataDocument::json is empty.");
    }
    
    //LOGGER.trace("xmlHash="+mdoc.getXmlHash());
    //LOGGER.trace("requiresXmlWrite="+mdoc.getRequiresXmlWrite());
    itemUtil.writeItem(ec,mdoc,ec.getItemIndexName());
    this.writeOk(response,mdoc.getItemId());
    return response;
  }
  
  /**
   * Initialize.
   * @param id the item id
   * @param content the content to publish
   */
  public void init(String id, String content) {
    this.setId(id);
    this.setContent(content);
  }
  
  /**
   * Process the document prior to publication.
   * @param ec the context
   * @param au the access utility
   * @param response the response
   * @param mdoc the metadata document
   */
  @SuppressWarnings("unused")
  protected void prePublish(ElasticContext ec, AccessUtil au, AppResponse response, MetadataDocument mdoc) 
      throws Exception {
    mdoc.setRequiresXmlWrite(true);
    GeoportalContext gc = GeoportalContext.getInstance();
    ItemIO itemio = new ItemIO();
    ItemUtil itemUtil = new ItemUtil();
    JsonObjectBuilder jb = null;
    JsonObject eval = null, supplied = null;
    if (mdoc.hasEvaluatedJson()) {
      eval = (JsonObject)JsonUtil.toJsonStructure(mdoc.getEvaluatedJson());
    }
    if (mdoc.hasSuppliedJson()) {
      supplied = (JsonObject)JsonUtil.toJsonStructure(mdoc.getSuppliedJson());
    }    
    
    // now
    String now = DateUtil.nowAsString();
    
    // username
    String username = null;
    if (this.getUser() != null) {
      username = Val.trim(this.getUser().getUsername());
      if (username.length() == 0) username = null;
    }
    
    // id
    String id = mdoc.getItemId(), fileid = null;
    //boolean hasFileIdKey = false;
    if ((fileid == null || fileid.length() == 0) && eval != null) {
      fileid = Val.trim(JsonUtil.getString(eval,FieldNames.FIELD_FILEID));
    }
    if ((fileid == null || fileid.length() == 0) && supplied != null) {
      fileid = Val.trim(JsonUtil.getString(supplied,FieldNames.FIELD_FILEID));
    }
    if (id == null || id.length() == 0) {
      if (ec.getAllowFileId() && fileid != null && fileid.length() > 0) {
        // encoded forward slashes %2F will cause issues on Tomcat
        if (fileid.indexOf("/") == -1) {
          id = fileid;
        }
      }
    }
    
    // metadata type
    String metadataTypeKey = null;
    if (mdoc.getMetadataType() != null) {
      metadataTypeKey = mdoc.getMetadataType().getKey();
    }
    
    String indexName = ec.getItemIndexName();
    String itemType = ec.getActualItemIndexType();
    JsonObject item = null;
    JsonObject itemSource = null;
    String sourceAsString = null;
    
    // try to find the item within the index
    if ((id != null) && (id.length() > 0)) {
      try {
        item = itemUtil.readItemJson(indexName,itemType,id);
      } catch (FileNotFoundException e) {
      }
    } else {
      if (fileid != null && fileid.length() > 0) {
        item = itemUtil.searchForFileId(indexName,itemType,fileid);
      }
    }
    
    // update sys info
    if (item == null) {
      this.setIsNew(true);
      if ((id != null) && (id.length() > 0)) {
        // TODO validate the id?
        mdoc.setItemId(id);
      } else {
        mdoc.setItemId(UuidUtil.makeUuid(true));
      }
      if (eval == null && supplied != null) {
        // validate a new json based document
        String v = Val.trim(JsonUtil.getString(supplied,FieldNames.FIELD_TITLE));
        if (v != null && v.length() > 0) {
          mdoc.setTitle(v);
        } 
        mdoc.validateTitle();
        if (metadataTypeKey == null) metadataTypeKey = "json"; // TODO ??
      }
      jb = itemio.mixin(mdoc,null);
    } else {
      mdoc.setItemId(item.getString("_id"));
      itemSource = itemUtil.getItemSource(item);
      sourceAsString = itemUtil.sourceAsString(item);
      au.ensureOwner(getUser(),FieldNames.FIELD_SYS_OWNER,itemSource);
      jb = itemio.mixin(mdoc,sourceAsString);
      if (mdoc.hasXml()) wasXmlModified(ec,mdoc,itemSource,now,jb);
    }
    
    // TODO sys_hasxml_b
    
    boolean setOwner = false;
    //if (fileid == null) jb.addNull(ItemIO.FIELD_FILEID);
    //else jb.add(ItemIO.FIELD_FILEID,fileid);
    if (this.getIsNew()) {
      jb.add(FieldNames.FIELD_SYS_CREATED,now);
      jb.add(FieldNames.FIELD_SYS_MODIFIED,now);
      if (mdoc.hasXml()) jb.add(FieldNames.FIELD_SYS_XMLMODIFIED,now);
      setOwner = true;
      if (gc.getSupportsGroupBasedAccess() && gc.getDefaultAccessLevel() != null && 
          gc.getDefaultAccessLevel().length() > 0) {
        jb.add(FieldNames.FIELD_SYS_ACCESS,gc.getDefaultAccessLevel());
      }
      if (gc.getSupportsApprovalStatus() && gc.getDefaultApprovalStatus() != null && 
          gc.getDefaultApprovalStatus().length() > 0) {
        jb.add(FieldNames.FIELD_SYS_APPROVAL_STATUS,gc.getDefaultApprovalStatus());
      }
    } else {
      jb.add(FieldNames.FIELD_SYS_MODIFIED,now);
      String owner_s = null;
      String owner_txt = null;
      if (itemSource != null) {
        owner_s = Val.trim(itemSource.getString(FieldNames.FIELD_SYS_OWNER,null));
        owner_txt = Val.trim(itemSource.getString(FieldNames.FIELD_SYS_OWNER_TXT,null));
      }
      if (owner_s == null || owner_s.length() == 0 || owner_txt == null || owner_txt.length() == 0) setOwner = true;
    }
    if (setOwner) {
      if (username == null) {
        jb.addNull(FieldNames.FIELD_SYS_OWNER);
        jb.addNull(FieldNames.FIELD_SYS_OWNER_TXT);
      }
      else {
        jb.add(FieldNames.FIELD_SYS_OWNER,username);
        jb.add(FieldNames.FIELD_SYS_OWNER_TXT,username);
      }
    }
    if (metadataTypeKey != null) {
      jb.add(FieldNames.FIELD_SYS_METADATATYPE,metadataTypeKey);
    }
    
    mdoc.setJson(JsonUtil.toJson(jb.build(),true));   
  }
  
  /**
   * Check for XML modification.
   * @param ec the context
   * @param mdoc the metadata document
   * @param elasticSource the source
   * @param now the date string
   * @param jb the object being built
   * @throws Exception
   */
  protected void wasXmlModified(ElasticContext ec, MetadataDocument mdoc, JsonObject elasticSource, 
      String now, JsonObjectBuilder jb) throws Exception {
    ItemUtil itemUtil = new ItemUtil();
    String xmlModField = FieldNames.FIELD_SYS_XMLMODIFIED;
    boolean xmlMod = true, compareXmlIfSameHash = true;
    String hash = itemUtil.readXmlHash(ec,mdoc.getItemId(),elasticSource);
    if (hash == null) {
      xmlMod = true;
    } else if (mdoc.getXml() == null) {
      xmlMod = true;
    } else if (hash.equals(MurmurUtil.makeHash(mdoc.getXml()))) {
      xmlMod = false;
      if (compareXmlIfSameHash) {
        LOGGER.trace("Same xml hash, reading xml to compare...");
        String xml0 = itemUtil.readXml(ec.getIndexName(),mdoc.getItemId(),elasticSource);
        //System.err.println("wasXmlModified.xml="+xml0);
        String xml1 = mdoc.getXml();
        if (xml0 != null && xml1 != null) {
          xmlMod = !xml0.equals(xml1);
        } else if (xml1 != null) {
          xmlMod = true;
        }          
      }
    }
    if (xmlMod) {
      jb.add(xmlModField,now);
    } else {
      mdoc.setRequiresXmlWrite(false);
      String v = now;
      if (elasticSource != null && elasticSource.containsKey(xmlModField)) {
        v = Val.trim(elasticSource.getString(xmlModField,null));
        if (v == null || v.length() == 0) v = now;
      }
      jb.add(xmlModField,v);
    }
  }
  
  /**
   * Write the response. 
   * @param response the response
   * @param id the item id
   */
  public void writeOk(AppResponse response, String id) {
    JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
    jsonBuilder.add("id",id);
    if (getIsNew()) {
      jsonBuilder.add("status","created");
    } else {
      jsonBuilder.add("status","updated");
    }
    response.writeOkJson(this,jsonBuilder);
  }
  
}
