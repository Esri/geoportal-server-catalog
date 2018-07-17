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
package com.esri.geoportal.lib.elastic.http.util;
import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.lib.elastic.util.MurmurUtil;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 * Item utilities.
 */
public class ItemUtil {
  
  /**
   * Make a hash (Murmur).
   * @param bytes the bytes
   * @return the hash
   */
  public String makeHash(byte[] bytes) {
    return MurmurUtil.makeHash(bytes);
  }
  
  /**
   * Prepare meta information (mimetype,hash,date,size).
   * @param mimetype the mimetype
   * @param bytes the bytes
   * @return the meta information
   */
  public JsonObjectBuilder prepareXmlMeta(String mimetype, byte[] bytes) {
    String date = DateUtil.nowAsString();
    String hash = this.makeHash(bytes);
    long size = 0;
    if (bytes != null) size = bytes.length;
    return prepareXmlMeta(mimetype,hash,date,size);
  }

  /**
   * Prepare meta information (mimetype,hash,date,size).
   * @param mimetype the mimetype
   * @param hash the hash
   * @param date the current date
   * @param size the number of bytes
   * @return the meta information
   */
  public JsonObjectBuilder prepareXmlMeta(String mimetype, String hash, String date, long size) {
    JsonObjectBuilder jb = Json.createObjectBuilder();
    if (mimetype != null && mimetype.length() > 0) jb.add("mimetype",mimetype);
    if (hash != null && hash.length() > 0) jb.add("hash",hash);
    if (date != null && date.length() > 0) jb.add("date",date);
    if (size >= 0) jb.add("size",size);
    return jb;
  }
  
  /**
   * Read an item.
   * @param indexName the index name
   * @param typeName the type name
   * @param id the item id
   * @return the response string
   * @throws Exception if an exception occurs
   */
  public String readItem(String indexName, String typeName, String id) throws Exception {
    ElasticClient client = ElasticClient.newClient();
    String url = client.getItemUrl(indexName,typeName,id);
    String result = client.sendGet(url);
    return result;
  }
  
  /**
   * Read an item.
   * @param indexName the index name
   * @param typeName the type name
   * @param id  the item id
   * @return the item
   * @throws Exception if an exception occurs
   */
  public JsonObject readItemJson(String indexName, String typeName, String id) throws Exception {
    ElasticClient client = ElasticClient.newClient();
    String url = client.getItemUrl(indexName,typeName,id);
    String result = client.sendGet(url);
    JsonObject item = (JsonObject)JsonUtil.toJsonStructure(result);
    return item;
  }
  
  /**
   * Read an item's XML.
   * @param indexName the index name
   * @param id the item id
   * @return the xml
   * @throws Exception if an exception occurs
   */
  public String readXml(String indexName, String id) throws Exception {
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    if (ec.getUseSeparateXmlItem()) {
      ElasticClient client = ElasticClient.newClient();
      String url = client.getXmlUrl(indexName,ec.getXmlIndexType(),id);
      String result = client.sendGet(url);
      if (result != null && result.length() > 0) {
        JsonObject item = (JsonObject)JsonUtil.toJsonStructure(result);
        try {
          String xml = item.getJsonObject("_source").getString(FieldNames.FIELD_SYS_CLOB);
          return xml;
        } catch (Exception e) {
          e.printStackTrace();
        }       
      }
    } else {
      JsonObject item = readItemJson(indexName,ec.getItemIndexType(),id);
      if (item != null) {
        try {
          String xml = item.getJsonObject("_source").getString(FieldNames.FIELD_SYS_XML);
          return xml;
        } catch (Exception e) {
          e.printStackTrace();
        }        
      }
    }
    return null;
  }
  
  /**
   * Reads the XML hash.
   * @param ec the context
   * @param id the item id
   * @return the hash
   * @throws Exception
   */
  public String readXmlHash(ElasticContext ec, String id) throws Exception {
    JsonObject jso = readXmlMeta(ec,id);
    if (jso != null) return JsonUtil.getString(jso,"hash");
    return null;
  }
  
  /**
   * Read the XML meta information (mimetype,hash,date,size).
   * @param ec the context
   * @param id the item id
   * @return the meta information
   * @throws Exception
   */
  public JsonObject readXmlMeta(ElasticContext ec, String id) throws Exception {
    // TODO
    return null;
  }
  
  /**
   * Write an item.
   * @param ec the context
   * @param mdoc the metadata document
   * @param indexName the index name
   * @return the response
   * @throws Exception
   */
  public void writeItem(ElasticContext ec, MetadataDocument mdoc, 
      String indexName) throws Exception {
    String contentType = "application/json;charset=utf-8";
    ElasticClient client = ElasticClient.newClient();
    
    String itemId = mdoc.getItemId();
    String itemJson = mdoc.getJson();
    
    if (mdoc.getRequiresXmlWrite() && mdoc.hasXml()) {
      byte[] bytes = null;
      if (mdoc.hasXml()) {
        bytes = mdoc.getXml().getBytes("UTF-8");
      }
      JsonObjectBuilder meta = prepareXmlMeta("application/xml",bytes);
      if (ec.getUseSeparateXmlItem()) {
        JsonObjectBuilder xmlItem = Json.createObjectBuilder();
        xmlItem.add(FieldNames.FIELD_SYS_CLOB,mdoc.getXml());
        xmlItem.add(FieldNames.FIELD_SYS_ITEMID,itemId);
        xmlItem.add(FieldNames.FIELD_SYS_META,meta.build().toString());
        // FieldNames.FIELD_SYS_ITEMID, getItemId(),
        String xmlUrl = client.getXmlUrl(indexName,ec.getXmlIndexType(),itemId);
        client.sendPut(xmlUrl,xmlItem.build().toString(),contentType);
      } else {
        JsonObjectBuilder item = JsonUtil.newObjectBuilder(itemJson);
        item.add(FieldNames.FIELD_SYS_XML,mdoc.getXml());
        item.add(FieldNames.FIELD_SYS_XMLMETA,meta);
        itemJson = item.build().toString();
      }
    }
    //System.err.println("itemId="+itemId);
    String itemUrl = client.getItemUrl(indexName,ec.getItemIndexType(),itemId);
    client.sendPut(itemUrl,itemJson,contentType);
  }
  
}
