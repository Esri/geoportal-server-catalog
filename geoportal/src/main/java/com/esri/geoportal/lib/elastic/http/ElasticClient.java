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
package com.esri.geoportal.lib.elastic.http;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import org.apache.commons.lang3.StringUtils;

/**
 * An HTTP client for Elasticsearch.
 */
public class ElasticClient {
  
  /** Instance variables. */
  private String baseUrl;
  private String basicCredentials;
  
  /**
   * Create a new client.
   * @return the client
   */
  public static ElasticClient newClient() {
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    return new ElasticClient(ec.getBaseUrl(true),ec.getBasicCredentials());
  }
  
  /**
   * Constructor.
   * @param baseUrl the Elasticsearch base URL
   * @param basicCredentials basic credentials
   */
  public ElasticClient(String baseUrl, String basicCredentials) {
    this.baseUrl = baseUrl;
    this.basicCredentials = basicCredentials;
  }
  
  /**
   * URL encode a value.
   * @param value the value
   * @return the encoded value
   * @throws UnsupportedEncodingException
   */
  public String encode(String value) throws UnsupportedEncodingException {
    return URLEncoder.encode(value,"UTF-8");
  }
 
  /**
   * Get the Elasticsearch base URL
   * @return base URL
   */
  public String getBaseUrl() {
    return baseUrl;
  }
  
  /**
   * Get a bulk update URL.
   * @param indexName the index name
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getBulkUrl(String indexName) throws UnsupportedEncodingException {
    return baseUrl + "/" + URLEncoder.encode(indexName,"UTF-8") + "/_bulk";
  }
  
  /**
   * Get an index URL.
   * @param indexName the index name
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getIndexUrl(String indexName) throws UnsupportedEncodingException {
    return baseUrl + "/" + encode(indexName);
  }

  /**
   * Get an item URL.
   * @param indexName the index name
   * @param typeName the type name
   * @param id the item id
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getItemUrl(String indexName, String typeName, String id) throws UnsupportedEncodingException {
    return this.getTypeUrl(indexName,typeName) + "/" + encode(id);
  }
  
  /**
   * Get the scroll URL.
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getScrollUrl() {
    return baseUrl + "/_search/scroll";
  }
  
  /**
   * Get a type URL.
   * @param indexName the index name
   * @param typeName the type name
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getTypeUrl(String indexName, String typeName) throws UnsupportedEncodingException {
    typeName = StringUtils.trimToNull(typeName);
    return baseUrl + "/" + encode(indexName) + (typeName!=null? "/" + encode(typeName): "");
  }
  
  /**
   * Get an XML URL.
   * @param indexName the index name
   * @param typeName the type name
   * @param id the item id
   * @return the URL
   * @throws UnsupportedEncodingException
   */
  public String getXmlUrl(String indexName, String typeName, String id) throws UnsupportedEncodingException {
    if (!id.endsWith("_xml")) id += "_xml";
    return this.getTypeUrl(indexName,typeName) + "/" + encode(id);
  }
  
  /**
   * Send a request.
   * @param method the HTTP method
   * @param url the URL
   * @param data the entity data
   * @param dataContentType data the entity data content type
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String send(String method, String url, String data, String dataContentType) throws Exception {
    String result = null;
    BufferedReader br = null;
    DataOutputStream wr = null;
    StringWriter sw = new StringWriter();
    HttpURLConnection con = null;
    String charset = "UTF-8";
    try {
      URL u = new java.net.URL(url);
      HttpURLConnection.setFollowRedirects(true);
      con = (HttpURLConnection)u.openConnection();
      con.setRequestMethod(method);
      con.setInstanceFollowRedirects(true);
      if (basicCredentials != null && basicCredentials.length() > 0) {
        con.setRequestProperty( "Authorization",basicCredentials);
      }
      
      if (data != null && data.length() > 0) {
        //System.err.println("sendData="+data);
        con.setDoOutput(true);
        byte[] bytes = data.getBytes("UTF-8");
        if (dataContentType != null && dataContentType.length() > 0) {
          con.setRequestProperty( "Content-Type",dataContentType);
        }
        con.setRequestProperty("charset","UTF-8");
        con.setRequestProperty("Content-Length",""+bytes.length);
        wr = new DataOutputStream(con.getOutputStream());
        wr.write(bytes);
      }
      String contentType = con.getContentType();
      if (contentType != null) {
        String[] a = contentType.split(";");
        for (String v: a) {
          v = v.trim();
          if (v.toLowerCase().startsWith("charset=")) {
            String cs = v.substring("charset=".length()).trim();
            if (cs.length() > 0) {
              charset = cs;
              break;
            }
          }
        }        
      }
      br = new BufferedReader(new InputStreamReader(con.getInputStream(),charset));
      int nRead = 0;
      char[] buffer = new char[4096];
      while ((nRead = br.read(buffer,0,4096)) >= 0) {
        sw.write(buffer,0,nRead);
      }
      result = sw.toString();
//    } catch(IOException ex) {
//      try {
//        if (con != null && br == null) {
//          int code = con.getResponseCode();
//          System.err.println("code="+code);
//          br = new BufferedReader(new InputStreamReader(con.getInputStream(),charset));
//          int nRead = 0;
//          char[] buffer = new char[4096];
//          while ((nRead = br.read(buffer,0,4096)) >= 0) {
//            sw.write(buffer,0,nRead);
//          }
//          System.err.println("error="+sw.toString());
//        }
//      } catch (Exception ex1) {
//        ex1.printStackTrace();
//      }
//      throw ex;
    } finally {
      try {if (wr != null) wr.close();} catch(Exception ef) {ef.printStackTrace();}
      try {if (br != null) br.close();} catch(Exception ef) {ef.printStackTrace();}
    }
    //System.err.println("result:\r\n"+result);
    return result;
  }
  
  /**
   * Send a DELETE request.
   * @param url the URL
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendDelete(String url) throws Exception {
    return send("DELETE",url,null,null);
  }
  
  /**
   * Send a HEAD request.
   * @param url the URL
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendHead(String url) throws Exception {
    return send("HEAD",url,null,null);
  }

  /**
   * Send a GET request.
   * @param url the URL
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendGet(String url) throws Exception {
    return send("GET",url,null,null);
  }

  /**
   * Send a POST request.
   * @param url the URL
   * @param data the entity data
   * @param dataContentType data the entity data content type
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendPost(String url, String data, String dataContentType) throws Exception {
    return send("POST",url,data,dataContentType);
  }
  
  /**
   * Send a PUT request.
   * @param url the URL
   * @param data the entity data
   * @param dataContentType data the entity data content type
   * @return the response
   * @throws Exception if an exception occurs
   */
  public String sendPut(String url, String data, String dataContentType) throws Exception {
    return send("PUT",url,data,dataContentType);
  }
  
}
