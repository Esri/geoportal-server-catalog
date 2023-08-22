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
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.ResourcePath;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import net.minidev.json.JSONArray;

/**
 * STAC API: Records service provider.
 */
@ApplicationPath("stac")
@Path("")
public class STACService extends Application {

	/** Logger. */
	private static final Logger LOGGER = LoggerFactory.getLogger(STACService.class);

	@Override
	public Set<Class<?>> getClasses() {
		Set<Class<?>> resources = new HashSet<Class<?>>();
		resources.add(STACService.class);
		return resources;
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response get(@Context HttpServletRequest hsr) {
		String response = null;
		Status status = Response.Status.OK;
		try {
			response = this.readResourceFile("service/config/stac-description.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in root level " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			response = ("{\"error\":\"STAC API Landing Page could not be generated.\"}");
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
			responseJSON = this.readResourceFile("service/config/stac-conformance.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;

			responseJSON = ("{\"error\":\"STAC API Conformance response could not be generated.\"}");

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
			responseJSON = this.readResourceFile("service/config/stac-collections.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in collections " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API collection response could not be generated.\"}");
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
			responseJSON = this.readResourceFile("service/config/stac-collection-metadata.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in metadata " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API collection response could not be generated.\"}");
		}
		return Response.status(status).entity(responseJSON).build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/collections/metadata/items")
	public Response getItems(@Context HttpServletRequest hsr, @QueryParam("limit") int limit,
			@QueryParam("bbox") String bbox, @QueryParam("datetime") String datetime, @QueryParam("search_after") String search_after)
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
			
			url = url + "/_search?size=" + limit;			
			query = this.prepareSearchQuery(queryMap,search_after);	
			
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime,null,null,"metadataItems");

		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API Collection metadata items response could not be generated.\"}");
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
			//System.out.println("final query "+query);
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, null, 1, null,null,null,"metadataItemId");

		} catch (Exception e) {
			LOGGER.error("Error in getting item with item id: "+id+" " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API Collection metadata item response could not be generated.\"}");
		}
		return Response.status(status).entity(responseJSON).build();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/search")
	public Response search(@Context HttpServletRequest hsr, @QueryParam("limit") int limit,
			@QueryParam("bbox") String bbox,
			@QueryParam("intersects") String intersects, 
			@QueryParam("datetime") String datetime, 
			@QueryParam("ids") String idList,
			@QueryParam("searchAfter") String searchAfter)
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
			
			if(idList != null && idList.length() >0)
			{
				//"LC80100252015082LGN00,LC80100252014287LGN00"
				if(idList.indexOf("[")<0)
					queryMap.put("ids", idList);				
			}
			
			if(intersects != null && intersects.length() >0)
				queryMap.put("intersects", intersects);

			
			url = url + "/_search?size=" + limit;

