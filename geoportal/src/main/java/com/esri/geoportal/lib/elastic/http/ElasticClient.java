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
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

/**
 * An HTTP client for Elasticsearch.
 */
public class ElasticClient {
  
  private String baseUrl = "http://gptdb1.esri.com:9200"; // TODO
  
  public String encode(String value) throws UnsupportedEncodingException {
    return URLEncoder.encode(value,"UTF-8");
  }

  public String getBaseUrl() {
    return baseUrl;
  }
  
  public String getBulkUrl(String indexName) throws UnsupportedEncodingException {
    return baseUrl + "/" + URLEncoder.encode(indexName,"UTF-8") + "/_bulk";
  }
  
  public String getItemUrl(String indexName, String typeName, String id) throws UnsupportedEncodingException {
    return this.getTypeUrl(indexName,typeName) + "/" + encode(id);
  }
  
  public String getScrollUrl() {
    return baseUrl + "/_search/scroll";
  }
  
  public String getTypeUrl(String indexName, String typeName) throws UnsupportedEncodingException {
    return baseUrl + "/" + encode(indexName)+ "/" + encode(typeName);
  }
  
  public String getXmlUrl(String indexName, String typeName, String id) throws UnsupportedEncodingException {
    if (!id.endsWith("_xml")) id += "_xml";
    return this.getTypeUrl(indexName,typeName) + "/" + encode(id);
  }
  
  public static ElasticClient newClient() {
    return new ElasticClient();
  }
  
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

      // TODO need to supply credentials
      
//      if (options && options.basicCredentials &&
//          typeof options.basicCredentials.username === "string" &&
//          options.basicCredentials.username.length > 0 &&
//          typeof options.basicCredentials.password === "string" &&
//          options.basicCredentials.password.length > 0) {
//        var cred = options.basicCredentials.username+":"+options.basicCredentials.password;
//        cred = new java.lang.String(java.util.Base64.getEncoder().encode(cred.getBytes("UTF-8")),"UTF-8");
//        con.setRequestProperty( "Authorization","Basic "+cred);
//      }

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
  
  public String sendDelete(String url) throws Exception {
    return send("DELETE",url,null,null);
  }
  
  public String sendGet(String url) throws Exception {
    return send("GET",url,null,null);
  }
  
  public String sendPost(String url, String data, String dataContentType) throws Exception {
    return send("POST",url,data,dataContentType);
  }
  
  public String sendPut(String url, String data, String dataContentType) throws Exception {
    return send("PUT",url,data,dataContentType);
  }
  
}
