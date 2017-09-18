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
import com.esri.geoportal.base.util.exception.InvalidParameterException;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.response.ItemWriter;
import com.esri.geoportal.lib.elastic.response.ItemWriterFactory;
import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.json.JsonStructure;

import org.elasticsearch.action.search.SearchRequestBuilder;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.common.unit.TimeValue;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.QueryStringQueryBuilder;
/* ES 2to5 */
//import org.elasticsearch.index.query.QueryStringQueryBuilder.Operator;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.WrapperQueryBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.elasticsearch.search.suggest.SuggestBuilder;
import org.elasticsearch.search.suggest.SuggestBuilders;
import org.elasticsearch.search.suggest.term.TermSuggestionBuilder.SuggestMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Search for items.
 */
public class SearchRequest extends _SearchRequestBase {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(SearchRequest.class);

  /** Instance variables . */
  protected int from = 0;
  protected int size = 10;
  protected String [] urlTypes;
  protected List<JsonStructure> musts = new ArrayList<JsonStructure>();
  protected List<JsonStructure> filters = new ArrayList<JsonStructure>();

  /** Constructor */
  public SearchRequest() {
    super();
  }
  
  /** The starting index number for the search. */
  public int getFrom() {
    return from;
  }
  
  /** The number of search results per page. */
  public int getSize() {
    return size;
  }

  public String[] getUrlTypes() {
    return urlTypes;
  }

  public void setUrlTypes(String...urlTypes) {
    this.urlTypes = urlTypes;
  }

  /** Methods =============================================================== */

  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    
    boolean b = Val.chkBool(getParameter("pretty"),false);
    if (b) this.setPretty(b);

    SearchRequestBuilder search = ec.getTransportClient().prepareSearch(ec.getItemIndexName());
    parse(search);
    search.setTypes(ec.getItemIndexType());
    
    JsonObjectBuilder jsoQuery = Json.createObjectBuilder();
    JsonObjectBuilder jsoBool = Json.createObjectBuilder();
    if (musts.size() == 0) {
      jsoBool.add("must",Json.createObjectBuilder().add("match_all",JsonUtil.newObject()));
    } else {
      JsonArrayBuilder a = Json.createArrayBuilder();
      for (JsonStructure j: musts) a.add(j);
      jsoBool.add("must",a);
    }
    if (filters.size() > 0) {
      JsonArrayBuilder a = Json.createArrayBuilder();
      for (JsonStructure j: filters) a.add(j);
      jsoBool.add("filter",a);
    }
    /* ES 2to5 */
    //jsoQuery.add("query",Json.createObjectBuilder().add("bool",jsoBool));
    jsoQuery.add("bool",jsoBool);
    
