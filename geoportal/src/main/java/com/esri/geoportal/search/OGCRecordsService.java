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
package com.esri.geoportal.search;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

import org.owasp.esapi.ESAPI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.ResourcePath;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import java.text.Format;
import java.text.SimpleDateFormat;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;

/**
 * OGC API: Records service provider.
 */
@ApplicationPath("ogcrecords")
@Path("")
public class OGCRecordsService extends Application {

	/** Logger. */
	private static final Logger LOGGER = LoggerFactory.getLogger(OGCRecordsService.class);

	@Override
	public Set<Class<?>> getClasses() {
		Set<Class<?>> resources = new HashSet<Class<?>>();
		resources.add(OGCRecordsService.class);
		return resources;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response get(@Context HttpServletRequest hsr) {
		String response = null;
		Status status = Response.Status.OK;
		try {
			response = this.readResourceFile("service/config/ogcrecords-description.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in root level " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			response = this.generateResponse("500", "OGCRecords API Landing Page could not be generated.");
			
		}
		return Response.status(status).entity(response).build();
	}
	
	@GET
	@Path("/api")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getApi(@Context HttpServletRequest hsr) {
		String response = null;
		Status status = Response.Status.OK;
		try {
			response = this.readResourceFile("service/config/ogcrecords-api.json", hsr);
		} catch (Exception e) {
			LOGGER.error("Error in api " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			response = this.generateResponse("500", "OGCRecords API response could not be generated. ");
		}
		return Response.status(status).entity(response).build();
	}

	@GET
	@Path("/conformance")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getConformance(@Context HttpServletRequest hsr) {
		String responseJSON = null;
		Status status = Response.Status.OK;
		try {
			responseJSON = this.readResourceFile("service/config/ogcrecords-conformance.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "OGCRecords API Conformance response could not be generated.");

		}
		return Response.status(status).entity(responseJSON).build();
	}
	

	@GET
	@Path("/collections")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCollections(@Context HttpServletRequest hsr) {
		String responseJSON = null;
		Status status = Response.Status.OK;
		try {
			responseJSON = this.readResourceFile("service/config/ogcrecords-collections.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in collection " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "OGCRecords API collection response could not be generated.");
			
		}
		return Response.status(status).entity(responseJSON).build();
	}

	@GET
	@Path("/collections/metadata/queryables")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCollectionQueryable(@Context HttpServletRequest hsr) {
		String responseJSON = null;
		Status status = Response.Status.OK;
		try {
			responseJSON = this.readResourceFile("service/config/ogcrecords-queryables.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in queryables " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "OGCRecords API queryables response could not be generated.");
		}
		return Response.status(status).entity(responseJSON).build();
	}
	
	@GET
	@Path("/collections/metadata")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCollectionMetadata(@Context HttpServletRequest hsr) {
		String responseJSON = null;
		Status status = Response.Status.OK;
		try {
			responseJSON = this.readResourceFile("service/config/ogcrecords-collection-metadata.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "OGCRecords API collection response could not be generated.");
		}
		return Response.status(status).entity(responseJSON).build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/collections/metadata/items")
	public Response getItems(@Context HttpServletRequest hsr, @QueryParam("limit") int limit,
			@QueryParam("bbox") String bbox, @QueryParam("datetime") String datetime,
			@QueryParam("title") String title,
			@QueryParam("provider") String provider,
			@QueryParam("querydsl") String querydsl,
			@QueryParam("search_after") String search_after)
			throws UnsupportedEncodingException {
		String responseJSON = null;
		String response = "";
		Status status = Response.Status.OK;
		limit = setLimit(limit);

		String query = "";	

		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<String, String>();

			if (bbox != null && bbox.length() > 0)
				queryMap.put("bbox", bbox);
			if (datetime != null && datetime.length() > 0)
				queryMap.put("datetime", datetime);
			if (title != null && title.length() > 0)
				queryMap.put("title", title);
			if (provider != null && provider.length() > 0)
				queryMap.put("provider", provider);
			if (querydsl != null && querydsl.length() > 0)
				queryMap.put("querydsl", querydsl);
			
			url = url + "/_search?size=" + limit;			
			query = this.prepareSearchQuery(queryMap,search_after);	
			
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime,title,provider,querydsl);

		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getMessage());			
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "OGCRecords API Collection metadata items response could not be generated.");
			
		}
		return Response.status(status).entity(responseJSON).build();
	}
	
	@GET
	@Path("collections/metadata/items/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getItem(@Context HttpServletRequest hsr, @PathParam("id") String id) {
		String responseJSON = null;
		String response = "";
		Status status = Response.Status.OK;	
		String query = "";

		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<String, String>();
	
			queryMap.put("ids", "\""+id+"\"");
			url = url + "/_search";

			query = this.prepareSearchQuery(queryMap,null);
			
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareSingleItemResponse(response, hsr);

		} catch (Exception e) {
			LOGGER.error(ESAPI.encoder().encodeForHTML("Error in getting item with item id: "+id+" " + e.getMessage()));
			
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "OGCRecords API Collection metadata item response could not be generated.");

		}
		return Response.status(status).entity(responseJSON).build();
	}
	
