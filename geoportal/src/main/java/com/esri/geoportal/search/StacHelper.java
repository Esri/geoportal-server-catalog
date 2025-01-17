package com.esri.geoportal.search;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;

import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.exception.InvalidParameterException;
import com.esri.geoportal.context.GeoportalContext;
import static com.esri.geoportal.context.GeoportalContext.LOGGER;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.service.stac.StacContext;
import com.esri.geoportal.service.stac.Asset;
import com.esri.geoportal.service.stac.Collection;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import java.util.logging.Level;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;
import net.minidev.json.parser.JSONParser;


public class StacHelper {
	
	
	/** Validates single STAC feature for required fields and duplicate id in collection
	 * @param requestPayload
	 * @param collectionId
	 * @param validateFields 
	 * @return
	 * @throws Exception
	 */
	public static StacItemValidationResponse validateStacItem(JSONObject requestPayload,
                String collectionId, boolean validateFields) throws Exception {
            
    StacItemValidationResponse response = new StacItemValidationResponse();
    //Validate https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md#item-fields
    if(validateFields) {
        response = validateFields(requestPayload);
    }		
    if(response.getCode() == null) {
        // issue 572 only validate id if autogenerating id is off
        GeoportalContext gc = GeoportalContext.getInstance();
        if (!gc.isCanStacAutogenerateId()) {
            response = validateId(requestPayload,collectionId);
            if(response.getCode() == null) {
                response.setCode(StacItemValidationResponse.ITEM_VALID);
            }
        } else {
            if(response.getCode() == null) {
                response.setCode(StacItemValidationResponse.ITEM_VALID);
            }                    
        }
    }
    return response;
	}


	public static String getItemWithItemId(String collectionId,String id) throws Exception {
		
		String response;		
		String query;
		
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		ElasticClient client = ElasticClient.newClient();
		String url = client.getTypeUrlForSearch(ec.getIndexName());
		Map<String, String> queryMap = new HashMap<>();

		queryMap.put("ids", id);
		url = url + "/_search";
		
		GeoportalContext gc = GeoportalContext.getInstance();
		if (gc.getSupportsCollections()) {
			queryMap.put("collections", collectionId);
		}
		query = prepareSearchQuery(queryMap, null);

		if (query.length() > 0)
			response = client.sendPost(url, query, "application/json");
		else
			response = client.sendGet(url);
		
		return response;
	}
  

