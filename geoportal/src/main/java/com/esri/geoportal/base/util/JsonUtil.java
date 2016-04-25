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
package com.esri.geoportal.base.util;
import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.json.JsonString;
import javax.json.JsonStructure;
import javax.json.JsonValue;
import javax.json.JsonWriter;
import javax.json.JsonWriterFactory;
import javax.json.JsonValue.ValueType;
import javax.json.stream.JsonGenerator;

/**
 * JSON utilities.
 */
public class JsonUtil {

  /**
   * Adds an error to an object.
   * @param jso the parent
   * @param message the message
   */
  public static JsonObject addError(JsonObject jso, String message) {
    if (message == null) message = "";
    JsonObjectBuilder builder = newObjectBuilder(jso);
    //JsonObject error = Json.createObjectBuilder().add("message",escape(message)).build();
    JsonObject error = Json.createObjectBuilder().add("message",message).build();
    builder.add("error",error);
    return builder.build();
  }

  /**
   * Escape a string.
   * @param text the text
   * @return the escaped string
   */
  public static String escape(String text) {
    // TODO: is there a javax.json method to do this?
    if (text == null) return null;

    StringBuilder sb = new StringBuilder();
    for (int i=0;i<text.length();i++){
      char ch = text.charAt(i);
      switch(ch){
      case '"':
        sb.append("\\\"");
        break;
      case '\\':
        sb.append("\\\\");
        break;
      case '\b':
        sb.append("\\b");
        break;
      case '\f':
        sb.append("\\f");
        break;
      case '\n':
        sb.append("\\n");
        break;
      case '\r':
        sb.append("\\r");
        break;
      case '\t':
        sb.append("\\t");
        break;
        /*
      // TODO: is this required?
      case '/':
        sb.append("\\/");
        break;
         */
      default:
        if ((ch >= '\u0000') && (ch <= '\u001F')) {
          String s2 =Integer.toHexString(ch);
          sb.append("\\u");
          for(int k=0;k<4-s2.length();k++){
            sb.append('0');
          }
          sb.append(s2.toUpperCase());
        } else{
          sb.append(ch);
        }
      }
    }
    return sb.toString();
  }


  /**
   * Escape a string.
   * @param text the text
   * @param quote if true, quote the text
   * @return the escaped string
   */
  public static String escape(String text, boolean quote) {
    if (text == null) return null;
    if (quote) {
      return "\""+escape(text)+"\"";
    } else {
      return escape(text);
    }
  }
  
  /**
   * Gets a string value.
   * @param jso the json object
   * @param name the property name
   * @return the stgring value
   */
  public static String getString(JsonObject jso, String name) {
    if (jso != null && jso.containsKey(name) && !jso.isNull(name)) {
      JsonValue v = jso.get(name);
      if (v.getValueType().equals(ValueType.STRING)) {
        return jso.getString(name);
      } else if (v.getValueType().equals(ValueType.NUMBER)) {
        // TODO Convert to string?
      } 
    }
    return null;
  }

  /**
   * Creates a JSON string representing an error response.
   * @return the JSON string
   */
  public static String newErrorResponse(String message, boolean pretty) {
    return toJson(addError(newObject(),message),pretty);
  }

  /**
   * Creates a new object.
   * @return the object
   */
  public static JsonObject newObject() {
    return Json.createObjectBuilder().build();
  }

  /**
   * Creates a new object builder.
   * @param jso the object used to populate the builder
   * @return the builder
   */
  public static JsonObjectBuilder newObjectBuilder(JsonObject jso) {
    JsonObjectBuilder jb = Json.createObjectBuilder();
    if (jso != null) {
      for (Entry<String, JsonValue> entry: jso.entrySet()) {
        jb.add(entry.getKey(), entry.getValue());
      }
    }
    return jb;
  }
  
  /**
   * Creates a new object builder.
   * @param json the json string
   * @return the builder
   */
  public static JsonObjectBuilder newObjectBuilder(String json) {
    JsonObjectBuilder jb = Json.createObjectBuilder();
    if (json != null && json.length() > 0) {
      JsonStructure js = toJsonStructure(json);
      if (js != null && js.getValueType().equals(ValueType.OBJECT)) {
        jb = newObjectBuilder((JsonObject)js);
      }
    }
    return jb;
  }
  
  /**
   * Read a resource file.
   * @param path the resource file path
   * @return a JsonStructure
   * @throws IOException if and error occurs reading the file
   * @throws URISyntaxException if the determined URI syntax is invalid
   */
  public static JsonStructure readResourceFile(String path) 
      throws IOException, URISyntaxException {
    ResourcePath rp = new ResourcePath();
    URI uri = rp.makeUrl(path).toURI();
    String s = new String(Files.readAllBytes(Paths.get(uri)),"UTF-8");
    //System.err.println(path+":"+s);
    if (s != null) s = s.trim();
    if (s != null) return toJsonStructure(s);
    return null;
  }

  /**
   * Create a JSON string.
   * @param structure the structure JsonAoject or JsonArray
   * @return the JSON string
   */
  public static String toJson(JsonStructure structure) {
    return toJson(structure,false);
  }

  /**
   * Create a JSON string.
   * @param structure the structure JsonAoject or JsonArray
   * @param pretty for pretty print
   * @return the JSON string
   */
  public static String toJson(JsonStructure structure, boolean pretty) {
    JsonWriter writer  = null;
    StringWriter result = new StringWriter();
    try {
      Map<String, Object> props = new HashMap<String,Object>();
      if (pretty) props.put(JsonGenerator.PRETTY_PRINTING,true);
      JsonWriterFactory factory = Json.createWriterFactory(props);
      writer = factory.createWriter(result);
      writer.write(structure); 
    } finally {
      try {
        if (writer != null) writer.close();
      } catch (Throwable t) {
        t.printStackTrace(System.err);
      }
    }
    return result.toString().trim();
  }

  /**
   * Parse a JSON string.
   * @param json the string
   * @return the structure (JsonAoject or JsonArray)
   */
  public static JsonStructure toJsonStructure(String json) {
    JsonReader reader = Json.createReader(new StringReader(json));
    JsonStructure structure = reader.read(); 
    return structure;
  }
  
  /**
   * Convert a JsonArray to a String array.
   * @param jsa the JsonArray
   * @return the String array
   */
  public static String[] toStringArray(JsonArray jsa) {
    ArrayList<String> list = new ArrayList<String>();
    for (JsonValue v: jsa) {
      if ((v != null) && v.getValueType().equals(ValueType.STRING)) {
        list.add(((JsonString)v).getString());
      }
    }
    return list.toArray(new String[0]);
  }
  
}
