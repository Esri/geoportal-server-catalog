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

import java.io.UnsupportedEncodingException;

import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.client.Request;
import org.eclipse.jetty.ee10.proxy.BalancerServlet;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.util.ssl.SslContextFactory;
import org.eclipse.jetty.client.transport.HttpRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.base.util.BalancerSupport;
import com.esri.geoportal.base.util.BalancerSupport.BalancerNode;
import com.esri.geoportal.context.GeoportalContext;

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
		if (proxyRequest.headers(headers -> headers.contains("Content-Type")) != null) {
			String contentType = proxyRequest.getHeaders().get("Content-Type");
			proxyRequest.headers(headers -> headers.remove("Content-Type"));
			proxyRequest.headers(headers -> headers.put(HttpHeader.CONTENT_TYPE, contentType));
		}
		if (proxyRequest.headers(headers -> headers.contains("Content-Length")) != null) {
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