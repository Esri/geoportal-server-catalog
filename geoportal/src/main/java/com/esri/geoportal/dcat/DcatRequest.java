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
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.util.Map;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * DCAT build request.
 * 
 * Represents an abstract request used to build a DCAT cache.
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
  
  private final DcatContext dcatContext;
  private final String selfInfo;
  private final ScriptEngine engine;
  private long dataCounter;

  /**
   * Creates instance of the request.
   * @param dcatContext context
   * @param selfInfo self info
   * @param engine engine
   */
  public DcatRequest(DcatContext dcatContext, String selfInfo, ScriptEngine engine) {
    this.dcatContext = dcatContext;
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
      if (data==null || !data.isObject())
        throw new IOException(String.format("Response is not valid DCAT response."));
      processData(data);
    } catch(Exception ex) {
      onEnd(false, ex);
    }
  }
  
  /**
   * Executes request.
   * @throws NullPointerException
   */
  public void execute() {
    try {
      search(null);
    } catch (Exception ex) {
      onEnd(false, ex);
    }
  }
  
  /**
   * Callback for a single records.
   * @param header response header
   * @param rec record
   * @throws java.io.IOException if writing record fails
   */
  public abstract void onRec(DcatHeader header, String rec) throws IOException;
  
  /**
   * Callback for an end of processing.
   * @param complete to complete DCAT file
   * @param exception if exception occurred
   */
  public abstract void onEnd(boolean complete, Exception exception);
  
  private void search(String searchAfter) {
    try {
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
      
      Invocable invocable = (Invocable)engine;
      invocable.invokeFunction("execute",this,sRequestInfo,selfInfo);
    } catch (Exception ex) {
      completeExecution(false, ex);
    }
  }
  
  private void processData(JsonNode data) {
    try {
      String lastIdentifier = null;

      DcatHeaderExt header = MAPPER.convertValue(data, DcatHeaderExt.class);
      JsonNode dataset = data.get("dataset");

      if (dataset==null || !dataset.isArray() || dataset.size()==0) {
        onEnd(true, null);
        return;
      }

      for (JsonNode rec: dataset) {
        if (!dcatContext.isRunning()) {
          break;
        }
        JsonNode identifier = rec.get("identifier");
        if (identifier!=null && identifier.isTextual()) {
          lastIdentifier = identifier.asText();
        }

        String sRec = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(rec);
        onRec(header, sRec);
      }
      
      dataCounter += dataset.size();
      if (dataCounter % Math.round(Math.pow(10,Math.floor(Math.log10(dataCounter)))) == 0)
        LOGGER.info(String.format("Processed total of %d DCAT records", dataCounter));
      
      if (lastIdentifier!=null && dcatContext.isRunning()) {
        search(lastIdentifier);
      } else {
        completeExecution(dcatContext.isRunning(), null);
      }
    } catch (Exception ex) {
      completeExecution(false, ex);
    }
  }
  
  private void completeExecution(boolean complete, Exception exception) {
    synchronized(dcatContext) {
      dcatContext.notifyAll();
    }
    onEnd(complete, exception);
  }
  
  private static class DcatHeaderExt extends DcatHeader {

    public Integer start;
    public Integer num;
    public Integer total;
    public Integer nextStart;

  }
  
}
