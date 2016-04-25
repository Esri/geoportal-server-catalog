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
package com.esri.geoportal.lib.elastic.response;
import com.esri.geoportal.base.util.ScriptEngines;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.lib.elastic.request.GetItemRequest;
import com.esri.geoportal.lib.elastic.request.SearchRequest;

import java.io.IOException;
import java.net.URISyntaxException;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;

/**
 * Response item writer (JavaScript based).
 */
public class ScriptItemWriter extends ItemWriter {
  
  /** The script engines. */
  protected static ScriptEngines ENGINES = new ScriptEngines();

  /** Instance variables. */
  private String javascriptFile;

  /** Constructor. */
  public ScriptItemWriter() {
    super();
  }
  
  /** Get a cached script engine. */
  protected ScriptEngine getCachedEngine() throws URISyntaxException, IOException, ScriptException {
    return ENGINES.getCachedEngine(javascriptFile);
  }

  /** The Javascript file name. */
  public String getJavascriptFile() {
    return javascriptFile;
  }
  /** The Javascript file name. */
  public void setJavascriptFile(String javascriptFile) {
    this.javascriptFile = javascriptFile;
  }

  @Override
  public void write(GetItemRequest request, AppResponse response, GetResponse getResponse) 
      throws Exception {
    ScriptEngine engine = this.getCachedEngine();
    Invocable invocable = (Invocable)engine;
    String itemString = getResponse.getSourceAsString();
    String responseString = makeGetResponseString(request,getResponse);
    invocable.invokeFunction("writeItem",request,response,getResponse.getId(),itemString,responseString);
  }
  
  @Override
  public void write(SearchRequest request, AppResponse response, SearchResponse searchResponse) 
      throws Exception {
    SearchHits searchHits = searchResponse.getHits();
    ScriptEngine engine = this.getCachedEngine();
    Invocable invocable = (Invocable)engine;
    //System.err.println(request+" ,IsItemByIdRequest="+request.getIsItemByIdRequest());
    if (request.getIsItemByIdRequest() && searchHits.getTotalHits() == 1) {
      SearchHit hit = searchHits.getAt(0);
      String itemString = hit.getSourceAsString();
      String responseString = null;
      invocable.invokeFunction("writeItem",request,response,hit.getId(),itemString,responseString);
    } else {
      invocable.invokeFunction("writeItems",request,response,searchResponse);
    }
  }
  
}
