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
package com.esri.geoportal.lib.elastic;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.eclipse.jetty.client.BytesRequestContent;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.client.Request;
import org.eclipse.jetty.ee10.proxy.BalancerServlet;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.base.util.BalancerSupport;
import com.esri.geoportal.base.util.BalancerSupport.BalancerNode;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.security.ConfigProperties;


import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * A proxy to Elasticsearch.
 */
public class ElasticProxy extends BalancerServlet {

  /** Properties */
  private static final Logger LOGGER = LoggerFactory.getLogger(ElasticProxy.class);

  private static final long serialVersionUID = 1L;
  private final BalancerSupport balancerSupport = new BalancerSupport();
  private String _authString = null;
  private boolean _useHttps = false;
  private Integer proxyBufferSize = null;

  // ---- Security settings ----
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final int MAX_AGG_SIZE = 100;
  private static final int MAX_GEOHASH_PRECISION = 7;
  // Nested aggregations multiply bucket counts (100 x 100 x ...), and a flat list
  // of many sibling aggregations can be just as expensive, so both the nesting
  // depth and the total number of aggregation definitions in a request are capped.
  private static final int MAX_AGG_DEPTH = 3;
  private static final int MAX_TOTAL_AGGS = 30;
  // date_histogram with a tiny interval over a large date range (or min_doc_count:0,
  // which forces empty buckets to be filled in across that whole range) can generate
  // huge numbers of buckets, so intervals finer than this are clamped and min_doc_count:0
  // is bumped to 1.
  private static final long MIN_DATE_HISTOGRAM_INTERVAL_MS = 60 * 60 * 1000L; // 1 hour
  private static final Pattern FIXED_INTERVAL_PATTERN = Pattern.compile("(\\d+)\\s*(ms|s|m|h|d)", Pattern.CASE_INSENSITIVE);
  private static final Set<String> SUB_HOUR_CALENDAR_INTERVALS = Set.of("second", "seconds", "1s", "minute", "minutes", "1m");
  // 10 MB was too generous for a search/count body - lowered to 1 MB.
  private static final int MAX_BODY_BYTES = 1 * 1024 * 1024;
  // "size"/"from"/"search_after" are otherwise unbounded, letting a client pull back
  // (or deep-page through) far more of the index than a UI search ever needs.
  private static final int MAX_SEARCH_SIZE = 100;
  private static final int MAX_SEARCH_FROM = 10000;
  // Limits for the "heavy" query types (regexp, wildcard, fuzzy, query_string,
  // simple_query_string) - these aren't blocked outright (query_string/simple_query_string
  // back the main search box), but their most expensive features are capped/disabled.
  private static final int MAX_DETERMINIZED_STATES = 1000;
  private static final int MAX_PATTERN_LENGTH = 200;
  private static final int MAX_QUERY_TEXT_LENGTH = 1000;
  private static final int MAX_FUZZINESS = 2;
  private static final int MAX_FUZZY_EXPANSIONS = 50;
  private static final String QUERY_TIMEOUT = "7s";
  private static final String SANITIZED_ATTR = ElasticProxy.class.getName() + ".sanitizedBody";
  // Elasticsearch also accepts the request body via a "source" query-string
  // parameter (?source=<json>&source_content_type=application/json), most
  // often paired with GET - this bypasses the body-based checks entirely,
  // so the sanitized value is stashed here and spliced back into the
  // proxied URL by rewriteTarget().
  private static final String SANITIZED_SOURCE_ATTR = ElasticProxy.class.getName() + ".sanitizedSource";

  // Blocked anywhere in the body: real scripting keys, plus stored-script/template
  // references ("source"/"inline"/"id" - matter for _search/template, already blocked
  // at the path level too, but defended here as well) and query types that read other
  // documents (more_like_this "like" docs, percolate) which this app never uses.
  private static final Set<String> BLOCKED_KEYS = Set.of(
      "script", "script_score", "script_fields", "runtime_mappings", "scripted_metric",
      "source", "inline", "id", "template", "percolate", "more_like_this", "inner_hits");

  // Blocked only at the top level of the search body - these are legitimate ES query
  // clause parameters (e.g. "fields" inside simple_query_string) when nested, but at
  // the root they are response-shaping options that can expose fields not meant to be
  // public, none of which this app's client code ever sends.
  private static final Set<String> DATA_LEAK_ROOT_KEYS = Set.of(
      "_source", "fields", "docvalue_fields", "stored_fields", "highlight");