  /** Get STAC items where a field matches a provided value
   * 
   * @param collectionId
   * @param fieldName - json path to a field, for example: properties.somepropertyname
   * @param fieldValue
   * @return
   * @throws Exception 
   */
	public static String getItemWithFieldValue(String collectionId,String fieldName, String fieldValue) throws Exception {
		
		String response;		
		String query;
		
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		ElasticClient client = ElasticClient.newClient();
		String url = client.getTypeUrlForSearch(ec.getIndexName());

		url = url + "/_search";
		
		query = "{\"query\": {\"query_string\": {\"query\": \"" + fieldValue + "\",\"fields\"  : [\"" + fieldName + "\"]}}}";

    response = client.sendPost(url, query, "application/json");
		
		return response;
	}
  
  
  /** Get a STAC item based on a provided collectionId and itemId
   * 
   * @param collectionId
   * @param itemId
   * @return
   * @throws Exception 
   */  
  public static JSONObject getSTACItemById(String collectionId,
          String itemId) throws Exception {
    
    JSONObject theSTACItem = null;
    JSONParser jsonParser = new JSONParser();

    String itemJSON = StacHelper.getItemWithItemId(collectionId, itemId);
    JSONObject gptItem = (JSONObject) jsonParser.parse(itemJSON);
    JSONObject hits = (JSONObject) gptItem.get("hits");
    JSONArray hitsArray = (JSONArray) hits.get("hits");
    
    if (!hitsArray.isEmpty()) {
      JSONObject theGPTItem = (JSONObject) hitsArray.get(0);
      theSTACItem = (JSONObject) theGPTItem.get("_source");
    }
    
    // {"hits":{"hits":[{"_source": {}}]}}
    return theSTACItem;
  }

  
	/** Returns Array of collections from elastic index 'çollections'
	 * @return
	 * @throws Exception
	 */
	public static JSONArray getCollectionList() throws Exception {
		ElasticClient client = ElasticClient.newClient();
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		
		String url = client.getTypeUrlForSearch(ec.getCollectionIndexName());
		url = url + "/_search";
		String query = "{\"track_total_hits\":true,\"sort\": {\"_id\": \"asc\"}}";
		
		String	response = client.sendPost(url, query, "application/json");	
		DocumentContext elasticResContext = JsonPath.parse(response);

		net.minidev.json.JSONArray collectionArr = elasticResContext.read("$.hits.hits");
		JSONArray resCollectionArr = new JSONArray();
		for(var i=0;i<collectionArr.size();i++)
		{
			HashMap elasticCollectionMap = (HashMap) collectionArr.get(i);
			resCollectionArr.add(elasticCollectionMap.get("_source"));			
		}
		return resCollectionArr;
	}

  
	/** Returns  ArrayList of collection id from elastic index 'çollections'
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public static ArrayList<String> getCollectionIDList() throws Exception {
		net.minidev.json.JSONArray collectionArr = getCollectionList();
		
		HashMap<String, Object> item = null;
		String collectionId = "";
		ArrayList<String> collectionList = new ArrayList<String>();
				
		if (collectionArr != null && collectionArr.size() > 0) 
		{
			for(int i=0;i<collectionArr.size();i++)
			{
				item = (HashMap<String, Object>) collectionArr.get(i);
				collectionId = (String) item.get("id");
				collectionList.add(collectionId);
			}
		}
		return collectionList;
	}


	public static String prepareSearchQuery(Map<String, String> queryMap, String searchAfter) {
		String queryStr = "";
		JsonArrayBuilder builder = Json.createArrayBuilder();

		if (queryMap.containsKey("bbox")) {
			String bboxQry = prepareBbox((String) queryMap.get("bbox"));
			if (bboxQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(bboxQry));

		}
		if (queryMap.containsKey("datetime")) {
			String dateTimeQry = prepareDateTime(queryMap.get("datetime"));
			if (dateTimeQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(dateTimeQry));
		}
		if (queryMap.containsKey("ids")) {
			String idsQry = prepareIds(queryMap.get("ids"));
			System.out.println("ids " + idsQry);

			if (idsQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(idsQry));
		}

		if (queryMap.containsKey("intersects")) {
			String intersectsQry = prepareIntersects(queryMap.get("intersects"));
			if (intersectsQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(intersectsQry));
		}

		if (queryMap.containsKey("collections")) {			
			String collectionQry = prepareCollection(queryMap.get("collections"));
			builder.add(JsonUtil.toJsonStructure(collectionQry));
		}

		JsonArray filter = builder.build();

		if (!filter.isEmpty()) {
			queryStr = "\"query\":{\"bool\": {\"must\":" + JsonUtil.toJson(filter) + "}}";
		}
		String searchAfterStr = "";
		if (searchAfter != null && searchAfter.length() > 0) {
			searchAfterStr = "\"search_after\":[\"" + searchAfter + "\"]";
		}

		String searchQuery = "{\"track_total_hits\":true,\"sort\": {\"_id\": \"asc\"}"
				+ (queryStr.length() > 0 ? "," + queryStr : "")
				+ (searchAfterStr.length() > 0 ? "," + searchAfterStr : "") + "}";
		return searchQuery;
	}


  // {"type": "GeometryCollection", "geometries": [{"type": "Point", "coordinates": [100.0, 0.0]}, 
  // {"type": "LineString", "coordinates": [[101.0, 0.0], [102.0, 1.0]]}]}
	private static String prepareIntersects(String geoJson) {
		String query = "";
		String field = "shape_geo";
		String spatialType = "geo_shape";
		String relation = "intersects";

		query = "{\"" + spatialType + "\": {\"" + field + "\": {\"shape\": " + geoJson + ",\"relation\": \"" + relation
				+ "\"}}}";
		return query;
	}


	private static String prepareIds(String ids) {
		String[] idList = ids.split(",");
		//{"bool":{"should":[{"match":{"_id":"1"}},{"match":{"_id":"2"}}]}}
		
		StringBuffer idQryBuf = new StringBuffer("{\"bool\":{\"should\":[");
		int i=0;
		for (String id : idList) {
			if(i ==0)
				idQryBuf.append("{\"match\": {\"_id\": \"" + id + "\"}}");	
			else
				idQryBuf.append(",{\"match\": {\"_id\": \"" + id + "\"}}");
			i++;
		}
		idQryBuf.append("]}}");
		return idQryBuf.toString();
		//return "{\"match\": {\"id\": \"" + ids + "\"}}";
	}


	private static String prepareDateTime(String datetime) {
		String query = "";
		String dateTimeFld = FieldNames.FIELD_SYS_MODIFIED;
		
		String dateTimeFldQuery = "";
		// Find from and to dates
		// https://api.stacspec.org/v1.0.0/ogcapi-features/#tag/Features/operation/getFeatures
		// Either a date-time or an interval, open or closed. Date and time expressions
		// adhere to RFC 3339. Open intervals are expressed using double-dots.
		// Examples:
		// A date-time: "2018-02-12T23:20:50Z"
		// A closed interval: "2018-02-12T00:00:00Z/2018-03-18T12:31:12Z"
		// Open intervals: "2018-02-12T00:00:00Z/.." or "../2018-03-18T12:31:12Z"

		String fromField = datetime;
		String toField = "";
		List<String> dateFlds = Arrays.asList(datetime.split("/"));

		if (dateFlds.size() > 1) {
			fromField = dateFlds.get(0);
			toField = dateFlds.get(1);
		}
		if (toField.equals("") || toField.equals("..")) {
			dateTimeFldQuery = "{\"gte\": \"" + fromField + "\"}";
		} else if (fromField.equals("..")) {
			dateTimeFldQuery = "{\"lte\":\"" + toField + "\"}";
		} else {
			dateTimeFldQuery = "{\"gte\": \"" + fromField + "\",\"lte\":\"" + toField + "\"}";
		}

		query = "{\"range\": {\"" + dateTimeFld + "\":" + dateTimeFldQuery + "}}";

		return query;
	}

	private static String prepareBbox(String bboxString) {
		String field = "envelope_geo";
		String spatialType = "geo_shape"; // geo_shape or geo_point
		String relation = "intersects";
		List<String> bbox = Arrays.asList(bboxString.split(",", -1));

		double coords[] = { -180.0, -90.0, 180.0, 90.0 };
		String query = "";
		// As per stac API validator, invalid bbox should respond with 400, instead of
		// replacing it with defaults
		if (bbox.size() == 4 || bbox.size() == 6) {
			coords[0] = Double.parseDouble(bbox.get(0));
			coords[1] = Double.parseDouble(bbox.get(1));
			coords[2] = Double.parseDouble(bbox.get(2));
			coords[3] = Double.parseDouble(bbox.get(3));
			String coordinates = "[[" + coords[0] + "," + coords[3] + "], [" + coords[2] + "," + coords[1] + "]]";
			if (bbox.size() == 6) {
				coords[4] = Double.parseDouble(bbox.get(4));
				coords[5] = Double.parseDouble(bbox.get(5));
			}

			query = "{\"" + spatialType + "\": {\"" + field + "\": {\"shape\": {\"type\": \"envelope\","
					+ "\"coordinates\":" + coordinates + "},\"relation\": \"" + relation + "\"}}}";
			return query;
		} else {
			throw new InvalidParameterException("bbox", "Invalid bbox");
		}
	}

	private static String prepareCollection(String collections) {
		String[] collectionList = collections.split(",");
		//{"bool":{"should":[{"match":{"src_collections_s":"metadata"}},{"match":{"src_collections_s":"north_america"}}]}}
		
		StringBuffer collectionQryBuf = new StringBuffer("{\"bool\":{\"should\":[");
		int i=0;
		for (String collectionId : collectionList) {
			if(i ==0)
				collectionQryBuf.append("{\"match\": {\"src_collections_s\": \"" + collectionId + "\"}}");	
			else
				collectionQryBuf.append(",{\"match\": {\"src_collections_s\": \"" + collectionId + "\"}}");
			i++;
		}
		collectionQryBuf.append("]}}");
		return collectionQryBuf.toString();
	}

	private static StacItemValidationResponse validateId(JSONObject requestPayload,String collectionId) throws Exception {
		String errorMsg;
		StacItemValidationResponse response = new StacItemValidationResponse();
		
		//Validate if id exists	
		String id =  requestPayload.get("id").toString();
		String itemRes = getItemWithItemId(collectionId, id);
		DocumentContext elasticResContext = JsonPath.parse(itemRes);

		net.minidev.json.JSONArray items = elasticResContext.read("$.hits.hits");
		if (items != null && !items.isEmpty()) {
			errorMsg = "stac item with id '"+id+"' already exists.";
			response.setCode(StacItemValidationResponse.ID_EXISTS);
			response.setMessage(errorMsg);
		}		
		return response;
	}

  
	// https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md
	private static StacItemValidationResponse validateFields(JSONObject requestPayload) {
		String errorMsg ="";
		StacItemValidationResponse response = new StacItemValidationResponse();
		
		if(!requestPayload.containsKey("stac_version")) {
			errorMsg = errorMsg+"stac_version is mandatory.";
		}
    
		if(!requestPayload.containsKey("id") || 
				(requestPayload.containsKey("id") 
        && requestPayload.get("id").toString().isBlank())) {
      
      GeoportalContext gc = GeoportalContext.getInstance();
      if (!"true".equals(gc.isCanStacAutogenerateId())) {
    		errorMsg = errorMsg+" id is mandatory and should not be empty.";
      }
		}
    
		//geometry and bbox is mandatory from stac spec but geoportal will allow combination of shape_geo and envelope_geo as well
		if(!requestPayload.containsKey("geometry") && !requestPayload.containsKey("shape_geo")) {
			errorMsg = errorMsg+" geometry or shape_geo is mandatory.";
		}
		
		if(requestPayload.containsKey("geometry")) {
			if(requestPayload.get("geometry") != null && (!requestPayload.containsKey("bbox")))
			errorMsg = errorMsg+" bbox is mandatory if geometry is not null.";
		}

    if(requestPayload.containsKey("shape_geo")) {
			if(requestPayload.get("shape_geo") != null && (!requestPayload.containsKey("envelope_geo")))
			errorMsg = errorMsg+" envelope_geo is mandatory if shape_geo is not null.";
		}
		
		if(!requestPayload.containsKey("properties")) {
			errorMsg = errorMsg+" properties is mandatory.";
		}
    
		if(requestPayload.containsKey("properties")) {
			JSONObject prop = (JSONObject) requestPayload.get("properties");

      if(!prop.containsKey("datetime")) {
				errorMsg = errorMsg+" datetime is mandatory.";

      } else if(prop.containsKey("datetime") && prop.get("datetime") == null) {
        
				if(!prop.containsKey("start_datetime") || !prop.containsKey("end_datetime")) {
					errorMsg = errorMsg+" start_datetime and end_datetime is mandatory if datetime is null.";
				}
			}
		}

		if(!requestPayload.containsKey("assets")) {
			errorMsg = errorMsg + " assets is mandatory.";
		}
    
  	StacContext sc = StacContext.getInstance();
    for (String validationRule : sc.getValidationRules()) {
      LOGGER.debug("Validation rule: " + validationRule);
      try {
        JSONObject validationResult = (JSONObject) sc.passesValidation(validationRule, requestPayload);
        if (!validationResult.getAsString("passes").equals("true")) {
          errorMsg = errorMsg + " Failed validation rule ";
          errorMsg = errorMsg + validationRule + ": ";
          errorMsg = errorMsg + validationResult.getAsString("message");
        }
      } catch (Exception ex) {
        errorMsg = errorMsg + Level.SEVERE + " - StacItemValidationResponse: " +  ex.getMessage();
      }
    }
    
		if(errorMsg.length()>0) {
			response.setCode(StacItemValidationResponse.BAD_REQUEST);
			response.setMessage(errorMsg);
		}
    
		return response;
	}


	public static JSONObject prePublish(JSONObject requestPayload, String collectionId, boolean forUpdate) {
		String date = DateUtil.nowAsString();
		JSONObject prop = (JSONObject) requestPayload.get("properties");
		
		//Add feature
		if(!forUpdate)
		{
			//populate STAC item field (collection) with collectionID from URI
			requestPayload.put("collection",collectionId);
			
			//Add attributes in properties			
			prop.put(FieldNames.FIELD_STAC_CREATED,date);
			prop.put(FieldNames.FIELD_STAC_UPDATED,date);		
			requestPayload.put("properties", prop);
			
			//Add Geoportal attributes sys_created_dt, sys_modified_dt, sys_collections_s,sys_access_s 
			// sys_approval_status_s,title and url_granule_s
			JSONArray collArr = new JSONArray();
			collArr.add(collectionId);
			
			requestPayload.put(FieldNames.FIELD_SYS_CREATED,date);
			requestPayload.put(FieldNames.FIELD_SYS_MODIFIED,date);		
			requestPayload.put(FieldNames.FIELD_SYS_COLLECTIONS,collArr);
			requestPayload.put(FieldNames.FIELD_TITLE,requestPayload.get("id"));
			
			//Add url_granule_s from asset with role thumbnail
			if(requestPayload.containsKey(FieldNames.FIELD_ASSETS))
			{
        JSONObject assetsObj = (JSONObject) requestPayload.get(FieldNames.FIELD_ASSETS);

        if(assetsObj.keySet().contains(FieldNames.FIELD_THUMBNAIL)) {
          JSONObject thumbnailObj = (JSONObject) assetsObj.get(FieldNames.FIELD_THUMBNAIL);
          if(thumbnailObj.get("href")!=null) {
            requestPayload.put(FieldNames.FIELD_URL_GRANULE_S,thumbnailObj.get("href").toString());
          }
        }
			}
            
			//if envelope_geo and shape_geo not present in request, add from bbox and geometry respectively,
			if(!requestPayload.containsKey(FieldNames.FIELD_SHAPE_GEO) && requestPayload.containsKey(FieldNames.FIELD_GEOMETRY)) {
        requestPayload.put(FieldNames.FIELD_SHAPE_GEO, requestPayload.get(FieldNames.FIELD_GEOMETRY));
			}
			
			if(!requestPayload.containsKey(FieldNames.FIELD_ENVELOPE_GEO) && requestPayload.containsKey(FieldNames.FIELD_BBOX)) {
        JSONArray bbox =(JSONArray) requestPayload.get(FieldNames.FIELD_BBOX);
        JSONArray envelopeGeoArr = new JSONArray();
        JSONObject envelopeGeo = new JSONObject();

        if (bbox.size() == 4) {
          double coords[] = { -180.0, -90.0, 180.0, 90.0 };

          coords[0] = Double.parseDouble(bbox.get(0).toString());
          coords[1] = Double.parseDouble(bbox.get(1).toString());
          coords[2] = Double.parseDouble(bbox.get(2).toString());
          coords[3] = Double.parseDouble(bbox.get(3).toString());

          JSONArray coordinateArr1 = new JSONArray();
          coordinateArr1.add(0, coords[0]);
          coordinateArr1.add(1, coords[3]);

          JSONArray coordinateArr2 = new JSONArray();
          coordinateArr2.add(0, coords[2]);
          coordinateArr2.add(1, coords[1]);

          JSONArray coordinateArr = new JSONArray();
          coordinateArr.add(0, coordinateArr1);
          coordinateArr.add(1, coordinateArr2);

          envelopeGeo.put("coordinates", coordinateArr);
          envelopeGeo.put("type", "envelope");
          envelopeGeo.put("ignore_malformed", "true");
          envelopeGeoArr.add(0,envelopeGeo);

          requestPayload.put(FieldNames.FIELD_ENVELOPE_GEO, envelopeGeoArr);
        }
			}
			
			GeoportalContext gc = GeoportalContext.getInstance();
			if (gc.getSupportsGroupBasedAccess() && gc.getDefaultAccessLevel() != null && 
			          gc.getDefaultAccessLevel().length() > 0) {
				requestPayload.put(FieldNames.FIELD_SYS_ACCESS,gc.getDefaultAccessLevel());
      }
      if (gc.getSupportsApprovalStatus() && gc.getDefaultApprovalStatus() != null && 
			          gc.getDefaultApprovalStatus().length() > 0) {
        requestPayload.put(FieldNames.FIELD_SYS_APPROVAL_STATUS,gc.getDefaultApprovalStatus());
      }
		    
      requestPayload.put(FieldNames.FIELD_SYS_OWNER, null);
      requestPayload.put(FieldNames.FIELD_SYS_OWNER_TXT,null);
		}

    //Update Feature
		else
		{
      requestPayload.put(FieldNames.FIELD_SYS_MODIFIED,date);	

      prop.put(FieldNames.FIELD_STAC_UPDATED,date);		
      requestPayload.put("properties", prop);
		}

		return requestPayload;
	}

	public static StacItemValidationResponse validateStacItemForUpdate(JSONObject requestPayload, 
			String collectionId, String featureId, boolean validateFields) throws Exception {
		
		String errorMsg = "";
		StacItemValidationResponse response = new StacItemValidationResponse();
		if(validateFields)
		{
      response = validateFields(requestPayload);	
		}
		
		if(response.getCode() == null)
		{
			//validate that collectionId and featureId in URL is matching values in Feature body
			if(!requestPayload.getAsString("id").equals(featureId))
			{
        errorMsg = errorMsg+" id in Feature body and Id in path param should be equal.";
			}
			if(!(requestPayload.getAsString("collection")!= null && requestPayload.getAsString("collection").equals(collectionId)))
			{
        errorMsg = errorMsg+" collection in Feature body and collectionId in path param should be equal.";
			}
			if(errorMsg.length()>0)
			{
        response.setCode(StacItemValidationResponse.BAD_REQUEST);
        response.setMessage(errorMsg);
			}
			else
			{
        //validate it is valid featureId
        String itemRes = getItemWithItemId(collectionId, featureId);
        DocumentContext elasticResContext = JsonPath.parse(itemRes);

        net.minidev.json.JSONArray items = elasticResContext.read("$.hits.hits");
        if (items == null || items.size() == 0) {
            response.setCode(StacItemValidationResponse.ITEM_NOT_FOUND);
            response.setMessage("Feature does not exist.");
        }
			}
		}
		if(response.getCode() == null)
		{
			response.setCode(StacItemValidationResponse.ITEM_VALID);
			response.setMessage("Item is valid.");
		}
		return response;
	}

	
	//Validate Stac collection json as per https://github.com/radiantearth/stac-spec/blob/master/collection-spec/collection-spec.md
	public static StacItemValidationResponse validateStacCollection(JSONObject requestPayload, boolean update) throws Exception {
			
		String errorMsg = "";
		StacItemValidationResponse response = new StacItemValidationResponse();
		if(!requestPayload.containsKey("type")) {
			errorMsg = errorMsg+" type is mandatory.";
		}
		
		if(requestPayload.containsKey("type") && !requestPayload.getAsString("type").equals("Collection")) {
			errorMsg = errorMsg+" type should be Collection.";
		}
    
		if(!requestPayload.containsKey("stac_version") || 
      (requestPayload.containsKey("stac_version") && requestPayload.get("stac_version").toString().isBlank()))	{
			errorMsg = errorMsg+" stac_version is mandatory.";
		}
    
		if (!requestPayload.containsKey("id") || 
       (requestPayload.containsKey("id") && requestPayload.get("id").toString().isBlank()))	{
			errorMsg = errorMsg+" id is mandatory.";
		}
    
		if (!requestPayload.containsKey("description") || 
       (requestPayload.containsKey("description") && requestPayload.get("description").toString().isBlank()))	{
			errorMsg = errorMsg+" description is mandatory.";
		}
    
		if (!requestPayload.containsKey("license") || 
       (requestPayload.containsKey("license") && requestPayload.get("license").toString().isBlank()))	{
			errorMsg = errorMsg+" license is mandatory.";
		}

    if (!requestPayload.containsKey("providers"))	{
			errorMsg = errorMsg+" providers are mandatory.";
		}

    if (!requestPayload.containsKey("extent")) {
			errorMsg = errorMsg+" extent is mandatory.";
		}
    
		if (errorMsg.length()>0) {
			response.setCode(StacItemValidationResponse.BAD_REQUEST);
			response.setMessage(errorMsg);

    } else {
			String id = requestPayload.get("id").toString();
			//Check if same id collection exist
			JSONObject itemRes = getCollectionWithId(id);	
			
			if(update && (itemRes == null))
			{
				errorMsg = "Stac collection with id '"+id+"' does not exist.";
				response.setCode(StacItemValidationResponse.ITEM_NOT_FOUND);
				response.setMessage(errorMsg);
			}
			if (!update && (itemRes != null)) {
				errorMsg = "Stac collection with id '"+id+"' already exists.";
				response.setCode(StacItemValidationResponse.ID_EXISTS);
				response.setMessage(errorMsg);
			}
			if(errorMsg.length()==0)
			{
				response.setCode(StacItemValidationResponse.ITEM_VALID);
				response.setMessage("success");
			}
		}
    
		return response;
	}

	public static JSONObject getCollectionWithId(String id) throws Exception {
		String response = "";		
		String query = "";
		
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		ElasticClient client = ElasticClient.newClient();
		String url = client.getTypeUrlForSearch(ec.getCollectionIndexName());
		Map<String, String> queryMap = new HashMap<String, String>();

		queryMap.put("ids", id);
		url = url + "/_search";
		
		query = prepareSearchQuery(queryMap, null);

		if (query.length() > 0)
			response = client.sendPost(url, query, "application/json");
		else
			response = client.sendGet(url);
		
		DocumentContext elasticResContext = JsonPath.parse(response);
		net.minidev.json.JSONArray items = elasticResContext.read("$.hits.hits");
		JSONObject item = new JSONObject();
		
		if(items != null && items.size()>0)
		{
			HashMap itemMap = (HashMap) items.get(0);
			item = new JSONObject((HashMap)itemMap.get("_source"));
		}
		return item;
	}

	public static JSONObject deleteCollectionItems(String collectionId, String idList, boolean deleteCollection) {
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		ElasticClient client = ElasticClient.newClient();
		String response = "";
		JSONObject resObj = new JSONObject();
		String url ="";
		String body = "";
		boolean deleteById = false;
		
		try {
			url =  client.getTypeUrlForSearch(ec.getIndexName());
			url = url+"/_delete_by_query";			
			
			if(idList!=null && !idList.isBlank())
			{
				 String ids = prepareIds(idList);
				 body = "{\"query\":{\"bool\":{\"must\":[{\"match\":{\"src_collections_s\":\""+collectionId+"\"}},"+ids+"]}}}";
			}
			else {
				body = "{\"query\":{\"bool\":{\"must\":[{\"match\":{\"src_collections_s\":\""+collectionId+"\"}}]}}}";
			}			
			
			response = client.sendPost(url, body, "application/json");
		}catch(Exception e)
		{
			e.printStackTrace();
			resObj.put("code", "500");
			resObj.put("description", "Stac features could not be deleted from collection. "+e.getCause());
			return resObj;
		}
		
		resObj = (JSONObject) JSONValue.parse(response);
		int total  = resObj.containsKey("total")? ((Number)(resObj.get("total"))).intValue(): null;
		int deleted  = resObj.containsKey("deleted")? ((Number)(resObj.get("deleted"))).intValue(): null;
		
		if(idList != null && !idList.isBlank())
		{
			deleteById = true;
		}				
		resObj = new JSONObject();
		if(!deleteCollection)
		{
			resObj.put("code", "200");
			resObj.put("description", "Stac features found: "+total+", deleted: "+deleted);			
		}
		if(deleteCollection)
		{	//Deleting collection is not allowed if items are deleted by Id
			if(deleteById)
			{
				resObj.put("code", "200");
				resObj.put("description", "Stac features found: "+total+", deleted: "+deleted+". Deleting collection is not allowed when items are deleted with id list.");	
			}			
			if(!deleteById && deleted != total)
			{
				resObj.put("code", "200");
				resObj.put("description", "Stac features found: "+total+", deleted: "+deleted+". Collection will not be deleted as some features could not be deleted.");	
				
			}
			if(!deleteById && deleted == total)
			{
				//Now delete collection which is an item in Collection Index
				try {
					url = client.getTypeUrlForSearch(ec.getCollectionIndexName());			
					response = client.sendDelete(url+"/_doc/"+collectionId);	
					resObj.put("code", "200");
					resObj.put("description", "Stac features found: "+total+", deleted: "+deleted+". Collection is deleted.");
				}catch (Exception e) {					
					e.printStackTrace();
					resObj.put("code", "500");
					resObj.put("description", "Stac features found: "+total+", deleted: "+deleted+" but collection could not be deleted."+e.getCause());
				}
			}
		}	
			
		return resObj;
	}

	  
  /*
   * get the WKT of the CRS from the collection
   *
   * @param collection - the Collection object for which to look for theCRS
   * @param theCRS - the requested CRS (example: "EPSG:3857")
   *
   * @returns - either the EPSG code, or the WKT definition of the CRS from the collection
  */
  public static String getRequestedCRS(Collection collection, String theCRS) {
    
      // if not EPSG:nnnnn get the esri WKT representation of the CRS and reproject
      // else use just the EPSG code
      String requestedCRS;
      if (!theCRS.startsWith("EPSG:")) {
         Asset theAsset = collection.getAsset(theCRS);
         String wkt = theAsset.getEsriWKT();
         requestedCRS = "{\"wkt\": \"" + wkt.replace("\"", "\\\"") + "\"}";

      } else {
          requestedCRS = theCRS.replace("EPSG:", "");
      }
      LOGGER.debug("requestedCRS = " + requestedCRS);

      return requestedCRS;
  }

  
  /*
   * Project an Individual item
   *
   * @param outCRS - the requested CRS
   *
   * @returns - either the EPSG code, or the WKT definition of the CRS from the collection
  */
  public static String getRequestedCRS(JSONObject collectionObj, String outCRS) {
    
      // if not EPSG:nnnnn get the esri WKT representation of the CRS and reproject
      // else use just the EPSG code
      String requestedCRS;
      
      if (!outCRS.startsWith("EPSG:")) {
         JSONObject theAssets = (JSONObject) collectionObj.get("assets");
         JSONObject theCRS = (JSONObject) theAssets.get(outCRS);
         String wkt = theCRS.getAsString("esri:wkt");
         requestedCRS = "{\"wkt\": \"" + wkt.replace("\"", "\\\"") + "\"}";

      } else {
          requestedCRS = outCRS.replace("EPSG:", "");
      }
      LOGGER.debug("requestedCRS = " + requestedCRS);

      return requestedCRS;
  }
  
  
  public static JSONObject mergeJSON(JSONObject source, JSONObject updates) {
    JSONObject result = source;
    
    for (String key: updates.keySet()) {
            Object value = updates.get(key);
            if (!result.containsKey(key)) {
                // new value for "key":
                result.put(key, value);
            } else {
                // existing value for "key" - recursively deep merge:
                if (value instanceof JSONObject) {
                    JSONObject valueSource = (JSONObject) source.get(key);
                    JSONObject updatesValue = (JSONObject) updates.get(key);
                    JSONObject mergedSub = mergeJSON(valueSource, updatesValue);
                    result.put(key, mergedSub);
                } else {
                    result.put(key, value);
                }
            }
    }
    return result;
  }
}