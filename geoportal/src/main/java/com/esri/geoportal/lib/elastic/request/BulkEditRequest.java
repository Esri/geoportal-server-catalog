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
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.base.util.exception.UsageException;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.AccessUtil;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.lib.elastic.util.Scroller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.script.Script;
import org.elasticsearch.search.SearchHit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Bulk request.
 */
public class BulkEditRequest extends BulkRequest {
  
  /*
  
  url params: id=&owner=&sourceUri=&sourceRef=&taskRef=
  url params: query=
  request body: {"query": ...}
  
  */
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(BulkEditRequest.class);
  
  /** Instance variables. */
  private String body;
  private List<JsonObject> httpFilters = new ArrayList<JsonObject>();
  private List<QueryBuilder> filters = new ArrayList<QueryBuilder>();
  private Map<String,String[]> parameterMap;
  private Script updateScript;
  private String updateSource;
    
  /** Constructor. */
  public BulkEditRequest() {
    super();
    this.setProcessMessage("BulkEditRequest");
    this.setDocsPerRequest(10000);
  }
  
  /** The request body. */
  public String getBody() {
    return body;
  }
  /** The request body. */
  public void setBody(String body) {
    this.body = body;
  }
  
  /** The request parameter map. */
  public Map<String, String[]> getParameterMap() {
    return parameterMap;
  }
  /** The request parameter map. */
  public void setParameterMap(Map<String, String[]> parameterMap) {
    this.parameterMap = parameterMap;
  }
  
  /** The update script. */
  public Script getUpdateScript() {
    return updateScript;
  }
  /** The update script. */
  public void setUpdateScript(Script updateScript) {
    this.updateScript = updateScript;
  }
  
  /** The update source (JSON field value pairs). */
  public String getUpdateSource() {
    return updateSource;
  }
  /** The update source (JSON field value pairs). */
  public void setUpdateSource(String updateSource) {
    this.updateSource = updateSource;
  }
  
  /** Methods =============================================================== */
  
  /**
   * Append the scroller hit to the buld request.
   * @param ec the Elastic context
   * @param request the request
   * @param hit the hit
   */
  protected void appendHit(ElasticContext ec, BulkRequestBuilder request, SearchHit hit) {
    if (this.getUpdateScript() != null) {
      request.add(ec.getTransportClient().prepareUpdate(
        ec.getItemIndexName(),ec.getActualItemIndexType(),hit.getId())
        .setScript(this.getUpdateScript())
        .setRetryOnConflict(getRetryOnConflict())
      );
    } else {
      request.add(ec.getTransportClient().prepareUpdate(
        ec.getItemIndexName(),ec.getActualItemIndexType(),hit.getId())
        .setDoc(this.getUpdateSource())
        .setRetryOnConflict(getRetryOnConflict())
      );
    }
  }
  
  /**
   * Append the scroller hit to the bulk request (HTTP).
   * @param ec the Elastic context
   * @param request the request
   * @param hit the hit
   */
  protected void appendHit(ElasticContext ec, StringBuilder data, com.esri.geoportal.lib.elastic.http.util.SearchHit hit) {
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html
    JsonObjectBuilder line1 = Json.createObjectBuilder();
    // should "_retry_on_conflict" be "retry_on_conflict" at ES6?
    String retryName = "_retry_on_conflict";
    if (ec.getIs6Plus()) retryName = "retry_on_conflict";
    JsonObjectBuilder joBuilder = Json.createObjectBuilder()
            .add("_id",hit.getId())
            .add(retryName,this.getRetryOnConflict());
    if (!ec.getIs7Plus()) {
      joBuilder = joBuilder.add("_type",ec.getActualItemIndexType());
    }
    line1.add("update", joBuilder);
    data.append(line1.build().toString()).append("\n");
    if (getUpdateScript() != null) {
      // TODO updateScript
      System.out.println("updateScript="+getUpdateScript().toString());
    } else {
      JsonObjectBuilder line2 = Json.createObjectBuilder();
      JsonObject src = (JsonObject)JsonUtil.toJsonStructure(getUpdateSource());
      line2.add("doc",src);
      data.append(line2.build().toString()).append("\n");
    }
  }
  