  private static final Set<String> ALLOWED_AGG_TYPES = Set.of(
      "terms", "date_histogram", "nested", "geohash_grid", "filter", "filters");

  // ---- Path allow-list ----
  // This app only ever needs to search the configured metadata index (see doc/api.txt
  // and every client usage under src/main/webapp - all of it hits "_search" against the
  // one metadata index, nothing else). A keyword-based allow/forbidden-segment list is
  // NOT sufficient here: it would still let a client search a *different* index entirely
  // (e.g. "/elastic/some_other_index/_search", or even "/elastic/.kibana/_search" - any
  // index name is, by definition, not a "forbidden" keyword), and a path-traversal segment
  // like "/elastic/x/../_search" would sail through such a check (no forbidden segment
  // present) only to have the proxy's own URI normalization later collapse "x/.." away,
  // producing a *bare* "/_search" that Elasticsearch runs across *all* indices. So instead
  // the path is required to be *exactly* the one shape this app ever sends: either a bare
  // "/_search" (which addIndexName() below expands to the configured index) or an explicit
  // "/{indexName}/_search" naming that same index - nothing more, nothing less. "." and
  // ".." segments are rejected outright (never silently resolved) so they can't be used to
  // disguise a different effective path.
  private boolean isAllowedElasticPath(String pathInfo) {
    if (pathInfo == null) return false;
    GeoportalContext gc = GeoportalContext.getInstance();
    ElasticContext ec = gc != null ? gc.getElasticContext() : null;
    if (ec == null) return false;
    String path = ec.addIndexName(pathInfo);
    if (path == null) return false;
    List<String> segs = new ArrayList<>();
    for (String s : path.split("/")) {
      if (s.isEmpty()) continue;
      if (s.equals(".") || s.equals("..")) return false;
      segs.add(s);
    }
    return segs.size() == 2 && segs.get(0).equals(ec.getIndexName()) && segs.get(1).equalsIgnoreCase("_search");
  }




  /** Default allowed aggregation fields (used if appui.search.aggregation.fields is not configured). */
  private static final Set<String> DEFAULT_AGG_FIELDS = Set.of(
      "envelope_cen_pt", "src_collections_s", "sys_owner_s", "apiso_TopicCategory_s",
      "sys_metadatatype_s", "contact_organizations_s", "keywords_s", "src_source_type_s",
      "src_source_name_s", "timeperiod_nst.begin_dt", "timeperiod_nst.end_dt", "sys_modified_dt");

  /** Allowed aggregation fields, loaded from appui.search.aggregation.fields. */
  private Set<String> allowedAggFields = DEFAULT_AGG_FIELDS;
  /** If true (appui.search.allowSettings), aggregation fields are not validated. */
  private boolean allowSettings = false;

  /** Loads appui.search.allowSettings and appui.search.aggregation.fields from the Spring ConfigProperties bean. */
  private void loadAggregationSettings() {
    try {
      GeoportalContext gc = GeoportalContext.getInstance();
      if (gc == null || gc.getApplicationContext() == null) {
        LOGGER.warn("Spring context not available, using default aggregation fields.");
        return;
      }
      ConfigProperties cfg = gc.getApplicationContext().getBean(ConfigProperties.class);
      allowSettings = cfg.isSearchAllowSettings();
      Set<String> set = new HashSet<>(cfg.getSearchAggregationFieldsList());
      if (!set.isEmpty()) allowedAggFields = set;
    } catch (Exception e) {
      LOGGER.warn("Unable to read ConfigProperties, using default aggregation fields.", e);
    }
    LOGGER.debug("allowSettings=" + allowSettings + ", allowed aggregation fields=" + allowedAggFields);
  }

  /** Thrown when a request violates the security rules. */
  private static class AccessDeniedException extends Exception {
    private static final long serialVersionUID = 1L;
    AccessDeniedException(String msg) {
      super(msg);
    }
  }

