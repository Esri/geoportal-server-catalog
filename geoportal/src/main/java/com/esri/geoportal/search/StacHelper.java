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
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;


public class StacHelper {
	
	
	/** Validates single Stac feature for required fields and duplicate id in collection
	 * @param requestPayload
	 * @param collectionId
	 * @param validateFields 
	 * @return
	 * @throws Exception
	 */
	public static StacItemValidationResponse validateStacItem(JSONObject requestPayload,String collectionId, boolean validateFields) throws Exception {	
		StacItemValidationResponse response = new StacItemValidationResponse();
		//Validate https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md#item-fields
		if(validateFields)
		{
			response = validateFields(requestPayload);
		}		
		if(response.getCode() == null)
		{
			response = validateId(requestPayload,collectionId);
			if(response.getCode() == null)
			{
				response.setCode(StacItemValidationResponse.ITEM_VALID);
			}
		}
		return response;
	}
	
	public static String getItemWithItemId(String collectionId,String id) throws Exception {
		
		String response = "";		
		String query = "";
		
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		ElasticClient client = ElasticClient.newClient();
		String url = client.getTypeUrlForSearch(ec.getIndexName());
		Map<String, String> queryMap = new HashMap<String, String>();

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
	public static ArrayList<String> getCollectionIDList() throws Exception
	{
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

//{"type": "GeometryCollection", "geometries": [{"type": "Point", "coordinates": [100.0, 0.0]}, {"type": "LineString", "coordinates": [[101.0, 0.0], [102.0, 1.0]]}]}
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
		//{"bool":{"should":[{"match":{"id":"1"}},{"match":{"id":"2"}}]}}
		
		StringBuffer idQryBuf = new StringBuffer("{\"bool\":{\"should\":[");
		int i=0;
		for (String id : idList) {
			if(i ==0)
				idQryBuf.append("{\"match\": {\"id\": \"" + id + "\"}}");	
			else
				idQryBuf.append(",{\"match\": {\"id\": \"" + id + "\"}}");
			i++;
		}
		idQryBuf.append("]}}");
		return idQryBuf.toString();
		//return "{\"match\": {\"id\": \"" + ids + "\"}}";
	}

	private static String prepareDateTime(String datetime) {
		String query = "";
		//String dateTimeFld = "sys_modified_dt";
		String dateTimeFld = "datetime";
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
		// reaplcing it with defaults
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
		String errorMsg ="";
		StacItemValidationResponse response = new StacItemValidationResponse();
		
		//Validate if id exists	
		String id =  requestPayload.get("id").toString();
		String itemRes = getItemWithItemId(collectionId, id);
		DocumentContext elasticResContext = JsonPath.parse(itemRes);

		net.minidev.json.JSONArray items = elasticResContext.read("$.hits.hits");
		if (items != null && items.size() > 0) {
			errorMsg = "stac item with id '"+id+"' already exists.";
			response.setCode(StacItemValidationResponse.ID_EXISTS);
			response.setMessage(errorMsg);
		}		
		return response;
	}

	private static StacItemValidationResponse validateFields(JSONObject requestPayload) {
		String errorMsg ="";
		StacItemValidationResponse response = new StacItemValidationResponse();
		
		if(!requestPayload.containsKey("stac_version"))
		{
			errorMsg = errorMsg+"stac_version is mandatory.";
		}
		if(!requestPayload.containsKey("id") || 
				(requestPayload.containsKey("id") && requestPayload.get("id").toString().isBlank()))
		{
			errorMsg = errorMsg+" id is mandatory and should not be empty.";
		}
		if(!requestPayload.containsKey("geometry"))
		{
			errorMsg = errorMsg+" geometry is mandatory.";
		}
		
		if(requestPayload.containsKey("geometry"))
		{
			if(requestPayload.get("geometry") != null && (!requestPayload.containsKey("bbox")))
			errorMsg = errorMsg+" bbox is mandatory if geometry is not null.";
		}
		if(!requestPayload.containsKey("properties"))
		{
			errorMsg = errorMsg+" properties is mandatory.";
		}
		if(requestPayload.containsKey("properties"))
		{
			JSONObject prop = (JSONObject) requestPayload.get("properties");
			if(!prop.containsKey("datetime"))
			{
				errorMsg = errorMsg+" datetime is mandatory.";
			}
			else if(prop.containsKey("datetime") && prop.get("datetime") == null)
			{
				if(!prop.containsKey("start_datetime") || !prop.containsKey("end_datetime"))
				{
					errorMsg = errorMsg+" start_datetime and end_datetime is mandatory if datetime is null.";
				}
			}
		}
		if(!requestPayload.containsKey("links"))
		{
			errorMsg = errorMsg+" links is mandatory.";
		}
		if(requestPayload.containsKey("links"))
		{
			JSONArray linkArr = (JSONArray) requestPayload.get("links");
			
			for(var i=0; i<linkArr.size();i++)
			{
				JSONObject link = (JSONObject) linkArr.get(i);
				if(!link.containsKey("href") || !link.containsKey("rel"))
				{
					errorMsg = errorMsg+" href and rel are mandatory in link object.";
				}
			}
		}
		if(!requestPayload.containsKey("assets"))
		{
			errorMsg = errorMsg+" assets is mandatory.";
		}
		if(errorMsg.length()>0)
		{
			response.setCode(StacItemValidationResponse.BAD_REQUEST);
			response.setMessage(errorMsg);
		}		
		return response;
	}

	public static JSONObject prePublish(JSONObject requestPayload, String collectionId, boolean forUpdate)
	{
		String date = DateUtil.nowAsString();
		JSONObject prop = (JSONObject) requestPayload.get("properties");
		
		//Add feature
		if(!forUpdate)
		{
			//populate Stac item field (collection) with collectionID from URI
			requestPayload.put("collection",collectionId);
			
			//Add attributes in properties			
			prop.put(FieldNames.FIELD_STAC_CREATED,date);
			prop.put(FieldNames.FIELD_STAC_UPDATED,date);		
			requestPayload.put("properties", prop);
			
			//Add Geoportal attributes sys_created_dt, sys_modified_dt, sys_collections_s,sys_access_s and sys_approval_status_s
			JSONArray collArr = new JSONArray();
			collArr.add(collectionId);
			
			requestPayload.put(FieldNames.FIELD_SYS_CREATED,date);
			requestPayload.put(FieldNames.FIELD_SYS_MODIFIED,date);		
			requestPayload.put(FieldNames.FIELD_SYS_COLLECTIONS,collArr);
			
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
		if(!requestPayload.containsKey("type"))
		{
			errorMsg = errorMsg+" type is mandatory.";
		}
		
		if(requestPayload.containsKey("type") && !requestPayload.getAsString("type").equals("Collection"))
		{
			errorMsg = errorMsg+" type should be Collection.";
		}
		if(!requestPayload.containsKey("stac_version") || 
				(requestPayload.containsKey("stac_version") && requestPayload.get("stac_version").toString().isBlank()))
		{
			errorMsg = errorMsg+" stac_version is mandatory.";
		}
		if(!requestPayload.containsKey("id") || 
				(requestPayload.containsKey("id") && requestPayload.get("id").toString().isBlank()))
		{
			errorMsg = errorMsg+" id is mandatory.";
		}
		if(!requestPayload.containsKey("description") || 
				(requestPayload.containsKey("description") && requestPayload.get("description").toString().isBlank()))
		{
			errorMsg = errorMsg+" description is mandatory.";
		}
		if(!requestPayload.containsKey("license") || 
				(requestPayload.containsKey("license") && requestPayload.get("license").toString().isBlank()))
		{
			errorMsg = errorMsg+" license is mandatory.";
		}
		if(!requestPayload.containsKey("providers"))
		{
			errorMsg = errorMsg+" providers are mandatory.";
		}
		if(!requestPayload.containsKey("extent"))
		{
			errorMsg = errorMsg+" extent is mandatory.";
		}
		if(!requestPayload.containsKey("links"))
		{
			errorMsg = errorMsg+" links are mandatory.";
		}
		if(errorMsg.length()>0)
		{
			response.setCode(StacItemValidationResponse.BAD_REQUEST);
			response.setMessage(errorMsg);
		}
		else
		{
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
		JSONObject item = null;
		
		if(items != null && items.size()>0)
		{
			HashMap itemMap = (HashMap) items.get(0);
			item = new JSONObject((HashMap)itemMap.get("_source"));
		}
		return item;
	}
}
	
	


