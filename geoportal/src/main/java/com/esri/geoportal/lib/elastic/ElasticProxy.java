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
import com.esri.geoportal.base.util.BalancerSupport;
import com.esri.geoportal.base.util.BalancerSupport.BalancerNode;
import com.esri.geoportal.context.GeoportalContext;

import java.io.UnsupportedEncodingException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.client.api.Request;
import org.eclipse.jetty.proxy.BalancerServlet;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
  
  @Override
  protected void copyRequestHeaders(HttpServletRequest clientRequest, Request proxyRequest) {
    super.copyRequestHeaders(clientRequest, proxyRequest);
    if (this._authString != null) {
      proxyRequest.header("Authorization",this._authString);
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
      String user = ec.getXpackUsername();
      String pwd = ec.getXpackPassword();
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
  protected HttpClient newHttpClient() {
    if (this._useHttps) {
      SslContextFactory factory = new SslContextFactory();
      factory.setTrustAll(true);
      return new HttpClient(factory);
    }
    //return balancerSupport.newHttpClient();
    return new HttpClient();
  }
  
  @Override
  protected String rewriteTarget(HttpServletRequest request) {
    String uri = balancerSupport.rewriteTarget(request);
    LOGGER.debug("ProxyTo: "+uri);
    return uri;
  }
  
}
