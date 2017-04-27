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
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchScrollRequestBuilder;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.sort.SortBuilders;

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
  private QueryBuilder query = QueryBuilders.matchAllQuery();
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
  public QueryBuilder getQuery() {
    return query;
  }
  /** The query. */
  public void setQuery(QueryBuilder query) {
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
  public void scroll(Consumer<SearchHit> callback) {

    String scrollId = null;

    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    TransportClient client = ec.getTransportClient();

    SearchRequestBuilder search = client.prepareSearch(getIndexName());
    search.setTypes(getIndexType());
    search.setQuery(getQuery());
    search.setScroll(new TimeValue(getKeepAliveMillis()));
    search.addSort(SortBuilders.fieldSort("_doc"));
    search.setSize(getPageSize());
    if (!getFetchSource()) {
      search.setFetchSource(false);
    }

    long count = 0, max = getMaxDocs();

    SearchResponse response = search.get();
    scrollId = response.getScrollId();
    setTotalHits(response.getHits().getTotalHits());

    while (true) {
      SearchHit[] hits = response.getHits().getHits();
      if (hits.length == 0) break;
      for (SearchHit hit: hits) {
        count++;
        if (count > max) break;
        processed.incrementAndGet();
        callback.accept(hit);
      }
      if (count > max) break;
      SearchScrollRequestBuilder scroll = client.prepareSearchScroll(scrollId);
      scroll.setScroll(new TimeValue(getKeepAliveMillis()));
      response = scroll.get();
    }
    //System.err.println("processed="+processed.get());
    
    try {
      if (scrollId != null) {
        client.prepareClearScroll().addScrollId(scrollId).get();
      }
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }

}