  @Override
  public AppResponse execute() throws Exception {
    AppUser user = this.getUser();
    AccessUtil au = new AccessUtil();
    if (getAdminOnly()) {
      au.ensureAdmin(user);
    } else {
      au.ensurePublisher(user);
    }
    return super.execute();
  }
  
  /** Filter by id. */
  protected void filterById() {
    String[] values = getParameterValues("id");
    if (values != null && values.length == 1) {
      values = Val.tokenize(values[0],",",false);
    }
    if (values != null && values.length > 0) {
      QueryBuilder q = QueryBuilders.idsQuery().addIds(values);
      filters.add(q);
      
      JsonArrayBuilder ja = Json.createArrayBuilder();
      for (String v: values) ja.add(v);
      JsonObjectBuilder jb = Json.createObjectBuilder();
      JsonObjectBuilder joBuilder = Json.createObjectBuilder()
              .add("values",ja);
      if (!GeoportalContext.getInstance().getElasticContext().getIs7Plus()) {
        joBuilder = joBuilder.add("type",GeoportalContext.getInstance().getElasticContext().getActualItemIndexType());
      }
      jb.add("ids", joBuilder);
      httpFilters.add(jb.build());
    }
  }
  
  /** Filter by owner. */
  protected void filterByOwner() {
    filterByTerm(FieldNames.FIELD_SYS_OWNER,getParameter("owner"));
  }
  
  /** Filter by a query contained within the request body. */
  protected void filterByQuery() {
    String errMsg = "Bulk edit: the request body contains an invalid query";
    String content = this.body;
    if (content != null) content = content.trim();
    if (content == null || content.length() == 0) {
      content = getParameter("query");
      if (content != null) content = content.trim();
    }
    if (content != null && content.length() > 0) {
      if (content.startsWith("{")) {
        try {
          JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(content);
          if (jso.containsKey("query")) {
            JsonObject jsQuery = jso.getJsonObject("query");
            String v = JsonUtil.toJson(jsQuery);
            QueryBuilder q = QueryBuilders.wrapperQuery(v);
            filters.add(q);
            
            httpFilters.add(jsQuery);            
          }
        } catch (Exception e) {
          throw new UsageException(errMsg);
        }
      } else {
        throw new UsageException(errMsg);
      }      
    }
  }
  
  /** Filter by the harvesting source reference. */
  protected void filterBySourceRef() {
    filterByTerm(FieldNames.FIELD_SRC_SOURCE_REF,getParameter("sourceRef"));
  }
  
  /** Filter by the harvesting source uri. */
  protected void filterBySourceUri() {
    filterByTerm(FieldNames.FIELD_SRC_SOURCE_URI,getParameter("sourceUri"));
  }
  
  /** Filter by the harvesting task reference. */
  protected void filterByTaskRef() {
    filterByTerm(FieldNames.FIELD_SRC_TASK_REF,getParameter("taskRef"));
  }
  
  /** Filter by term. */
  protected void filterByTerm(String field, String value) {
    if (value != null) value = value.trim();
    if (value != null && value.length() > 0) {
      QueryBuilder q = QueryBuilders.termQuery(field,value);
      filters.add(q);
      
      JsonObjectBuilder jb = Json.createObjectBuilder();
      jb.add("term",Json.createObjectBuilder()
        .add(field,value)
      );
      httpFilters.add(jb.build());
    }
  }
  
  /** Filter by user (to ensure you're updating your own documents). */
  protected void filterByUser() {
    AppUser user = this.getUser();
    if (!user.isAdmin()) {
      filterByTerm(FieldNames.FIELD_SYS_OWNER,user.getUsername());
    }
  }
  
  /**
   * Get a request parameter.
   * @param name the parameter name
   * @return the value
   */
  public String getParameter(String name) {  
    String[] a = getParameterValues(name);
    if (a != null) {
      if (a.length == 0) return "";
      else return a[0];
    }
    return null;
  }

