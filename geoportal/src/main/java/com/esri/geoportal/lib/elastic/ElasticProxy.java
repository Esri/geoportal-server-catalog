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
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

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
  private static final int MAX_BODY_BYTES = 10 * 1024 * 1024;
  private static final String QUERY_TIMEOUT = "7s";
  private static final String SANITIZED_ATTR = ElasticProxy.class.getName() + ".sanitizedBody";

  private static final Set<String> BLOCKED_KEYS = Set.of(
      "script", "script_score", "script_fields", "runtime_mappings", "scripted_metric");

  private static final Set<String> ALLOWED_AGG_TYPES = Set.of(
      "terms", "date_histogram", "nested", "geohash_grid", "filter", "filters");



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
    String method = request.getMethod();
    boolean hasBody = "POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method)
        || "PATCH".equalsIgnoreCase(method);
    if (hasBody) {
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
    super.service(request, response);
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
    if (isSearch) {
      body.put("timeout", QUERY_TIMEOUT);
    }
    JsonNode aggs = body.has("aggs") ? body.get("aggs") : body.get("aggregations");
    if (aggs != null) {
      validateAggs(aggs);
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

  /** Recursively validates the aggregations. */
  private void validateAggs(JsonNode aggs) throws AccessDeniedException {
    if (!aggs.isObject()) {
      throw new AccessDeniedException("Invalid aggregations");
    }
    Iterator<Map.Entry<String, JsonNode>> names = aggs.fields();
    while (names.hasNext()) {
      JsonNode def = names.next().getValue();
      if (!def.isObject()) {
        throw new AccessDeniedException("Invalid aggregation definition");
      }
      Iterator<String> keys = def.fieldNames();
      while (keys.hasNext()) {
        String aggType = keys.next();
        if ("aggs".equals(aggType) || "aggregations".equals(aggType)) {
          validateAggs(def.get(aggType));
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
        if (obj.has("size") && obj.get("size").asInt() > MAX_AGG_SIZE) {
          obj.put("size", MAX_AGG_SIZE);
        }
        if ("geohash_grid".equals(aggType) && obj.has("precision")
            && obj.get("precision").asInt() > MAX_GEOHASH_PRECISION) {
          obj.put("precision", MAX_GEOHASH_PRECISION);
        }
        break;
      default:
        break;
    }
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
      balancerSupport.setIs7Plus(ec.getIs7Plus());
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
    LOGGER.debug("ProxyTo: "+uri);
    return uri;
  }
  

  	@Override
    protected void sendProxyRequest(HttpServletRequest clientRequest, HttpServletResponse proxyResponse, Request proxyRequest) {
  		//Below code customizes headers sent to Elasticsearch. Default ones are not working with AWS ALB used in case of AWS opensearch serverless.
		// Remove problematic headers
		proxyRequest.headers(headers -> headers.remove("Forwarded")); // AWS ALB doesn't like this
		proxyRequest.headers(headers -> headers.remove("Via")); // We'll add a proper one later 

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