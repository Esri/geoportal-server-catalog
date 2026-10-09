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
package com.esri.geoportal.service.rest;

import java.io.InputStream;
import java.io.StringReader;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Handles /rest/app-config requests.
 * <p>
 * Serves the client-side (web app) configuration that used to be hard-coded in
 * app/context/app-config.js. Values are now maintained in
 * classpath:config/config.properties under the "appui." prefix, using dot-notation
 * keys, e.g. {@code appui.searchResults.numPerPage=10}. This resource converts the
 * flat properties (minus the "appui." prefix) into the equivalent nested JSON object
 * so that AppContext.js can merge it into AppContext.appConfig, keeping references
 * like AppContext.appConfig.searchResults.numPerPage working unchanged.
 */
@Path("/app-config")
public class AppConfigService {

  private static final String RESOURCE = "config/config.properties";
  private static final String PREFIX = "appui.";

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getAppConfig() {
    try {
      Properties props = loadProperties();
      Map<String,Object> tree = new LinkedHashMap<String,Object>();
      for (String key : props.stringPropertyNames()) {
        if (!key.startsWith(PREFIX)) continue;
        String strippedKey = key.substring(PREFIX.length());
        if (strippedKey.isEmpty()) continue;
        String[] parts = strippedKey.split("\\.");
        putNested(tree,parts,0,props.getProperty(key));
      }
      JsonObjectBuilder builder = Json.createObjectBuilder();
      writeTree(builder,tree);
      return Response.ok(builder.build().toString(),MediaType.APPLICATION_JSON).build();
    } catch (Throwable t) {
      String message = t.getMessage() != null ? t.getMessage() : t.toString();
      JsonObjectBuilder err = Json.createObjectBuilder().add("error",message);
      return Response.serverError().entity(err.build().toString()).type(MediaType.APPLICATION_JSON).build();
    }
  }

  /** Load config.properties from the classpath. */
  private Properties loadProperties() throws Exception {
    Properties props = new Properties();
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    if (cl == null) cl = AppConfigService.class.getClassLoader();
    try (InputStream is = cl.getResourceAsStream(RESOURCE)) {
      if (is == null) {
        throw new IllegalStateException("Resource not found on classpath: "+RESOURCE);
      }
      props.load(is);
    }
    return props;
  }

  /** Insert a dotted property key's value into the nested tree Map structure. */
  @SuppressWarnings("unchecked")
  private void putNested(Map<String,Object> tree, String[] parts, int idx, String value) {
    String part = parts[idx];
    if (idx == parts.length - 1) {
      tree.put(part,coerce(parts,value));
    } else {
      Object existing = tree.get(part);
      Map<String,Object> child;
      if (existing instanceof Map) {
        child = (Map<String,Object>) existing;
      } else {
        child = new LinkedHashMap<String,Object>();
        tree.put(part,child);
      }
      putNested(child,parts,idx+1,value);
    }
  }

  /** Convert a raw string property value into a typed value (Boolean/Long/Double/JsonValue/String). */
  private Object coerce(String[] parts, String value) {
    if (value == null) return "";
    String trimmed = value.trim();
    if (trimmed.isEmpty()) return "";

    // Inline JSON object/array, e.g. searchResults.defaultSort
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try (JsonReader reader = Json.createReader(new StringReader(trimmed))) {
        return reader.readValue();
      } catch (Exception ex) {
        // fall through, treat as plain string
      }
    }

    // searchMap.center is a comma-separated "lon,lat" pair -> JSON array of numbers
    String lastKey = parts[parts.length-1];
    if ("center".equals(lastKey) && trimmed.indexOf(',') >= 0) {
      JsonArrayBuilder arr = Json.createArrayBuilder();
      for (String piece : trimmed.split(",")) {
        addToArray(arr,piece.trim());
      }
      return arr.build();
    }

    if ("true".equalsIgnoreCase(trimmed) || "false".equalsIgnoreCase(trimmed)) {
      return Boolean.parseBoolean(trimmed);
    }
    Object num = tryParseNumber(trimmed);
    if (num != null) return num;
    return value;
  }

  private void addToArray(JsonArrayBuilder arr, String s) {
    Object num = tryParseNumber(s);
    if (num instanceof Long) {
      arr.add((Long) num);
    } else if (num instanceof Double) {
      arr.add((Double) num);
    } else {
      arr.add(s);
    }
  }

  private Object tryParseNumber(String s) {
    try {
      if (s.matches("-?\\d+")) return Long.valueOf(s);
      if (s.matches("-?\\d*\\.\\d+")) return Double.valueOf(s);
    } catch (NumberFormatException ignore) {
      // not a number
    }
    return null;
  }

  /** Recursively write the nested tree Map into a JsonObjectBuilder. */
  @SuppressWarnings("unchecked")
  private void writeTree(JsonObjectBuilder builder, Map<String,Object> tree) {
    for (Map.Entry<String,Object> entry : tree.entrySet()) {
      Object val = entry.getValue();
      if (val instanceof Map) {
        JsonObjectBuilder child = Json.createObjectBuilder();
        writeTree(child,(Map<String,Object>) val);
        builder.add(entry.getKey(),child);
      } else {
        addValue(builder,entry.getKey(),val);
      }
    }
  }

  private void addValue(JsonObjectBuilder builder, String key, Object val) {
    if (val instanceof JsonValue) {
      builder.add(key,(JsonValue) val);
    } else if (val instanceof Boolean) {
      builder.add(key,(Boolean) val);
    } else if (val instanceof Long) {
      builder.add(key,(Long) val);
    } else if (val instanceof Double) {
      builder.add(key,(Double) val);
    } else {
      builder.add(key,String.valueOf(val));
    }
  }

}
