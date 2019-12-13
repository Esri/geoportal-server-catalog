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

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * DCAT builder
 */
public class DcatBuilder {
  /**
   * Logger
   */
  private static final Logger LOGGER = LoggerFactory.getLogger(DcatBuilder.class);
  
  /** The script engines. */
  private static Map<String,ScriptEngine> ENGINES = Collections.synchronizedMap(new HashMap<String,ScriptEngine>());
  
  /** Instance variables. */
  private String javascriptFile = "gs/context/nashorn/execute.js";
  private final DcatCache dcatCache;
  
  public DcatBuilder(DcatCache dcatCache) {
    this.dcatCache = dcatCache;
  }
  
  public void execute() {
    try {
      String sRequestInfo = "{ \"parameterMap\": { \"f\": \"json\", \"sortField\": \"id\", \"sortOrder\": \"asc\" } }";
      ScriptEngine engine = getCachedEngine(javascriptFile);
      Invocable invocable = (Invocable)engine;
      invocable.invokeFunction("execute",this,sRequestInfo,"");
    } catch(Exception ex) {
      LOGGER.error("Error building DCAT", ex);
    }
  }
  
  public void putResponse(int status, String mediaType, String entity, Map<String,String> headers) {
    LOGGER.info(String.format("Entity: %s", entity));
  }
  
  private ScriptEngine getCachedEngine(String javascriptFile) 
      throws URISyntaxException, IOException, ScriptException {
    ScriptEngine engine = null;
    synchronized(ENGINES) {
      engine = ENGINES.get(javascriptFile);
      if (engine == null) {
        URL url = Thread.currentThread().getContextClassLoader().getResource(javascriptFile);
        URI uri = url.toURI();
        String script = new String(Files.readAllBytes(Paths.get(uri)),"UTF-8");
        ScriptEngineManager engineManager = new ScriptEngineManager();
        engine = engineManager.getEngineByName("nashorn");
        engine.eval(script);
        ENGINES.put(javascriptFile,engine);
      }
    }
    return engine;
  }
  
}
