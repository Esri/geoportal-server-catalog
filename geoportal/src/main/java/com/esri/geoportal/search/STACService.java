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
import com.esri.geoportal.base.util.exception.InvalidParameterException;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;

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
			response = this.generateResponse("500", "STAC API Landing Page could not be generated.");
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
			responseJSON = this.generateResponse("500", "STAC API Conformance response could not be generated.");

		}
		return Response.status(status).entity(responseJSON).build();

	}
	
	@GET
	@Path("/api")
	@Produces("application/vnd.oai.openapi+json;version=3.0")
	public Response getApi(@Context HttpServletRequest hsr) {
		String responseJSON = null;
		Status status = Response.Status.OK;
		try {
			responseJSON = this.readResourceFile("service/config/stac-api.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in api " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "STAC API api response could not be generated.");

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
                    GeoportalContext gc = GeoportalContext.getInstance();
                    // 518 updates
		    if (!gc.getSupportsCollections()) {
                        // Geoportal not configured for collections
                        // STAC will only have 1 STAC collection 'metadata'
			responseJSON = this.readResourceFile("service/config/stac-collections.json", hsr);
                        responseJSON= responseJSON.replaceAll("\\{collectionId\\}", "metadata");
                    } else {
                        // Geoportal configured for collections
                        // STAC will have collection for each Geoportal collection
                        responseJSON = this.readResourceFile("service/config/stac-collections.json", hsr);
                        JSONObject stacCollections = (JSONObject) JSONValue.parse(responseJSON);
                        JSONArray collectionsArray = (JSONArray) stacCollections.get("collections");
                        JSONObject collectionsTemplate = (JSONObject) collectionsArray.get(0);
                        String collectionsTemplateString = collectionsTemplate.toString();
                        
                        // Get list of collections
                        ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
                        url = url + "/_search";
                        String collectionsSearch = "{\"aggregations\": {\"collections\": {\"terms\": {\"field\": \"src_collections_s\"}}}}";

			String response = client.sendPost(url, collectionsSearch, "application/json");
                        JSONObject gptResponse = (JSONObject) JSONValue.parse(response);  //JsonUtil.toJsonStructure(response);
                        JSONObject gptAggregations = (JSONObject) gptResponse.get("aggregations");
                        JSONObject gptCollections = (JSONObject) gptAggregations.get("collections");
                        JSONArray gptBuckets = (JSONArray) gptCollections.get("buckets");
                        
                        collectionsArray.clear();
                        for (int i = 0; i < gptBuckets.size(); i++) {
                            JSONObject bucket = (JSONObject) gptBuckets.get(i);
                            String collectionName = bucket.getAsString("key");
                            String thisCollectionString = collectionsTemplateString.replace("{collectionId}", collectionName);
                            JSONObject thisCollection = (JSONObject) JSONValue.parse(thisCollectionString);
                            collectionsArray.add(i, JSONValue.parse(thisCollection.toJSONString()));
                        }
                        
                        responseJSON = stacCollections.toString();
                        System.out.println(responseJSON);
                    }

		} catch (Exception e) {
			LOGGER.error("Error in collections " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "STAC API collection response could not be generated.");
		}
		return Response.status(status).entity(responseJSON).build();
	}

	@GET
	@Path("/collections/{collectionId}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCollectionMetadata(@Context HttpServletRequest hsr,
			@PathParam("collectionId") String collectionId) {
		String responseJSON = null;
		Status status = Response.Status.OK;
		try {
                    if(collectionId == null || collectionId.isBlank()) // #518 || !collectionId.equals("metadata"))
                    {
                        status = Response.Status.NOT_FOUND;
                    }			
                    else
                    {
                        responseJSON = this.readResourceFile("service/config/stac-collection-metadata.json", hsr);
                        responseJSON= responseJSON.replaceAll("\\{collectionId\\}", collectionId);
                    }

		} catch (Exception e) {
			LOGGER.error("Error in metadata " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "STAC API collection response could not be generated.");
		}
		return Response.status(status).entity(responseJSON).build();
	}

	@GET
	@Produces("application/geo+json")
	@Path("/collections/{collectionId}/items")
	public Response getItems(@Context HttpServletRequest hsr, 
			@PathParam("collectionId") String collectionId,
			@QueryParam("limit") int limit,
			@QueryParam("bbox") String bbox, @QueryParam("datetime") String datetime,
			@QueryParam("search_after") String search_after)
			throws UnsupportedEncodingException {
		String responseJSON = null;
		String response = "";
		Status status = Response.Status.OK;
		
		String query = "";	

		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<String, String>();
			
			limit = setLimit(limit);

			if (bbox != null && bbox.length() > 0)
				queryMap.put("bbox", bbox);
			if (datetime != null && datetime.length() > 0)
				queryMap.put("datetime", datetime);
                        GeoportalContext gc = GeoportalContext.getInstance();
                        if (gc.getSupportsCollections()) {
                            queryMap.put("collection", collectionId);
                        }
			
			url = url + "/_search?size=" + limit;			
			query = this.prepareSearchQuery(queryMap,search_after);	
			
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime,null,null,
					"metadataItems",collectionId);			

		} catch (InvalidParameterException e) {			
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter "+e.getParameterName()+": "+e.getMessage());
		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "STAC API collection metadata items response could not be generated.");
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}
	
	@GET
	@Path("collections/{collectionId}/items/{id}")
	@Produces("application/geo+json")
	public Response getItem(@Context HttpServletRequest hsr,
			@PathParam("collectionId") String collectionId, @PathParam("id") String id) {
		String responseJSON = null;
		String response = "";
		Status status = Response.Status.OK;	
		String query = "";

		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<String, String>();
	
			queryMap.put("ids", id);
			url = url + "/_search";

			query = this.prepareSearchQuery(queryMap,null);
			
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponseSingleItem(response, hsr,collectionId);
			if(responseJSON.contains("Record not found"))
			{
				status = Response.Status.NOT_FOUND;
			}
			System.out.println(responseJSON);

		} catch (InvalidParameterException e) {			
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter "+e.getParameterName()+": "+e.getMessage());
		} catch (Exception e) {
			LOGGER.error("Error in getting item with item id: "+id+" " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "STAC API collection metadata item with itemid response could not be generated.");
		}
		
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}

	@GET
	@Produces("application/geo+json")
	@Path("/search")
	public Response search(@Context HttpServletRequest hsr, @QueryParam("limit") int limit,
			@QueryParam("bbox") String bbox,
			@QueryParam("intersects") String intersects, 
			@QueryParam("datetime") String datetime, 
			@QueryParam("ids") String idList,
			@QueryParam("collections") String collections,
			@QueryParam("searchAfter") String searchAfter)
			throws UnsupportedEncodingException {
		String responseJSON = null;
		String response = "";
		Status status = Response.Status.OK;
		
		String query = "";
		//TODO implement collections parameter in search
		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<String, String>();	
			
			limit = setLimit(limit);
			if (bbox != null && bbox.length() > 0)
				queryMap.put("bbox", bbox);
			if (datetime != null && datetime.length() > 0)
				queryMap.put("datetime", datetime);
                        GeoportalContext gc = GeoportalContext.getInstance();
                        if ((gc.getSupportsCollections() && collections != null && !collections.isEmpty())) {
                            String listOfCollections = collections.replace("[", "").replace("]", "").replace("\"", "");
                            queryMap.put("collection", listOfCollections);                            
                        }
			if(idList != null && idList.length() >0)
			{
                            //"LC80100252015082LGN00,LC80100252014287LGN00"
                            if(!idList.contains("["))
                                queryMap.put("ids", idList);				
			}
			
			if(intersects != null && intersects.length() >0)
				queryMap.put("intersects", intersects);
			
			url = url + "/_search?size=" + limit;

			query = this.prepareSearchQuery(queryMap,searchAfter);
			System.out.println("final query "+query);
			
			if (query.length() > 0)
			{
				response = client.sendPost(url, query, "application/json");
			}
			else
			{
				response = client.sendGet(url);
			}
			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime,idList,intersects,"search","metadata");
			

		} catch (InvalidParameterException e) {			
			status = Response.Status.BAD_REQUEST;
			System.out.println("Parameter "+e.getParameterName()+": "+e.getMessage());
			responseJSON = this.generateResponse("400", "Parameter "+e.getParameterName()+": "+e.getMessage());
		
		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "STAC API collection search items response could not be generated.");
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}	
	

	@POST
	@Produces("application/geo+json")
	@Path("/search")
	@Consumes({MediaType.APPLICATION_JSON,MediaType.TEXT_PLAIN,MediaType.WILDCARD})
	public Response search(@Context HttpServletRequest hsr,@RequestBody String body,
			@QueryParam("search_after") String search_after)
			throws UnsupportedEncodingException {
		String responseJSON = null;
		String response = "";
		Status status = Response.Status.OK;
		//System.out.println(body);
		JsonObject requestPayload = (JsonObject) JsonUtil.toJsonStructure(body);
		
		int limit = (requestPayload.containsKey("limit") ? requestPayload.getInt("limit"): 0);	
		String datetime = (requestPayload.containsKey("datetime") ? requestPayload.getString("datetime"): null);
		
		JsonArray bboxJsonArr = (requestPayload.containsKey("bbox") ? requestPayload.getJsonArray("bbox"): null);			
		JsonArray idArr= (requestPayload.containsKey("ids") ? requestPayload.getJsonArray("ids"): null);	
		
		//TODO implement collection parameter in search
		JsonArray collectionArr = (requestPayload.containsKey("collections") ? requestPayload.getJsonArray("collections"): null);	
				
		JsonObject intersects = (requestPayload.containsKey("intersects") ? requestPayload.getJsonObject("intersects"): null);		
		
		String query = "";
		String bbox="";
		String ids="";

		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<>();
			limit = setLimit(limit);	
			
			if (bboxJsonArr != null && !bboxJsonArr.isEmpty()) {
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

			if (idArr != null && !idArr.isEmpty()) {
				// ["LC80100252015082LGN00","LC80100252014287LGN00"]
				for (int i = 0; i < idArr.size(); i++) {
					if (i > 0)
						ids = ids + "," + idArr.getString(i);
					else
						ids = ids + idArr.getString(i);
				}
				queryMap.put("ids", ids);
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

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime,ids,
					(intersects!=null ?intersects.toString():""),"searchPost","metadata");

		} catch (InvalidParameterException e) {			
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter "+e.getParameterName()+": "+e.getMessage());
		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500", "STAC API collection search items response could not be generated.");			
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}

	//Prepare response for a single feature
	private String prepareResponseSingleItem(String searchRes, HttpServletRequest hsr,String collectionId) {
		
		net.minidev.json.JSONArray items = null;
		String itemFileString = "";		
		String finalResponse = "";
		
		String filePath = "service/config/stac-item.json";
		
		try {
			itemFileString = this.readResourceFile(filePath, hsr);

			DocumentContext elasticResContext = JsonPath.parse(searchRes);
			
			JsonObject fileObj = (JsonObject) JsonUtil.toJsonStructure(itemFileString);	
			String featureTemplateStr = "{\"featurePropPath\":" + fileObj.toString() + "}";

			items = elasticResContext.read("$.hits.hits");
			
			DocumentContext featureContext = JsonPath.parse(featureTemplateStr);
			if(items != null && items.size()>0)
			{
				DocumentContext searchItemCtx = JsonPath.parse(items.get(0));
				
				//Populate feature 
				 this.populateFeature(featureContext,searchItemCtx);
				 JsonObject obj =(JsonObject) JsonUtil.toJsonStructure(featureContext.jsonString()); 
				 JsonObject resObj =  obj.getJsonObject("featurePropPath");
				 			
				 finalResponse = resObj.toString();
			}
			else
			{
				finalResponse = this.generateResponse("404", "Record not found.");
				
			}
			finalResponse = finalResponse.replaceAll("\\{collectionId\\}", collectionId);
					
		} catch (IOException | URISyntaxException e) {
			LOGGER.error("Stac response for stac-item could not be preapred. "+e.getMessage());
			e.printStackTrace();
		}
		return finalResponse;
	}

	
	private String prepareResponse(String searchRes, HttpServletRequest hsr, String bbox, int limit,
                                       String datetime,String ids, String intersects,String requestType,String collectionId) {
		int numberMatched;
                @SuppressWarnings("UnusedAssignment")
		net.minidev.json.JSONArray items = null;
	
                @SuppressWarnings("UnusedAssignment")
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
						try {
							JSONArray sortArr = searchItemCtx.read("$.sort");
							search_after = sortArr.get(0).toString();
						} catch (Exception e) {
							search_after = null;
						}
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
			if (intersects !=null && !intersects.isBlank()) {
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

			finalResponse = finalResponse.replaceAll("\\{collectionId\\}", collectionId);
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
		
		ArrayList<String> propToBeRemovedList = new ArrayList<>();
		ArrayList<String> assetToBeRemovedList = new ArrayList<>();
		boolean featureValid = true;
		
		try {
		
			String val = featureContext.read("$.featurePropPath.id");
			String recordId = searchItemCtx.read(val);
			featureContext.set("$.featurePropPath.id", searchItemCtx.read(val));
	
			val = featureContext.read("$.featurePropPath.collection");
			featureContext.set("$.featurePropPath.collection", searchItemCtx.read(val));
						
			//add bbox, geometry				
			this.setBbox(searchItemCtx,featureContext);		
			
			this.setGeometry(searchItemCtx,featureContext);
			
			
			//Fill asset
			HashMap<String, JSONObject> assetsObj = featureContext.read("$.featurePropPath.assets");
			Set<String> assetsObjKeys = assetsObj.keySet();		
			
			//Iterate Assets
			HashMap<String, Object> assetObj = null;
			String assetObjKeyVal ="";
			for (String assetsObjKey : assetsObjKeys) {
				try {
					assetObj = assetsObj.get(assetsObjKey);
					Set<String> assetObjKeys = assetObj.keySet();
					
					for (String assetObjKey : assetObjKeys) {
						 assetObjKeyVal = String.valueOf(assetObj.get(assetObjKey));
						
						// If it is a json path, set values from search result
						if (assetObjKeyVal.startsWith("$")) {
							if (searchItemCtx.read(assetObjKeyVal) != null) {
								featureContext.set("$.featurePropPath.assets." + assetsObjKey+"."+assetObjKey, searchItemCtx.read(assetObjKeyVal));
							}
						}
					}
					
				} catch (Exception e) {
					// If json path not found or error in any asset, remove this asset in the
					// end.if removed here, concurrentModificationException
					assetToBeRemovedList.add("$.featurePropPath.assets." + assetsObjKey);
					LOGGER.trace("key: " + assetsObjKey + " could not be added. Reason : " + e.getMessage());
				}
			}
			
			//Add all the assets from stac record, if available
			try {				 
				 HashMap<String, JSONObject> stacRecAssetObj = searchItemCtx.read("$._source.assets");
				 assetsObj = featureContext.read("$.featurePropPath.assets");
				 if(stacRecAssetObj != null)
				 {
					 Set<String> stacRecAssetObjKeys = stacRecAssetObj.keySet();	
				 
					 for (String stacRecAssetObjKey : stacRecAssetObjKeys) {					 
						 assetsObj.put(stacRecAssetObjKey,searchItemCtx.read("$._source.assets."+stacRecAssetObjKey,JSONObject.class));
					 }
					 featureContext.set("$.featurePropPath.assets",assetsObj);
				 }
			}//if json path ($._source.assets) not found,catch exception and ignore
			catch(Exception e)
			{
				LOGGER.trace("No assets ($._source.assets) in this Stac record with id: "+recordId);
				
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
			
			String linkSelfHref = featureContext.read("$.featurePropPath.links[0].href");
			linkSelfHref = linkSelfHref.replaceAll("\\{itemId\\}", featureContext.read("$.featurePropPath.id"));
			featureContext.set("$.featurePropPath.links[0].href",linkSelfHref);
			
		} catch (Exception e) {
			// If json path not found or error in any property, skip this feature
			featureValid = false;
			LOGGER.trace("feature could not be added. Reason : " + e.getMessage());
		//	System.out.println("feature could not be added. Reason : " + e.getMessage());
		}		
		
		for (String propToRemove : propToBeRemovedList) {
			featureContext.delete(propToRemove);
		}
		for (String assetToRemove : assetToBeRemovedList) {			
			featureContext.delete(assetToRemove);
		}
		return featureValid;
	}
	

	private void setGeometry(DocumentContext searchItemCtx, DocumentContext featureContext) {
		net.minidev.json.JSONArray valArr = featureContext.read("$.featurePropPath.geometry");
		String geometryProp = "";		
		try {
			if(!valArr.isEmpty())
			{
				geometryProp = (String) valArr.get(0);							
				featureContext.set("$.featurePropPath.geometry", searchItemCtx.read(geometryProp));	
			}
		}
		catch(Exception ex)
		{
			//If first path does not work, try second one
			if(valArr.size() >1)
			{
				geometryProp = (String) valArr.get(1);
				featureContext.set("$.featurePropPath.geometry", searchItemCtx.read(geometryProp));				
			}
		}
	}

	private void setBbox(DocumentContext searchItemCtx, DocumentContext featureContext) {
            net.minidev.json.JSONArray valArr = featureContext.read("$.featurePropPath.bbox");
            String bboxProp = "";
            if(!valArr.isEmpty())
            {
                bboxProp = (String) valArr.get(0);
                if(!bboxProp.isBlank() && bboxProp.contains("envelope_geo"))
                {
                    this.setBboxAsEnvelopGeo(searchItemCtx,featureContext,bboxProp);				
                }			
                else if(!bboxProp.isBlank() && bboxProp.contains("bbox"))
                {				
                    this.setBboxAsBbox(searchItemCtx, featureContext, bboxProp);
                }
            }
            if(valArr.size() >1)
            {
                bboxProp = (String) valArr.get(1);
                if(!bboxProp.isBlank() && bboxProp.contains("envelope_geo"))
                {
                    this.setBboxAsEnvelopGeo(searchItemCtx,featureContext,bboxProp);				
                }			
                else if(!bboxProp.isBlank() && bboxProp.contains("bbox"))
                {				
                    this.setBboxAsBbox(searchItemCtx, featureContext, bboxProp);
                }				
            }		
	}

	private void setBboxAsEnvelopGeo(DocumentContext searchItemCtx, DocumentContext featureContext, String bboxProp) {
            try {
                JSONArray enveloperArr = searchItemCtx.read(bboxProp);

                //"envelope_geo":[{"type":"envelope","ignore_malformed":"true","coordinates":[[-127.0236257875064,64.01274197384028],[-125.569240728746,63.020232862518167]]}]
                if(enveloperArr !=null)
                {
                    @SuppressWarnings("unchecked")
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
                }		
            }catch(Exception ex)		
            {
                    //DO nothing. Just skip
            }		
	}
	
	private void setBboxAsBbox(DocumentContext searchItemCtx, DocumentContext featureContext, String bboxProp) {
            try {
                //"bbox": [-74.09957050999664,-4.611277442089833,-73.1088539899217,-3.6165503784726664]
                featureContext.set("$.featurePropPath.bbox", searchItemCtx.read(bboxProp));
            } catch(Exception ex) {
                //DO nothing. Just skip
            }
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
			System.out.println("ids "+idsQry);
			
			if (idsQry.length() > 0)
				builder.add(JsonUtil.toJsonStructure(idsQry));
		}
		
		if (queryMap.containsKey("intersects")) {
                    String intersectsQry = this.prepareIntersects(queryMap.get("intersects"));
                    if (intersectsQry.length() > 0)
                        builder.add(JsonUtil.toJsonStructure(intersectsQry));
		}
                
		if (queryMap.containsKey("collection")) {
                    List<String> clauses = this.prepareCollection(queryMap.get("collection"));
                    if (!clauses.isEmpty()) {
                        for (String clause : clauses) {
                            builder.add(JsonUtil.toJsonStructure(clause));                        
                        }
                    }
		}
		
		JsonArray filter = builder.build();
		
		if (!filter.isEmpty()) {
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
//{"type": "GeometryCollection", "geometries": [{"type": "Point", "coordinates": [100.0, 0.0]}, {"type": "LineString", "coordinates": [[101.0, 0.0], [102.0, 1.0]]}]}
	private String prepareIntersects(String geoJson) {
		String query =""; 
		String field = "shape_geo";
		String spatialType = "geo_shape"; 
		String relation = "intersects";
		
		query = "{\"" + spatialType + "\": {\"" + field + "\": {\"shape\": "+geoJson+ ",\"relation\": \"" + relation + "\"}}}";
		return query;
	}

	private String prepareIds(String ids) {		
		return "{\"match\": {\"id\": \""+ids+"\"}}";	
	}

	private String prepareDateTime(String datetime) {
		String query = "";
		String dateTimeFld = "sys_modified_dt";
		String dateTimeFldQuery = "";
		// Find from and to dates
		// https://api.stacspec.org/v1.0.0/ogcapi-features/#tag/Features/operation/getFeatures
                // Either a date-time or an interval, open or closed. Date and time expressions adhere to RFC 3339. Open intervals are expressed using double-dots.
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

	private String prepareBbox(String bboxString) {
		String field = "envelope_geo";
		String spatialType = "geo_shape"; // geo_shape or geo_point
		String relation = "intersects";
		List<String> bbox = Arrays.asList(bboxString.split(",", -1));

		double coords[] = { -180.0, -90.0, 180.0, 90.0 };
		String query = "";
		//As per stac API validator, invalid bbox should respond with 400, instead of reaplcing it with defaults
		if (bbox.size()==4 || bbox.size()==6) {			
                    coords[0] = Double.parseDouble(bbox.get(0));		
                    coords[1] = Double.parseDouble(bbox.get(1));			
                    coords[2] = Double.parseDouble(bbox.get(2));			
                    coords[3] = Double.parseDouble(bbox.get(3));
                    String coordinates = "[[" + coords[0] + "," + coords[3] + "], [" + coords[2] + "," + coords[1] + "]]";
                    if(bbox.size()==6)
                    {
                        coords[4] = Double.parseDouble(bbox.get(4));			
                        coords[5] = Double.parseDouble(bbox.get(5));
                    }

                    query = "{\"" + spatialType + "\": {\"" + field + "\": {\"shape\": {\"type\": \"envelope\","
                            + "\"coordinates\":"+coordinates 
                            + "},\"relation\": \"" + relation + "\"}}}";
                    return query;
		}
		else
		{
                    throw new InvalidParameterException("bbox", "Invalid bbox");
		}
	}

	private List<String> prepareCollection(String collections) {
            String[] collectionList = collections.split(",");
            List<String> clauses = new ArrayList<>();
            for (String collectionId : collectionList) {
                clauses.add("{\"match\": {\"src_collections_s\": \""+collectionId+"\"}}");
            }
            return clauses;	
	}

        private int setLimit(int limit) {
            if(limit ==0)
            {
                    limit = 10; //default
            }
            if (limit < 0 || limit > 10000) {
                    throw new InvalidParameterException("limit", "limit can only be between 1 and 10000");
            }
            return limit;
	}

	public String getBaseUrl(HttpServletRequest hsr) {

		StringBuffer requestURL = hsr.getRequestURL();
		String ctxPath = hsr.getContextPath();
                String urlScheme = hsr.getScheme();
                String urlServerName = hsr.getServerName();
                int urlPort = hsr.getServerPort();
		String baseUrl;

		if (ctxPath.length() > 0) {
        	    baseUrl = requestURL.substring(0, requestURL.indexOf(ctxPath) + ctxPath.length());
		} else {
        	    baseUrl = urlScheme + "://" + urlServerName;
                    if ((urlPort != 80) && (urlPort != 443)) {
                        baseUrl += ":" + urlPort;
                }
		}                
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
	
	private String generateResponse(String code, String resMsg)
	{	
		net.minidev.json.JSONObject resObj =  new JSONObject();
		resObj.put("code", code);
		resObj.put("description", resMsg);
		
		return resObj.toJSONString();
	}

}
