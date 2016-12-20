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
package com.esri.geoportal.lib.elastic.kvp;
import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.lib.elastic.util.MurmurUtil;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.elasticsearch.action.DocWriteResponse.Result;
import org.elasticsearch.action.delete.DeleteResponse;
import org.elasticsearch.action.get.GetRequestBuilder;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.index.get.GetField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Key-value pair.
 */
public class Kvp {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(Kvp.class);
  
  /** Instance variables. */
  private String dataFieldName;
  private boolean found;
  private String id;
  private String indexName;
  private String indexType;
  private String itemId;
  private String meta;
  
  /** Constructor. */
  public Kvp() {}
  
  /** The name of the field holding the data value. */
  public String getDataFieldName() {
    return dataFieldName;
  }
  /** The name of the field holding the data value. */
  public void setDataFieldName(String dataFieldName) {
    this.dataFieldName = dataFieldName;
  }

  /** True if a requested kvp was found. */
  public boolean getFound() {
    return found;
  }
  /** True if a requested kvp was found. */
  public void setFound(boolean found) {
    this.found = found;
  }

  /** The id. */
  public String getId() {
    return id;
  }
  /** The id. */
  public void setId(String id) {
    this.id = id;
  }

  /** The index name. */
  public String getIndexName() {
    return indexName;
  }
  /** The index name. */
  public void setIndexName(String indexName) {
    this.indexName = indexName;
  }
  
  /** The index type. */
  public String getIndexType() {
    return indexType;
  }
  /** The index type. */
  public void setIndexType(String indexType) {
    this.indexType = indexType;
  }

  /** The associated item id. */
  public String getItemId() {
    return itemId;
  }
  /** The associated item id. */
  public void setItemId(String itemId) {
    this.itemId = itemId;
  }

  /** Meta information (JSON string). */
  public String getMeta() {
    return meta;
  }
  /** Meta information (JSON string). */
  public void setMeta(String meta) {
    this.meta = meta;
  }
  
  /** Methods =============================================================== */
  
  /**
   * Delete the content.
   * @param ec the context
   * @param id the id
   * @return the response
   * @throws Exception
   */
  public DeleteResponse deleteContent(ElasticContext ec, String id) throws Exception {
    setFound(false);
    DeleteResponse resp = ec.getTransportClient().prepareDelete(getIndexName(),getIndexType(),id).get();
    /* ES 2to5 */
    //setFound(resp.isFound());
    setFound(resp.getResult().equals(Result.DELETED));
    return resp;
  }

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
  public JsonObjectBuilder prepareMeta(String mimetype, byte[] bytes) {
    String date = DateUtil.nowAsString();
    String hash = this.makeHash(bytes);
    long size = 0;
    if (bytes != null) size = bytes.length;
    return prepareMeta(mimetype,hash,date,size);
  }

  /**
   * Prepare meta information (mimetype,hash,date,size).
   * @param mimetype the mimetype
   * @param hash the hash
   * @param date the current date
   * @param size the number of bytes
   * @return the meta information
   */
  public JsonObjectBuilder prepareMeta(String mimetype, String hash, String date, long size) {
    JsonObjectBuilder jb = Json.createObjectBuilder();
    if (mimetype != null && mimetype.length() > 0) jb.add("mimetype",mimetype);
    if (hash != null && hash.length() > 0) jb.add("hash",hash);
    if (date != null && date.length() > 0) jb.add("date",date);
    if (size >= 0) jb.add("size",size);
    return jb;
  }
  
  /**
   * Reads the hash.
   * @param ec the context
   * @return the hash
   * @throws Exception
   */
  public String readHash(ElasticContext ec) throws Exception {
    JsonObject jso = readMeta(ec);
    if (jso != null) return JsonUtil.getString(jso,"hash");
    return null;
  }
  
  /*
  public GetResponse readItem(ElasticContext ec) throws Exception {
    this.setFound(false);
    GetRequestBuilder req = ec.getTransportClient().prepareGet(indexName,indexType,id);
    GetResponse resp = req.get();
    if (resp.isExists()) {
      this.setFound(true);
      try {
        Map<String,Object> source = resp.getSource();
        this.base64 = (String)source.get(ItemIO.FIELD_SYS_64);
        this.itemId = (String)source.get(ItemIO.FIELD_SYS_ITEMID);
        this.meta = (String)source.get(ItemIO.FIELD_SYS_META);
      } catch (Exception e) {
        LOGGER.warn("Error reading data item, index: "+indexName+" _id: "+id,e);
      }
    }
    return resp;
  }
  */
  
  /**
   * Read the meta information.
   * @param ec the context
   * @return the meta information
   * @throws Exception
   */
  public JsonObject readMeta(ElasticContext ec) throws Exception {
    setFound(false);
    setMeta(null);
    String fieldName = FieldNames.FIELD_SYS_META;
    GetRequestBuilder req = ec.getTransportClient().prepareGet(getIndexName(),getIndexType(),getId());
    req.setFetchSource(false);
    /* ES 2to5 */
    //req.setFields(fieldName);
    req.setStoredFields(fieldName);
    GetResponse resp = req.get();
    if (resp.isExists()) {
      setFound(true);
      try {
        GetField field = resp.getField(fieldName);
        if (field != null) {
          String meta = (String)field.getValue();
          setMeta(meta);
          if (meta != null && meta.length() > 0) {
            JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(meta);
            return jso;
          }
        }
      } catch (Exception e) {
        String msg = getIndexName()+"/"+getIndexType()+"/"+getId();
        LOGGER.error("Error reading field: "+fieldName+", "+msg,e);
      }
    }
    return null;
  }

}
