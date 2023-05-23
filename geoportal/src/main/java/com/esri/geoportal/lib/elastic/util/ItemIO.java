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
package com.esri.geoportal.lib.elastic.util;
import com.esri.geoportal.base.metadata.MetadataDocument;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.ElasticContextHttp;
import com.esri.geoportal.lib.elastic.kvp.XmlContent;

import java.util.Map.Entry;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import org.opensearch.action.delete.DeleteResponse;
import org.opensearch.action.get.GetRequest;
import org.opensearch.action.get.GetResponse;
import org.opensearch.action.index.IndexRequest;
import org.opensearch.action.index.IndexResponse;
import org.opensearch.client.RequestOptions;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.client.indices.CreateIndexRequest;
import org.opensearch.client.indices.CreateIndexResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ItemIO {
    private static final Logger LOGGER = LoggerFactory.getLogger(ElasticContextHttp.class);

  /** Constructor. */
  public ItemIO() {}
  
  /**
   * Delete an item.
   * @param ec the context
   * @param id the id
   * @return the response
   * @throws Exception
   */
  public DeleteResponse deleteItem(ElasticContext ec, String id) throws Exception {
//    DeleteResponse resp = ec.getTransportClient().prepareDelete(
//      ec.getItemIndexName(),ec.getActualItemIndexType(),id).get();
//    /* ES 2to5 */
//    // if (resp.isFound()) {
//    if (resp.getResult().equals(Result.DELETED)) {
//      (new XmlContent(ec)).deleteContent(ec,id);
//    }
//    return resp;
        return null;
  }
  
  /**
   * Get an item.
   * @param ec the context
   * @param id the id
   * @return the response
   * @throws Exception
   */
  public GetResponse getItem(ElasticContext ec, String id) throws Exception {
//    return ec.getTransportClient().prepareGet(
//        ec.getItemIndexName(),ec.getActualItemIndexType(),id).get();

    GetRequest getRequest = new GetRequest(ec.getItemIndexName(), id);
    GetResponse response = ec.openSearchRestClient().get(getRequest, RequestOptions.DEFAULT);
    return response;
  }
  
  /**
   * Get a title (if requited).
   * @param jso the json object
   * @param title the current title
   * @return the title
   */
  private String getTitle(JsonObject jso, String title) {
    String name = FieldNames.FIELD_TITLE;
    if (title == null || title.length() == 0) {
      String v = Val.trim(JsonUtil.getString(jso,name));
      if (v != null && v.length() > 0) {
        return v;
      }
    }
    return title;
  }
  
  /**
   * For a metadata document, mixin the suppliedJson, the evaluatedJson with the existing _source. 
   * @param mdoc the metadata document
   * @param elasticSource the _source for the item
   * @return the mixed in object
   * @throws Exception
   */
  public JsonObjectBuilder mixin(MetadataDocument mdoc, String elasticSource) 
      throws Exception {
    String title = Val.trim(mdoc.getTitle());
    JsonObjectBuilder jb = Json.createObjectBuilder();
    JsonObject eval = null, supplied = null, src = null;
    boolean hasEvaluatedJson = mdoc.hasEvaluatedJson();
    boolean hasSuppliedJson = mdoc.hasSuppliedJson();
    boolean hasElasticSource = (elasticSource != null  && elasticSource.length() > 0);
    if (hasSuppliedJson) {
      supplied = (JsonObject)JsonUtil.toJsonStructure(mdoc.getSuppliedJson());
      title = getTitle(supplied,title);
    }
    if (hasEvaluatedJson) {
      eval = (JsonObject)JsonUtil.toJsonStructure(mdoc.getEvaluatedJson());
      title = getTitle(eval,title);
    }
    if (hasElasticSource) {
      src = (JsonObject)JsonUtil.toJsonStructure(elasticSource);
      title = getTitle(src,title);
    }
    if (hasElasticSource && src != null) {
      title = getTitle(src,title);
      for (Entry<String, JsonValue> entry: src.entrySet()) {
        // TODO need a naming convention ??
        String name = entry.getKey();
        boolean bAdd = false;
        if (!hasEvaluatedJson) {
          bAdd = true;
        } else if (name.startsWith("_") || 
                   name.startsWith("sys_") || 
                   name.startsWith("src_") || 
                   name.startsWith("app_") ||
                   name.startsWith("user_")) {
          bAdd = true;
        }
        if (bAdd) {
          if (src.isNull(name)) jb.addNull(name);
          else jb.add(name,entry.getValue());
        }
      }
    }
    if (hasEvaluatedJson && eval != null) {
      for (Entry<String, JsonValue> entry: eval.entrySet()) {
        // TODO need a naming convention ??
        String name = entry.getKey();
        boolean bAdd = false;
        if (name.startsWith("sys_")) {
          bAdd = false;
        } else if (!name.equalsIgnoreCase("xml")) {
          bAdd = true;
        }
        if (bAdd) {
          if (eval.isNull(name)) jb.addNull(name);
          else jb.add(name,entry.getValue());
        }
      }
    }
    if (hasSuppliedJson && supplied != null) {
      for (Entry<String, JsonValue> entry: supplied.entrySet()) {
        // TODO need a naming convention ??
        String name = entry.getKey();
        boolean bAdd = false;
        if (name.startsWith("sys_")) {
          bAdd = false;
        } else if (!name.equalsIgnoreCase("xml")) {
          bAdd = true;
        }
        if (bAdd) {
          if (supplied.isNull(name)) jb.addNull(name);
          else jb.add(name,entry.getValue());
        }
      }
    }
    if (title == null || title.length() == 0) title = "Unknown";
    if (title != null && title.length() > 0) jb.add(FieldNames.FIELD_TITLE,title);
    return jb;
  }
  
  /**
   * Read an xml.
   * @param ec the context
   * @param id the id
   * @throws Exception
   */
  public String readXml(ElasticContext ec, String id) throws Exception {
    return readXml(ec,id,ec.getXmlIndexName());
  }
  
  /**
   * Read an xml.
   * @param ec the context
   * @param id the id
   * @return the index name
   * @throws Exception
   */
  public String readXml(ElasticContext ec, String id, String indexName) throws Exception {
    return (new XmlContent(ec)).readXml(ec,id,indexName);
  }
  
  /**
   * Read an xml hash.
   * @param ec the context
   * @param id the id
   * @return the hash
   * @throws Exception
   */
  public String readXmlHash(ElasticContext ec, String id) throws Exception {
    return (new XmlContent(ec)).readXmlHash(ec,id);
  }
  
  /**
   * Write an item.
   * @param ec the context
   * @param mdoc the metadata document
   * @return the response
   * @throws Exception
   */
  public IndexResponse writeItem(ElasticContext ec, MetadataDocument mdoc) throws Exception {
    return writeItem(ec,mdoc,ec.getItemIndexName(),ec.getXmlIndexName());
  }
  
  /**
   * Write an item.
   * @param ec the context
   * @param mdoc the metadata document
   * @param indexName the index name
   * @param xmlIndexName the XML index name
   * @return the response
   * @throws Exception
   */
  public IndexResponse writeItem(ElasticContext ec, MetadataDocument mdoc, 
      String indexName, String xmlIndexName) throws Exception {
//    // TODO how to delete just the xml??
    if (mdoc.getRequiresXmlWrite() && mdoc.hasXml()) {
      (new XmlContent(ec)).write(ec,mdoc,xmlIndexName);
    }
    LOGGER.info("in writeItem");
//    IndexRequestBuilder req = ec.getTransportClient().prepareIndex(
//        indexName,ec.getActualItemIndexType(),mdoc.getItemId());
//        req.setSource(mdoc.getJson());
//        return req.get();
    RestHighLevelClient client = ec.openSearchRestClient();
    CreateIndexRequest createIndexRequest = new CreateIndexRequest(indexName);

//          createIndexRequest.settings(Settings.builder() //Specify in the settings how many shards you want in the index.
//                  .put("index.number_of_shards", 4)
//                  .put("index.number_of_replicas", 3)
//          );
//                    
    CreateIndexResponse createIndexResponse = client.indices().create(createIndexRequest, RequestOptions.DEFAULT);

    //Adding data to the index.
    IndexRequest request = new IndexRequest(indexName); //Add a document to the custom-index we created.
    request.id(mdoc.getItemId()); //Assign an ID to the document.          

    request.source(mdoc.getJson()); //Place your content into the index's source.
    IndexResponse indexResponse = client.index(request, RequestOptions.DEFAULT);
    LOGGER.info("indexResponse "+indexResponse.toString());
    return indexResponse;
  }
         
}
