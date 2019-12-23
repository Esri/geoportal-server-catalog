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
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.search.SearchRequest;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;

import javax.json.JsonObject;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ReadListener;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A filter for proxy requests to Elasticsearch.
 */
public class ElasticProxyFilter implements Filter {
  
  /** Logger. */
  public static final Logger LOGGER = LoggerFactory.getLogger(ElasticProxyFilter.class);
  
  /** Constructor */
  public ElasticProxyFilter() {}
  
  @Override
  public void destroy() {
  }
  
  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    //System.err.println("ElasticProxyFilter.doFilter");
    HttpServletRequest hsr = (HttpServletRequest)request;
    GeoportalContext gc = GeoportalContext.getInstance();
    AppUser user = null;
    boolean checkAccess = false;
    
    if (gc.getSupportsApprovalStatus() || gc.getSupportsGroupBasedAccess()) {
      user = new AppUser(hsr,null);
      if (!user.isAdmin()) {
        String path = hsr.getPathInfo();
        String idxName = gc.getElasticContext().getIndexName();
        String itmType = gc.getElasticContext().getActualItemIndexType();
        // This will limit the ability to use other Elasticsearch indexes for non admin users
        // _search, _count URI queries (q=) are problematic
        if (path != null && (path.indexOf("_search") != -1 || path.indexOf("_count") != -1)) {
          if (path.indexOf("_search/scroll") == -1) {
            if (path.indexOf("/"+idxName+"/_search") != -1 || 
                path.indexOf("/"+idxName+"/_count") != -1 ||
                path.indexOf("/"+idxName+"/clob/_search") != -1 ||
                path.indexOf("/"+idxName+"/clob/_count") != -1 ||
                path.indexOf(",") != -1) {
              // Throw an exception here or rely on app-security.xml?
              throw new ServletException("This endpoint is not supported.");
            }
            if (path.indexOf("/"+idxName+"/"+itmType+"/_search") != -1 || 
                path.indexOf("/"+idxName+"/"+itmType+"/_count") != -1) {
              checkAccess = true;
              String qstr = hsr.getQueryString();
              if (qstr != null && qstr.length() > 0) {
                String lc = "?" + qstr.toLowerCase();
                if (lc.indexOf("?q=") != -1 || lc.indexOf("&q=") != -1) {
                  // Throw an exception here or rely on app-security.xml?
                  throw new ServletException("Parameter q is not supported, Post a {query: ...}");
                }
              }
            }
          }
        } else {
          // TODO check others?
          // Throw an exception here or rely on app-security.xml?
          throw new ServletException("This endpoint is not supported.");
        }
      }
    }
    if (checkAccess) {
      String content = null;
      String contentType = null;
      content = this.readCharacters(hsr);
      if (content != null  && content.length() == 0) content = null;
      //content = "{\"query\":{\"term\":{\"sys_owner_s\":\"publisher\"}}}"; 
      //contentType = "application/json";
      JsonObject jso = this.mergeAccessQuery(hsr,user,content);
      if (jso.getBoolean("wasModified")) {
        content = jso.getString("sBody"); 
        contentType = "application/json";
        LOGGER.debug("ElasticProxyFilter::modifiedQuery="+content);
      }
      hsr = new LocalRequestWrapper(hsr,content,contentType);
    }
    
    chain.doFilter(hsr,response);
  }

  @Override
  public void init(FilterConfig filterConfig) {}
  
  private JsonObject mergeAccessQuery(HttpServletRequest hsr, AppUser user, String body) 
      throws ServletException{
    SearchRequest sr = new SearchRequest(user);
    try {
      String json = sr.mergeAccessQuery(hsr,body);
      return (JsonObject)JsonUtil.toJsonStructure(json);
    } catch (Throwable e) {
      throw new ServletException(e);
    }
  }
  
  private String readCharacters(HttpServletRequest hsr) throws IOException {
    StringBuilder sb = new StringBuilder();
    BufferedReader br = null;
    InputStreamReader ir = null;
    InputStream st = null;
    try {
      char cbuf[] = new char[2048];
      int n = 0;
      int nLen = cbuf.length;
      st = hsr.getInputStream();
      if (st != null) {
        ir = new InputStreamReader(st,"UTF-8");
        br = new BufferedReader(ir);
        while ((n = br.read(cbuf,0,nLen)) >= 0) {
          sb.append(cbuf,0,n);
        }
      }
    } finally {
      try {if (br != null) br.close();} catch (Exception ef) {}
      try {if (ir != null) ir.close();} catch (Exception ef) {}
      try {if (st != null) st.close();} catch (Exception ef) {}
    }
    return sb.toString();
  }
  
  /**
   * Request wrapper.
   */
  private static class LocalRequestWrapper extends HttpServletRequestWrapper {

    protected String content;
    protected String contentType;

    public LocalRequestWrapper(HttpServletRequest request, 
        String content, String contentType) {
      super(request);
      this.content = content;
      this.contentType = contentType;
      //this.setCharacterEncoding(arg0); TODO?
    }

    @Override
    public int getContentLength() {
      if (content != null) {
        return content.length();
      } 
      return super.getContentLength();
    }

    @Override
    public String getContentType() {
      if (contentType != null) {
        return contentType;
      }
      return super.getContentType();
    }
    
    @Override
    public Enumeration<String> getHeaderNames() {
      if (contentType != null) {
        boolean hasContentType = false, hasContentLength = false, useht = false;
        Hashtable<String,String> ht = new Hashtable<String,String>();
        Enumeration<String> names = super.getHeaderNames();
        if (names != null) {
          while (names.hasMoreElements()) {
            String name = (String)names.nextElement();
            ht.put(name,name);
            if (name.equals("content-type")) {
              hasContentType = true;
            } else if (name.equals("content-length")) {
              hasContentLength = true;
            }
          }
          if (!hasContentType) {
            ht.put("content-type","content-type");
            useht = true;
          }
          if (!hasContentLength && content != null) {
            ht.put("content-length","content-length");
            useht = true;
          }
          if (useht) {
            return ht.keys();
          }
        }
      }
      return super.getHeaderNames();
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
      if (name.equals("content-length") && content != null) {
        List<String> list = new ArrayList<String>();
        list.add(""+content.length());
        return Collections.enumeration(list);
      }
      if (name.equals("content-type") && contentType != null) {
        List<String> list = new ArrayList<String>();
        list.add(contentType);
        return Collections.enumeration(list);
      }
      return super.getHeaders(name);
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
      if (content != null) {
        ByteArrayInputStream stream = new ByteArrayInputStream(content.getBytes());
        return new LocalInputStream(stream);
      }
      return super.getInputStream();
    }
    
    @Override
    public String getMethod() {
      if (content != null && content.length() > 0) {
        if (super.getMethod().equals("GET")) return "POST";
      }
      return super.getMethod();
    }
    
  }
  
  /**
   * Input stream.
   */
  private static class LocalInputStream extends ServletInputStream {
    
    private ByteArrayInputStream stream;
    
    public LocalInputStream(ByteArrayInputStream stream) {
      this.stream = stream;
    }

    @Override
    public boolean isFinished() {
      return stream.available() == 0;
    }

    @Override
    public boolean isReady() {
      return true;
    }

    @Override
    public void setReadListener(ReadListener arg0) {
      throw new RuntimeException("LocalInputStream::setReadListener - Not implemented");
    }

    @Override
    public int read() throws IOException {
      return stream.read();
    }
  }
   
}

