
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
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.lib.elastic.http.ElasticClient;

import java.io.FileNotFoundException;
import java.math.BigDecimal;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Map.Entry;

import javax.annotation.PostConstruct;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonValue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Elasticsearch context (HTTP based, no Transport client.
 */
public class ElasticContextHttp extends ElasticContext {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(ElasticContextHttp.class);
  
  /** Instance variables . */
  private boolean wasStarted = false;
  
  /** Constructor */
  public ElasticContextHttp() {
    super();
    setUseSeparateXmlItem(false);
  }
  
  /**
   * Create an alias.
   * @param index the index name
   * @param alias the alias name
   * @throws Exception
   */
  protected void _createAlias(String index, String alias) throws Exception {
    //LOGGER.info("Creating alias: "+alias+" for index: "+index);
    ElasticClient client = new ElasticClient(getBaseUrl(false),getBasicCredentials());
    String url = client.getBaseUrl()+"/_aliases";
    JsonObjectBuilder request = Json.createObjectBuilder();
    JsonArrayBuilder actions = Json.createArrayBuilder();
    actions.add(Json.createObjectBuilder().add(
      "add",Json.createObjectBuilder().add("index",index).add("alias",alias)
    ));
    request.add("actions",actions);
    String postData = request.build().toString();
    String contentType = "application/json;charset=utf-8";
    
    @SuppressWarnings("unused")
    String result = client.sendPost(url,postData,contentType);
    //LOGGER.debug("_createAlias.result",result);
  }
  
  /**
   * Create an index.
   * @param name the index name
   * @throws Exception
   */
  protected void _createIndex(String name) throws Exception {
    //LOGGER.info("Creating index: "+name);
    ElasticClient client = new ElasticClient(getBaseUrl(false),getBasicCredentials());
    String url = client.getIndexUrl(name);
    String path = this.getActualMappingsFile();
    JsonObject jso = (JsonObject)JsonUtil.readResourceFile(path);
    String postData = JsonUtil.toJson(jso,false);
    String contentType = "application/json;charset=utf-8";
    
    if (!this.getUseSeparateXmlItem()) {
      JsonObjectBuilder jb = Json.createObjectBuilder();
      for (Entry<String, JsonValue> entry: jso.entrySet()) {
        String k = entry.getKey();
        if (k != null && k.equals("mappings")) {
          JsonObject jso2 = (JsonObject)entry.getValue();
          JsonObjectBuilder jb2 = Json.createObjectBuilder(); 
          for (Entry<String, JsonValue> entry2: jso2.entrySet()) {
            String k2 = entry2.getKey();
            if (!k2.equals("blob") && !k2.equals("clob")) {
              jb2.add(entry2.getKey(),entry2.getValue());
            }
          }
          jb.add("mappings",jb2.build());
        } else {
          jb.add(entry.getKey(),entry.getValue());
        }
      }
      postData = jb.build().toString();
    }

    @SuppressWarnings("unused")
    String result = client.sendPut(url,postData,contentType);
    //LOGGER.debug("_createIndex.result",result);    
  }
  
  /**
   * Ensure that an index exists.
   * @param name the index name
   * @param considerAsAlias consider creating an aliased index
   * @throws Exception if an exception occurs
   */
  public void ensureIndex(String name, boolean considerAsAlias) throws Exception {
    LOGGER.debug("Checking index: "+name);
    try {
      if (name == null || name.trim().length() == 0) return;
      String result, url;
      ElasticClient client = new ElasticClient(getBaseUrl(false),getBasicCredentials());
      
      result = client.sendGet(client.getBaseUrl());
      JsonObject esinfo = (JsonObject)JsonUtil.toJsonStructure(result);
      String version = esinfo.getJsonObject("version").getString("number");
      LOGGER.info("Elasticsearch version: "+version);
      for (int i=1;i<20;i++) {
        if (version.indexOf(i+".") == 0) {
          int primaryVersion = i;
          //System.out.println("primaryVersion="+primaryVersion);
          if (primaryVersion >= 6) this.setIs6Plus(true);
          if (primaryVersion >= 7) this.setIs7Plus(true);
          break;
        }
      }
      if (getIs6Plus() && this.getUseSeparateXmlItem()) {
        LOGGER.info("Elasticsearch is version "+version+", setting useSeparateXmlItem=false");
        setUseSeparateXmlItem(false);
      }
      
      boolean indexExists = false;
      try {
        client.sendHead(client.getIndexUrl(name));
        indexExists = true;
      } catch (FileNotFoundException e) {}
      
      
      if (indexExists) {
        boolean hasClobDocType = false;
        result = client.sendGet(client.getIndexUrl(name));
        if (result != null && result.length() > 0 && result.indexOf("{") == 0) {
          JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(result);
          for (Entry<String, JsonValue> entry: jso.entrySet()) {
            JsonObject jsoIndex = (JsonObject)entry.getValue();
            for (Entry<String, JsonValue> indexEntry: jsoIndex.entrySet()) {
              String indexK = indexEntry.getKey();
              if (indexK != null && indexK.equals("mappings")) {
                JsonObject jsoMappings = (JsonObject)indexEntry.getValue();
                for (Entry<String, JsonValue> mappingEntry: jsoMappings.entrySet()) {
                  String mappingK = mappingEntry.getKey();
                  if (mappingK != null && mappingK.equals("clob")) {
                    hasClobDocType = true;
                    break;
                  }
                }
              }
              if (hasClobDocType) break;
            }          
          }
        }
        if (hasClobDocType && !this.getUseSeparateXmlItem()) {
          LOGGER.info("Existing index has clob doc type, setting useSeparateXmlItem=true");
          setUseSeparateXmlItem(true);
        }
      }
      
      // return if the index exists
      if (indexExists) return;
      
      if (name.equals(this.getItemIndexName())) {
        considerAsAlias = this.getIndexNameIsAlias();
      }
      if (name.indexOf("_v") != -1) considerAsAlias = false;
      if (!considerAsAlias) {
        _createIndex(name);
      } else {
        
        String pfx = name+"_v";
        String idxName = null;
        int sfx = -1;
        
        url = client.getBaseUrl()+"/_aliases";
        result = client.sendGet(url);
        if (result != null && result.length() > 0 && result.indexOf("{") == 0) {
          JsonObject jso = (JsonObject)JsonUtil.toJsonStructure(result);
          if (!jso.isEmpty()) {
            for (String k: jso.keySet()) {
              if (k.startsWith(pfx)) {
                String s = k.substring(pfx.length());
                int i = Val.chkInt(s,-1);
                if (i > sfx) {
                  sfx = i;
                  idxName = k;
                }               
              }
            }
          }
        }
        
        if (idxName == null) {
          idxName = pfx+"1";
          _createIndex(idxName);
        }
        _createAlias(idxName,name);
      }
    } catch (Exception e) {
      LOGGER.error("Error executing ensureIndex()",e);
      throw e;
    }
  }
  
  /** Startup.
   */
  @PostConstruct
  @Override
  public void startup() {
    LOGGER.info("Starting up ElasticContextHttp...");
    String[] nodeNames = this.nodesToArray();
    if ((nodeNames == null) || (nodeNames.length == 0)) {
      LOGGER.warn("Configuration warning: Elasticsearch - no nodes defined.");
    } else if (wasStarted) {
      LOGGER.warn("Configuration warning: ElasticContextHttp has already been started.");
    } else {
      
      if (this.getAutoCreateIndex()) {
        String indexName = getItemIndexName();
        boolean indexNameIsAlias = getIndexNameIsAlias();
        try {
          ensureIndex(indexName,indexNameIsAlias);
        } catch (Exception e) {
          // keep trying - every 5 minutes
          long period = 1000 * 60 * 5;
          long delay = period;
          Timer timer = new Timer(true);
          timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
              try {
                ensureIndex(indexName,indexNameIsAlias);
                timer.cancel();
              } catch (Exception e2) {
                // logging is handled by ensureIndex
              }
            }      
          },delay,period);
        }
      }
      
    }
  }
  
}
