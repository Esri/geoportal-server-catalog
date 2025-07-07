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
package com.esri.geoportal.lib.elastic.http.util;
import java.util.function.Consumer;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.search.StacHelper;

/**
 * Scroll through a collection of documents using PIT search
 */
public class PITSearchScroller extends BaseScroller{  
	private static final Logger LOGGER = LoggerFactory.getLogger(PITSearchScroller.class);
 
  /**
   * Pagination with PIT and search_after
   * @param callback the callback
   */
  public void scroll(Consumer<SearchHit> callback) throws Exception {
    
    String query = this.getQuery();
    String contentType = "application/json;charset=utf-8";
    ElasticClient client = ElasticClient.newClient();
    String url = client.getTypeUrlForSearch(getIndexName());
    url += "/_search";
    String result="";
    JsonObject response = null;
    String pitSearchUrl =url+"/point_in_time?keep_alive="+ getKeepAliveMillis() + "ms";
   
     JsonObjectBuilder request = Json.createObjectBuilder();
     String postData = null;
   
    result = client.sendPost(pitSearchUrl,postData,contentType);
//    //get pit id
    response = (JsonObject)JsonUtil.toJsonStructure(result);
    String pitId = response.getString("pit_id");
    
    //Send first request to retrieve data      
    request.add("size",this.getPageSize());
    JsonObjectBuilder sortObj = Json.createObjectBuilder();
    sortObj.add("_id", "asc");
    request.add("sort",sortObj);
    
    JsonObjectBuilder pitObj = Json.createObjectBuilder();
    pitObj.add("id", pitId);
    pitObj.add("keep_alive", getKeepAliveMillis() + "ms");
    request.add("pit",pitObj);
    
    //request.add("fields",Json.createArrayBuilder().add("title"));
    if (!getFetchSource()) request.add("stored_fields","_none");
    if (query != null && query.length() > 0) {
      JsonObject jsq = (JsonObject)JsonUtil.toJsonStructure(query);
      request.add("query",jsq);
    }      
    long count = 0,  max = getMaxDocs();  
    postData = request.build().toString();   
    result = client.sendPost(client.getBaseUrl()+"/_search",postData,contentType);
   
    response = (JsonObject)JsonUtil.toJsonStructure(result);    
    JsonObject hits = response.getJsonObject("hits");
    setTotalHits(hits.getInt("total",0));
    JsonArray sort =null;
    try {
      while (true) {
        if (response == null) break;
        JsonArray searchHits = response.getJsonObject("hits").getJsonArray("hits");        
        if (searchHits.size() == 0) break;
        for (int i=0;i<searchHits.size();i++) {
          count++;
          if (count > max) break;
          SearchHit searchHit = new SearchHit(searchHits.getJsonObject(i),processed.get());
          processed.incrementAndGet();
          if (callback != null) callback.accept(searchHit);
          
          //Get the sort from last hit
          if(i==searchHits.size()-1)
          {
        	  sort = searchHits.getJsonObject(i).getJsonArray("sort");
          }          
        }
        if (count > max) break;
        request = Json.createObjectBuilder();
        response = null;
        if(sort.size()>0)
        {	
        	request.add("size",this.getPageSize());
        	sortObj = Json.createObjectBuilder();
            sortObj.add("_id", "asc");
            request.add("sort",sortObj);
            
            pitObj = Json.createObjectBuilder();
            pitObj.add("id", pitId);
            pitObj.add("keep_alive", getKeepAliveMillis() + "ms");
            request.add("pit",pitObj);
            
        	request.add("search_after",sort);
        	if (query != null && query.length() > 0) {
        	      JsonObject jsq = (JsonObject)JsonUtil.toJsonStructure(query);
        	      request.add("query",jsq);
        	 }    
        	result = client.sendPost(client.getBaseUrl()+"/_search",request.build().toString(),contentType);
            response = (JsonObject)JsonUtil.toJsonStructure(result);      
        } 
      }      
    } finally {
      try {
        if (pitId != null) {
          request = Json.createObjectBuilder();    
          request.add("pit_id",Json.createArrayBuilder().add(pitId));
          client.send("DELETE",client.getBaseUrl()+"/_search/point_in_time",request.build().toString(),contentType);
        }
      } catch (Throwable t) {
    	  LOGGER.error(t.getMessage());
      }
     
    }
    
  }

}
