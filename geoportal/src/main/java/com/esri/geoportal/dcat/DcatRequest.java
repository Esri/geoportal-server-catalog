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
package com.esri.geoportal.dcat;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.util.Map;
import javax.json.JsonObjectBuilder;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * DCAT build request.
 */
public abstract class DcatRequest {
  /**
   * Logger
   */
  private static final Logger LOGGER = LoggerFactory.getLogger(DcatRequest.class);
  private static final int PAGE_SIZE = 100;
  
  /** JSON processing. */
  private static final ObjectMapper MAPPER = new ObjectMapper();
  static {
    MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
  }
  
  private final JsonObjectBuilder selfInfo;
  private final ScriptEngine engine;

  /**
   * Creates instance of the request.
   * @param selfInfo self info
   * @param engine engine
   */
  public DcatRequest(JsonObjectBuilder selfInfo, ScriptEngine engine) {
    this.selfInfo = selfInfo;
    this.engine = engine;
  }
  
  /**
   * Puts response.
   * @param status status
   * @param mediaType media type
   * @param entity entity
   * @param headers headers
   */
  public void putResponse(int status, String mediaType, String entity, Map<String,String> headers) {
    LOGGER.trace(String.format("Entity: %s", entity));
    try {
      JsonNode data = MAPPER.readTree(entity);
      processData(data);
    } catch(IOException ex) {
      LOGGER.error(String.format("Error parsing entity: %s", entity), ex);
    }
  }
  
  /**
   * Executes request.
   * @throws JsonProcessingException
   * @throws NoSuchMethodException
   * @throws NullPointerException
   * @throws ScriptException 
   */
  public void execute() throws JsonProcessingException, NoSuchMethodException, NullPointerException, ScriptException {
    search(null);
  }
  
  /**
   * Callback for a single records.
   * @param rec record
   */
  public abstract void onRec(String rec);
  
  /**
   * Callback for an end of processing.
   */
  public abstract void onEnd();
  
  private void search(String searchAfter) throws JsonProcessingException, NoSuchMethodException, NullPointerException, ScriptException {
    ObjectNode requestInfo = MAPPER.createObjectNode();
    ObjectNode parameterMap = MAPPER.createObjectNode();
    requestInfo.set("parameterMap", parameterMap);
    parameterMap.put("f", "dcat");
    parameterMap.put("size", Integer.toString(PAGE_SIZE));

    ArrayNode sortNode = MAPPER.createArrayNode();
    sortNode.add("_id:asc");
    parameterMap.set("sortBy", sortNode);

    if (searchAfter!=null) {
      parameterMap.put("search_after", searchAfter);
    }

    String sRequestInfo = MAPPER.writeValueAsString(requestInfo);
    String sSelfInfo = null;

    if (selfInfo != null) {
      sSelfInfo = selfInfo.build().toString();
    }

    Invocable invocable = (Invocable)engine;
    invocable.invokeFunction("execute",this,sRequestInfo,sSelfInfo);
  }
  
  private void processData(JsonNode data) {
    String lastIdentifier = null;
    
    if (data.isObject()) {
      JsonNode dataset = data.get("dataset");
      if (dataset!=null && dataset.isArray()) {
        for (JsonNode rec: dataset) {
          JsonNode identifier = rec.get("identifier");
          if (identifier!=null && identifier.isTextual()) {
            lastIdentifier = identifier.asText();
          }
          
          try {
            String sRec = MAPPER.writeValueAsString(rec);
            onRec(sRec);
          } catch(JsonProcessingException ex) {
            LOGGER.debug(String.format("Error writing node: %s", rec), ex);
          }
        }
      }
    }
    
    if (lastIdentifier!=null) {
      LOGGER.info(lastIdentifier);
      // TODO continue with next page
    } else {
      onEnd();
    }
  }
  
}