	private String prepareSingleItemResponse(String searchRes, HttpServletRequest hsr) {
		
		net.minidev.json.JSONArray items = null;
		String itemFileString = "";		
		String finalResponse = "";
		
		String filePath = "service/config/ogcrecords-item.json";
		
		try {
			itemFileString = this.readResourceFile(filePath, hsr);

			DocumentContext elasticResContext = JsonPath.parse(searchRes);
			
			JsonObject fileObj = (JsonObject) JsonUtil.toJsonStructure(itemFileString);
			String featureTemplateStr = "{\"featurePropPath\":" + fileObj.toString() + "}";
			
			items = elasticResContext.read("$.hits.hits");
		
			DocumentContext featureContext = JsonPath.parse(featureTemplateStr);
			if(items !=null && items.size()>0)
			{
				DocumentContext searchItemCtx = JsonPath.parse(items.get(0));
				
				//Populate feature 
				this.populateFeature(featureContext,searchItemCtx);	
				JsonObject resObj =(JsonObject) JsonUtil.toJsonStructure(featureContext.jsonString());
				finalResponse = resObj.toString();
			}
			else
			{
				finalResponse = this.generateResponse("404", "Record not found.");
			}
			
		} catch (IOException | URISyntaxException e) {
			LOGGER.error("ogcrecords response could not be preapred. "+e.getMessage());			
		}
		return finalResponse;
	}

	
	private String prepareResponse(String searchRes, HttpServletRequest hsr, String bbox, int limit,
			String datetime,String title, String provider,String querydsl) {
		net.minidev.json.JSONArray items = null;
	
		int numberMatched = -1;
		int numberReturned = -1;
		String itemFileString;		
		String finalResponse = "";
		String search_after="";
		String filePath = "service/config/ogcrecords-items.json";
		
		try {
			itemFileString = this.readResourceFile(filePath, hsr);

			DocumentContext elasticResContext = JsonPath.parse(searchRes);
			DocumentContext resourceFilecontext = JsonPath.parse(itemFileString);
			

			JsonObject fileObj = (JsonObject) JsonUtil.toJsonStructure(itemFileString);
			String featureTemplateStr = fileObj.getJsonObject("featurePropPath").toString();
			featureTemplateStr = "{\"featurePropPath\":" + featureTemplateStr + "}";

			numberMatched = elasticResContext.read("$.hits.total.value");
			items = elasticResContext.read("$.hits.hits");
			//numberReturned = String.valueOf(items.size());

      Format formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
      String timestamp = formatter.format(new Date());
			resourceFilecontext.set("$.response.timestamp", timestamp).jsonString();
			resourceFilecontext.set("$.response.numberMatched", numberMatched > -1 ? numberMatched: null);
			
			JSONArray jsonArray = new JSONArray();
			
			for (int i = 0; i < items.size(); i++) {
				DocumentContext featureContext = JsonPath.parse(featureTemplateStr);
				DocumentContext searchItemCtx = JsonPath.parse(items.get(i));
				
				//Populate feature 
				boolean success = this.populateFeature(featureContext,searchItemCtx);			
				if(success)
				{
					jsonArray.add(featureContext.read("$.featurePropPath"));	
					if(i== (items.size()-1))
					{
						JSONArray sortArr = searchItemCtx.read("$.sort");				
						search_after =  sortArr.get(0).toString();
					}		
				}						
			}	
			numberReturned = jsonArray.size(); //String.valueOf(jsonArray.size());
			resourceFilecontext.set("$.response.features", jsonArray);	
			resourceFilecontext.set("$.response.numberReturned", numberReturned > -1 ? numberReturned: null);			
			
			JsonObject obj =(JsonObject) JsonUtil.toJsonStructure(resourceFilecontext.jsonString()); 
			JsonObject resObj =  obj.getJsonObject("response");
			 			
			finalResponse = resObj.toString();
			// Prepare urlparam for next page 	
			
			String urlparam = "limit=" + limit + (search_after != null ? "&search_after=" + search_after : "");
			if(querydsl != null)
			{		
				querydsl = URLEncoder.encode(querydsl,StandardCharsets.UTF_8.toString());
				urlparam = urlparam + "&querydsl=" + querydsl;
			}else
			{
				urlparam = urlparam + (bbox != null ? "&bbox=" + bbox : "")
				+ (datetime != null ? "&datetime=" + datetime : "")
				+ (title != null ? "&title=" + title : "")
				+ (provider != null ? "&provider=" + provider : "");
			}
			
			finalResponse = finalResponse.replaceAll("\\{urlparam\\}", urlparam);
		} catch (IOException | URISyntaxException e) {
			LOGGER.error("ogcrecords response could not be preapred. "+e.getMessage());			
		}
		return finalResponse;
	}