  /**
   * Get a request parameter values.
   * @param name the parameter name
   * @return the values
   */
  public String[] getParameterValues(String name) {
    if (getParameterMap() == null) return null;
    for (Map.Entry<String,String[]> entry: getParameterMap().entrySet()) {
      if (entry.getKey().equalsIgnoreCase(name)) {
        return entry.getValue();
      }
    }
    return null;
  }
  
  /**
   * Create the HTTP scroller.
   * @param ec the Elastic context
   * @return the scroller
   */
  protected com.esri.geoportal.lib.elastic.http.util.Scroller newHttpScroller(ElasticContext ec) {
    //QueryBuilder qtmp = this.newScrollerQuery(ec);
    //System.out.println("BulkEditRequest.query.transport="+qtmp.toString());
    
    String q = this.newHttpScrollerQuery(ec);
    LOGGER.debug("BulkEditRequest.query="+q); // TODO temporary
    com.esri.geoportal.lib.elastic.http.util.Scroller scroller = new com.esri.geoportal.lib.elastic.http.util.Scroller();
    scroller.setIndexName(ec.getItemIndexName());
    scroller.setIndexType(ec.getActualItemIndexType());
    scroller.setQuery(q);
    scroller.setFetchSource(false);
    scroller.setPageSize(getScrollerPageSize());
    //scroller.setMaxDocs(10);
    return scroller;
  }
  
  /**
   * Create the HTTP scroller query.
   * @param ec the Elastic context
   * @return the scroller query
   */
  protected String newHttpScrollerQuery(ElasticContext ec) {
    filters = new ArrayList<QueryBuilder>(); // temporary
    httpFilters = new ArrayList<JsonObject>();
    this.filterById();
    this.filterByOwner();
    this.filterBySourceUri();
    this.filterBySourceRef();
    this.filterByTaskRef();
    this.filterByQuery();
    if (httpFilters.size() == 0) {
      throw new UsageException("Bulk edit: the request had no filters");
    }
    this.filterByUser();
    
    JsonArrayBuilder ja = Json.createArrayBuilder();
    for (JsonObject v: httpFilters) ja.add(v);
    JsonObjectBuilder jb = Json.createObjectBuilder();
    jb.add("bool",Json.createObjectBuilder()
      .add("filter",ja)
    );
    String q = jb.build().toString();

    //System.err.println("Bulk edit query .......................\r\n"+q); // TODO temporary
    //if (filterArray.size() > 0) throw new UsageException("Bulk edit: temporary stop");
    return q;
  }
  
  /**
   * Create the scroller.
   * @param ec the Elastic context
   * @return the scroller
   */
  protected Scroller newScroller(ElasticContext ec) {
    QueryBuilder q = this.newScrollerQuery(ec);
    Scroller scroller = new Scroller();
    scroller.setIndexName(ec.getItemIndexName());
    scroller.setIndexType(ec.getActualItemIndexType());
    scroller.setQuery(q);
    scroller.setFetchSource(false);
    scroller.setPageSize(getScrollerPageSize());
    //scroller.setMaxDocs(10);
    return scroller;
  }
  
  /**
   * Create the scroller query.
   * @param ec the Elastic context
   * @return the scroller query
   */
  protected QueryBuilder newScrollerQuery(ElasticContext ec) {
    filters = new ArrayList<QueryBuilder>();
    this.filterById();
    this.filterByOwner();
    this.filterBySourceUri();
    this.filterBySourceRef();
    this.filterByTaskRef();
    this.filterByQuery();
    if (filters.size() == 0) {
      throw new UsageException("Bulk edit: the request had no filters");
    }
    this.filterByUser();

    QueryBuilder q = null;
    if (filters.size() == 1) {
      q = filters.get(0);
    } else {
      BoolQueryBuilder bq = QueryBuilders.boolQuery();
      for (QueryBuilder filter: filters) {
        bq.filter(filter);
      }
      q = bq;
    }
    //System.err.println("Bulk edit query .......................\r\n"+q.toString()); // TODO temporary
    //if (filters.size() > 0) throw new UsageException("Bulk edit: temporary stop");
    return q;
  }
    
}