    String wq = JsonUtil.toJson(jsoQuery.build());
    search.setQuery(QueryBuilders.wrapperQuery(wq));
    // TODO some logging here
    //LOGGER.info("SearchRequest: "+wq);
    LOGGER.trace("SearchRequest: "+wq);
    SearchResponse searchResponse = search.get();
    writeResponse(response,searchResponse);
    return response;
  }
  
  /**
   * Create the response item writer.
   * @return the writer
   */
  protected ItemWriter newWriter() {
    ItemWriterFactory factory = GeoportalContext.getInstance().getBean(
        "item.ItemWriterFactory",ItemWriterFactory.class);
    return factory.newWriter(this.getF());
  }

  /**
   * Parse the request.
   * @param search the search
   */
  protected void parse(SearchRequestBuilder search) {
    this.parseXtnF(search);
    this.parseElastic(search);
    this.parseUrlTypes(search);
    this.parseXtnBBox(search);
    this.parseXtnTime(search);
    this.parseXtnFilter(search);
    this.parseXtnId(search);
  }

  /**
   * Parse the Elasticsearch components of the request.
   * @param search the search
   */
  protected void parseElastic(SearchRequestBuilder search) {
    
    // based on org.elasticsearch.rest.action.search.RestSearchAction 2016-01-27
    // https://github.com/elastic/elasticsearch/blob/master/core/src/main/java/org/elasticsearch/rest/action/search/RestSearchAction.java
    
    /*
        String[] indices = Strings.splitStringByCommaToArray(request.param("index"));
        SearchRequest searchRequest = new SearchRequest(indices);
        // get the content, and put it in the body
        // add content/source as template if template flag is set
        boolean isTemplateRequest = request.path().endsWith("/template"); 
 
 
        String searchType = request.param("search_type");
        if (SearchType.fromString(searchType, parseFieldMatcher).equals(SearchType.QUERY_AND_FETCH) ||
                SearchType.fromString(searchType, parseFieldMatcher).equals(SearchType.DFS_QUERY_AND_FETCH)) {
            throw new IllegalArgumentException("Unsupported search type [" + searchType + "]");
        } else {
            searchRequest.searchType(searchType);
        }
        
        String scroll = request.param("scroll");
        if (scroll != null) {
            searchRequest.scroll(new Scroll(parseTimeValue(scroll, null, "scroll")));
        }

        searchRequest.types(Strings.splitStringByCommaToArray(request.param("type")));
        searchRequest.routing(request.param("routing"));
        searchRequest.preference(request.param("preference"));
        searchRequest.indicesOptions(IndicesOptions.fromRequest(request, searchRequest.indicesOptions()));
     */
    
    String dsl = Val.trim(getBody());
    if (dsl != null && dsl.length() > 0) {
      boolean isJson = false;
      try {
        JsonUtil.toJsonStructure(dsl);
        isJson = true;
      } catch (Exception e) {}
      if (isJson) {
        //AggregationBuilders.
        // TODO Queries aggregations suggesters highlighters others
        WrapperQueryBuilder qwb = QueryBuilders.wrapperQuery(dsl);
        String json = qwb.toString();
        musts.add(JsonUtil.toJsonStructure(json));
        //search.setQuery(qwb);
        
      }
    }
    
    String q = Val.trim(this.getParameter("q"));
    if (q != null && q.length() > 0) {
      QueryStringQueryBuilder qsqb = QueryBuilders.queryStringQuery(q);
      if (!q.equals("*:*")) {
        //qsqb.escape(true); // TODO should this be escaped
      }
      //qsqb.allowLeadingWildcard(true);  // TODO should this be allowed
      qsqb.defaultField(Val.chkStr(this.getParameter("df"),null));
      qsqb.analyzer(Val.chkStr(this.getParameter("analyzer"),null));
      qsqb.analyzeWildcard(Val.chkBool(this.getParameter("analyze_wildcard"),true)); // TODO false?
      // qsqb.lowercaseExpandedTerms(Val.chkBool(this.getParameter("lowercase_expanded_terms"),true)); // TODO ES 2to5
      String lenient = Val.trim(this.getParameter("lenient"));
      if (lenient != null && lenient.length() > 0) {
        qsqb.lenient(Val.chkBool(lenient,false));
      }
      String defaultOperator = Val.trim(this.getParameter("default_operator"));
      if (defaultOperator != null && defaultOperator.length() > 0) {
        //qsqb.defaultOperator(Operator.fromString(defaultOperator));
        qsqb.defaultOperator(Operator.valueOf(defaultOperator));
      }
      String json = qsqb.toString();
      musts.add(JsonUtil.toJsonStructure(json));
    } 
    
    int nFrom = Val.chkInt(this.getParameter("from"),-1);
    if (nFrom<0) {
      // backward compatibility with old version of Eros feed
      nFrom = Val.chkInt(this.getParameter("start"),-1);
    }
    if (nFrom >= 0) {
      this.from = nFrom;
      if (this.getInputIndexOffset() == 0) {
        search.setFrom(nFrom);
      } else {
        search.setFrom(nFrom - this.getInputIndexOffset());
      }
      /*
      search.setFrom(nFrom);
      if (this.getInputIndexOffset() > 0) {
        this.from = nFrom - this.getInputIndexOffset();
      }
      */
    } else {
      this.from = this.getInputIndexOffset();
    }

    int nSize = Val.chkInt(this.getParameter("size"),-1);
    if (nSize<0) {
      // backward compatibility with old version of Eros feed
      nSize = Val.chkInt(this.getParameter("max"),-1);
    }
    if (nSize >= 0) {
      this.size = nSize;
      search.setSize(size);
    }
    
    String explain = Val.trim(this.getParameter("explain"));
    if (explain != null && explain.length() > 0) {
      search.setExplain(Val.chkBool(explain,false));
    }
    
    String version = Val.trim(this.getParameter("version"));
    if (version != null && version.length() > 0) {
      search.setVersion(Val.chkBool(version,false));
    }

    String timeout = Val.trim(this.getParameter("timeout"));
    if (timeout != null && timeout.length() > 0) {
      TimeValue tv = TimeValue.parseTimeValue(timeout,null,"timeout");
      if (tv != null) search.setTimeout(tv);
    }

    int terminateAfter = Val.chkInt(this.getParameter("terminate_after"),-1);
    if (terminateAfter > 0) search.setTerminateAfter(terminateAfter);
    
    /*
        if (request.param("fields") != null) {
            throw new IllegalArgumentException("The parameter [" +
                SearchSourceBuilder.FIELDS_FIELD + "] is no longer supported, please use [" +
                SearchSourceBuilder.STORED_FIELDS_FIELD + "] to retrieve stored fields or _source filtering " +
                "if the field is not stored");
        }
     */
    
    // https://github.com/elastic/elasticsearch/blob/44ac5d057a8ceb6940c26275d9963bccb9f5065a/core/src/main/java/org/elasticsearch/rest/action/search/RestSearchAction.java
    
    /* ES 2to5 */
    /*
    String fieldsParam = Val.trim(this.getParameter("fields"));
    if (fieldsParam != null) {
      if (fieldsParam.length() == 0) {
        search.setNoFields();
      } else {
        String[] fields = Val.tokenize(fieldsParam,",",false);
        for (String field: fields) search.addField(field);
      }
    }
    */
    
    String fieldsParam = this.getParameter("fields");
    if (fieldsParam == null) fieldsParam = this.getParameter("stored_fields");
    fieldsParam = Val.trim(fieldsParam);
    if (fieldsParam != null) {
      if (fieldsParam.length() == 0) {
        //search.setNoFields(); /* ES 2to5  TODO */
      } else {
        String[] fields = Val.tokenize(fieldsParam,",",false);
        for (String field: fields) search.addStoredField(field);
      }
    }

    /* ES 2to5 */
    /*
    String[] fdFields = Val.tokenize(this.getParameter("fielddata_fields"),",",false);
    for (String field: fdFields) search.addFieldDataField(field);
    */
    String[] dvFields = Val.tokenize(this.getParameter("docvalue_fields"),",",false);
    for (String field: dvFields) search.addDocValueField(field);
    String[] fdFields = Val.tokenize(this.getParameter("fielddata_fields"),",",false);
    for (String field: fdFields) search.addDocValueField(field);
    
    
    // "stored_fields"
  
    boolean checkFetchSource = true;
    if (checkFetchSource) {
      String source = Val.trim(this.getParameter("_source"));
      Boolean fetchSource = null;
      String[] source_includes = null;
      String[] source_excludes = null;
      boolean isExplicitTrue = Val.chkBool(source,false);
      boolean isExplicitFalse = !Val.chkBool(source,true);
      if (isExplicitTrue) {
        fetchSource = true;
      } else if (isExplicitFalse) {
        fetchSource = false;
      } else {
        String[] a =  Val.tokenize(this.getParameter(source),",",false);
        if (a.length > 0) source_includes = a;
      }
      String[] includes = Val.tokenize(this.getParameter("_source_includes"),",",false);
      String[] excludes = Val.tokenize(this.getParameter("_source_excludes"),",",false);
      if (includes.length > 0) source_includes = includes;
      if (excludes.length > 0) source_excludes = excludes;
      if (fetchSource != null || source_includes != null || source_excludes != null) {
        if (fetchSource == null) fetchSource = true;
        if (source_includes != null || source_excludes != null) {
          search.setFetchSource(source_includes,source_includes);
        } else {
          search.setFetchSource(fetchSource);
        }        
      }
    }

    String trackScores = Val.trim(this.getParameter("track_scores"));
    if (trackScores != null && trackScores.length() > 0) {
      search.setTrackScores(Val.chkBool(trackScores,false));
    }
    
    String[] sorts = Val.tokenize(this.getParameter("sort"),",",false);
    for (String sort: sorts) {
      int idx = sort.lastIndexOf(":");
      if (idx != -1) {
        String sortField = sort.substring(0,idx);
        String sortOrder = sort.substring(idx+1);
        if (sortOrder.equals("desc"))  {
          search.addSort(sortField,SortOrder.DESC);
        } else {
          search.addSort(sortField,SortOrder.ASC);
        }
      } else {
        search.addSort(sort,SortOrder.ASC);
      }
    }
    
    String[] stats = Val.tokenize(this.getParameter("stats"),",",false);
    if (stats.length > 0) search.setStats(stats);
    
    String suggestField = Val.trim(this.getParameter("suggest_field"));
    if (suggestField != null && suggestField.length() > 0) {
      String suggestText = Val.chkStr(this.getParameter("suggest_text"),q);
      int suggestSize = Val.chkInt(this.getParameter("suggest_size"),5);
      String suggestMode = Val.trim(this.getParameter("suggest_mode"));
      /* ES 2to5 */
      /*
      search.addSuggestion(SuggestBuilders.termSuggestion(suggestField)
          .field(suggestField).text(suggestText).size(suggestSize).suggestMode(suggestMode));
      */
      search.suggest(new SuggestBuilder().addSuggestion(suggestField,
        SuggestBuilders.termSuggestion(suggestField)
          .text(suggestText).size(suggestSize).suggestMode(SuggestMode.resolve(suggestMode))));
    }

  }
  
  /**
   * Parse the bbox parameter.
   * <br>bbox={geo:box?}
   * @param search the search
   */
  protected void parseXtnBBox(SearchRequestBuilder search) {
    // bbox={geo:box?}
    /*
    {
      "geo_shape": {
        "envelope_geo": {
          "shape": {
            "type": "envelope",
            "coordinates" : [[13.0, 53.0], [14.0, 52.0]]
          }
        }
      }
    }
     */
    // TODO configure field names
    String field = "envelope_geo";
    String bbox = Val.trim(this.getParameter("bbox"));
    String rel = Val.trim(this.getParameter("spatialRel"));
    if (bbox != null && bbox.length() > 0) {
      String[] a = bbox.split(",");
      if (a.length >= 4) {
        try {
          double xmin = Double.parseDouble(a[0]);
          double ymin = Double.parseDouble(a[1]);
          double xmax = Double.parseDouble(a[2]);
          double ymax = Double.parseDouble(a[3]);
          
          if (xmin > 10000) {
            String msg = "The bbox coordinates should be WGS84.";
            throw new InvalidParameterException("bbox",msg);
          }
          
          if ((xmin < -180.0) && (xmax >= -180.0)) xmin = -180.0;
          if ((xmax > 180.0) && (xmin <= 180.0)) xmax = 180.0;
          if ((ymin < -90.0) && (ymax >= -90.0)) ymin = -90.0;
          if ((ymax > 90.0) && (ymin <= 90.0)) ymax = 90.0;
          
          // spatialRel INTERSECTS WITHIN CONTAINS DISJOINT
          String relation = "intersects";
          if (rel != null && rel.length() > 0) {
            rel = rel.toLowerCase();
            if (rel.equals("intersects") || rel.equals("within") || 
                rel.equals("contains") || rel.equals("disjoint")) {
              relation = rel;
            }
          }
                    
          String txt = "{\"type\":\"envelope\",\"coordinates\":[["+xmin+","+ymax+"],["+xmax+","+ymin+"]]}";
          JsonStructure env = JsonUtil.toJsonStructure(txt);
          JsonObjectBuilder jso = Json.createObjectBuilder();
          jso.add("geo_shape",Json.createObjectBuilder()
            .add(field,Json.createObjectBuilder()
              .add("shape",env)
              .add("relation",relation)
            )
          );
          filters.add(jso.build());
        } catch (NumberFormatException nfe) {
          throw new InvalidParameterException("bbox");
        }
      }
    }

  }
  
  /**
   * Parse the response format parameter.
   * <br>f={json|pjson|atom|csw}
   * @param search the search
   */
  protected void parseXtnF(SearchRequestBuilder search) {
    String f =  Val.trim(getParameter("f"));
    String outputSchema = Val.trim(getParameter("outputSchema"));
    if (outputSchema != null && outputSchema.length() > 0) {
      f = outputSchema;
    } 
    if (f != null && f.equals("pjson")) this.setPretty(true);
    if (f != null && f.length() > 0) this.setF(f);
  }
  
  /**
   * Parse the id parameter.
   * <br>id={id,id,id}
   * @param search the search
   */
  protected void parseXtnId(SearchRequestBuilder search) {
    String[] ids = getParameterValues("id");
    //if (ids == null) ids = getParameterValues("ids");
    //if (ids == null) ids = getParameterValues("recordId");
    if (ids == null) ids = getParameterValues("recordIds");
    if (ids != null && ids.length == 1) {
      ids = Val.tokenize(ids[0],",",false);
    }
    if (ids != null && ids.length > 0) {
      String json = QueryBuilders.idsQuery().addIds(ids).toString();
      filters.add(JsonUtil.toJsonStructure(json));
    }
  }
  
  /**
   * Parse the filter parameter.
   * <br>filter={filter}
   * @param search the search
   */
  protected void parseXtnFilter(SearchRequestBuilder search) {
    String v = Val.trim(this.getParameter("filter"));
    if (v != null && v.length() > 0) {
      // TODO check for wrapper query??
      String json = QueryBuilders.queryStringQuery(v).toString();
      filters.add(JsonUtil.toJsonStructure(json));
    }
  }
  
  /**
   * Parse the time parameter (temporal extent)
   * <br>time={time:start?/{time:end?}
   * @param search the search
   */
  protected void parseXtnTime(SearchRequestBuilder search) {
    // time={time:start?/{time:end?}
    /*
    {
      "range" : {
        "date" : {
          "gte" : "now-1d/d",
          "lt" :  "now/d"
        }
      }
    }
     */
    // TODO configure field names
    // TODO end: lt or lte ???
    List<JsonStructure> tFilters = new ArrayList<JsonStructure>();
    String startField = "timeperiod_nst.begin_dt";
    String endField = "timeperiod_nst.end_dt";
    String time = Val.trim(this.getParameter("time"));
    if (time != null && time.length() > 0) {
      String start = null, end = null;
      String[] parts = time.split("/");
      start = Val.trim(parts[0]);
      if (parts.length > 1) end = Val.trim(parts[1]);
      if (start != null && start.length() > 0) {
        JsonObjectBuilder jso = Json.createObjectBuilder();
        jso.add("range",Json.createObjectBuilder().add(
            startField,Json.createObjectBuilder().add("gte",start)));
        tFilters.add(jso.build());
      }
      if (end != null && end.length() > 0) {
        JsonObjectBuilder jso = Json.createObjectBuilder();
        jso.add("range",Json.createObjectBuilder().add(
            endField,Json.createObjectBuilder().add("lt",end)));
        tFilters.add(jso.build());
      }
    }
    if (tFilters.size() > 0) {
      JsonArrayBuilder a = Json.createArrayBuilder();
      for (JsonStructure j: tFilters) a.add(j);
      JsonObjectBuilder jq = Json.createObjectBuilder();
      /*
      jq.add("query",Json.createObjectBuilder()
          .add("nested",Json.createObjectBuilder()
            .add("path", "timeperiod_nst")
            .add("query",Json.createObjectBuilder()
              .add("bool",Json.createObjectBuilder()
                .add("must",a)
              )
            )
          )
        );
       */

      jq.add("nested",Json.createObjectBuilder()
        .add("path", "timeperiod_nst")
        .add("query",Json.createObjectBuilder()
          .add("bool",Json.createObjectBuilder()
            .add("must",a)
          )
        )
      );

      //System.err.println("temporalq="+jq.build());
      filters.add(jq.build());
    }
  }

  protected void parseUrlTypes(SearchRequestBuilder search) {
    String sUrlTypes = Val.trim(this.getParameter("urlTypes"));
    if (sUrlTypes!=null) {
      urlTypes = sUrlTypes.split(",");
    }
    
    if (urlTypes!=null && urlTypes.length>0) {
      JsonObjectBuilder jsoQuery = Json.createObjectBuilder();
      JsonObjectBuilder jsoBool = Json.createObjectBuilder();
      JsonObjectBuilder jsoMust = Json.createObjectBuilder();
      JsonObjectBuilder jsoNested = Json.createObjectBuilder();
      JsonObjectBuilder jsoNestedQuery = Json.createObjectBuilder();
      JsonObjectBuilder jsoTerms = Json.createObjectBuilder();
      JsonArrayBuilder jsoTermsArray = Json.createArrayBuilder();
      Arrays.asList(urlTypes).forEach(jsoTermsArray::add);

      jsoTerms.add("resources_nst.url_type_s", jsoTermsArray);
      jsoNestedQuery.add("terms", jsoTerms);
      jsoNested.add("path", "resources_nst");
      jsoNested.add("query", jsoNestedQuery);
      jsoMust.add("nested", jsoNested);
      jsoBool.add("must", jsoMust);
      jsoQuery.add("bool", jsoBool);

      JsonObjectBuilder jq = Json.createObjectBuilder();
      jq.add("query", jsoQuery);

      filters.add(jq.build());
    }
  }
  
  /**
   * Write the response. 
   * @param response the app response
   * @param searchResponse the search response
   */
  public void writeResponse(AppResponse response, SearchResponse searchResponse) throws Exception {
    ItemWriter writer = newWriter();
    writer.write(this,response,searchResponse);
  }

}
