
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
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import net.minidev.json.JSONArray;
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
  private final JSONParser jsonParser = new JSONParser();
  private final GeometryServiceClient gsc = gc.getGeometryServiceClient();

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
        String value;
        if (key.contains("properties.")) {
          value = properties.getAsString(key.replace("properties.", ""));
        } else {
          value = properties.getAsString(key);
        }
        
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
    boolean intersects = true;
    JSONObject properties = (JSONObject) item.get("properties");
    
    String[] geometryFields = {"geometry"};  // , "bbox", "envelope_geo", "shape_geo"};
    Set<String> geometryFieldSet = Set.of(geometryFields);
    Set<String> intersection = new HashSet<>(item.keySet());
    intersection.retainAll(geometryFieldSet);

    try {
      // Get collection geometry
      JSONObject collection = (JSONObject) StacHelper.getCollectionWithId(collectionId);
      JSONObject collectionObj = (JSONObject) jsonParser.parse(collection.toString()); // (JSONObject) collectionObj.get("extent");
      JSONObject collectionExtent = (JSONObject) collectionObj.get("extent");
      JSONObject collectionSpatial = (JSONObject) collectionExtent.get("spatial");
      JSONObject collectionGeometry = (JSONObject) collectionSpatial.get("geometry");
      JSONArray collectionCoordinates =(JSONArray) collectionGeometry.get("coordinates");

      JSONObject collectionGeometryAGS = new JSONObject();
      JSONObject collectionGeometryAGSRings = new JSONObject();
      collectionGeometryAGS.put("geometryType", "esriGeometryPolygon");
      collectionGeometryAGSRings.put("rings", collectionCoordinates);
      collectionGeometryAGS.put("geometry", collectionGeometryAGSRings);
      String collectionAGSGeometry = collectionGeometryAGS.toString();
      
      // Loop over all geometry fields
      for (String thisGeometryField: intersection) {

        if (item.containsKey(thisGeometryField)) {

          // get the item geometry
          String geometry = gsc.getItemGeometry(item, thisGeometryField);

          if ((geometry != null) && (!geometry.isEmpty())) {
            // see if the geometry intersects the collection geometry
            intersects = intersects && doesIntersect(geometry, collectionAGSGeometry);
          }
        }
      }

      // see if the item properties include the geomWKTField (see app-context.xml)
      if (properties.containsKey(gc.getGeomWKTField())) {
        JSONObject geometry_wkt_in = (JSONObject) properties.get(gc.getGeomWKTField());
        String[] geometryTypes = { "point", "linestring", "polygon", "polyhedral"};
        for (String geometryType: geometryTypes) {
          if (geometry_wkt_in.containsKey(geometryType)) {
            String arcgisGeometry = gsc.getArcGISGeometry(geometryType.toUpperCase(), geometry_wkt_in);
            if ((arcgisGeometry != null) && (!arcgisGeometry.isEmpty())) {
              // see if the geometry intersects the collection geometry
              intersects = intersects && doesIntersect(arcgisGeometry, collectionAGSGeometry);
            }
          }
        }
      }
    } catch (Exception ex) {
      java.util.logging.Logger.getLogger(StacContext.class.getName()).log(Level.SEVERE, null, ex);
    }   
    return intersects;
  }

  public boolean doesIntersect(String geometry, String collectionGeometry) {
    boolean intersects = false;
    
    try {
      // see if the geometry intersects the collection geometry
      String intersectResponse = gsc.doIntersect(geometry, collectionGeometry);
      JSONObject intersectResponseObj = (JSONObject) jsonParser.parse(intersectResponse);
      JSONArray intersectGeometries = (JSONArray) intersectResponseObj.get("geometries");
      JSONObject intersectPaths = (JSONObject) intersectGeometries.get(0);
      
      // if the paths is not an empty array, the two geometries intersect
      intersects = !intersectPaths.isEmpty();
      
    } catch (Exception ex) {
      LOGGER.error(StacContext.class.getName() + ": " + ex.getMessage());
      intersects = false;
      
    } finally {
      return intersects;
    }
  }
}
