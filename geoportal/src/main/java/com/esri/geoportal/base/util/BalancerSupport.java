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
package com.esri.geoportal.base.util;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;


/**
 * Supports forward proxy load balancing to a cluster of nodes.
 */
public class BalancerSupport {
  
  /** Instance vriables. */
  protected final AtomicLong balancerCount = new AtomicLong();
  private List<BalancerNode> balancerNodes = new ArrayList<>();
  private ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
  private static final Logger LOGGER = LoggerFactory.getLogger(BalancerSupport.class);

  /** The cluster of nodes. */ 
  public List<BalancerNode> getBalancerNodes() {
    return balancerNodes;
  }
  /** The cluster of nodes. */ 
  public void getBalancerNodes(List<BalancerNode> balancerNodes) {
    this.balancerNodes = balancerNodes;
  }
//  
//  /**
//   * Make a new HTTP client
//   * @return the client
//   */
//  public HttpClient newHttpClient() {
//    HttpClient client = new HttpClient();
//    // TODO HttpProxy??
//    //HttpProxy proxy = new HttpProxy("localhost",8888);
//    //ProxyConfiguration proxyConfig = client.getProxyConfiguration();
//    //proxyConfig.getProxies().add(proxy);
//    return client;
//  }
  
  /**
   * Rewrite the target url for a request.
   * @param request the request
   * @return the url
   */
  public String rewriteTarget(HttpServletRequest request) {   
    
    StringBuilder target= null;
    if(ec.getAwsOpenSearchType().equals("serverless"))
    {
    	//AWS opensearch serverless calls AWS ALB which calls AWS lambda function(python) to execute search request
    	target = new StringBuilder(ec.getAwsALBEndpoint());
    }
    else
    {
    	if (balancerNodes.size() == 0) return null;
        int index = (int)(balancerCount.getAndIncrement() % balancerNodes.size());
        BalancerNode node =  balancerNodes.get(index);
    	target = new StringBuilder(node.proxyTo);
    }
	String pathInfo = ec.addIndexName(request.getPathInfo());
    // Defense in depth: this class's caller (ElasticProxy) already validates the path
    // against an exact allow-list, but "." / ".." segments are rejected here too, so
    // that even if this method is ever reached directly, a path-traversal segment like
    // "/x/../_search" can't be forwarded as-is and later get silently resolved (by the
    // URI.normalize() call below) into a bare, all-indices "/_search".
    if (pathInfo != null) {
      for (String seg : pathInfo.split("/")) {
        if (seg.equals(".") || seg.equals("..")) {
          LOGGER.warn("Blocked Elasticsearch path (traversal segment): "+pathInfo);
          return null;
        }
      }
      target.append(pathInfo);
    }    
    String query = request.getQueryString();
    if (query != null) {
      StringBuilder qsb = new StringBuilder();
      String[] pairs = query.split("&");
      for (String kvp: pairs) {
        String[] p = kvp.split("=");
        if (p.length != 2) continue;
        if (p[0].equalsIgnoreCase("access_token")) continue;
        if (isScriptingParam(p[0],p[1]) || isBlockedParam(p[0])) {
          LOGGER.warn("Blocked Elasticsearch query parameter: "+p[0]);
          return null;
        }
        if (qsb.length() > 0) qsb.append("&");
        String v = p[1];
        //try {v = URLEncoder.encode(v,"UTF-8");}
        //catch (UnsupportedEncodingException e) {}
        //System.err.println("v="+v);
        qsb.append(p[0]).append("=").append(v);
      }
      if (qsb.length() > 0) query = qsb.toString();
      else query = null;
    }
    if (query != null) {
      target.append("?").append(query); // request.getQueryString() is not decoded 
    }
    try {
      String uri = URI.create(target.toString()).normalize().toString();
      return uri;
    } catch (Exception e) {
    	LOGGER.error(e.getMessage());
    }
    return null;
  }
  
  /** Parameters that are not allowed at all (scroll opens server side search contexts). */
  private static final Set<String> BLOCKED_PARAMS = Set.of("scroll","scroll_id","search_type","request_cache","preference","filter_path","track_scores","terminate_after");

  /** Determines if a query-string parameter name is blocked (compared URL-decoded). Undecodable names are blocked. */
  private boolean isBlockedParam(String name) {
    try {
      return BLOCKED_PARAMS.contains(URLDecoder.decode(name,"UTF-8").trim().toLowerCase());
    } catch (UnsupportedEncodingException | IllegalArgumentException e) {
      return true;
    }
  }

  /** Parameter names that only exist to carry scripts. */
  private static final Set<String> SCRIPT_PARAMS = Set.of(
      "script","script_fields","script_score","runtime_mappings","scripted_metric");

  /** JSON keys that introduce Elasticsearch scripting inside any parameter value (e.g. source=). */
  private static final Pattern SCRIPT_JSON_KEY = Pattern.compile(
      "\"(script|script_fields|script_score|runtime_mappings|scripted_metric)\"\\s*:",
      Pattern.CASE_INSENSITIVE);

  /**
   * Determines if a query-string parameter carries Elasticsearch scripting, either
   * as a dedicated parameter or as a script key inside a JSON value. The value is
   * decoded once, matching Elasticsearch's parameter decoding. Undecodable
   * values are rejected.
   */
  private boolean isScriptingParam(String name, String value) {
    try {
      String n = URLDecoder.decode(name,"UTF-8").toLowerCase();
      if (SCRIPT_PARAMS.contains(n)) return true;
      String v = URLDecoder.decode(value,"UTF-8");
      if (SCRIPT_JSON_KEY.matcher(v).find()) return true;
    } catch (UnsupportedEncodingException | IllegalArgumentException e) {
      return true;
    }
    return false;
  }

  /** A node that is part of the cluster to which requests are proxied. */
  public static class BalancerNode {
    
    /** The url for the node. */
    public String proxyTo;
    
    /**
     * Constructor.
     * @param proxyTo the url for the node.
     */
    public BalancerNode(String proxyTo) {
      this.proxyTo = proxyTo;
    }
  }

}