  @Override
  protected void service(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    if (!isAllowedElasticPath(request.getPathInfo())) {
      LOGGER.warn("Blocked Elasticsearch path: " + request.getPathInfo());
      response.sendError(HttpServletResponse.SC_FORBIDDEN, "This endpoint is not supported.");
      return;
    }
    String method = request.getMethod();
    // Elasticsearch accepts (and Jetty will forward) a request body on GET
    // as well, e.g. GET _search with a query body - so GET must be
    // sanitized/size-checked too, not just POST/PUT/PATCH.
    boolean mayHaveBody = "POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)
        || "PATCH".equalsIgnoreCase(method) || "GET".equalsIgnoreCase(method);
    if (mayHaveBody) {
      byte[] bytes = request.getInputStream().readNBytes(MAX_BODY_BYTES + 1);
      if (bytes.length > MAX_BODY_BYTES) {
        response.sendError(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "Request body too large");
        return;
      }
      if (bytes.length > 0) {
        try {
          byte[] sanitized = sanitizeBody(new String(bytes, StandardCharsets.UTF_8), request.getRequestURI());
          request.setAttribute(SANITIZED_ATTR, sanitized);
        } catch (AccessDeniedException e) {
          LOGGER.warn("Blocked Elasticsearch request: " + e.getMessage());
          response.sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
          return;
        } catch (IOException e) {
          response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON request body");
          return;
        }
      }
    }

    // Elasticsearch also accepts the query body via a "source" query-string
    // parameter (?source=<json>&source_content_type=application/json),
    // typically combined with GET so no request body is sent at all. This
    // query parameter bypasses the body checks above entirely, so it must
    // be validated/sanitized the same way. Parsed directly from the raw
    // query string (rather than request.getParameter()) to avoid any
    // interaction with the input stream already consumed above.
    String source = extractQueryParam(request.getQueryString(), "source");
    if (source != null) {
      if (source.getBytes(StandardCharsets.UTF_8).length > MAX_BODY_BYTES) {
        response.sendError(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "Request body too large");
        return;
      }
      try {
        byte[] sanitized = sanitizeBody(source, request.getRequestURI());
        request.setAttribute(SANITIZED_SOURCE_ATTR, new String(sanitized, StandardCharsets.UTF_8));
      } catch (AccessDeniedException e) {
        LOGGER.warn("Blocked Elasticsearch request: " + e.getMessage());
        response.sendError(HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        return;
      } catch (IOException e) {
        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON in source parameter");
        return;
      }
    }

    super.service(request, response);
  }

  /** Extracts and URL-decodes a single query-string parameter's raw value, or null if absent/undecodable. */
  private String extractQueryParam(String query, String name) {
    if (query == null) return null;
    for (String pair : query.split("&")) {
      int eq = pair.indexOf('=');
      if (eq < 0) continue;
      String key = pair.substring(0, eq);
      if (!key.equalsIgnoreCase(name)) continue;
      try {
        return URLDecoder.decode(pair.substring(eq + 1), "UTF-8");
      } catch (UnsupportedEncodingException | IllegalArgumentException e) {
        return null;
      }
    }
    return null;
  }

  @Override
  protected Request.Content proxyRequestContent(HttpServletRequest request,
      HttpServletResponse response, Request proxyRequest) throws IOException {
    byte[] sanitized = (byte[]) request.getAttribute(SANITIZED_ATTR);
    if (sanitized == null) {
      return super.proxyRequestContent(request, response, proxyRequest);
    }
    // body may have changed: let the client compute Content-Length
    proxyRequest.headers(h -> h.remove(HttpHeader.CONTENT_LENGTH));
    String contentType = request.getContentType();
    if (contentType == null) contentType = "application/json";
    return new BytesRequestContent(contentType, sanitized);
  }

  /** Validates and sanitizes a request body (JSON or NDJSON). */
  private byte[] sanitizeBody(String body, String path) throws AccessDeniedException, IOException {
    boolean isSearch = path != null && path.contains("_search");
    boolean isMSearch = path != null && path.contains("_msearch");
    String trimmed = body.trim();

    if (!isMSearch) {
      try {
        JsonNode node = MAPPER.readTree(trimmed);
        if (node != null && node.isObject()) {
          sanitizeObject((ObjectNode) node, isSearch);
        } else if (node != null) {
          checkNoBlockedKeys(node);
        }
        return MAPPER.writeValueAsBytes(node);
      } catch (JsonProcessingException e) {
        // fall through to NDJSON handling
      }
    }

    // NDJSON (_msearch, _bulk)
    StringBuilder sb = new StringBuilder();
    int idx = 0;
    for (String line : trimmed.split("\n")) {
      if (line.isBlank()) continue;
      JsonNode node = MAPPER.readTree(line);
      if (node != null && node.isObject()) {
        sanitizeObject((ObjectNode) node, isMSearch && (idx % 2 == 1));
      }
      sb.append(MAPPER.writeValueAsString(node)).append('\n');
      idx++;
    }
    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  /** Sanitizes a single search body object. */
  private void sanitizeObject(ObjectNode body, boolean isSearch) throws AccessDeniedException {
    checkNoBlockedKeys(body);
    checkNoDataLeakRootKeys(body);
    checkNoTermsLookup(body);
    sanitizeHeavyQueries(body);
    if (isSearch) {
      body.put("timeout", QUERY_TIMEOUT);
    }
    if (body.has("size") && body.get("size").asInt() > MAX_SEARCH_SIZE) {
      body.put("size", MAX_SEARCH_SIZE);
    }
    if (body.has("from") && body.get("from").asInt() > MAX_SEARCH_FROM) {
      body.put("from", MAX_SEARCH_FROM);
    }
    JsonNode aggs = body.has("aggs") ? body.get("aggs") : body.get("aggregations");
    if (aggs != null) {
      validateAggs(aggs, 1, new int[]{0});
    }
  }

  /** Rejects response-shaping options that can expose fields not meant to be public (root level only). */
  private void checkNoDataLeakRootKeys(ObjectNode body) throws AccessDeniedException {
    for (String key : DATA_LEAK_ROOT_KEYS) {
      if (body.has(key)) {
        throw new AccessDeniedException("\"" + key + "\" is not allowed");
      }
    }
  }

  /** Recursively rejects "terms lookup" (a terms query that reads its values from another document via index/id/path). */
  private void checkNoTermsLookup(JsonNode node) throws AccessDeniedException {
    if (node.isObject()) {
      Iterator<Map.Entry<String, JsonNode>> it = node.fields();
      while (it.hasNext()) {
        Map.Entry<String, JsonNode> e = it.next();
        if ("terms".equals(e.getKey()) && e.getValue().isObject()) {
          Iterator<JsonNode> vals = e.getValue().elements();
          while (vals.hasNext()) {
            JsonNode v = vals.next();
            if (v.isObject() && (v.has("index") || v.has("id") || v.has("path"))) {
              throw new AccessDeniedException("terms lookup (index/id/path) is not allowed");
            }
          }
        }
        checkNoTermsLookup(e.getValue());
      }
    } else if (node.isArray()) {
      for (JsonNode child : node) {
        checkNoTermsLookup(child);
      }
    }
  }

  /**
   * Recursively caps/disables the most expensive features of the "heavy" query types
   * (regexp, wildcard, fuzzy, query_string, simple_query_string). These query types are
   * not blocked outright - query_string/simple_query_string back the application's main
   * search box - but options that can turn them into a full index scan are capped.
   */
  private void sanitizeHeavyQueries(JsonNode node) throws AccessDeniedException {
    if (node.isObject()) {
      ObjectNode obj = (ObjectNode) node;
      Iterator<Map.Entry<String, JsonNode>> it = obj.fields();
      while (it.hasNext()) {
        Map.Entry<String, JsonNode> e = it.next();
        String key = e.getKey();
        JsonNode val = e.getValue();
        if (val.isObject()) {
          if ("wildcard".equals(key)) {
            sanitizePatternFieldClauses((ObjectNode) val, "wildcard", true);
          } else if ("regexp".equals(key)) {
            sanitizePatternFieldClauses((ObjectNode) val, "regexp", false);
          } else if ("fuzzy".equals(key)) {
            sanitizeFuzzyFieldClauses((ObjectNode) val);
          } else if ("query_string".equals(key)) {
            sanitizeQueryStringClause((ObjectNode) val, true);
          } else if ("simple_query_string".equals(key)) {
            sanitizeQueryStringClause((ObjectNode) val, false);
          }
        }
        sanitizeHeavyQueries(val);
      }
    } else if (node.isArray()) {
      for (JsonNode child : node) {
        sanitizeHeavyQueries(child);
      }
    }
  }

  /** Validates/clamps the per-field clauses of a "wildcard" or "regexp" query. */
  private void sanitizePatternFieldClauses(ObjectNode fieldClauses, String type, boolean blockLeadingWildcard)
      throws AccessDeniedException {
    Iterator<Map.Entry<String, JsonNode>> it = fieldClauses.fields();
    while (it.hasNext()) {
      JsonNode v = it.next().getValue();
      String pattern = null;
      if (v.isTextual()) {
        pattern = v.asText();
      } else if (v.isObject()) {
        ObjectNode o = (ObjectNode) v;
        JsonNode pn = o.has("value") ? o.get("value") : o.get(type);
        if (pn != null) pattern = pn.asText();
        if (o.has("max_determinized_states") && o.get("max_determinized_states").asInt() > MAX_DETERMINIZED_STATES) {
          o.put("max_determinized_states", MAX_DETERMINIZED_STATES);
        }
      }
      if (pattern != null) {
        if (pattern.length() > MAX_PATTERN_LENGTH) {
          throw new AccessDeniedException(type + " pattern exceeds max length of " + MAX_PATTERN_LENGTH);
        }
        if (blockLeadingWildcard && (pattern.startsWith("*") || pattern.startsWith("?"))) {
          throw new AccessDeniedException("Leading wildcard in " + type + " query is not allowed");
        }
      }
    }
  }

  /** Clamps the per-field clauses of a "fuzzy" query. */
  private void sanitizeFuzzyFieldClauses(ObjectNode fieldClauses) {
    Iterator<Map.Entry<String, JsonNode>> it = fieldClauses.fields();
    while (it.hasNext()) {
      JsonNode v = it.next().getValue();
      if (v.isObject()) {
        ObjectNode o = (ObjectNode) v;
        if (o.has("fuzziness") && o.get("fuzziness").isNumber() && o.get("fuzziness").asInt() > MAX_FUZZINESS) {
          o.put("fuzziness", MAX_FUZZINESS);
        }
        if (o.has("max_expansions") && o.get("max_expansions").asInt() > MAX_FUZZY_EXPANSIONS) {
          o.put("max_expansions", MAX_FUZZY_EXPANSIONS);
        }
      }
    }
  }

  /** Validates/clamps a "query_string" or "simple_query_string" clause. */
  private void sanitizeQueryStringClause(ObjectNode clause, boolean isFullQueryString) throws AccessDeniedException {
    if (clause.has("query") && clause.get("query").asText("").length() > MAX_QUERY_TEXT_LENGTH) {
      throw new AccessDeniedException("Query text exceeds max length of " + MAX_QUERY_TEXT_LENGTH);
    }
    if (clause.has("fuzziness") && clause.get("fuzziness").isNumber() && clause.get("fuzziness").asInt() > MAX_FUZZINESS) {
      clause.put("fuzziness", MAX_FUZZINESS);
    }
    if (clause.has("max_determinized_states") && clause.get("max_determinized_states").asInt() > MAX_DETERMINIZED_STATES) {
      clause.put("max_determinized_states", MAX_DETERMINIZED_STATES);
    }
    if (isFullQueryString) {
      // allow_leading_wildcard is only valid for the full "query_string" query (not
      // simple_query_string, which would reject it as an unknown parameter) - force it
      // off regardless of client input, since a leading wildcard forces a full index scan.
      clause.put("allow_leading_wildcard", false);
    }
  }

  /** Recursively blocks any script related keys. */
  private void checkNoBlockedKeys(JsonNode node) throws AccessDeniedException {
    if (node.isObject()) {
      Iterator<Map.Entry<String, JsonNode>> it = node.fields();
      while (it.hasNext()) {
        Map.Entry<String, JsonNode> e = it.next();
        if (BLOCKED_KEYS.contains(e.getKey())) {
          throw new AccessDeniedException("Scripts are not allowed");
        }
        checkNoBlockedKeys(e.getValue());
      }
    } else if (node.isArray()) {
      for (JsonNode child : node) {
        checkNoBlockedKeys(child);
      }
    }
  }

  /**
   * Recursively validates the aggregations.
   * @param aggs the "aggs"/"aggregations" object
   * @param depth the current nesting depth (top-level = 1)
   * @param totalAggCount mutable running count of aggregation definitions seen so far, across the whole request
   */
  private void validateAggs(JsonNode aggs, int depth, int[] totalAggCount) throws AccessDeniedException {
    if (!aggs.isObject()) {
      throw new AccessDeniedException("Invalid aggregations");
    }
    if (!allowSettings && depth > MAX_AGG_DEPTH) {
      throw new AccessDeniedException("Aggregation nesting too deep (max " + MAX_AGG_DEPTH + ")");
    }
    Iterator<Map.Entry<String, JsonNode>> names = aggs.fields();
    while (names.hasNext()) {
      names.next();
      if (!allowSettings && ++totalAggCount[0] > MAX_TOTAL_AGGS) {
        throw new AccessDeniedException("Too many aggregations in request (max " + MAX_TOTAL_AGGS + ")");
      }
    }
    names = aggs.fields();
    while (names.hasNext()) {
      JsonNode def = names.next().getValue();
      if (!def.isObject()) {
        throw new AccessDeniedException("Invalid aggregation definition");
      }
      Iterator<String> keys = def.fieldNames();
      while (keys.hasNext()) {
        String aggType = keys.next();
        if ("aggs".equals(aggType) || "aggregations".equals(aggType)) {
          validateAggs(def.get(aggType), depth + 1, totalAggCount);
        } else if ("meta".equals(aggType)) {
          continue;
        } else if (!ALLOWED_AGG_TYPES.contains(aggType)) {
          throw new AccessDeniedException("Aggregation type not allowed: " + aggType);
        } else {
          validateAggBody(aggType, def.get(aggType));
        }
      }
    }
  }

  /** Validates field restrictions and limits of an individual aggregation. */
  private void validateAggBody(String aggType, JsonNode agg) throws AccessDeniedException {
    if (!agg.isObject()) return;
    ObjectNode obj = (ObjectNode) agg;
    switch (aggType) {
      case "terms":
      case "date_histogram":
      case "geohash_grid":
        JsonNode field = obj.get("field");
        if (!allowSettings && (field == null || !allowedAggFields.contains(field.asText()))) {
          throw new AccessDeniedException("Aggregation not allowed on field: "
              + (field == null ? "(none)" : field.asText()));
        }
        if (("geohash_grid".equals(aggType) && !obj.has("size"))
            || (obj.has("size") && obj.get("size").asInt() > MAX_AGG_SIZE)) {
          obj.put("size", MAX_AGG_SIZE);
        }
        if ("geohash_grid".equals(aggType) && obj.has("precision")
            && obj.get("precision").asInt() > MAX_GEOHASH_PRECISION) {
          obj.put("precision", MAX_GEOHASH_PRECISION);
        }
        if ("terms".equals(aggType) && !allowSettings) {
          // include/exclude (regex or large value lists) and shard_size (forces every
          // shard to compute and return far more terms than "size") are all ways to
          // make an otherwise-bounded terms aggregation expensive again.
          if (obj.has("include") || obj.has("exclude")) {
            throw new AccessDeniedException("terms aggregation \"include\"/\"exclude\" is not allowed");
          }
          if (obj.has("shard_size")) {
            throw new AccessDeniedException("terms aggregation \"shard_size\" is not allowed");
          }
        }
        if ("date_histogram".equals(aggType) && !allowSettings) {
          validateDateHistogram(obj);
        }
        break;
      default:
        break;
    }
  }

  /**
   * Clamps a date_histogram's interval to a minimum granularity and forces
   * min_doc_count to at least 1, so a tiny interval over a large date range
   * (or min_doc_count:0 filling in empty buckets across that range) cannot
   * generate an unbounded number of buckets.
   */
  private void validateDateHistogram(ObjectNode obj) {
    if (!obj.has("min_doc_count") || obj.get("min_doc_count").asInt(1) <= 0) {
      obj.put("min_doc_count", 1);
    }
    for (String field : new String[]{"fixed_interval", "interval"}) {
      if (!obj.has(field)) continue;
      String value = obj.get(field).asText().trim();
      if ("interval".equals(field) && Set.of(
          "year", "1y", "quarter", "1q", "month", "1M",
          "week", "1w", "day", "1d", "hour", "1h").contains(value)) {
        continue;
      }
      Long ms = parseFixedIntervalMillis(value);
      if (ms == null || ms < MIN_DATE_HISTOGRAM_INTERVAL_MS) {
        obj.put(field, "1h");
      }
    }
    if (obj.has("calendar_interval")) {
      String v = obj.get("calendar_interval").asText().trim();
      if (SUB_HOUR_CALENDAR_INTERVALS.contains(v)) {
        obj.put("calendar_interval", "hour");
      }
    }
  }

  /** Parses an Elasticsearch fixed interval/date-histogram interval string (e.g. "30s","2h") to milliseconds, or null if unparseable. */
  private Long parseFixedIntervalMillis(String value) {
    if (value == null) return null;
    Matcher m = FIXED_INTERVAL_PATTERN.matcher(value.trim());
    if (!m.matches()) return null;
    long amount = Long.parseLong(m.group(1));
    long unitMs;
    switch (m.group(2).toLowerCase()) {
      case "ms": unitMs = 1L; break;
      case "s": unitMs = 1000L; break;
      case "m": unitMs = 60_000L; break;
      case "h": unitMs = 3_600_000L; break;
      case "d": unitMs = 86_400_000L; break;
      default: return null;
    }
    return amount * unitMs;
  }

  
  
  @Override
  protected void copyRequestHeaders(HttpServletRequest clientRequest, Request proxyRequest) {
    super.copyRequestHeaders(clientRequest, proxyRequest);
    if (this._authString != null) {
    	proxyRequest.headers(h -> h.put("Authorization", this._authString));
    }
  }

  /* TODO proxyPassReverse??
  @Override
  protected String filterServerResponseHeader(HttpServletRequest request, Response serverResponse, String headerName,
      String headerValue) {
    return super.filterServerResponseHeader(request, serverResponse, headerName, headerValue);
  }
  */

  @Override
  public void init() throws ServletException {
    LOGGER.debug("Starting up ElasticProxy...");
    loadAggregationSettings();
    GeoportalContext gc = GeoportalContext.getInstance();
    if (gc!=null) {
      ElasticContext ec = gc.getElasticContext();
      if (ec!=null) {
        proxyBufferSize = ec.getProxyBufferSize();
      }
    }
    initBalancerNodes();
    super.init();
  }
  
  /** Initialize the load balancer nodes. */
  private void initBalancerNodes() {
    GeoportalContext gc = GeoportalContext.getInstance();
    ElasticContext ec = null;
    if (gc != null) ec = gc.getElasticContext();
    if (ec != null) {
      String[] nodes = ec.nodesToArray();
      String scheme = "http://";
      if (ec.getUseHttps()) {
        scheme = "https://";
        this._useHttps = true;
      }
      if ((nodes != null) && (nodes.length > 0)) {
        for (String node: nodes) {
          String url = scheme+node+":"+ec.getHttpPort();
          LOGGER.debug("Adding BalancerNode: "+url);
          balancerSupport.getBalancerNodes().add(new BalancerNode(url));
        }
      }
      String user = ec.getUsername();
      String pwd = ec.getPassword();
      if (user != null && user.length() > 0 && pwd != null && pwd.length() > 0) {
        try {
          String cred = user+":"+pwd;
          byte[] bytes = java.util.Base64.getEncoder().encode(cred.getBytes("UTF-8"));
          this._authString = "Basic "+(new String(bytes,"UTF-8"));
        } catch (UnsupportedEncodingException e) {
        }
      }
    }
  }
  
  @Override
  protected HttpClient newHttpClient() {                                                                                                            SslContextFactory.Client factory = null;
    
    HttpClient client = new HttpClient();
    if (this._useHttps) {    	
        factory = new SslContextFactory.Client();
        factory.setTrustAll(true);
        client.setSslContextFactory(factory);
      }
    

    if (proxyBufferSize!=null) {
      LOGGER.debug("Buffer size for HTTP client for ElasticProxi set to: %s bytes".formatted(proxyBufferSize));
      client.setRequestBufferSize(proxyBufferSize);
    }
//    org.eclipse.jetty.client.HttpProxy proxy = new org.eclipse.jetty.client.HttpProxy("localhost",8888);
//    org.eclipse.jetty.client.ProxyConfiguration proxyConfig = client.getProxyConfiguration();
//    proxyConfig.getProxies().add(proxy);
    return client;
  }
  
  @Override
  protected String rewriteTarget(HttpServletRequest request) {
    String uri = balancerSupport.rewriteTarget(request);
    // if the "source" query parameter was validated/sanitized in service(),
    // splice the sanitized value back in so the (possibly clamped/modified)
    // version is what actually gets forwarded to Elasticsearch
    String sanitizedSource = (String) request.getAttribute(SANITIZED_SOURCE_ATTR);
    if (uri != null && sanitizedSource != null) {
      uri = replaceQueryParam(uri, "source", sanitizedSource);
    }
    // sanitizeObject() only forces a safety "timeout" into the JSON body, so a
    // GET _search with no body and no "source" (nothing for it to sanitize)
    // would otherwise run with no time limit at all. "timeout" is also a valid
    // _search query-string parameter, so enforce the same default here too -
    // unconditionally overwriting any client-supplied value, same as the body
    // path - regardless of request method or whether a body was present.
    if (uri != null && isSearchPath(request)) {
      uri = replaceQueryParam(uri, "timeout", QUERY_TIMEOUT);
    }
    LOGGER.debug("ProxyTo: "+uri);
    return uri;
  }

  /** True for /_search paths (but not /_search/scroll), matching the isSearch check in sanitizeBody(). */
  private boolean isSearchPath(HttpServletRequest request) {
    String path = request.getRequestURI();
    return path != null && path.contains("_search") && !path.contains("_search/scroll");
  }

  /** Replaces (or appends) a query-string parameter in an already-built target URL. */
  private String replaceQueryParam(String uri, String paramName, String newRawValue) {
    try {
      int qIdx = uri.indexOf('?');
      String base = qIdx >= 0 ? uri.substring(0, qIdx) : uri;
      String query = qIdx >= 0 ? uri.substring(qIdx + 1) : "";
      String encodedValue = URLEncoder.encode(newRawValue, StandardCharsets.UTF_8);
      StringBuilder sb = new StringBuilder();
      boolean replaced = false;
      if (!query.isEmpty()) {
        for (String pair : query.split("&")) {
          int eq = pair.indexOf('=');
          String key = eq >= 0 ? pair.substring(0, eq) : pair;
          if (sb.length() > 0) sb.append('&');
          if (key.equalsIgnoreCase(paramName)) {
            sb.append(paramName).append('=').append(encodedValue);
            replaced = true;
          } else {
            sb.append(pair);
          }
        }
      }
      if (!replaced) {
        if (sb.length() > 0) sb.append('&');
        sb.append(paramName).append('=').append(encodedValue);
      }
      return base + "?" + sb;
    } catch (Exception e) {
      LOGGER.error("Error rewriting \"" + paramName + "\" query parameter", e);
      return uri;
    }
  }
  

  	@Override
    protected void sendProxyRequest(HttpServletRequest clientRequest, HttpServletResponse proxyResponse, Request proxyRequest) {
  		//Below code customizes headers sent to Elasticsearch. Default ones are not working with AWS ALB used in case of AWS opensearch serverless.
		// Remove problematic headers
		proxyRequest.headers(headers -> headers.remove("Forwarded")); // AWS ALB doesn't like this
		proxyRequest.headers(headers -> headers.remove("Via")); // We'll add a proper one later 
		// Client cookies (session cookies, etc.) must never be forwarded to Elasticsearch -
		// they are not needed by ES and could leak sensitive session identifiers to the
		// search cluster (and to AWS ALB in the serverless case).
		proxyRequest.headers(headers -> headers.remove(HttpHeader.COOKIE));

		// Remove duplicate Content-Type and Content-Length and add only one
		if (proxyRequest.getHeaders().contains(HttpHeader.CONTENT_TYPE))  {
			String contentType = proxyRequest.getHeaders().get("Content-Type");
			proxyRequest.headers(headers -> headers.remove("Content-Type"));
			proxyRequest.headers(headers -> headers.put(HttpHeader.CONTENT_TYPE, contentType));
		}
		if (proxyRequest.getHeaders().contains(HttpHeader.CONTENT_LENGTH)) {
			String contentLength = proxyRequest.getHeaders().get("Content-Length");
			proxyRequest.headers(headers -> headers.remove("Content-Length"));
			proxyRequest.headers(headers -> headers.put(HttpHeader.CONTENT_LENGTH, contentLength));
		}

		// add proper Via header
		String host = clientRequest.getHeader("Host");

		proxyRequest.headers(headers -> headers.put("Via", "http/1.1 " + clientRequest.getServerName()));
		proxyRequest.headers(headers -> headers.put("X-Forwarded-For", clientRequest.getRemoteAddr()));
		proxyRequest.headers(headers -> headers.put("X-Forwarded-Proto", clientRequest.getScheme()));

		if (host != null) {
			proxyRequest.headers(headers -> headers.put("X-Forwarded-Host", host));
		}
		// Log final request for debugging
//		System.out.println("Final Proxy Request:");
//		System.out.println("Method: " + proxyRequest.getMethod());
//		System.out.println("URI: " + proxyRequest.getURI());
//		proxyRequest.getHeaders().forEach(field -> System.out.println(field.getName() + ": " + field.getValue()));

		super.sendProxyRequest(clientRequest, proxyResponse, proxyRequest);
    }

  
}