	private boolean populateFeature(DocumentContext featureContext, DocumentContext searchItemCtx) {		
		HashMap<String, String> propObj = featureContext.read("$.featurePropPath.properties");
		Set<String> propObjKeys = propObj.keySet();
		String propKeyVal = "";
		ArrayList<String> propToBeRemovedList = new ArrayList<String>();
		boolean featureValid = true;
		
		try {
		
			String val = featureContext.read("$.featurePropPath.id");
			featureContext.set("$.featurePropPath.id", searchItemCtx.read(val));
	
			val = featureContext.read("$.featurePropPath.collection");
			featureContext.set("$.featurePropPath.collection", searchItemCtx.read(val));
	
			//Links - optional
			val = featureContext.read("$.featurePropPath.links[0].href");
      try {
        featureContext.set("$.featurePropPath.links[0].href", searchItemCtx.read(val));
      } catch (Exception ex) {
        String links[] = {};
        featureContext.set("$.featurePropPath.links[0].href", links);
      }
	
			val = featureContext.read("$.featurePropPath.links[0].title");
      featureContext.set("$.featurePropPath.links[0].title", searchItemCtx.read(val));
			
			//add bbox, geometry
			val = featureContext.read("$.featurePropPath.bbox");
			JSONArray enveloperArr = searchItemCtx.read(val);
			HashMap<String, JSONArray> hm = (HashMap<String, JSONArray>) enveloperArr.get(0);
			
			JSONArray geomArr = (JSONArray) hm.get("coordinates");
			JSONArray geomArr0 = (JSONArray) geomArr.get(0);
			JSONArray geomArr1 = (JSONArray) geomArr.get(1);
							
			Double xmin = Double.parseDouble(geomArr0.get(0).toString());
			Double ymax = Double.parseDouble(geomArr0.get(1).toString());				
					
			Double xmax = Double.parseDouble(geomArr1.get(0).toString());
			Double ymin = Double.parseDouble(geomArr1.get(1).toString());
			
			JSONArray arr = new JSONArray();
			arr.add(xmin);
			arr.add(ymin);
			arr.add(xmax);
			arr.add(ymax);
			featureContext.set("$.featurePropPath.bbox", arr);					
			
      // optional
			val = featureContext.read("$.featurePropPath.geometry");
      try {
  			featureContext.set("$.featurePropPath.geometry", searchItemCtx.read(val));
      } catch (Exception ex) {
        featureContext.set("$.featurePropPath.geometry", null);
      }
				
			//Iterate properties, skip property if it is not available
			for (String propKey : propObjKeys) {
				try {
					propKeyVal = String.valueOf(propObj.get(propKey));
					// If it is a json path, set values from search result
					if (propKeyVal.startsWith("$")) {
						if (searchItemCtx.read(propKeyVal) != null) {
							featureContext.set("$.featurePropPath.properties." + propKey, searchItemCtx.read(propKeyVal));
						}
					}
				} catch (Exception e) {
					// If json path not found or error in any property, remove this property in the
					// end.
					// if removed here, concurrentModificationException
					propToBeRemovedList.add("$.featurePropPath.properties." + propKey);
					LOGGER.trace("key: " + propKey + " could not be added. Reason : " + e.getMessage());
				}
			}
			
		} catch (Exception e) {
			// If json path not found or error in any property, skip this feature
			featureValid = false;
			LOGGER.trace("feature could not be added. Reason : " + e.getMessage());
			System.out.println("feature could not be added. Reason : " + e.getMessage());
		}		
		
		for (String propToRemove : propToBeRemovedList) {
			featureContext.delete(propToRemove);
		}
		return featureValid;
	}
	

