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
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * DCAT builder.
 * 
 * Provides uniform way for building aggregated DCAT file. It iterates through
 * all records in the Elastic page by page, then combines it into a single file.
 */
public class DcatBuilder {
  /**
   * Logger
   */
  private static final Logger LOGGER = LoggerFactory.getLogger(DcatBuilder.class);
  
  /** The script engines. */
  private static final Map<String,ScriptEngine> ENGINES = Collections.synchronizedMap(new HashMap<String,ScriptEngine>());
  
  /** JSON processing. */
  private static final ObjectMapper MAPPER = new ObjectMapper();
  static {
    MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
  }
  
  /** Instance variables. */
  private String javascriptFile = "gs/context/nashorn/execute.js";
  private final DcatCache dcatCache;
  
  /**
   * Creates instance of the builder.
   * @param dcatCache DCAT cache
   */
  public DcatBuilder(DcatCache dcatCache) {
    this.dcatCache = dcatCache;
  }
  
  /**
   * Builds DCAT aggregated file.
   * @param dcatContext context
   */
  public void build(DcatContext dcatContext) {
    try {
      LOGGER.info(String.format("Starting building aggregated DCAT file..."));
      execute(dcatContext, getSelfInfo(), getCachedEngine(javascriptFile));
    } catch(Exception ex) {
      LOGGER.error(String.format("Error building aggregated DCAT file!"), ex);
    }
  }
  
  private void execute(DcatContext dcatContext, String selfInfo, ScriptEngine engine) {
      DcatRequestImpl request = new DcatRequestImpl(dcatContext, selfInfo, engine);
      synchronized (request) {
        request.execute();
        try {
          request.wait();
        } catch(InterruptedException ignore) {
        }
      }
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
  
  private String getSelfInfo() {
    JsonObjectBuilder info = Json.createObjectBuilder();
    JsonObjectBuilder elastic = Json.createObjectBuilder();
    String node = null;
    String scheme = "http://";
    int port = 9200;
    try {
      node = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getNextNode();
      port = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getHttpPort();
      if (com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getUseHttps()) {
        scheme = "https://";
      }
      String username = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getXpackUsername();
      String password = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getXpackPassword();
      if (username != null && username.length() > 0 && password != null && password.length() > 0) {
        elastic.add("username",username);
        elastic.add("password",password);
      }
    } catch (Throwable t) {
      LOGGER.warn(String.format("Warning getting self info."), t);
    }
    try {
      JsonObjectBuilder access = Json.createObjectBuilder();
      access.add("supportsApprovalStatus",com.esri.geoportal.context.GeoportalContext.getInstance().getSupportsApprovalStatus());
      access.add("supportsGroupBasedAccess",com.esri.geoportal.context.GeoportalContext.getInstance().getSupportsGroupBasedAccess());    
      com.esri.geoportal.context.AppUser user = null;
      if (user != null && user.getUsername() != null) {
        access.add("username",user.getUsername());
        access.add("isAdmin",user.isAdmin());
        if (com.esri.geoportal.context.GeoportalContext.getInstance().getSupportsGroupBasedAccess()) {
          JsonArrayBuilder jsaGroups = Json.createArrayBuilder();
          List<com.esri.geoportal.base.security.Group> groups = user.getGroups();
          if (groups != null) {
            for (com.esri.geoportal.base.security.Group group: groups) {
              jsaGroups.add(group.id);
            }         
          }
          access.add("groups",jsaGroups);
        }
      }
      elastic.add("access",access);
    } catch (Throwable t) {
      LOGGER.warn(String.format("Warning getting self info."), t);
    }
    if ((node != null) && (node.length() > 0)) {
      String idxName = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getIndexName();
      String itmType = com.esri.geoportal.context.GeoportalContext.getInstance().getElasticContext().getItemIndexType();       
      String url = scheme+node+":"+port+"/"+idxName+"/"+itmType+"/_search";
      elastic.add("searchUrl",url);
      info.add("elastic",elastic);
      return info.build().toString();
    }
    return null;
  }
  
  private class DcatRequestImpl extends DcatRequest {
    private DcatCacheOutputStream outputStream = null;
    private PrintWriter writer = null;
    private boolean open;

    public DcatRequestImpl(DcatContext dcatContext, String selfInfo, ScriptEngine engine) {
      super(dcatContext, selfInfo, engine);
    }

    @Override
    public void onRec(DcatHeader header, String rec) throws IOException {
      if (!open) {
        prepareForWriting();
        
        writer.println("{");
        writer.println(String.format("\"conformsTo\": \"%s\",", header.conformsTo));
        writer.println(String.format("\"describedBy\": \"%s\",", header.describedBy));
        writer.println(String.format("\"context\": \"%s\",", header.context));
        writer.println(String.format("\"type\": \"%s\",", header.type));
        writer.println("\"dataset:\": [");
      }
      
      if (open) {
        writer.print(",");
      }
      
      writer.print(rec);
      
      if (!open) {
        open = true;
      }
    }

    @Override
    public void onEnd(boolean complete, Exception exception) {
      if (complete) {
        writer.println("]");
        writer.println("}");

        LOGGER.info(String.format("Completed building aggregated DCAT file :)"));
        close();
      } else {
        if (exception!=null) {
          LOGGER.error(String.format("Error building aggregated DCAT file!"), exception);
        }
        abort();
      }
      
      synchronized(this) {
        this.notifyAll();
      }
    }
    
    private void close() {
      writer.flush();
      if (outputStream!=null) {
        try {
          outputStream.close();
        } catch (IOException ignore) {}
      }
    }
    
    private void abort() {
      if (outputStream!=null) {
        try {
          outputStream.abort();
        } catch (IOException ignore) {}
      }
    }
    
    private void prepareForWriting() throws IOException {
      outputStream = dcatCache.createOutputCacheStream();
      writer = new PrintWriter(new OutputStreamWriter(outputStream, "UTF-8"));
    }
    
  }
}
