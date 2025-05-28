
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
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.search.StacHelper;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
  private final JSONParser jsonParser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
  private final GeometryServiceClient gsc = gc.getGeometryServiceClient();

  private List<String> validationRules;
  private Map<String, String> fieldMappings = new HashMap<>();

  private String statusFld = "gsdb:status";

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

  /** Gets validation rules 
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

  /** Gets field mappings
   * @return list of validation rules 
   */
  public Map<String, String> getFieldMappings() {
    return fieldMappings;
  }
  
  /** 
   * Sets validation rules
   * @param fieldMappings defined in app-context
   */
  public void setFieldMappings(List<String> fieldMappings) {
    Map<String, String> theMap = new HashMap();

    try {
      for (String field : fieldMappings) {
        String[] parts = field.split("=");
        String stacField = parts[0].trim();
        String indexField = parts[1].trim();
        theMap.put(stacField, indexField);
      }
      this.fieldMappings = theMap;
      
    } catch (Exception ex) {
      LOGGER.error(StacContext.class.getName() + ": " + ex.getMessage());
      throw ex;
    }    
  } 
  
	
	public String getStatusFld() {
		return statusFld;
	}

	public void setStatusFld(String statusFld) {
		this.statusFld = statusFld;
	}
  
  /* ========== Validation Rule functions here ========== */
  
  public JSONObject passesValidation(String validationRule, JSONObject item, String collectionId,boolean forUpdate) throws Exception {
    boolean passes;
    String message = "";
    JSONObject response = new JSONObject();    
    boolean ukFieldExists = false;
    JSONObject properties = (JSONObject) item.get("properties");
    String[] ruleElements = validationRule.split("\\|");
    String ruleType = ruleElements[0];
    String key;
    String itemId = item.getAsString("id");
    
    switch (ruleType) {    
      case "unique":
        key = ruleElements[1];
        String[] uniqueKeyFields = key.split(",");
        String value;  
        String searchQry="";
        String filterClause="";
        int cnt =1;
        for (String ukField: uniqueKeyFields) { 
        	
          if (ukField.contains("properties.")) {
            value = properties.getAsString(ukField.replace("properties.", ""));
          } else {
            value = properties.getAsString(ukField);
          }
          //Prepare filter clause fldName=fldValue AND fldName=fldValue ex:xom:source_key_id=testpolygon1 AND xom:source_system=testitem
          if(cnt ==1)
          {
        	  filterClause = ukField+"="+ value; 
          }
          else
          {
        	  filterClause = filterClause+" AND " + ukField+"="+ value;
          }
          cnt++;
          searchQry = StacHelper.prepareFilter(filterClause);
        }
          
        ukFieldExists = indexHasValue(collectionId, searchQry,forUpdate,itemId);
        passes = !ukFieldExists;
        message = passes ? "Unique key validation on (" + key + "): OK!" : "Unique key violation for: " + message;          
        
        break;
        
      case "intersects_collection":
        passes = itemIntersectsCollection(item, collectionId);
        
        message = passes ? "Geometry validation OK!" : "Item geometry does not intersect geometry of collection " + collectionId;

        break;
        
      case "geometry_source_matches":
        passes = true;       
        JSONObject existingItem = StacHelper.getSTACItemById(collectionId, itemId);
        
        if (existingItem == null) {
          // this is a new item
          passes = true;
          
        } else {          
          // this is an existing item, check the geometry source
          JSONObject existingGeometryWKT = (JSONObject) getProperty(existingItem, "gsdb:geometry_wkt");
          JSONObject newGeometryWKT = (JSONObject) getProperty(item, "gsdb:geometry_wkt");

          // loop over keys in newGeometryWKT
          //   if the key exists in existingGeometryWKT 
          //     if the new geometry source equals the existing geometry source
          //       the new geometry is allowed
          //     else
          //       the new geometry is NOT allowed, stop testing, rule failed
          //   else next, this new geometry is allowed
          if(existingGeometryWKT!=null && newGeometryWKT!=null)
          {
              for (String geometryType: newGeometryWKT.keySet())
              { 
                  if (existingGeometryWKT.containsKey(geometryType)) {
                    JSONObject existingGeometry = (JSONObject) existingGeometryWKT.get(geometryType);
                    JSONObject newGeometry = (JSONObject) newGeometryWKT.get(geometryType);

                    String existingGeometrySource = null;
                    String newGeometrySource = null;

                    if (newGeometry.containsKey("geometry_source")) {
                      newGeometrySource = newGeometry.getAsString("geometry_source");
                    }
                    if (newGeometry.containsKey("geometry_source")) {
                      existingGeometrySource = existingGeometry.getAsString("geometry_source");
                    }

                    if ((existingGeometrySource != null) && (newGeometrySource != null)) {
                      passes = passes && newGeometrySource.equalsIgnoreCase(existingGeometrySource);
                    }
                    
                    if (!passes) {
                      message = "Geometry source validation failed: submitted source: " + newGeometrySource + ", existing source: " + existingGeometrySource;
                      break;
                    }

                  } else {
                    passes = passes && true;
                  }

              } 
          }
        }

        message = passes ? "Geometry source validation: OK!" : message;          
        
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
   * Get geometry wkt object
   * @param theItem the STAC item for which to get the geometry WKT field
   * @param theProperty the STAC property to get
   */
  private JSONObject getProperty(JSONObject theItem, String theProperty) {
      JSONObject thePropertyValue = null;
      if (theItem != null) {
        if (theItem.containsKey("properties")) {
          JSONObject existingProperties = (JSONObject) theItem.get("properties");

          if (existingProperties.containsKey(theProperty)) {
            thePropertyValue = (JSONObject) existingProperties.get(theProperty);
          }
        }
      }
      
      return thePropertyValue;
  }
    
  /** 
   * Sets validation rules
   * @param collectionId collection to check for uniqueness of field
   * @param key name of the field to check for uniqueness on 
   * @param value value to check for
   * @param forUpdate if rqeuest is for item update
   * @param itemId 
   * @return true if and only if the index already has an item with this value for this field
   */
  private boolean indexHasValue(String collectionId, String filterQry,boolean forUpdate, String itemId) throws Exception {
    LOGGER.debug("Testing if the index has an entry with filter " + filterQry);
    String searchResponse = "";	
    boolean valueExists = false;
    try {
		ElasticClient client = ElasticClient.newClient();
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		String url = client.getTypeUrlForSearch(ec.getIndexName());
		url = url+"/_search";
    	if (filterQry.length() > 0)
    	{
    		String queryStr = "{\"query\":"+filterQry+"}";
    	    searchResponse = client.sendPost(url, queryStr, "application/json");    	    	
    	    	
	    	DocumentContext elasticResContext = JsonPath.parse(searchResponse);
			net.minidev.json.JSONArray items = elasticResContext.read("$.hits.hits");		
			
			if(items != null && items.size()>0)
			{
				if(!forUpdate)
					valueExists= true;
				else
				{//if it is update request, and unique key is for same item, it is not issue
					HashMap<String, JSONObject> itemMap =  (HashMap<String, JSONObject>) items.get(0);
					JSONObject item = new JSONObject(itemMap.get("_source"));
					String id = item.getAsString("id");
					if(!id.contentEquals(itemId))
					{
						valueExists= true;
					}
				}
			}
    	}    		
		return valueExists;
      
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
        String[] geometryTypes = { "point", "linestring", "multilinestring", "polygon", "polyhedral"};
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
      if(intersectResponse.indexOf("\"code\":400")>-1)
      {
    	  LOGGER.error("Intersct failed "+intersectResponse);
      }
      else
      {
    	  JSONObject intersectResponseObj = (JSONObject) jsonParser.parse(intersectResponse);
          JSONArray intersectGeometries = (JSONArray) intersectResponseObj.get("geometries");
          JSONObject intersectPaths = (JSONObject) intersectGeometries.get(0);
          if (intersectPaths.containsKey("rings")) {
            JSONArray intersectRings = (JSONArray) intersectPaths.get("rings");
            intersects = !intersectRings.isEmpty();    
          } else {
            // if the paths is not an empty array, the two geometries intersect
            intersects = !intersectPaths.isEmpty();        
          }      
      }
      
    } catch (Exception ex) {
      LOGGER.error(StacContext.class.getName() + ": " + ex.getMessage());
      intersects = false;
      
    } finally {
      return intersects;
    }
  }


}