	private String prepareSearchQuery(Map<String, String> queryMap, String searchAfter) throws UnsupportedEncodingException {
		String queryStr = "";
		JsonArrayBuilder builder = Json.createArrayBuilder();
		
		if ((queryMap.containsKey("querydsl") && (queryMap.get("querydsl").toString().length()>0))) {
			 queryStr = queryMap.get("querydsl");
			 JsonObject queryObj = (JsonObject) JsonUtil.toJsonStructure(queryStr);
			 queryStr = queryObj.get("query").toString();
			 queryStr = "\"query\":"+queryStr;			
		}
		else
		{
			if (queryMap.containsKey("bbox")) {
				String bboxQry = this.prepareBbox((String) queryMap.get("bbox"));
				if (bboxQry.length() > 0)
					builder.add(JsonUtil.toJsonStructure(bboxQry));

			}
			if (queryMap.containsKey("datetime")) {
				String dateTimeQry = this.prepareDateTime(queryMap.get("datetime"));
				if (dateTimeQry.length() > 0)
					builder.add(JsonUtil.toJsonStructure(dateTimeQry));
			}
			if (queryMap.containsKey("title")) {
				String titleQry = this.prepareTitle(queryMap.get("title"));
				if (titleQry.length() > 0)
					builder.add(JsonUtil.toJsonStructure(titleQry));
			}
			if (queryMap.containsKey("provider")) {
				String providerQry = this.prepareProvider(queryMap.get("provider"));
				if (providerQry.length() > 0)
					builder.add(JsonUtil.toJsonStructure(providerQry));
			}
			if (queryMap.containsKey("ids")) {
				String idsQry = this.prepareIds(queryMap.get("ids"));
				if (idsQry.length() > 0)
					builder.add(JsonUtil.toJsonStructure(idsQry));
			}
			
			JsonArray filter = builder.build();
			
			if (filter.size() > 0) {
				queryStr = "\"query\":{\"bool\": {\"must\":" + JsonUtil.toJson(filter) + "}}";
			}
		}
		//System.out.println("final dsl query string "+queryStr);
		
		String searchAfterStr = "";
		if(searchAfter!= null && searchAfter.length()>0)
		{
			searchAfterStr = "\"search_after\":[\""+searchAfter+"\"]";
		}
				
		String searchQuery = "{\"track_total_hits\":true,\"sort\": {\"_id\": \"asc\"}"
				+(queryStr.length()>0 ? ","+queryStr: "")
				+(searchAfterStr.length()>0 ?","+searchAfterStr : "")+"}";		
		return searchQuery;
	}
	

	private String prepareTitle(String title) {		
		return "{\"match\": {\"title\": \""+title+"\"}}";	
	}
	private String prepareProvider(String provider) {		
		return "{\"match\": {\"sys_owner_s\": \""+provider+"\"}}";	
	}

