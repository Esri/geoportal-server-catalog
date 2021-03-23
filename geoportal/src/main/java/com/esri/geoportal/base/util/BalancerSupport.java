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
import java.util.concurrent.atomic.AtomicLong;
import javax.servlet.http.HttpServletRequest;


/**
 * Supports forward proxy load balancing to a cluster of nodes.
 */
public class BalancerSupport {
  
  /** Instance vriables. */
  protected final AtomicLong balancerCount = new AtomicLong();
  private List<BalancerNode> balancerNodes = new ArrayList<>();
  private boolean is7Plus;

  public boolean getIs7Plus() {
    return is7Plus;
  }

  public void setIs7Plus(boolean is7Plus) {
    this.is7Plus = is7Plus;
  }
  
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
    if (balancerNodes.size() == 0) return null;
    int index = (int)(balancerCount.getAndIncrement() % balancerNodes.size());
    BalancerNode node =  balancerNodes.get(index);
    StringBuilder target = new StringBuilder(node.proxyTo);
    String pathInfo = request.getPathInfo();
    if (pathInfo != null) {
      target.append(getIs7Plus()? pathInfo.replaceAll("/item", "/_doc"): pathInfo);
    }
    String query = request.getQueryString();
    if (query != null) {
      try {
        String lc = query.toLowerCase();
        String lcd = URLDecoder.decode(query,"UTF-8").toLowerCase();
        if (lc.contains("<script") && lc.contains("</script>")) return null;
        if (lcd.contains("<script") && lcd.contains("</script>")) return null;
      } catch (UnsupportedEncodingException e) {}
    }
    if (query != null) {
      StringBuilder qsb = new StringBuilder();
      String[] pairs = query.split("&");
      for (String kvp: pairs) {
        String[] p = kvp.split("=");
        if (p.length != 2) continue;
        if (p[0].equalsIgnoreCase("access_token")) continue;
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
      e.printStackTrace();
    }
    return null;
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
