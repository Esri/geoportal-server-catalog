package com.esri.geoportal.search;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.base.util.DateUtil;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.exception.InvalidParameterException;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.util.FieldNames;
import com.esri.geoportal.service.stac.StacContext;
import com.esri.geoportal.service.stac.Asset;
import com.esri.geoportal.service.stac.Collection;
import com.esri.geoportal.service.stac.GeometryServiceClient;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import java.util.logging.Level;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;


public class StacHelper {
	private static final Logger LOGGER = LoggerFactory.getLogger(StacHelper.class);
	
	/** Validates single STAC feature for required fields and duplicate id in collection
	 * @param requestPayload
	 * @param collectionId
	 * @param validateFields 
	 * @return
	 * @throws Exception
	 */
	public static StacItemValidationResponse validateStacItem(JSONObject requestPayload,String collectionId, boolean validateAllFields) throws Exception {	
		StacItemValidationResponse response = new StacItemValidationResponse();
		//Validate https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md#item-fields
		response = validateId(requestPayload,collectionId);
		if(response.getCode() == null)
		{
			response = validateFields(requestPayload,collectionId, validateAllFields,false);
			if(response.getCode() == null)
			{
				response.setCode(StacItemValidationResponse.ITEM_VALID);
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
		
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		ElasticClient client = ElasticClient.newClient();
		String url = client.getTypeUrlForSearch(ec.getIndexName());

		url = url + "/_search";
    
    String query = "{\"_source\": {\"include\": [\"" + fieldName + "\"]},";
		query += "\"query\": {\"match\": {\"" + fieldName + "\": {\"query\": \"" + escapeSearchCharacters(fieldValue) + "\", \"operator\": \"and\"}}}}";
    
    String response = client.sendPost(url, query, "application/json");
		
		return response;
	}
  
  /**
   * Escape certain characters in the value to be searched for
   * Indexes tend to tokenize the value (for example on dashes)
   * @param inputValue
   * @return 
   */
  public static String escapeSearchCharacters(String inputValue) {
    return inputValue.replace("-", " ");
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
    return getCollectionList(10000);
  }

  
	/** Returns Array of collections from elastic index 'çollections'
	 * @return
	 * @throws Exception
	 */
	public static JSONArray getCollectionList(int limit) throws Exception {
		ElasticClient client = ElasticClient.newClient();
		ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		
		String url = client.getTypeUrlForSearch(ec.getCollectionIndexName());
    
    // 616 - only allow max number to return
		url = url + "/_search?size=" + limit;    
    String searchAfterStr = "";
    // TODO - full pagination for collections list
    //    if (searchAfter != null && !searchAfter.isBlank()) {
    //      searchAfterStr = ", \"search_after\":[\"" + searchAfter + "\"]";
    //    } else {
    //      searchAfterStr = "";
    //    }
		String query = "{\"track_total_hits\":true,\"sort\": {\"_id\": \"asc\"}" + searchAfterStr + "}";
		
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
			String dateTimeQry = prepareDateTimeFld(FieldNames.FIELD_SYS_MODIFIED,queryMap.get("datetime"));
			if (dateTimeQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(dateTimeQry));
		}
		
		if (queryMap.containsKey("updated")) {
			String dateTimeQry = prepareDateTimeFld(FieldNames.FIELD_SYS_MODIFIED,queryMap.get("updated"));
			if (dateTimeQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(dateTimeQry));
		}
		
		if (queryMap.containsKey("created")) {
			String dateTimeQry = prepareDateTimeFld(FieldNames.FIELD_SYS_CREATED,queryMap.get("created"));
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
		
		if (queryMap.containsKey("status")) {			
			String statusQry = prepareStatus(queryMap.get("status"));
			builder.add(JsonUtil.toJsonStructure(statusQry));
		}
    
		if (queryMap.containsKey("filterClause")) {			
			String filterQry = prepareFilter(queryMap.get("filterClause"));
			builder.add(JsonUtil.toJsonStructure(filterQry));
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


  private static String prepareStatus(String status) {
	  	StacContext sc = StacContext.getInstance();
		return prepareFilter(sc.getStatusFld()+"="+status);
		
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


	private static String prepareDateTimeFld(String datetimeFldName, String dateTimeFldVal) {
		String query = "";		
		
		String dateTimeFldQuery = "";
		// Find from and to dates
		// https://api.stacspec.org/v1.0.0/ogcapi-features/#tag/Features/operation/getFeatures
		// Either a date-time or an interval, open or closed. Date and time expressions
		// adhere to RFC 3339. Open intervals are expressed using double-dots.
		// Examples:
		// A date-time: "2018-02-12T23:20:50Z"
		// A closed interval: "2018-02-12T00:00:00Z/2018-03-18T12:31:12Z"
		// Open intervals: "2018-02-12T00:00:00Z/.." or "../2018-03-18T12:31:12Z"

		String fromField = dateTimeFldVal;
		String toField = "";
		List<String> dateFlds = Arrays.asList(dateTimeFldVal.split("/"));

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

		query = "{\"range\": {\"" + datetimeFldName + "\":" + dateTimeFldQuery + "}}";

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
  
  public static String prepareFilter(String filterClause) {
    String filterField;
    String filterValue;
    StacContext sc = StacContext.getInstance();
    Map<String, String> fieldMapping = sc.getFieldMappings();
    
		String[] clauseList = filterClause.split("AND");
		//{"bool":{"must":[{"match":{"clause_field1":"clause_value1"}},{"match":{"clause_field2":"clause_value2"}}]}}
		
		StringBuilder filterQryBuf = new StringBuilder("{\"bool\":{\"must\":[");
		int i=0;
		for (String clause : clauseList) {
      filterField = clause.split("=")[0].trim();
      // replace filterField with mapped index field if the filterField is mapped
      if (fieldMapping.containsKey(filterField)) {
        filterField = fieldMapping.get(filterField);
      }
      filterValue = clause.split("=")[1].trim();
			if(i>0) {
        filterQryBuf.append(",");
      }
      filterQryBuf.append("{\"match\": {\"")
                  .append(filterField)
                  .append("\": \"")
                  .append(filterValue)
                  .append("\"}}");	
			i++;
		}
		filterQryBuf.append("]}}");
		return filterQryBuf.toString();    
  }

	private static StacItemValidationResponse validateId(JSONObject requestPayload,String collectionId) throws Exception {
		String errorMsg;
		StacItemValidationResponse response = new StacItemValidationResponse();
		
		//Validate if id exists			
		if(requestPayload.get("id") !=null && !requestPayload.get("id").toString().isBlank())
		{
			String id = requestPayload.get("id").toString();
			String itemRes = getItemWithItemId(collectionId, id);
			DocumentContext elasticResContext = JsonPath.parse(itemRes);

			net.minidev.json.JSONArray items = elasticResContext.read("$.hits.hits");
			if (items != null && !items.isEmpty()) {
				errorMsg = "stac item with id '"+id+"' already exists.";
				response.setCode(StacItemValidationResponse.ID_EXISTS);
				response.setMessage(errorMsg);
			}		
		}		
		return response;
	}
 
	// https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md
	private static StacItemValidationResponse validateFields(JSONObject requestPayload,String collectionId, boolean validateAllFields,
			boolean forUpdate) {
		String errorMsg ="";
		StacItemValidationResponse response = new StacItemValidationResponse();
    
    if (validateAllFields) {
      // validate all these fields
		
      if(!requestPayload.containsKey("stac_version")) {
        errorMsg = errorMsg+"stac_version is mandatory.";
      }

      if(!requestPayload.containsKey("id") || 
          (requestPayload.containsKey("id") 
          && requestPayload.get("id").toString().isBlank())) {

        StacContext sc = StacContext.getInstance();
        if (!sc.isCanStacAutogenerateId()) {
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
      if(!requestPayload.containsKey("assets")) {
          errorMsg = errorMsg + " assets is mandatory.";
        }
      //https://github.com/EsriPS/exxonmobil-gsdb/issues/6 datetime validation moved to Validator TODO remove code 
//      if(requestPayload.containsKey("properties")) {
//        JSONObject prop = (JSONObject) requestPayload.get("properties");
//
//        if(!prop.containsKey("datetime")) {
//          errorMsg = errorMsg+" datetime is mandatory.";
//
//        } else if(prop.containsKey("datetime") && prop.get("datetime") == null) {
//
//          if(!prop.containsKey("start_datetime") || !prop.containsKey("end_datetime")) {
//            errorMsg = errorMsg+" start_datetime and end_datetime is mandatory if datetime is null.";
//          }
//        }
//      }
    } 
    	if(!requestPayload.containsKey("properties")) {
    		errorMsg = errorMsg+" properties is mandatory.";
      }
    
    	//Always validate the configured validation rules, (not validating configured rules unless properties present in item, avoiding several NullpointerException)
	    if(requestPayload.containsKey("properties"))
		{
	    	StacContext sc = StacContext.getInstance();
	        for (String validationRule : sc.getValidationRules()) {
	          LOGGER.debug("Validation rule: " + validationRule);
	          try {
	            JSONObject validationResult = (JSONObject) sc.passesValidation(validationRule, requestPayload,collectionId,forUpdate);
	            if (!validationResult.getAsString("passes").equals("true")) {
	              errorMsg = errorMsg + validationResult.getAsString("message");
	            }
	          } catch (Exception ex) {
	            errorMsg = errorMsg + Level.SEVERE + " - StacItemValidationResponse: " +  ex.getMessage();
	          }
	        }
		}
		if(errorMsg.length()>0) {
			response.setCode(StacItemValidationResponse.BAD_REQUEST);
			response.setMessage(errorMsg);
		}
    
		return response;
	}


	public static JSONObject prePublish(JSONObject requestPayload, String collectionId, boolean forUpdate) throws Exception {
		String date = DateUtil.nowAsString();
		JSONObject prop = (JSONObject) requestPayload.get("properties");
		GeoportalContext gc = GeoportalContext.getInstance();
		StacContext sc = StacContext.getInstance();
		GeometryServiceClient geometryClient = new GeometryServiceClient(gc.getGeometryService());
		// Populate few fields for Add/Update feature
		
		// populate STAC item field (collection) with collectionID from URI
		requestPayload.put("collection", collectionId);
		
		//Add item
		if(!forUpdate)
		{
			prop.put(FieldNames.FIELD_STAC_CREATED, date); //Created in case of Add item
			requestPayload.put(FieldNames.FIELD_SYS_CREATED, date);
		}
		prop.put(FieldNames.FIELD_STAC_UPDATED, date);
		
		//Check for geom_wkt field 
		if(prop.containsKey(sc.getGeomWKTField()))
		{
			JSONObject wktGeom = (JSONObject)prop.get(sc.getGeomWKTField());
			
			//iterate over all geometries and fill update_date
			for (Map.Entry<String, Object> entry : wktGeom.entrySet()) {
				String geomObjKey = entry.getKey();
				JSONObject geomObj = (JSONObject) wktGeom.get(geomObjKey);
				if(!geomObj.containsKey("update_date"))
				{
					geomObj.put("update_date",date);	
				}
			}
			
			boolean addPoint = checkToBeAdded(wktGeom,"point");
			boolean addFootprint = checkToBeAdded(wktGeom,"polygon");
			//if polyhedral exists but point and polygon missing, generate and add in geomWKT (both in case of Add and Update item)			
			if(addPoint){
					//generate point
					JSONObject pointWKTObj = geometryClient.getPointFromPolyhedralWKT((JSONObject) wktGeom.get("polyhedral"));
					wktGeom.put("point",pointWKTObj);					
			}
			if(addFootprint){
					//generate polygon footprint
					JSONObject polygonWKTObj = geometryClient.getPolyhedralFootprint((JSONObject) wktGeom.get("polyhedral"));
					wktGeom.put("polygon",polygonWKTObj);
			}
		}			
		requestPayload.put("properties", prop);

		// Add Geoportal attributes sys_created_dt, sys_modified_dt,
		// sys_collections_s,sys_access_s
		// sys_approval_status_s,title and url_granule_s
		JSONArray collArr = new JSONArray();
		collArr.add(collectionId);
		
		requestPayload.put(FieldNames.FIELD_SYS_MODIFIED, date);
		requestPayload.put(FieldNames.FIELD_SYS_COLLECTIONS, collArr);
		requestPayload.put(FieldNames.FIELD_TITLE, requestPayload.get("id"));

		// Add url_granule_s from asset with role thumbnail
		if (requestPayload.containsKey(FieldNames.FIELD_ASSETS)) {
			JSONObject assetsObj = (JSONObject) requestPayload.get(FieldNames.FIELD_ASSETS);

			if (assetsObj.keySet().contains(FieldNames.FIELD_THUMBNAIL)) {
				JSONObject thumbnailObj = (JSONObject) assetsObj.get(FieldNames.FIELD_THUMBNAIL);
				if (thumbnailObj.get("href") != null) {
					requestPayload.put(FieldNames.FIELD_URL_GRANULE_S, thumbnailObj.get("href").toString());
				}
			}
		}

		// if envelope_geo and shape_geo not present in request, add from bbox and
		// geometry respectively,
		if (!requestPayload.containsKey(FieldNames.FIELD_SHAPE_GEO)
				&& requestPayload.containsKey(FieldNames.FIELD_GEOMETRY)) {
			JSONObject twoDGeoJson = extract2DGeoJson((JSONObject)requestPayload.get(FieldNames.FIELD_GEOMETRY));
			requestPayload.put(FieldNames.FIELD_SHAPE_GEO, twoDGeoJson);
		}

		if (!requestPayload.containsKey(FieldNames.FIELD_ENVELOPE_GEO)
				&& requestPayload.containsKey(FieldNames.FIELD_BBOX)) {
			JSONArray bbox = (JSONArray) requestPayload.get(FieldNames.FIELD_BBOX);
			JSONArray envelopeGeoArr = new JSONArray();
			JSONObject envelopeGeo = new JSONObject();

			if (bbox != null && bbox.size() == 4) {
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
				envelopeGeoArr.add(0, envelopeGeo);

				requestPayload.put(FieldNames.FIELD_ENVELOPE_GEO, envelopeGeoArr);
			}
		}
		
		if (gc.getSupportsGroupBasedAccess() && gc.getDefaultAccessLevel() != null
				&& gc.getDefaultAccessLevel().length() > 0) {
			requestPayload.put(FieldNames.FIELD_SYS_ACCESS, gc.getDefaultAccessLevel());
		}
		if (gc.getSupportsApprovalStatus() && gc.getDefaultApprovalStatus() != null
				&& gc.getDefaultApprovalStatus().length() > 0) {
			requestPayload.put(FieldNames.FIELD_SYS_APPROVAL_STATUS, gc.getDefaultApprovalStatus());
		}

		requestPayload.put(FieldNames.FIELD_SYS_OWNER, null);
		requestPayload.put(FieldNames.FIELD_SYS_OWNER_TXT, null);
		

		// Update Feature
		if(forUpdate) {	
			//Update Item specific things can be put here
		}

		// in either add/update map STAC fields from app-context fieldMappings to index
		// fields		
		for (Map.Entry<String, String> entry : sc.getFieldMappings().entrySet()) {
			String stacField = entry.getKey();
			if (prop.containsKey(stacField)) {
				String indexField = entry.getValue();
				requestPayload.put(indexField, prop.get(stacField));
			}
		}

		return requestPayload;
	}

	private static JSONObject extract2DGeoJson(JSONObject geometry) {		
        String type = geometry.getAsString("type");
        type = type.toUpperCase();
        JSONArray coordinates = (JSONArray) geometry.get("coordinates");
        JSONObject modifiedObj = new JSONObject();
        try {
        	switch (type) {
    		case "POINT":
    			modifiedObj.put("type", "Point");
    			modifiedObj.put("coordinates", extract2DPoint(coordinates));
    			break;
    		case "LINESTRING":
    			modifiedObj.put("type", "LineString");
    			modifiedObj.put("coordinates", extract2DLine(coordinates));
    			break;
    		case "POLYGON":
    			modifiedObj.put("type", "Polygon");
    			modifiedObj.put("coordinates", extract2DPolygon(coordinates));
    			break;
    		case "MULTIPOLYGON":
    			modifiedObj.put("type", "MultiPolygon");
    			modifiedObj.put("coordinates", extarct2DMultiPolygon(coordinates));
    			break;
    		case "MULTILINESTRING":
    			modifiedObj.put("type", "MultiLineString");
    			modifiedObj.put("coordinates", extarct2DMultiLineString(coordinates));
    			break;
    		default:
    			//Return same as input geomtery
    			modifiedObj = geometry;
    			break;
    		}
        }
		catch(Exception ex)
        {
			//If it is not able to extract 2D geoJSON, just save 3D.
			LOGGER.info("Could not extract 2D geoJSON "+geometry.toString());
			modifiedObj = geometry;
        }
		return modifiedObj;
	}
	
	private static double toDouble(Object value) {
	    if (value instanceof BigDecimal) {
	        return ((BigDecimal) value).doubleValue();
	    } else if (value instanceof Double) {
	        return (Double) value;
	    } else if (value instanceof Number) {
	        return ((Number) value).doubleValue(); // covers Integer, Long, etc.
	    } else {
	        throw new IllegalArgumentException("Unsupported number type: " + value.getClass());
	    }
	}

    private static List<List<List<Double>>> extarct2DMultiLineString(JSONArray coords) {
        List<List<List<Double>>> extracted2D = new ArrayList<>();
        for (Object lineObj : coords) {
            JSONArray line = (JSONArray) lineObj;
            extracted2D.add(extract2DLine(line));
        }
        return extracted2D;
    }

    private static List<List<List<List<Double>>>> extarct2DMultiPolygon(JSONArray coords) {
        List<List<List<List<Double>>>> extracted2D = new ArrayList<>();
        for (Object polygonObj : coords) {
            JSONArray polygon = (JSONArray) polygonObj;
            extracted2D.add(extract2DPolygon(polygon));
        }
        return extracted2D;
    }

    private static List<Double> extract2DPoint(JSONArray coords) {
		return List.of(toDouble(coords.get(0)), toDouble(coords.get(1)));
    }

    private static List<List<Double>> extract2DLine(JSONArray coords) {
        List<List<Double>> extracted2D = new ArrayList<>();

		for (Object pointObj : coords) {
			JSONArray point = (JSONArray) pointObj;
			extracted2D
					.add(List.of(toDouble(point.get(0)), toDouble(point.get(1))));
		}
        return extracted2D;
    }

	private static List<List<List<Double>>> extract2DPolygon(JSONArray coords) {
		List<List<List<Double>>> extracted2D = new ArrayList<>();
		for (Object ringObj : coords) {
		        JSONArray ring = (JSONArray) ringObj;
		        List<List<Double>> projectedRing = new ArrayList<>();
		        for (Object pointObj : ring) {
		            JSONArray point = (JSONArray) pointObj;
		            projectedRing.add(List.of(
		                toDouble(point.get(0)),
		                toDouble(point.get(1))
		            ));
		        }
		        extracted2D.add(projectedRing);
		    }
		return extracted2D;
	}


	private static ArrayList<String> checkGeomWKTToBeremoved(JSONObject prop, StacContext sc) {
		ArrayList<String> toBeRemoved = new ArrayList<>();
		String polyhedralSource ="";
		//If point or polygon geometry_source does not match Polyhedral geom source, remove point and polygon from update payload
		if(prop.containsKey(sc.getGeomWKTField()))
		{
			JSONObject wktGeom = (JSONObject) prop.get(sc.getGeomWKTField());
			if(wktGeom.containsKey("polyhedral"))
			{
				JSONObject polyhedralObj = (JSONObject) wktGeom.get("polyhedral");	
				if(polyhedralObj.get("geometry_source")!=null && !polyhedralObj.getAsString("geometry_source").isBlank()) {
					polyhedralSource = polyhedralObj.getAsString("geometry_source");
				}
				if(wktGeom.containsKey("point"))
				{
					JSONObject pointObj = (JSONObject) wktGeom.get("point");
					if(pointObj != null && pointObj.get("geometry_source")!= null && !pointObj.getAsString("geometry_source").isBlank())
					{
						if(!polyhedralSource.equalsIgnoreCase(pointObj.getAsString("geometry_source")))
						{
							toBeRemoved.add("point");
						}
					}					
				}
				if(wktGeom.containsKey("polygon"))
				{
					JSONObject polygonObj = (JSONObject) wktGeom.get("polygon");
					if(polygonObj != null && polygonObj.get("geometry_source")!= null && !polygonObj.getAsString("geometry_source").isBlank())
					{
						if(!polyhedralSource.equalsIgnoreCase(polygonObj.getAsString("geometry_source")))
						{
							toBeRemoved.add("polygon");
						}
					}					
				}
			}
		}
		return toBeRemoved;		
	}

	private static boolean checkToBeAdded(JSONObject wktGeom, String type) {
		boolean toBeAdded = false;
		if(type.contentEquals("point") && wktGeom.containsKey("polyhedral"))
		{
			if(!wktGeom.containsKey("point"))
			{
				toBeAdded = true;
			}
			else if(wktGeom.containsKey("point"))
			{
				JSONObject pointObj = (JSONObject) wktGeom.get("point");
				if(pointObj == null || (pointObj!=null && 
						(pointObj.get("wkt")== null || (pointObj.get("wkt")!=null && pointObj.getAsString("wkt").isBlank()))))
				{
					toBeAdded = true;
				}					
			}
		}
		if(type.contentEquals("polygon") && wktGeom.containsKey("polyhedral"))
		{
			if(!wktGeom.containsKey("polygon"))
			{
				toBeAdded = true;
			}
			else if(wktGeom.containsKey("polygon"))
			{
				JSONObject polygonObj = (JSONObject) wktGeom.get("polygon");
				if(polygonObj == null || (polygonObj!=null && 
						(polygonObj.get("wkt")== null || (polygonObj.get("wkt")!=null && polygonObj.getAsString("wkt").isBlank()))))
				{
					toBeAdded = true;
				}					
			}
		}
		return toBeAdded;
	}


	public static StacItemValidationResponse validateStacItemForUpdate(JSONObject requestPayload, 
		String collectionId, String featureId, boolean validateAllFields) throws Exception {
		
		String errorMsg = "";
		StacItemValidationResponse response = new StacItemValidationResponse();		
		
		//First validate, it is valid featureId
		String itemRes = getItemWithItemId(collectionId, featureId);
		DocumentContext elasticResContext = JsonPath.parse(itemRes);

		net.minidev.json.JSONArray items = elasticResContext.read("$.hits.hits");
		if (items == null || items.size() == 0) {
			response.setCode(StacItemValidationResponse.ITEM_NOT_FOUND);
			response.setMessage("Feature does not exist.");
		}
		
		if (response.getCode() == null) {
			response = validateFields(requestPayload, collectionId, validateAllFields,true); //forUpdate=true if it is update request
		}

		if (response.getCode() == null) {
			// validate that collectionId and featureId in URL is matching values in Feature
			// body
			if (!requestPayload.getAsString("id").equals(featureId)) {
				errorMsg = errorMsg + " id in Feature body and Id in path param should be equal.";
			}
			if (requestPayload.getAsString("collection") != null
					&& !requestPayload.getAsString("collection").equals(collectionId)) {
				errorMsg = errorMsg + " collection in Feature body and collectionId in path param should be equal.";
			}
			if (errorMsg.length() > 0) {
				response.setCode(StacItemValidationResponse.BAD_REQUEST);
				response.setMessage(errorMsg);
			} 
		}
		if (response.getCode() == null) {
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
		
		if (requestPayload.containsKey("id") && !isCollectionIdCharValid(requestPayload.getAsString("id"))) {
			      
			errorMsg = errorMsg+" id can only contain characters (a-zA-Z0-9:_-).";
		}
    
		if (!requestPayload.containsKey("description") || 
       (requestPayload.containsKey("description") && requestPayload.get("description").toString().isBlank())) 
		{
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
			
			if(update && (itemRes.isEmpty()))
			{
				errorMsg = "Stac collection with id '"+id+"' does not exist.";
				response.setCode(StacItemValidationResponse.ITEM_NOT_FOUND);
				response.setMessage(errorMsg);
			}
			if (!update && (!itemRes.isEmpty())) {
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

	private static boolean isCollectionIdCharValid(String id) {
		String regEx = "^[A-Za-z0-9_-]+$"; 
		Pattern pattern = Pattern.compile(regEx);
		Matcher matcher = pattern.matcher(id);
		if (matcher.matches()) {
			return true;
		}
		return false;
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
		
		boolean deleteById = false;
		int deletedSuccess = 0;		
		int total = 0; 
		
		try {
			url =  client.getTypeUrlForSearch(ec.getIndexName());

			List<String> idArrList = new ArrayList<String>();
			if(idList ==null || idList.isBlank()) {				
				String idSearch = "{\"query\":{\"bool\":{\"must\":[{\"match\":{\"src_collections_s\":\""+collectionId+"\"}}]}}}";
				String searchRes = client.sendPost(url+"/_search", idSearch, "application/json");
				DocumentContext elasticResContext = JsonPath.parse(searchRes);

				net.minidev.json.JSONArray resArr = elasticResContext.read("$.hits.hits");
				
				for(var i=0;i<resArr.size();i++)
				{
					HashMap<?, ?> elasticCollectionMap = (HashMap<?, ?>) resArr.get(i);
					idArrList.add((String) elasticCollectionMap.get("_id"));			
				}
			}
			else
			{				
				String [] idArr = idList.split(",");
				idArrList = Arrays.asList(idArr);								
			}
			total = idArrList.size();
			for(int i = 0; i<idArrList.size();i++)
			{
				response = client.sendDelete(url+"/_doc/"+idArrList.get(i));					
				JSONObject responseObj = (JSONObject) JSONValue.parse(response);
				String result = "";
				if(responseObj.containsKey("result"))			
				{
					result = responseObj.get("result").toString();
					if(result.contentEquals("deleted"))
					{
						deletedSuccess++;
					}					
				}
			}
		}catch(Exception e)
		{
			LOGGER.error(e.getMessage());
			resObj.put("code", "500");
			resObj.put("description", "Stac features could not be deleted from collection. "+e.getCause());
			return resObj;
		}
		
		if(idList != null && !idList.isBlank())
		{
			deleteById = true;
		}				
		resObj = new JSONObject();
		if(!deleteCollection)
		{
			resObj.put("code", "200");
			resObj.put("description", "Stac features requested for deletion: "+total+", deleted: "+deletedSuccess+", failed: "+(total-deletedSuccess));
		}
		if(deleteCollection)
		{	//Deleting collection is not allowed if items are deleted by Id
			if(deleteById)
			{
				resObj.put("code", "200");
				resObj.put("description", "Stac features requested for deletion: "+total+", deleted: "+deletedSuccess+", failed: "+(total-deletedSuccess)+". Deleting collection is not allowed when items are deleted with id list.");	
			}			
			if(!deleteById && deletedSuccess != total)
			{
				resObj.put("code", "200");
				resObj.put("description", "Stac features requested for deletion: "+total+", deleted: "+deletedSuccess+", failed: "+(total-deletedSuccess)+". Collection will not be deleted as some features could not be deleted.");	
				
			}
			if(!deleteById && deletedSuccess == total)
			{
				//Now delete collection which is an item in Collection Index
				try {
					url = client.getTypeUrlForSearch(ec.getCollectionIndexName());			
					response = client.sendDelete(url+"/_doc/"+collectionId);	
					resObj.put("code", "200");
					resObj.put("description", "Stac features requested for deletion: "+total+", deleted: "+deletedSuccess+". Collection is deleted.");
				}catch (Exception e) {					
					LOGGER.error(e.getMessage());
					resObj.put("code", "500");
					resObj.put("description", "Stac features requested for deletion: "+total+", deleted: "+deletedSuccess+" but collection could not be deleted."+e.getCause());
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
         if (theAsset != null) {
          String wkt = theAsset.getEsriWKT();
          requestedCRS = "{\"wkt\": \"" + wkt.replace("\"", "\\\"") + "\"}";
         } else {
           requestedCRS = theCRS;
         }

      } else {
          requestedCRS = theCRS.replace("EPSG:", "");
      }
      LOGGER.debug("requestedCRS = " + requestedCRS);

      return requestedCRS;
  }

  
  /*
   * get the WKT of the CRS from the collection
   *
   * @param collectionObj - the collection to which the item belongs
   * @param outCRS - the requested CRS
   * @param outVCRS - the requested vertical CRS
   *
   * @returns - either the EPSG code, or the WKT definition of the CRS from the collection
  */
  public static String getRequestedCRS(Collection collectionObj, String outCRS, String outVCRS) {    
      // if not EPSG:nnnnn get the esri WKT representation of the CRS and reproject
      // else use just the EPSG code
      String requestedCRS;      
      if (!outCRS.startsWith("EPSG:")) {
    	 
    	  Asset theAsset = collectionObj.getAsset(outCRS);
          if (theAsset != null) {
           String wkt = theAsset.getEsriWKT();
           requestedCRS = "{\"wkt\": \"" + wkt.replace("\"", "\\\"") + "\"}";
          } else {
            requestedCRS = outCRS;
          }
      } else {
          // construct: {"wkid": 0000, "vcsWkid": 000000 }
          String wkid = outCRS.replace("EPSG:", "");
          String vcsWkid = outVCRS.replace("EPSG:", "");
          requestedCRS = "{\"wkid\": " + wkid + ", \"vcsWkid\": " + vcsWkid + " }";
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
	  
	  public static JSONArray generateBbox(JSONObject reqPayload)
	  {
		  JSONArray bbox = null;
		  try {
			  List<String> geometryTypes = Arrays.asList("POINT", "MULTIPOINT", "LINESTRING","MULTILINESTRING", "POLYGON","MULTIPOLYGON");
			  if(reqPayload.containsKey("geometry"))
			  {
				  double minLat = Double.MAX_VALUE, maxLat = Double.MIN_VALUE;
			      double minLng = Double.MAX_VALUE, maxLng = Double.MIN_VALUE;
			      
				  JSONObject geometry = (JSONObject) reqPayload.get("geometry");
				  String type = geometry.getAsString("type");
				  type = type.toUpperCase();
				  if(geometryTypes.contains(type))
				  {
					  JSONArray coordinates = (JSONArray) geometry.get("coordinates"); 
					  if (coordinates!=null && type.equals("POINT")) {
						  	StacContext sc = StacContext.getInstance();
						  	double bboxSize = sc.getStacBboxSize();				  	
						  	double x = (double) coordinates.get(0);
			                double y = (double) coordinates.get(1);
			                
			                minLng = x-(bboxSize/2);
			                maxLng = x +(bboxSize/2);		                		
						  
		                    minLat = y-(bboxSize/2);
		                    maxLat =  y+(bboxSize/2);                    
		                   
		                } else if (coordinates!=null && (type.equals("LINESTRING") || type.equals("MULTIPOINT"))) {	                    
		                    for (int i = 0; i < coordinates.size(); i++) {
		                        JSONArray coord = (JSONArray) coordinates.get(i);
		                        double lng = (double) coord.get(0);
			                    double lat = (double) coord.get(1);
		                        minLat = Math.min(minLat, lat);
		                        maxLat = Math.max(maxLat, lat);
		                        minLng = Math.min(minLng, lng);
		                        maxLng = Math.max(maxLng, lng);
		                    }
		                }
		                else if (coordinates!=null && (type.equals("POLYGON") || type.equals("MULTILINESTRING"))) {	                   
		                    for (int i = 0; i < coordinates.size(); i++) {
		                        JSONArray ring = (JSONArray) coordinates.get(i);
		                        for (int j = 0; j < ring.size(); j++) {
		                            JSONArray coord = (JSONArray) ring.get(j);
		                            double lng = (double) coord.get(0);
		    	                    double lat = (double) coord.get(1);
		                            minLat = Math.min(minLat, lat);
		                            maxLat = Math.max(maxLat, lat);
		                            minLng = Math.min(minLng, lng);
		                            maxLng = Math.max(maxLng, lng);
		                        }
		                    }
		                }
		                else if (coordinates!=null && type.equals("MULTIPOLYGON")){	                  
		                    for (int i = 0; i < coordinates.size(); i++) {
		                         JSONArray polygon = (JSONArray) coordinates.get(i);
		                        for (int j = 0; j < polygon.size(); j++) {
		                            JSONArray ring = (JSONArray) polygon.get(j);
		                            for (int k=0; k<ring.size(); k++){
		                                JSONArray coord = (JSONArray) ring.get(k);
		                                double lng = (double) coord.get(0);
			    	                    double lat = (double) coord.get(1);
		                                minLat = Math.min(minLat, lat);
		                                maxLat = Math.max(maxLat, lat);
		                                minLng = Math.min(minLng, lng);
		                                maxLng = Math.max(maxLng, lng);
		                            }
		                        }
		                    }
		               }				  
					  bbox =  new JSONArray();
					  bbox.add(0,minLng);
					  bbox.add(1,minLat);
					  bbox.add(2,maxLng);
					  bbox.add(3,maxLat);
				  }
				  else
				  {
					 LOGGER.debug("Unsupported geomtery type to generate bbox: "+type);
				  }
			  }
		  }catch(Exception ex)
		  {
			  LOGGER.error("bbox could not be generated "+ex.getMessage());
		  }
		  
		  return bbox;
	  }


}