	private String prepareIds(String ids) {
		return "{\"match\": {\"_id\": "+ids+"}}";	
	}

	private String prepareDateTime(String datetime) {
		String query = "";
		String dateTimeFld = "sys_modified_dt";
		String dateTimeFldQuery = "";
		// Find from and to dates
		// https://api.stacspec.org/v1.0.0/ogcapi-features/#tag/Features/operation/getFeatures
//	Either a date-time or an interval, open or closed. Date and time expressions adhere to RFC 3339. Open intervals are expressed using double-dots.
//	Examples:
//	A date-time: "2018-02-12T23:20:50Z"
//	A closed interval: "2018-02-12T00:00:00Z/2018-03-18T12:31:12Z"
//	Open intervals: "2018-02-12T00:00:00Z/.." or "../2018-03-18T12:31:12Z"

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

	private String prepareBbox(String bboxString) {
		String field = "envelope_geo";
		String spatialType = "geo_shape"; // geo_shape or geo_point
		String relation = "intersects";
		List<String> bbox = Arrays.asList(bboxString.split(",", -1));

		double coords[] = { -180.0, -90.0, 180.0, 90.0 };
		String query = "";
		if (bbox.size() > 3) {
			if ((Double.parseDouble(bbox.get(0)) < -180.0) && (Double.parseDouble(bbox.get(2)) >= -180.0))
				coords[0] = -180.0;
			else
				coords[0] = Double.parseDouble(bbox.get(0));
			if ((Double.parseDouble(bbox.get(1)) < -90.0) && (Double.parseDouble(bbox.get(3)) >= -90.0))
				coords[1] = -90.0;
			else
				coords[1] = Double.parseDouble(bbox.get(1));
			if ((Double.parseDouble(bbox.get(2)) > 180.0) && (Double.parseDouble(bbox.get(0)) <= 180.0))
				coords[2] = 180.0;
			else
				coords[2] = Double.parseDouble(bbox.get(2));
			if ((Double.parseDouble(bbox.get(3)) > 90.0) && (Double.parseDouble(bbox.get(1)) <= 90.0))
				coords[3] = 90.0;
			else
				coords[3] = Double.parseDouble(bbox.get(3));
		}

		if (coords.length > 3) {
			query = "{\"" + spatialType + "\": {\"" + field + "\": {\"shape\": {\"type\": \"envelope\","
					+ "\"coordinates\": [[" + coords[0] + "," + coords[3] + "], [" + coords[2] + "," + coords[1] + "]]"
					+ "},\"relation\": \"" + relation + "\"}}}";
		}
		return query;
	}

	private int setLimit(int limit) {
		if (limit == 0 || limit > 10000) {
			limit = 10; // default
		}
		return limit;
	}
	
	private String generateResponse(String code, String resMsg)
	{	
		net.minidev.json.JSONObject resObj =  new JSONObject();
		resObj.put("code", code);
		resObj.put("description", resMsg);
		
		return resObj.toJSONString();
	}
	

	private String getBaseUrl(HttpServletRequest hsr) {

		StringBuffer requestURL = hsr.getRequestURL();
		String ctxPath = hsr.getContextPath();
		String baseUrl = requestURL.substring(0, requestURL.indexOf(ctxPath) + ctxPath.length());
		return baseUrl + "/ogcrecords";
	}

	private String readResourceFile(String path, HttpServletRequest hsr) throws IOException, URISyntaxException {
		ResourcePath rp = new ResourcePath();
		URI uri = rp.makeUrl(path).toURI();
		String filedataString = new String(Files.readAllBytes(java.nio.file.Path.of(uri)), "UTF-8");

		if (filedataString != null)
			filedataString = filedataString.trim();
		String requestURL = hsr.getRequestURL().toString();
		// Remove last /
		requestURL = requestURL.substring(0, requestURL.length() - 1);

		// Replace {url}
		filedataString = filedataString.replaceAll("\\{url\\}", this.getBaseUrl(hsr));
		return filedataString;
	}

}