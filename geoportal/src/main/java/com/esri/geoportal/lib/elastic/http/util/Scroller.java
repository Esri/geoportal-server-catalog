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
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.lib.elastic.http.ElasticClient;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

/**
 * Scroll through a collection of documents.
 */
public class Scroller {
  
  /** Instance variables. */
  private boolean fetchSource = true;
  private String indexName;
  private String indexType;
  private int keepAliveMillis = 600000;
  private long maxDocs = Long.MAX_VALUE;
  private int pageSize = 100;
  private AtomicLong processed = new AtomicLong();
  private String query;
  private long totalHits = 0;
  
  /** Constructor. */
  public Scroller() {}

  /** If true fetch the _source. */
  public boolean getFetchSource() {
    return fetchSource;
  }
  /** If true fetch the _source. */
  public void setFetchSource(boolean fetchSource) {
    this.fetchSource = fetchSource;
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

  /** Keep-alive milliseconds. */
  public int getKeepAliveMillis() {
    return keepAliveMillis;
  }
  /** Keep-alive milliseconds. */
  public void setKeepAliveMillis(int keepAliveMillis) {
    this.keepAliveMillis = keepAliveMillis;
  }

  /** Maximum number of documents to process. */
  public long getMaxDocs() {
    return maxDocs;
  }
  /** Maximum number of documents to process. */
  public void setMaxDocs(long maxDocs) {
    this.maxDocs = maxDocs;
  }

  /** Number of documents per page. */
  public int getPageSize() {
    return pageSize;
  }
  /** Number of documents per page. */
  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  /** The query. */
  public String getQuery() {
    return query;
  }
  /** The query. */
  public void setQuery(String query) {
    this.query = query;
  }

  /** The total number of hits. */
  public long getTotalHits() {
    return totalHits;
  }
  /** The total number of hits. */
  public void setTotalHits(long totalHits) {
    this.totalHits = totalHits;
  }
  
  /**
   * Scroll.
   * @param callback the callback
   */
  public void scroll(Consumer<SearchHit> callback) throws Exception {
    
    // TODO add a match all query?
    
    String query = this.getQuery();
    String contentType = "application/json;charset=utf-8";
    ElasticClient client = ElasticClient.newClient();
    String url = client.getTypeUrl(getIndexName(),getIndexType());
    url += "/_search";
    url += "?scroll=" + getKeepAliveMillis() + "ms";
    
    JsonObjectBuilder request = Json.createObjectBuilder();
    request.add("size",this.getPageSize());
    request.add("sort",Json.createArrayBuilder().add("_doc"));
    //request.add("fields",Json.createArrayBuilder().add("title"));
    if (!getFetchSource()) request.add("stored_fields","_none");
    if (query != null && query.length() > 0) {
      JsonObject jsq = (JsonObject)JsonUtil.toJsonStructure(query);
      request.add("query",jsq);
    }

    String scrollId = null;
    @SuppressWarnings("unused")
    long count = 0, loop = 0, max = getMaxDocs();
  
    String postData = request.build().toString();
    //System.out.println("Scroller.postData="+postData);
    String result = client.sendPost(url,postData,contentType);
    //System.out.println("Scroller.result="+result);
    JsonObject response = (JsonObject)JsonUtil.toJsonStructure(result);
    scrollId = response.getString("_scroll_id");
    JsonObject hits = response.getJsonObject("hits");
    setTotalHits(hits.getInt("total",0));
    
    String scrollUrl = client.getScrollUrl();
    try {
      while (true) {
        if (response == null) break;
        JsonArray searchHits = response.getJsonObject("hits").getJsonArray("hits");
        if (searchHits.size() == 0) break;
        for (int i=0;i<searchHits.size();i++) {
          count++;
          if (count > max) break;
          SearchHit searchHit = new SearchHit(searchHits.getJsonObject(i),processed.get());
          processed.incrementAndGet();
          if (callback != null) callback.accept(searchHit);
        }
        if (count > max) break;
        request = Json.createObjectBuilder();
        request.add("scroll",this.getKeepAliveMillis()+"ms");
        request.add("scroll_id",scrollId);
        result = client.sendPost(scrollUrl,request.build().toString(),contentType);
        response = (JsonObject)JsonUtil.toJsonStructure(result);
        //response = null;
        loop++;
        //System.out.println("loop: "+loop);
      }      
    } finally {
      try {
        if (scrollId != null) {
          request = Json.createObjectBuilder();
          //request.add("scroll_id",scrollId);
          request.add("scroll_id",Json.createArrayBuilder().add(scrollId));
          client.send("DELETE",scrollUrl,request.build().toString(),contentType);
        }
      } catch (Throwable t) {
        t.printStackTrace();
      }
      //System.out.println("processed:"+processed.get()+" total:"+this.getTotalHits());
    }
    
  }

}
