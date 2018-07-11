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
import java.net.URLConnection;
import java.net.URLEncoder;

/**
 * An HTTP client for Elasticsearch.
 */
public class ElasticClient {
  
  private String baseUrl = "http://gptdb1.esri.com:9200";
  private String indexBaseUrl = "http://gptdb1.esri.com:9200/metadata";
  private String itemBaseUrl = "http://gptdb1.esri.com:9200/metadata/item";
  

  public String getBaseUrl() {
    return baseUrl;
  }
  
  public String getIndexBaseUrl() {
    return indexBaseUrl;
  }
  
  public String getScrollUrl() {
    return baseUrl + "/_search/scroll";
  }
  
  public String getTypeUrl(String indexName, String indexType) throws UnsupportedEncodingException {
    return baseUrl + "/" + URLEncoder.encode(indexName,"UTF-8")+ "/" + URLEncoder.encode(indexType,"UTF-8");
  }
  
  public String getItemBaseUrl() {
    return itemBaseUrl;
  }
  
  public String getItemUrl(String id) throws UnsupportedEncodingException {
    String url = itemBaseUrl +"/" + URLEncoder.encode(id,"UTF-8");
    return url;
  }
  
  public String getXmlUrl(String id) throws UnsupportedEncodingException {
    if (!id.endsWith("_xml")) id += "_xml";
    String url = indexBaseUrl + "/clob/" + URLEncoder.encode(id,"UTF-8"); // TODO
    return url;
  }
  
  public static ElasticClient newClient() {
    return new ElasticClient();
  }
  
  public String send(String method, String url, String data, String dataContentType) throws Exception {
    String result = null;
    BufferedReader br = null;
    DataOutputStream wr = null;
    StringWriter sw = new StringWriter();
    try {
      URL u = new java.net.URL(url);
      // HttpURLConnection.setFollowRedirects(true); // TODO?
      HttpURLConnection con = (HttpURLConnection)u.openConnection();
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
        con.setDoOutput(true);
        //con.setRequestMethod("POST"); // TODO
        byte[] postData = data.getBytes("UTF-8");
        if (dataContentType != null && dataContentType.length() > 0) {
          con.setRequestProperty( "Content-Type",dataContentType);
        }
        con.setRequestProperty("charset","UTF-8");
        con.setRequestProperty("Content-Length",""+postData.length);
        wr = new DataOutputStream(con.getOutputStream());
        wr.write(postData);
      }
      String charset = "UTF-8";
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
    } finally {
      try {if (wr != null) wr.close();} catch(Exception ef) {ef.printStackTrace();}
      try {if (br != null) br.close();} catch(Exception ef) {ef.printStackTrace();}
    }
    //System.out.println("result:\r\n"+result);
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
  
  public boolean useSeparateXmlItem() {
    return true; // TODO
  }
  
}
