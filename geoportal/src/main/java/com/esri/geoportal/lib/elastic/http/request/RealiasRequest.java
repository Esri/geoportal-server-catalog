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
package com.esri.geoportal.lib.elastic.http.request;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.exception.UsageException;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.http.util.AccessUtil;

import java.io.FileNotFoundException;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Reset the index alias.
 */
public class RealiasRequest extends com.esri.geoportal.lib.elastic.request.RealiasRequest {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(RealiasRequest.class);
  
  /** Instance variables. */
  private String indexName;
    
  /** Constructor. */
  public RealiasRequest() {
    super();
  }
  
  /** The index name. */
  public String getIndexName() {
    return indexName;
  }
  /** The index name. */
  public void setIndexName(String indexName) {
    this.indexName = indexName;
  }

  @Override
  public AppResponse execute() throws Exception {
    AppResponse response = new AppResponse();
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    AccessUtil au = new AccessUtil();
    au.ensureAdmin(getUser());
    
    String msgPfx = "Not applicable: ";
    String name = ec.getItemIndexName();
    String indexName = this.getIndexName();
    if (indexName == null || indexName.length() == 0) {
      throw new UsageException("An indexName is required.");
    } else if (indexName.equalsIgnoreCase(name)) {
      throw new UsageException("The indexName is the same as the configured indexName.");
    }
    /*
    if (indexName.indexOf("_v") == -1) {
      throw new UsageException("The indexName does not contain _v");
    }
    */
    if (!ec.getIndexNameIsAlias()) {
      throw new UsageException(msgPfx+"config parameter indexNameIsAlias is false");
    }
    if (name.indexOf("_v") != -1) {
      throw new UsageException(msgPfx+"config parameter indexName contains _v");
    }
    
    ElasticClient client = ElasticClient.newClient();
    JsonObjectBuilder request = Json.createObjectBuilder();
    JsonArrayBuilder actions = Json.createArrayBuilder();
    boolean alreadyAliased = false, foundAlias = false;
    
    try {
      client.sendHead(client.getIndexUrl(indexName));
    } catch (FileNotFoundException e) {
      throw new UsageException("The indexName does not exist");
    }
    
    String url = client.getBaseUrl()+"/_aliases";
    String result = client.sendGet(url);
    if (result != null && result.length() > 0 && result.indexOf("{") == 0) {
      JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(result);
      if (!jso.isEmpty()) {
        for (String k: jso.keySet()) {
          if (k.equalsIgnoreCase(name)) {
            // TODO test this
            throw new UsageException("Active index: "+name+" exists but is not an alias");
          }
        }
        for (String k: jso.keySet()) {
          //System.err.println("key: "+k);
          JsonObject jsoIndex = jso.getJsonObject(k);
          if (jsoIndex != null && jsoIndex.containsKey("aliases")) {
            JsonObject jsoAliases = jsoIndex.getJsonObject("aliases");
            if (!jsoAliases.isEmpty()) {
              for (String k2: jsoAliases.keySet()) {
                if (k2.equalsIgnoreCase(indexName)) {
                  throw new UsageException("The indexName is an alias");
                }
                if (k2.equalsIgnoreCase(name)) {
                  foundAlias = true;
                  if (k.equalsIgnoreCase(indexName)) {
                    alreadyAliased = true;
                  } else {
                    // "remove" : { "index" : "test1", "alias" : "alias1" } }
                    actions.add(Json.createObjectBuilder().add(
                      "remove",Json.createObjectBuilder().add("index",k).add("alias",k2)
                    ));
                  }
                  break;
                }
              }              
            }
          }
          if (foundAlias) break;
        }        
      }
    }
 
    JsonObjectBuilder jb = Json.createObjectBuilder();
    if (alreadyAliased) {
      jb.add("status","alreadyAliased");
    } else {
      //LOGGER.info("Re-aliasing: "+name+" for index: "+indexName);
      // TODO req.addAlias(indexName,name).get();
      actions.add(Json.createObjectBuilder().add(
        "add",Json.createObjectBuilder().add("index",indexName).add("alias",name)
      ));
      request.add("actions",actions);
      String postData = request.build().toString();
      String contentType = "application/json;charset=utf-8";
      result = client.sendPost(url,postData,contentType);
      jb.add("status","completed");
    }
    response.writeOkJson(this,jb);
    return response;
  }
  
}
