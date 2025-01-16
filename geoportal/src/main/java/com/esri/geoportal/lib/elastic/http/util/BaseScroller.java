package com.esri.geoportal.lib.elastic.http.util;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;

public abstract class BaseScroller {
	 public abstract void scroll(Consumer<SearchHit> callback) throws Exception;
	 /** Instance variables. */
	  private boolean fetchSource = true;
	  private String indexName;
	  private String indexType;
	  private int keepAliveMillis = 600000;
	  private long maxDocs = Long.MAX_VALUE;
	  private int pageSize = 100;
	  protected AtomicLong processed = new AtomicLong();
	  private String query;
	  private long totalHits = 0;  


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
	  
}