			query = this.prepareSearchQuery(queryMap,searchAfter);
			System.out.println("final query "+query);
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime,idList,intersects,"search");

		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API Collection search response could not be generated.\"}");
		}
		return Response.status(status).entity(responseJSON).build();
	}
	
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/search")
	@Consumes({MediaType.APPLICATION_JSON,MediaType.TEXT_PLAIN,MediaType.WILDCARD})
	public Response search(@Context HttpServletRequest hsr,@RequestBody String body, @QueryParam("search_after") String search_after)
			throws UnsupportedEncodingException {
		String responseJSON = null;
		String response = "";
		Status status = Response.Status.OK;
		//System.out.println(body);
		JsonObject requestPayload = (JsonObject) JsonUtil.toJsonStructure(body);
		
		int limit = (requestPayload.containsKey("limit") ? requestPayload.getInt("limit"): 0);
		limit = setLimit(limit);		
	
		String datetime = (requestPayload.containsKey("datetime") ? requestPayload.getString("datetime"): null);
		
		JsonArray bboxJsonArr = (requestPayload.containsKey("bbox") ? requestPayload.getJsonArray("bbox"): null);			
		JsonArray idArr= (requestPayload.containsKey("ids") ? requestPayload.getJsonArray("ids"): null);	
				
		JsonObject intersects = (requestPayload.containsKey("intersects") ? requestPayload.getJsonObject("intersects"): null);		
		
		String query = "";
		String bbox="";
		String ids="";

		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<String, String>();

			if (bboxJsonArr != null && bboxJsonArr.size() > 0) {
				for (int i = 0; i < bboxJsonArr.size(); i++) {
					if (i > 0)
						bbox = bbox + "," + bboxJsonArr.get(i);
					else
						bbox = bbox + bboxJsonArr.get(i);
				}
				queryMap.put("bbox", bbox);
			}

			if (datetime != null && datetime.length() > 0) {
				queryMap.put("datetime", datetime);
			}

			if (idArr != null && idArr.size() > 0) {
				// ["LC80100252015082LGN00","LC80100252014287LGN00"]
				for (int i = 0; i < idArr.size(); i++) {
					if (i > 0)
						ids = ids + "," + idArr.getString(i);
					else
						ids = ids + idArr.getString(i);
				}
				queryMap.put("ids", "\"" + ids + "\"");
			}

			if (intersects != null && !intersects.isEmpty()) {
				queryMap.put("intersects", intersects.toString());
			}

			url = url + "/_search?size=" + limit;
			query = this.prepareSearchQuery(queryMap,search_after);
			System.out.println("final query "+query);
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime,ids,intersects.toString(),"searchPost");

		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API Collection metadata search response could not be generated.\"}");
		}
		return Response.status(status).entity(responseJSON).build();
	}

	
	private String prepareResponse(String searchRes, HttpServletRequest hsr, String bbox, int limit,
			String datetime,String ids, String intersects,String requestType) {
		int numberMatched;
		net.minidev.json.JSONArray items = null;
	
		String numberReturned = "";
		String itemFileString = "";		
		String finalResponse = "";
		String search_after="";
		String filePath = "service/config/stac-items.json";
		
		try {
			itemFileString = this.readResourceFile(filePath, hsr);

			DocumentContext elasticResContext = JsonPath.parse(searchRes);
			DocumentContext resourceFilecontext = JsonPath.parse(itemFileString);
			DocumentContext linksContext = JsonPath.parse(this.readResourceFile(resourceFilecontext.read("$.response.links"), hsr));

			JsonObject fileObj = (JsonObject) JsonUtil.toJsonStructure(itemFileString);
			String featureTemplateStr = fileObj.getJsonObject("featurePropPath").toString();
			featureTemplateStr = "{\"featurePropPath\":" + featureTemplateStr + "}";

			numberMatched = elasticResContext.read("$.hits.total.value");
			items = elasticResContext.read("$.hits.hits");
			//numberReturned = String.valueOf(items.size());

			resourceFilecontext.set("$.response.timestamp", new Date().toString()).jsonString();
			resourceFilecontext.set("$.response.numberMatched", "" + numberMatched);
				
			
			if(requestType.startsWith("metadataItems"))
				resourceFilecontext.set("$.response.links",linksContext.read("$.metadataItem.links"));
			
			if(requestType.startsWith("search"))
				resourceFilecontext.set("$.response.links",linksContext.read("$.searchItem.links"));
			
			if(requestType.startsWith("metadataItemId"))
				resourceFilecontext.set("$.response.links",linksContext.read("$.metadataItemId.links"));
			
			
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
			numberReturned = String.valueOf(jsonArray.size());
			resourceFilecontext.set("$.response.features", jsonArray);	
			resourceFilecontext.set("$.response.numberReturned", "" + numberReturned);			
			
			JsonObject obj =(JsonObject) JsonUtil.toJsonStructure(resourceFilecontext.jsonString()); 
			JsonObject resObj =  obj.getJsonObject("response");
			 			
			finalResponse = resObj.toString();
			// Prepare urlparam for next page 	
			
			String encodedIntersect=null;
			if (intersects != null) {
				if (intersects.contains("%")) {
					encodedIntersect = intersects;
				} else {
					encodedIntersect = URLEncoder.encode(intersects, StandardCharsets.UTF_8.toString());
				}
			}	
			String urlparam="";
			if (requestType.equalsIgnoreCase("searchPost")) {
				//In post request, other parameters will be part of request body
				urlparam = (search_after != null ? "search_after=" + search_after : "");

			} else {
				urlparam = "limit=" + limit + (bbox != null ? "&bbox=" + bbox : "")
						+ (datetime != null ? "&datetime=" + datetime : "")
						+ (search_after != null ? "&search_after=" + search_after : "")
						+ (encodedIntersect != null ? "&intersects=" + encodedIntersect : "")
						+ (ids != null ? "&ids=" + ids : "");
			}
			 

			finalResponse = finalResponse.replaceAll("\\{urlparam\\}", urlparam);
		} catch (IOException | URISyntaxException e) {
			LOGGER.error("Stac response could not be preapred. "+e.getMessage());
			e.printStackTrace();
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
	
			val = featureContext.read("$.featurePropPath.assets.href");
			featureContext.set("$.featurePropPath.assets.href", searchItemCtx.read(val));
	
			val = featureContext.read("$.featurePropPath.assets.title");
			featureContext.set("$.featurePropPath.assets.title", searchItemCtx.read(val));
			
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
			
			val = featureContext.read("$.featurePropPath.geometry");
			featureContext.set("$.featurePropPath.geometry", searchItemCtx.read(val));
			
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
			//System.out.println("feature could not be added. Reason : " + e.getMessage());
		}		
		
		for (String propToRemove : propToBeRemovedList) {
			featureContext.delete(propToRemove);
		}
		return featureValid;
	}
	

	private String prepareSearchQuery(Map<String, String> queryMap, String searchAfter) {
		String queryStr = "";
		JsonArrayBuilder builder = Json.createArrayBuilder();

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
		if (queryMap.containsKey("ids")) {
			String idsQry = this.prepareIds(queryMap.get("ids"));
			if (idsQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(idsQry));
		}
		
		if (queryMap.containsKey("intersects")) {
			String intersectsQry = this.prepareIntersects(queryMap.get("intersects"));
			if (intersectsQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(intersectsQry));
		}
		
		JsonArray filter = builder.build();
		
		if (filter.size() > 0) {
			queryStr = "\"query\":{\"bool\": {\"must\":" + JsonUtil.toJson(filter) + "}}";
		}
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

	private String prepareIntersects(String geoJson) {
		String query =""; 
		String field = "shape_geo";
		String spatialType = "geo_shape"; 
		String relation = "intersects";
		JsonObject obj = (JsonObject) JsonUtil.toJsonStructure(geoJson);		
		
		query = "{\"" + spatialType + "\": {\"" + field + "\": {\"shape\": {\"type\": \""+obj.getString("type")+"\","
				+ "\"coordinates\":"+ obj.get("coordinates")
				+ "},\"relation\": \"" + relation + "\"}}}";
		return query;
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

	

	public String getBaseUrl(HttpServletRequest hsr) {

		StringBuffer requestURL = hsr.getRequestURL();
		String ctxPath = hsr.getContextPath();
		String baseUrl = requestURL.substring(0, requestURL.indexOf(ctxPath) + ctxPath.length());
		return baseUrl + "/stac";
	}

	public String readResourceFile(String path, HttpServletRequest hsr) throws IOException, URISyntaxException {
		ResourcePath rp = new ResourcePath();
		URI uri = rp.makeUrl(path).toURI();
		String filedataString = new String(Files.readAllBytes(Paths.get(uri)), "UTF-8");

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
