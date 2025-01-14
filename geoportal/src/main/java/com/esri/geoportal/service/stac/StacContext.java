
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
package com.esri.geoportal.service.stac;

import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.search.StacHelper;
import java.util.List;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;


/**
 * STAC context.
 */
@Configuration
public class StacContext {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(StacContext.class);
  private static StacContext SINGLETON = null;
  private final GeoportalContext gc = GeoportalContext.getInstance();

  private List<String> validationRules;
  
  
  /**
   * Get the single instance.
   * @return the instance
   */
  public static StacContext getInstance() {
    return SINGLETON;
  }  
  
  /** Constructor */
  public StacContext() {
    String msg = "The StacContext instance has already been started.";
    if (SINGLETON != null) {
      throw new RuntimeException(msg);
    } else {
      synchronized (StacContext.class) {
        if (SINGLETON == null) {
          SINGLETON = this;
        } else {
          throw new RuntimeException(msg);
        }
      }
    }
  }

  /** Default access level. 
   * @return list of validation rules 
   */
  public List<String> getValidationRules() {
    return validationRules;
  }
  
  /** 
   * Sets validation rules
   * @param validationRules defined in app-context 
   */
  public void setValidationRules(List<String> validationRules) {
    this.validationRules = validationRules;
  }
  
  
  /* ========== Validation Rule functions here ========== */
  
  public JSONObject passesValidation(String validationRule, JSONObject item) throws Exception {
    boolean passes;
    String message;
    JSONObject response = new JSONObject();
    
    String collectionId = item.getAsString("collection");
    JSONObject properties = (JSONObject) item.get("properties");
    String[] ruleElements = validationRule.split("\\|");
    String ruleType = ruleElements[0];
    String key;
    
    switch (ruleType) {
      case "unique":
        key = ruleElements[1];
        String value = properties.getAsString(key);
        
        passes = !indexHasValue(collectionId, key, value);
        message = passes ? "OK!" : 
                "Field " + key + " with value '" + value + "' is not unique";
        break;
        
      case "intersects_collection":
        passes = itemIntersectsCollection(item, collectionId);
        
        message = passes ? "OK!" : 
                "Item geometry does not intersect geometry of collection " + collectionId;

        break;
        
      default:
        LOGGER.debug("Unsupported validation rule: " + validationRule);
        passes = false;
        message = "Unknown validation rule " + validationRule;
        
        break;
    }

    response.put("passes", passes);
    response.put("message", message);

    return response;
  }
  
    
  /** 
   * Sets validation rules
   * @param collectionId collection to check for uniqueness of field
   * @param key name of the field to check for uniqueness on 
   * @param value value to check for
   * @return true if and only if the index already has an item with this value for this field
   */
  public boolean indexHasValue(String collectionId, String key, String value) throws Exception {
    LOGGER.debug("Testing if the index has an entry with field " + key + " = indexHasValue(String collectionId, String key, String value)" + value);
    
    try {
      String searchResponse = StacHelper.getItemWithFieldValue(collectionId, key, value);

      JSONParser jsonParser = new JSONParser();
      JSONObject responseObject = (JSONObject) jsonParser.parse(searchResponse);
      JSONObject hits = (JSONObject) responseObject.get("hits");
      JSONObject total = (JSONObject) hits.get("total");
      Number hitCount = total.getAsNumber("value");
      return (hitCount.longValue() > 0);
      
    } catch (Exception ex) {
      LOGGER.error(StacContext.class.getName() + ": " + ex.getMessage());
      throw ex;
    }
  }
  
  
  public boolean itemIntersectsCollection(JSONObject item, String collectionId) {
    boolean intersects = false;
    GeometryServiceClient gsc = gc.getGeometryServiceClient();
    JSONObject properties = (JSONObject) item.get("properties");
    
    String[] geometryFields = {"geometry", "bbox", "envelope_geo", "shape_geo", "geometry_wkt"};

    // Loop over all geometry fields
    for (String thisGeometryField: geometryFields) {
      
      if (item.containsKey(thisGeometryField)) {
        
        // get the item geometry
        String geometry = gsc.getItemGeometry(item, thisGeometryField);

        if ((geometry != null) && (!geometry.isEmpty())) {
          // see if the geometry intersects the collection geometry
          // TODO
        }
        
      } else {
        
        // see if the field is in the item properties        
        if (properties.containsKey(thisGeometryField)) {
          // TODO
        }
      }
    }
    
    return intersects;
  }

  
}
