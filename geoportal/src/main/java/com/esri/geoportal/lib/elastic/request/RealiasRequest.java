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
package com.esri.geoportal.lib.elastic.request;
import com.carrotsearch.hppc.cursors.ObjectObjectCursor;
import com.esri.geoportal.base.util.exception.UsageException;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.util.AccessUtil;

import java.util.Iterator;
import java.util.List;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

import org.elasticsearch.action.admin.indices.alias.IndicesAliasesRequestBuilder;
import org.elasticsearch.client.AdminClient;
import org.elasticsearch.cluster.metadata.AliasMetaData;
import org.elasticsearch.common.collect.ImmutableOpenMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Reset the index alias.
 */
public class RealiasRequest extends AppRequest {
  
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

    AdminClient client = ec.getTransportClient().admin();
    if (!client.indices().prepareExists(indexName).get().isExists()) {
      throw new UsageException("The indexName does not exist");
    } else if (client.indices().prepareAliasesExist(indexName).get().isExists()) {
      throw new UsageException("The indexName is an alias");
    }
    
    IndicesAliasesRequestBuilder req = client.indices().prepareAliases();
    boolean alreadyAliased = false, foundAlias = false;
    if (client.indices().prepareAliasesExist(name).get().isExists()) {
      ImmutableOpenMap<String,List<AliasMetaData>> aliases;
      aliases = client.indices().prepareGetAliases(name).get().getAliases();
      Iterator<ObjectObjectCursor<String,List<AliasMetaData>>> iter = aliases.iterator();
      while (iter.hasNext()) {
        ObjectObjectCursor<String,List<AliasMetaData>> o = iter.next();
        for (AliasMetaData md: o.value) {
          String s = md.getAlias();
          if (s != null && s.equals(name)) {
            foundAlias = true;
            if (o.key.equals(indexName)) {
              alreadyAliased = true;
            } else {
              req.removeAlias(o.key,s);
            }
            break;
          }
        }
        if (foundAlias) break;
      }
    } else if (client.indices().prepareExists(name).get().isExists()) {
      throw new UsageException("Active index: "+name+" exists but is not an alias");
    }
 
    JsonObjectBuilder jb = Json.createObjectBuilder();
    if (alreadyAliased) {
      jb.add("status","alreadyAliased");
    } else {
      //LOGGER.info("Re-aliasing: "+name+" for index: "+indexName);
      req.addAlias(indexName,name).get();
      jb.add("status","completed");
    }
    response.writeOkJson(this,jb);
    return response;
  }
  
}
