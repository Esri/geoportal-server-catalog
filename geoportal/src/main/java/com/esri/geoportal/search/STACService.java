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
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.PATCH;
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
import com.esri.geoportal.service.stac.Collection;
import com.esri.geoportal.service.stac.GeometryServiceClient;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
import java.util.logging.Level;

import net.minidev.json.JSONObject;
import net.minidev.json.JSONValue;
import net.minidev.json.JSONArray;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;


/**
 * STAC API service provider.
 */

/**
 * @author cont_anki
 *
 */
@ApplicationPath("stac")
@Path("")
public class STACService extends Application {

	private static final Logger LOGGER = LoggerFactory.getLogger(STACService.class);
	private final ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
	private final GeoportalContext gc = GeoportalContext.getInstance();
	private final ElasticClient client = ElasticClient.newClient();
  private final GeometryServiceClient geometryClient = new GeometryServiceClient(gc.getGeometryService());

  private final String INTERNAL_CRS = "EPSG:4326";
  
	
	@Override
	public Set<Class<?>> getClasses() {
		Set<Class<?>> resources = new HashSet<>();
		resources.add(STACService.class);
		return resources;
	}

  /**
   *
   * @param hsr
   * @return
   */
  @GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response get(@Context HttpServletRequest hsr) {
		String response;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		try {
			response = this.readResourceFile("service/config/stac-description.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in root level " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			response = this.generateResponse("500", "STAC API Landing Page could not be generated.",detailErrArray);
		}
		return Response.status(status).entity(response).build();
	}

	@GET
	@Path("/conformance")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getConformance(@Context HttpServletRequest hsr) {
		String responseJSON;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		try {
			responseJSON = this.readResourceFile("service/config/stac-conformance.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500", "STAC API Conformance response could not be generated.", detailErrArray);

		}
		return Response.status(status).entity(responseJSON).build();

	}

	@GET
	@Path("/api")
	@Produces("application/vnd.oai.openapi+json;version=3.0")
	public Response getApi(@Context HttpServletRequest hsr) {
		String responseJSON;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		try {
			responseJSON = this.readResourceFile("service/config/stac-api.json", hsr);

		} catch (Exception e) {
			LOGGER.error("Error in api " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500", "STAC API api response could not be generated.",detailErrArray);
		}
		return Response.status(status).entity(responseJSON).build();
	}

	@GET
	@Path("/collections")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCollections(@Context HttpServletRequest hsr, 
          @QueryParam("outCRS") String outCRS) {
    
		String responseJSON;
		String finalresponse = "";
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		
		try {			
			// 518 updates
			if (!gc.getSupportsCollections()) {
				// Geoportal not configured for collections
				// STAC will only have 1 STAC collection 'metadata'
				responseJSON = this.readResourceFile("service/config/stac-collections.json", hsr);
				responseJSON = responseJSON.replaceAll("\\{collectionId\\}", "metadata");
        
			} else {
				// Geoportal configured for collections
				// STAC will have collection for each Geoportal collection
				responseJSON = this.readResourceFile("service/config/stac-collections.json", hsr);
				
				JSONObject stacCollections = (JSONObject) JSONValue.parse(responseJSON);
				// Get list of collections
				JSONArray collectionsArray = StacHelper.getCollectionList();
        
        // if reprojecting STAC geometries is supported and a
        // geometry service has been configured, try projecting 
        // from internal CRS (4326) to requested outCRS
        if ((outCRS != null) && ("true".equals(gc.isCanStacGeomTransform())) && (!gc.getGeometryService().isEmpty())) {
          LOGGER.debug("outCRS = " + outCRS + " - " + gc.getGeometryService());

          // get the features from the response
          JSONParser jsonParser = new JSONParser();
          JSONArray responseObject = (JSONArray) jsonParser.parse(collectionsArray.toString());

          // each feature is a STAC item that needs projecting
          for (int i=0; i<responseObject.size(); i++) {
            JSONObject collectionObj = (JSONObject) responseObject.get(i);

            // get the collection metadata
            Collection theCollection = new Collection(collectionObj);
            List<String> availableCRS = theCollection.getAvailableCRS();

            if ((availableCRS.contains(outCRS)) || (outCRS.startsWith("EPSG:"))) {
              JSONObject responseJSONObject = projectCollectionGeometries(collectionObj.toString(), "4326", outCRS);
              collectionsArray.set(i, responseJSONObject);
            }
            else {
              // set internal CRS EPSG:4326 as default for output
              collectionObj.put("outCRS", INTERNAL_CRS);
              collectionsArray.set(i, collectionObj);

              LOGGER.warn("Requested CRS (" + outCRS + ") not available for collection " 
                      + collectionObj.getAsString("id") 
                      + ". Output provided in native CRS.");          
            }
          }
        }

				stacCollections.put("collections", collectionsArray);
				finalresponse = stacCollections.toString();
				finalresponse =  finalresponse.replaceAll("\\{url\\}", this.getBaseUrl(hsr));								
			}

		} catch (Exception e) {
			LOGGER.error("Error in collections " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500", "STAC API collection response could not be generated.",detailErrArray);
		}
		return Response.status(status).entity(finalresponse).build();
	} 

  
	@POST
	@Path("/collections")
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN })
	public Response addCollection(@Context HttpServletRequest hsr,@RequestBody String body) {	
		String responseJSON;
		Status status = null;
		JSONArray detailErrArray = new JSONArray();
		
		try {
			JSONObject requestPayload = (JSONObject) JSONValue.parse(body);
			StacItemValidationResponse validationStatus = StacHelper.validateStacCollection(requestPayload,false);
			if(validationStatus.getCode().equals(StacItemValidationResponse.ITEM_VALID))
			{
				String id = requestPayload.get("id").toString();			
				String collectionUrlElastic = client.getItemUrl(ec.getCollectionIndexName(),ec.getActualItemIndexType(), id);
				responseJSON = client.sendPut(collectionUrlElastic, body, "application/json");	
			}			
			else
			{
				//response json will contain details about validation error like required fields
				status = Response.Status.BAD_REQUEST;
				responseJSON = generateResponse(validationStatus.getCode(), validationStatus.getMessage(),null);
			}	
			
		} catch (Exception e) {
			LOGGER.error("Error in adding collections " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500", "Stac collection could not be added.",detailErrArray);
		}
		JSONObject responseObj = (JSONObject) JSONValue.parse(responseJSON);
		if(responseObj.containsKey("result") && responseObj.get("result").toString().contentEquals("created"))
		{					
			status = Response.Status.CREATED;
			responseJSON = generateResponse("201", "Stac Collection has been added successfully.",null);				
		}
			
		return Response.status(status).header("Content-Type", "application/json").entity(responseJSON).build();			
	}
		
	@PUT
	@Path("/collections")
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.APPLICATION_JSON })
	public Response updateCollection(@Context HttpServletRequest hsr,@RequestBody String body) {	
		String responseJSON;		
		Status status = null;
		JSONArray detailErrArray = new JSONArray();
		try {
			JSONObject requestPayload = (JSONObject) JSONValue.parse(body);
			StacItemValidationResponse validationStatus = StacHelper.validateStacCollection(requestPayload,true);
			if(validationStatus.getCode().equals(StacItemValidationResponse.ITEM_VALID))
			{
				String id = requestPayload.get("id").toString();			
				String collectionUrlElastic = client.getItemUrl(ec.getCollectionIndexName(),ec.getActualItemIndexType(), id);
				responseJSON = client.sendPut(collectionUrlElastic, body, "application/json");	
			}			
			else
			{
				//response json will contain details about validation error like required fields
				status = Response.Status.BAD_REQUEST;
				responseJSON = generateResponse(validationStatus.getCode(), validationStatus.getMessage(),null);
			}	
			
		} catch (Exception e) {
			LOGGER.error("Error in adding collections " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500", "Stac collection could not be added.",detailErrArray);
		}
		JSONObject responseObj = (JSONObject) JSONValue.parse(responseJSON);
		if(responseObj.containsKey("result") && responseObj.get("result").toString().contentEquals("updated"))
		{					
			status = Response.Status.CREATED;
			responseJSON = generateResponse("201", "Stac Collection has been updated successfully.",null);				
		}
			
		return Response.status(status).header("Content-Type", "application/json").entity(responseJSON).build();			
	}

  
	@GET
	@Path("/collections/{collectionId}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getCollectionMetadata(@Context HttpServletRequest hsr,
			@PathParam("collectionId") String collectionId,
      @QueryParam("outCRS") String outCRS) {
    
		String responseJSON = null;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		
		try {			
			if (!gc.getSupportsCollections()) 
			{	
				responseJSON = this.readResourceFile("service/config/stac-collection-metadata.json", hsr);			
				responseJSON = responseJSON.replaceAll("\\{collectionId\\}", collectionId);
			}
			else
			{
				JSONObject collectionObj = StacHelper.getCollectionWithId(collectionId);
				if (collectionObj == null) // #518 || !collectionId.equals("metadata"))
				{
					status = Response.Status.NOT_FOUND;
				}
				else
				{
          responseJSON = collectionObj.toString();

          // #574 project collection geometry to outCRS if provided and valid
          // if reprojecting STAC geometries is supported and a
          // geometry service has been configured, try projecting 
          // from internal CRS (4326) to requested outCRS
          if ((outCRS != null) && ("true".equals(gc.isCanStacGeomTransform())) && (!gc.getGeometryService().isEmpty())) {
            LOGGER.debug("outCRS = " + outCRS + " - " + gc.getGeometryService());
            Collection theCollection = new Collection(collectionObj);
            List<String> availableCRS = theCollection.getAvailableCRS();
            
            if ((availableCRS.contains(outCRS)) || (outCRS.startsWith("EPSG:"))) {
              JSONObject responseJSONObject = projectCollectionGeometries(collectionObj.toString(), "4326", outCRS);
              responseJSON = responseJSONObject.toString();
            }

            // done
            LOGGER.debug("Projected response -> " + responseJSON);

          } else {
            responseJSON = collectionObj.toString();

            LOGGER.warn("WARNING - outCRS " + outCRS + " is not known for collection " + collectionId +". Outputting tag in native CRS.");
          }
          
					responseJSON = responseJSON.replaceAll("\\{url\\}", this.getBaseUrl(hsr));
				}
			}
		} catch (Exception e) {
			LOGGER.error("Error in getting collection: {} {}",collectionId,e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500", "STAC API collection response could not be generated. "+e.getMessage(),detailErrArray);
		}
    
		return Response.status(status).entity(responseJSON).build();
	}

  
	@GET
	@Produces("application/geo+json")
	@Path("/collections/{collectionId}/items")
	public Response getItems(@Context HttpServletRequest hsr, 
          @PathParam("collectionId") String collectionId,
          @QueryParam("limit") int limit, 
          @QueryParam("bbox") String bbox, 
          @QueryParam("datetime") String datetime,
          @QueryParam("search_after") String search_after,
          @QueryParam("outCRS") String outCRS) throws UnsupportedEncodingException {
    
		String responseJSON;
		String response;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		String query;
		
		try {			
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<>();

			limit = setLimit(limit);

			if (bbox != null && bbox.length() > 0)
				queryMap.put("bbox", bbox);
			if (datetime != null && datetime.length() > 0)
				queryMap.put("datetime", datetime);
      @SuppressWarnings("LocalVariableHidesMemberVariable")
			GeoportalContext gc = GeoportalContext.getInstance();
			if (gc.getSupportsCollections()) {
				queryMap.put("collections", collectionId);
			}

			url = url + "/_search?size=" + limit;
			query = StacHelper.prepareSearchQuery(queryMap, search_after);

			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime, null, null, "metadataItems", collectionId,null);      

      // if reprojecting STAC geometries is supported and a
      // geometry service has been configured, try projecting 
      // from internal CRS (4326) to requested outCRS
      if ((outCRS != null) && ("true".equals(gc.isCanStacGeomTransform())) && (!gc.getGeometryService().isEmpty())) {
        LOGGER.debug("outCRS = " + outCRS + " - " + gc.getGeometryService());

        // get the collection metadata
        Collection collection = new Collection(collectionId);

        // check if outCRS is known for this collection
        List<String> availableCRS = collection.getAvailableCRS();
        if ((availableCRS.contains(outCRS)) || (outCRS.startsWith("EPSG:"))) {

          // get the features from the response
          JSONParser jsonParser = new JSONParser();
          JSONObject responseObject = (JSONObject) jsonParser.parse(responseJSON);
          JSONArray features = (JSONArray) responseObject.get("features");

          // each feature is a STAC item that needs projecting
          for (int i=0; i<features.size(); i++) {
            JSONObject theFeature = (JSONObject) features.get(i);
            JSONObject responseJSONObject = projectItemGeometries(collection, theFeature.toString(), "4326", outCRS);
            features.set(i, responseJSONObject);
          }
          
          responseJSON = responseObject.toString();
        }

        // done
        LOGGER.debug("Project response -> " + responseJSON);
      }

		} catch (InvalidParameterException e) {
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter " + e.getParameterName() + ": " + e.getMessage(),null);
		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500",
					"STAC API collection metadata items response could not be generated.",detailErrArray);
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}


	@GET
	@Path("collections/{collectionId}/items/{id}")
	@Produces("application/geo+json")
	public Response getItem(@Context HttpServletRequest hsr, 
          @PathParam("collectionId") String collectionId,
          @PathParam("id") String id, 
          @QueryParam("outCRS") String outCRS) {
		String responseJSON;
		String response;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		String filePath = "service/config/stac-item.json";
		
		try {
			response = StacHelper.getItemWithItemId(collectionId, id);
			String itemFileString = this.readResourceFile(filePath, hsr);
			
			responseJSON = this.prepareResponseSingleItem(response, itemFileString, collectionId);
			if (responseJSON.contains("Record not found")) {
				status = Response.Status.NOT_FOUND;
			}
			System.out.println(responseJSON);

      // if reprojecting STAC geometries is supported and a
      // geometry service has been configured, try projecting 
      // from internal CRS (4326) to requested outCRS
      if ((outCRS != null) && ("true".equals(gc.isCanStacGeomTransform())) && (!gc.getGeometryService().isEmpty())) {
        LOGGER.debug("outCRS = " + outCRS + " - " + gc.getGeometryService());

         // get the collection metadata
         Collection collection = new Collection(collectionId);

         // check if outCRS is known for this collection
         List<String> availableCRS = collection.getAvailableCRS();
         if ((availableCRS.contains(outCRS)) || (outCRS.startsWith("EPSG:"))) {

           JSONObject responseJSONObject = projectItemGeometries(collection, responseJSON, "4326", outCRS);
           responseJSON = responseJSONObject.toString();
         }

         // done
         LOGGER.debug("Project response -> " + responseJSON);
      } else {
          LOGGER.warn("WARNING - outCRS " + outCRS + " is not known for collection " + collectionId +". Outputting tag in native CRS.");
      }

		} catch (InvalidParameterException e) {
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter " + e.getParameterName() + ": " + e.getMessage(),null);
		} catch (Exception e) {
			LOGGER.error("Error in getting item with item id: " + id + " " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500",
					"STAC API collection metadata item with itemid response could not be generated.",detailErrArray);
		}

		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}


	/**
	 * @param hsr
	 * @param collectionId
	 * @param idList - optional - comma separated list of ids, if no ids then all items will be deleted
	 * @param deleteCollection - optional default=false; if true and no idList, it will delete collection also after deleting all items
	 * @return
	 */
	@DELETE
	@Path("collections/{collectionId}/items")
	@Produces("application/json")
	public Response deleteCollectionItems(@Context HttpServletRequest hsr, 
			@PathParam("collectionId") String collectionId, 
      @QueryParam("ids") String idList,
      @QueryParam("deleteCollection") boolean deleteCollection)
	{
		String responseJSON;		
		Status status = Response.Status.OK;		
		JSONArray detailErrArray = new JSONArray();
		try {
			JSONObject itemRes = StacHelper.getCollectionWithId(collectionId);
			if(itemRes == null)
			{
				responseJSON = this.generateResponse("404", "Collection not found.",null);
			} 
			
			else
			{
				JSONObject resObj = StacHelper.deleteCollectionItems(collectionId,idList,deleteCollection);
				responseJSON = resObj.toString();				
			}

		} catch (InvalidParameterException e) {
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter " + e.getParameterName() + ": " + e.getMessage(),null);
		} catch (Exception e) {
			LOGGER.error("Error in deleting items from collection"+ e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500",
					"STAC API: Items could not be deleted.",detailErrArray);
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}
	
	
	/**
	 * This will all items from collection and then delete collection
	 * @param hsr
	 * @param collectionId
	 * @return
	 */
	@DELETE
	@Path("collections/{collectionId}")
	@Produces("application/json")
	public Response deleteCollection(@Context HttpServletRequest hsr, @PathParam("collectionId") String collectionId)
	{
		String responseJSON;		
		Status status = Response.Status.OK;		
		JSONArray detailErrArray = new JSONArray();
		try {
			JSONObject itemRes = StacHelper.getCollectionWithId(collectionId);
			if(itemRes == null)
			{
				responseJSON = this.generateResponse("404", "Collection not found.",null);
			} else
			{
				JSONObject resObj = StacHelper.deleteCollectionItems(collectionId,null,true);
				responseJSON = resObj.toString();				
			}

		} catch (InvalidParameterException e) {
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter " + e.getParameterName() + ": " + e.getMessage(),null);
		} catch (Exception e) {
			LOGGER.error("Error in deleting items from collection"+ e.getCause());
			e.printStackTrace();
			detailErrArray.add(e.getMessage());
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = this.generateResponse("500",
					"STAC API: Items could not be deleted.",detailErrArray);
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}
	
	@DELETE
	@Path("collections/{collectionId}/items/{id}")
	@Produces("application/json")
	public Response deleteItemById(@Context HttpServletRequest hsr, @PathParam("collectionId") String collectionId,
			@PathParam("id") String id) {
		String responseJSON = null;
		String response;
		JSONArray detailErrArray = new JSONArray();
		Status status = Response.Status.OK;		
		
		try {
			response = StacHelper.getItemWithItemId(collectionId, id);
			
			DocumentContext elasticResContext = JsonPath.parse(response);
			JSONArray items = elasticResContext.read("$.hits.hits");
			
			if (items != null && !items.isEmpty()) {
				String url = client.getTypeUrlForSearch(ec.getIndexName());
				response = client.sendDelete(url+"/_doc/"+id);					
				JSONObject responseObj = (JSONObject) JSONValue.parse(response);
				String result;
				if(responseObj.containsKey("result"))			
				{
					result = responseObj.get("result").toString();
					if(result.contentEquals("deleted"))
					{
						responseJSON = this.generateResponse("200", "Stac feature deleted successfully.",null);
					}
					else
					{
						status = Response.Status.INTERNAL_SERVER_ERROR;
						responseJSON = this.generateResponse("500","STAC feature could not be deleted. Result: "+result,null);
					}
				}
			} else {
				responseJSON = this.generateResponse("404", "Record not found.",null);
			}

		} catch (InvalidParameterException e) {
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter " + e.getParameterName() + ": " + e.getMessage(),null);
		} catch (Exception e) {
			LOGGER.error("Error in deleting item with item id: " + id + " " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500","STAC API: Feature could not be deleted.",detailErrArray);
		}

		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}


  /* SEARCH */

	@GET
	@Produces("application/geo+json")
	@Path("/search")
	public Response search(@Context HttpServletRequest hsr, @QueryParam("limit") int limit,
			@QueryParam("bbox") String bbox, @QueryParam("intersects") String intersects,
			@QueryParam("datetime") String datetime, @QueryParam("ids") String idList,
			@QueryParam("collections") String collections, @QueryParam("search_after") String searchAfter,
      @QueryParam("outCRS") String outCRS)
			throws UnsupportedEncodingException {
		String responseJSON;
		String response;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		String query;
		String listOfCollections = null;

		try {			
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<>();

			limit = setLimit(limit);
			if (bbox != null && bbox.length() > 0)
				queryMap.put("bbox", bbox);
			if (datetime != null && datetime.length() > 0)
				queryMap.put("datetime", datetime);
			//GeoportalContext gc = GeoportalContext.getInstance();
			if ((gc.getSupportsCollections() && collections != null && !collections.isEmpty())) {
				listOfCollections = collections.replace("[", "").replace("]", "").replace("\"", "");
				queryMap.put("collections", listOfCollections);
			}
			if (idList != null && idList.length() > 0) {
				// "LC80100252015082LGN00,LC80100252014287LGN00"
				if (!idList.contains("["))
					queryMap.put("ids", idList);
			}

			if (intersects != null && intersects.length() > 0)
				queryMap.put("intersects", intersects);

			url = url + "/_search?size=" + (limit+1); //Adding one extra so that next page can be figured out

			query = StacHelper.prepareSearchQuery(queryMap, searchAfter);
			System.out.println("final query " + query);

			if (query.length() > 0) {
				response = client.sendPost(url, query, "application/json");
			} else {
				response = client.sendGet(url);
			}
			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime, 
                                          idList, intersects, "search", 
                                          listOfCollections,null);
      
      // if reprojecting STAC geometries is supported and a
      // geometry service has been configured, try projecting 
      // from internal CRS (4326) to requested outCRS
      if ((outCRS != null) && ("true".equals(gc.isCanStacGeomTransform())) && (!gc.getGeometryService().isEmpty())) {
        LOGGER.debug("outCRS = " + outCRS + " - " + gc.getGeometryService());

        JSONObject projectedResponseObj = projectSearchResults(responseJSON, "4326", outCRS);
        responseJSON = projectedResponseObj.toString();        
        
        // done
        LOGGER.debug("Project response -> " + responseJSON);
      }      

		} catch (InvalidParameterException e) {
			status = Response.Status.BAD_REQUEST;
			System.out.println("Parameter " + e.getParameterName() + ": " + e.getMessage());
			responseJSON = this.generateResponse("400", "Parameter " + e.getParameterName() + ": " + e.getMessage(),null);

		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500",
					"STAC API collection search items response could not be generated.",detailErrArray);
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}

	@POST
	@Produces("application/geo+json")
	@Path("/search")
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.WILDCARD })
	public Response search(@Context HttpServletRequest hsr, @RequestBody String body,
			@QueryParam("search_after") String search_after) throws UnsupportedEncodingException {
		String responseJSON;
		String response;
		Status status = Response.Status.OK;
		JSONArray detailErrArray = new JSONArray();
		JsonObject requestPayload = (JsonObject) JsonUtil.toJsonStructure(body);

		int limit = (requestPayload.containsKey("limit") ? requestPayload.getInt("limit") : 0);
		String datetime = (requestPayload.containsKey("datetime") ? requestPayload.getString("datetime") : null);
		JsonArray bboxJsonArr = (requestPayload.containsKey("bbox") ? requestPayload.getJsonArray("bbox") : null);
		JsonArray idArr = (requestPayload.containsKey("ids") ? requestPayload.getJsonArray("ids") : null);
		String outCRS = (requestPayload.containsKey("outCRS") ? requestPayload.getString("outCRS") : null);
		
		JsonArray collectionArr = (requestPayload.containsKey("collections")
				? requestPayload.getJsonArray("collections")
				: null);

		JsonObject intersects = (requestPayload.containsKey("intersects") 
        ? requestPayload.getJsonObject("intersects")
				: null);

		//TODO Handle merge=true in Search Pagination
		String query;
		String bbox = "";
		String ids = "";
		//ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		//ElasticClient client = ElasticClient.newClient();
		try {			
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
			
		
			String listOfCollections = "";
			if ((gc.getSupportsCollections() && collectionArr != null && !collectionArr.isEmpty())) {
				for(int i=0;i<collectionArr.size();i++)
				{
					if(i==0)
					{
						listOfCollections = collectionArr.getString(i);
					}
					else
					{
						listOfCollections = listOfCollections+","+ collectionArr.getString(i);
					}
					
				}								
				queryMap.put("collections", listOfCollections);
			}
      
			//Adding one extra so that next page can be figured out
			url = url + "/_search?size=" + (limit+1);
			query = StacHelper.prepareSearchQuery(queryMap, search_after);
			System.out.println("final query " + query);
			if (query.length() > 0)
				response = client.sendPost(url, query, "application/json");
			else
				response = client.sendGet(url);

			responseJSON = this.prepareResponse(response, hsr, bbox, limit, datetime, ids,
					(intersects != null ? intersects.toString() : ""), "searchPost", (collectionArr != null ? collectionArr.toString() : ""),body);
      
      // if reprojecting STAC geometries is supported and a
      // geometry service has been configured, try projecting 
      // from internal CRS (4326) to requested outCRS
      if ((outCRS != null) && ("true".equals(gc.isCanStacGeomTransform())) && (!gc.getGeometryService().isEmpty())) {
        LOGGER.debug("outCRS = " + outCRS + " - " + gc.getGeometryService());

        JSONObject projectedResponseObj = projectSearchResults(responseJSON, "4326", outCRS);
        responseJSON = projectedResponseObj.toString();        
        
        // done
        LOGGER.debug("Project response -> " + responseJSON);
      }
      
		} catch (InvalidParameterException e) {
			status = Response.Status.BAD_REQUEST;
			responseJSON = this.generateResponse("400", "Parameter " + e.getParameterName() + ": " + e.getMessage(),null);
		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			detailErrArray.add(e.getMessage());
			responseJSON = this.generateResponse("500",
					"STAC API collection search items response could not be generated.",detailErrArray);
		}
		return Response.status(status).header("Content-Type", "application/geo+json").entity(responseJSON).build();
	}

  
  /* TRANSACTIONS */
  
	/**
	 * STAC Transaction - Add item https://github.com/stac-api-extensions/transaction?tab=readme-ov-file#post
	 * @param hsr
   * @param collectionId
	 * @param body partial Item or partial ItemCollection
   * @param async
	 * @return
	 * @throws Exception
	 */
	@POST
	@Produces("application/json")
	@Path("/collections/{collectionId}/items")
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.WILDCARD })
	public Response item(@Context HttpServletRequest hsr,@PathParam("collectionId") String collectionId, 
			@RequestBody String body, @QueryParam("async") boolean async)throws Exception {
    String responseJSON;		
    Status status;

    if(gc.getSupportsCollections() && !validCollection(collectionId)) {
        status = Response.Status.BAD_REQUEST;
        String baseUrl = this.getBaseUrl(hsr);
        responseJSON = this.generateResponse("400","Collection does not exist. Please add collection by sending POST request "+baseUrl+"/collections",null);		

    } else {
        JSONObject requestPayload = (JSONObject) JSONValue.parse(body);
        //check if it is Feature or FeatureCollection
        String type = (requestPayload.containsKey("type") ? requestPayload.get("type").toString() : "");

        if(type.equalsIgnoreCase("Feature")) {
                return addFeature(requestPayload,collectionId,hsr,async);
        } else if(type.equalsIgnoreCase("FeatureCollection")) {
                return addFeatureCollection(requestPayload,collectionId, async);
        } else {
                status = Response.Status.BAD_REQUEST;
                responseJSON = this.generateResponse("400","type should be Feature or FeatureCollection.",null);			
        }		
    }
    return Response.status(status).header("Content-Type", "application/json").entity(responseJSON).build();			
	}

  
	/**
	 * STAC Transaction - Update Feature https://github.com/stac-api-extensions/transaction?tab=readme-ov-file#put
	 * @param hsr
   * @param collectionId
	 * @param body Feature
   * @param featureId
   * @param async
	 * @return
	 * @throws Exception
	 */
	@PUT
	@Produces("application/json")
	@Path("/collections/{collectionId}/items/{featureId}")
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.WILDCARD })
	public Response updateItems(@Context HttpServletRequest hsr,
                              @PathParam("collectionId") String collectionId, 
                              @PathParam("featureId") String featureId,
                              @RequestBody String body, 
                              @QueryParam("async") boolean async)throws Exception {
    
		String responseJSON;	
		Status status;		
		
		if(gc.getSupportsCollections() && !validCollection(collectionId)) 
		{	
			status = Response.Status.BAD_REQUEST;
			String baseUrl = this.getBaseUrl(hsr);
			responseJSON = this.generateResponse("400","Collection does not exist. Please add collection by sending POST request "+baseUrl+"/collections",null);		
		}
		else
		{
			JSONObject requestPayload = (JSONObject) JSONValue.parse(body);
			//check if it is Feature or FeatureCollection
			String type = (requestPayload.containsKey("type") ? requestPayload.get("type").toString() : "");
			if(type.equalsIgnoreCase("Feature"))
			{
				return updateFeature(requestPayload,collectionId,featureId,hsr,async);
        
			} else {
				status = Response.Status.BAD_REQUEST;
				responseJSON = this.generateResponse("400","type should be Feature.",null);			
			}					
		}
    
		return Response.status(status).header("Content-Type", "application/json").entity(responseJSON).build();			
	}
  
  
	/**
	 * STAC Transaction - Update Feature https://github.com/stac-api-extensions/transaction?tab=readme-ov-file#put
	 * @param hsr
   * @param collectionId
	 * @param body Feature
   * @param featureId
   * @param async
	 * @return
	 * @throws Exception
	 */
	@PATCH
	@Produces("application/json")
	@Path("/collections/{collectionId}/items/{featureId}")
	@Consumes({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.WILDCARD })
	public Response patchItem(@Context HttpServletRequest hsr,
                            @PathParam("collectionId") String collectionId, 
                            @PathParam("featureId") String featureId,
                      			@RequestBody String body, 
                            @QueryParam("async") boolean async) throws Exception {
		String responseJSON;	
		Status status;		
		
		if(gc.getSupportsCollections() && !validCollection(collectionId)) {	
			status = Response.Status.BAD_REQUEST;
			String baseUrl = this.getBaseUrl(hsr);
			responseJSON = this.generateResponse("400","Collection does not exist. Please add collection by sending POST request "+baseUrl+"/collections",null);		
		
    } else {
      JSONObject requestPayload = (JSONObject) JSONValue.parse(body);
			//check if it is Feature or FeatureCollection
			String type = (requestPayload.containsKey("type") ? requestPayload.get("type").toString() : "");
			if(type.equalsIgnoreCase("Feature"))
			{
				return patchFeature(requestPayload,collectionId,featureId,hsr,async);
        
			} else {
				status = Response.Status.BAD_REQUEST;
				responseJSON = this.generateResponse("400","Can only PATCH individual an STAC Item.",null);			
			}					
		}
    
		return Response.status(status).header("Content-Type", "application/json").entity(responseJSON).build();			
	}
	
  
  /* PATCH STAC Item */
  
	private Response patchFeature(JSONObject requestPayload, 
                                String collectionId, 
                                String featureId,
                                HttpServletRequest hsr,
                                boolean async) {
		if(async) {
      new Thread(() -> {
        this.executePatchFeature(requestPayload, collectionId,featureId,hsr,async);
      }).start();
      
      String responseJSON = generateResponse("202", "Stac Feature update has been started.",null);
      return Response.status(Status.ACCEPTED)
                     .header("Content-Type", "application/json")
                     .entity(responseJSON).build();
          
		} else {
      
			return executePatchFeature(requestPayload, collectionId,featureId,hsr,async);
		}
	}	
  
  
  private Response executePatchFeature(JSONObject requestPayload, 
                                       String collectionId, 
                                       String featureId,
                                       HttpServletRequest hsr,
                                       boolean async) {
		String responseJSON = "";
		Status status = Response.Status.INTERNAL_SERVER_ERROR;
		JSONArray detailErrArray = new JSONArray();
    Response responseObject = null;
        
		try {
      // get existing item
      JSONObject existingItem = StacHelper.getSTACItemById(collectionId, featureId);
      
      // if payload has geomCRSField and geomWKT field, project 
      // from internal CRS (EPSG:4326) to geomCRSField value
      if (requestPayload.containsKey("properties")) {
        JSONObject properties = (JSONObject) requestPayload.get("properties");
        
        if (properties.containsKey(gc.getGeomWKTField()) 
            && properties.containsKey(gc.getGeomCRSField())) {

          String patchCRS = properties.getAsString(gc.getGeomCRSField());
          
          // Only project if the submitted CRS is not the same as the internal CRS
          if (!patchCRS.equalsIgnoreCase(INTERNAL_CRS)) {
            Collection collection = new Collection(collectionId);
            String existingItemJSON = existingItem.toString();

            // project existing item from internal CRS to CRS submitted in the PATCH
            existingItem = projectItemGeometries(collection, 
                                                 existingItemJSON, 
                                                 INTERNAL_CRS.replace("EPSG:", ""),
                                                 patchCRS);            
          }
         
          // merge JSON from existing item with requestPayload
          JSONObject updatedItem = StacHelper.mergeJSON(existingItem, requestPayload);

          // update feature (will reproject)
          responseObject = updateFeature(updatedItem, collectionId, featureId, hsr, async);
    			responseJSON = generateResponse("200", responseObject.toString(), detailErrArray);

        } else {
          LOGGER.debug("Got partial geometry info for " + featureId);
    			responseJSON = generateResponse("500", "STAC Item " + featureId + " not updated due to missing geometry information.", detailErrArray);
        }
      }
      
		} catch(Exception ex) {
			LOGGER.error("Error in patching STAC Item: " + ex.getMessage());
			detailErrArray.add(ex.getMessage());
			responseJSON = generateResponse("500","STAC Item " + featureId + " could not be updated.", detailErrArray);
		}
    
		//For asynchronous request, log this response message
    if(async) {
      LOGGER.info("request: /collections/"+collectionId+"/items/"+featureId+"; method:PATCH; response: \n"+responseJSON);
    }
    
    if (responseObject != null) {
      return responseObject;
      
    } else {
      return Response.status(status)
          .header("Content-Type", "application/json")
          .entity(responseJSON).build();		
    }
	}
 
  
  /* Update STAC Item */
  
	private Response updateFeature(JSONObject requestPayload, String collectionId, String featureId,HttpServletRequest hsr,
			boolean async) {
		if(async)
		{
		 new Thread(() -> {
					executeUpdateFeature(requestPayload, collectionId,featureId,hsr,async);
		      }).start();
		      String responseJSON = generateResponse("202", "Stac Feature update has been started.",null);
		      return Response.status(Status.ACCEPTED)
						.header("Content-Type", "application/json")
						.entity(responseJSON).build();
		}
		else
		{
			return executeUpdateFeature(requestPayload, collectionId,featureId,hsr,async);
		}
	}
	
  
	private Response executeUpdateFeature(JSONObject requestPayload, 
                                        String collectionId, 
                                        String featureId, 
                                        HttpServletRequest hsr, 
                                        boolean async) {
    
		String responseJSON;
		Status status = Response.Status.INTERNAL_SERVER_ERROR;
		JSONArray detailErrArray = new JSONArray();
    
		try {
			StacItemValidationResponse validationStatus = StacHelper.validateStacItemForUpdate(requestPayload,collectionId,featureId,false);
      
			if (validationStatus.getCode().equals(StacItemValidationResponse.ITEM_VALID)) {
				JSONObject updatedPayload = StacHelper.prePublish(requestPayload,collectionId,false);
        
        // 574
        JSONObject projectedPayload = projectIncomingItem(updatedPayload,collectionId);
				
				String id = projectedPayload.get("id").toString();	
				String itemJsonString = projectedPayload.toString();	
				String itemUrlElastic = client.getItemUrl(ec.getIndexName(),ec.getActualItemIndexType(), id);
							
				responseJSON = client.sendPut(itemUrlElastic, itemJsonString, "application/json");
				
				JSONObject responseObj = (JSONObject) JSONValue.parse(responseJSON);
        
				if(responseObj.containsKey("result") && responseObj.get("result").toString().contentEquals("updated")) {					
					status = Response.Status.OK;
					responseJSON = "Feature updated";
					String itemUrlGeoportal = "";
					
					//if sync request for Feature, create STAC feature for response 
					if(!async) {
						String filePath = "service/config/stac-item.json";
						String itemFileString = this.readResourceFile(filePath, hsr);
						
						//Before searching newly added item, sleep for 1 second, otherwise record is not found
						TimeUnit.SECONDS.sleep(1);
						
						String itemRes = StacHelper.getItemWithItemId(collectionId, id);
						responseJSON = prepareResponseSingleItem(itemRes, itemFileString, collectionId);
						itemUrlGeoportal = this.getBaseUrl(hsr)+"/collections/"+collectionId+"/items/"+id;
					}
					return Response.status(status)
							.header("Content-Type", "application/json")
							.header("location",itemUrlGeoportal)
							.entity(responseJSON).build();				
				}
				//Some error in creating item
        else {
					LOGGER.info("Stac item with id " + id + " could not be updated. ");
				}
        
			} else if(validationStatus.getCode().equals(StacItemValidationResponse.ITEM_NOT_FOUND)) {
				status = Response.Status.NOT_FOUND;
				responseJSON = generateResponse("404", validationStatus.getMessage(),null);
        
			} else {
				//response json will contain details about validation error like required fields
				status = Response.Status.BAD_REQUEST;
				responseJSON = generateResponse("400", validationStatus.getMessage(),null);
			}	
      
		} catch(Exception ex) {
			LOGGER.error("Error in updating Stac Item: " + ex.getMessage());
			detailErrArray.add(ex.getMessage());
			responseJSON = generateResponse("500","Stac Feature could not be updated.",detailErrArray);
		}
    
		//For asynchronous request, log this response message
	  if(async) {
			 LOGGER.info("request: /collections/"+collectionId+"/items/"+featureId+"; method:PUT; response: \n"+responseJSON);
    }
    
		return Response.status(status)
				.header("Content-Type", "application/json")
				.entity(responseJSON).build();		
	}


	private Response addFeature(JSONObject requestPayload, String collectionId, HttpServletRequest hsr,boolean async) 
	{
    if(async) {
      new Thread(() -> {
        this.executeAddFeature(requestPayload, collectionId,hsr,async,"Feature");
      }).start();

      String responseJSON = generateResponse("202", "Stac Feature creation has been started.",null);
      return Response.status(Status.ACCEPTED)
                     .header("Content-Type", "application/json")
                     .entity(responseJSON).build();
      
    } else {
      return executeAddFeature(requestPayload, collectionId,hsr,async,"Feature");
    }
	}	
	
  
	private Response executeAddFeature(JSONObject requestPayload, 
          String collectionId, 
          HttpServletRequest hsr,
          boolean async, 
          String reqType) {
    
    String responseJSON;
    Status status = Response.Status.INTERNAL_SERVER_ERROR;
    JSONArray detailErrArray = new JSONArray();
    String elasticResJson;    

    try {
      StacItemValidationResponse validationStatus = StacHelper.validateStacItem(requestPayload,collectionId,gc.isValidateStacFields());
      
      if(validationStatus.getCode().equals(StacItemValidationResponse.ITEM_VALID)) {
        JSONObject updatedPayload = StacHelper.prePublish(requestPayload,collectionId,false);

        String itemJsonString = updatedPayload.toString();								

        String id = "";
        if (updatedPayload.containsKey("id")) {
          id = updatedPayload.getAsString("id");
        }
        
        if (id.length()<1) {
          // issue 572 - generate unique item id if configured to do so
          if (gc.isCanStacAutogenerateId()) {
            // generate a UUID to be used as id
            UUID guid = UUID.randomUUID();
            id = guid.toString();

            // save the id to the payload
            updatedPayload.put("id", id);
          }
        }
                    
        // issue 574 - project payload if submitted with geometries not in 4326
        JSONObject projectedPayload = updatedPayload;
        try {
          projectedPayload = projectIncomingItem(updatedPayload,collectionId);
        } catch (ParseException e) {
          LOGGER.error("Error parsing incoming item: " + e.getMessage());
        }

        itemJsonString = projectedPayload.toString();
        
        String itemUrlElastic = client.getItemUrl(ec.getIndexName(),ec.getActualItemIndexType(), id);

        elasticResJson = client.sendPut(itemUrlElastic, itemJsonString, "application/json");
        JSONObject elasticResObj = (JSONObject) JSONValue.parse(elasticResJson);
        
        if(elasticResObj.containsKey("result") && elasticResObj.get("result").toString().contentEquals("created")) {					
          status = Response.Status.CREATED;				
          responseJSON = generateResponse("201","Stac Item added.",null);
          String itemUrlGeoportal = "";

          //if sync request for Feature, create Stac feature for response 
          if(reqType.equals("Feature") && !async) {
            String filePath = "service/config/stac-item.json";
            String itemFileString = this.readResourceFile(filePath, hsr);

            //Before searching newly added item, sleep for 1 second, otherwise record is not found
            TimeUnit.SECONDS.sleep(1);

            String itemRes = StacHelper.getItemWithItemId(collectionId, id);
            responseJSON = prepareResponseSingleItem(itemRes, itemFileString, collectionId);
            itemUrlGeoportal = this.getBaseUrl(hsr)+"/collections/"+collectionId+"/items/"+id;
          }

          return Response.status(status)
                         .header("Content-Type", "application/json")
                         .header("location",itemUrlGeoportal)
                         .entity(responseJSON).build();				
        }
        //Some error in creating item
        else {
          detailErrArray.add(elasticResObj);
          responseJSON = generateResponse("500","Stac Item could not be added." ,detailErrArray);
          LOGGER.info("Stac item with id "+id+" could not be created. ");
        }
      }		

      else if (validationStatus.getCode().equals(StacItemValidationResponse.ID_EXISTS))
      {
              responseJSON = generateResponse("409", "Item with this id already exists in collection.",null);
              status = Response.Status.CONFLICT;
      }
      //Bad request, missing field or any field is invalid
      else
      {
              //response json will contain details about validation error like required fields
              status = Response.Status.BAD_REQUEST;				
              responseJSON = generateResponse("400", validationStatus.getMessage(),null);
      }		
    }
    catch(Exception ex)
    {
            LOGGER.error("Error in adding Stac Item " + ex.getCause());
            detailErrArray.add(ex.getMessage());
            responseJSON = generateResponse("500","Stac Item could not be added.",detailErrArray);
            ex.printStackTrace();
    }
    //For asynchronous request, log this response message
     if(async && reqType.equals("Feature"))
     {
             LOGGER.info("request: /collections/"+collectionId+"/items; method:POST; response: \n"+responseJSON);
     }
    return Response.status(status)
                    .header("Content-Type", "application/json")
                    .entity(responseJSON).build();
	}
	
	private Response addFeatureCollection(JSONObject requestPayload, String collectionId,boolean async) {		
		if(async)
		{
			 new Thread(() -> {
			        this.exeFeatureCollection(requestPayload, collectionId,async);
			      }).start();
			      String responseJSON = generateResponse("202", "FeatureCollection creation has been started.",null);
			      return Response.status(Status.ACCEPTED)
							.header("Content-Type", "application/json")
							.entity(responseJSON).build();
		}
		else
		{
			return exeFeatureCollection(requestPayload, collectionId,async);
		}
	}
  
  
	private Response exeFeatureCollection(JSONObject requestPayload, String collectionId,boolean async) {
		
		// Add invalid features in error response	
		String responseJSON = generateResponse("201","FeatureCollection created successfully.",null);
		Status status = Response.Status.CREATED;
		JSONArray detailErrArray = new JSONArray();
		try {
			if(requestPayload.containsKey("features"))
			{
				 JSONArray features = (JSONArray) requestPayload.get("features");
				 //For synchronous request, limit number of features in feature collection
				 if(!async)
				 {
					 if(features.size() >gc.getNumStacFeaturesAddItem())
					 {
						 responseJSON = generateResponse("400","Number of Features in FeatureCollection are more than allowed limit ("+features.size()+") in Synchronous request. For large FeatureCollection include paramter async=true.",null);
						 status = Response.Status.BAD_REQUEST;
					 }
				 }

				 JSONArray errorMsgArr = new JSONArray();
				 JSONObject errorMsgObj;
				 JSONObject errorObj;
				 
				 for(int i =0;i<features.size() ;i++)
				 {
					 JSONObject feature = (JSONObject) features.get(i);
					 Response res = executeAddFeature(feature, collectionId, null, false,"FeatureCollection");
					 if(res.getStatus() != Response.Status.CREATED.getStatusCode())
					 {
						 errorMsgObj = new JSONObject();
						 errorObj = (JSONObject)JSONValue.parse(res.getEntity().toString());						 
						 
						 errorMsgObj.put("id", feature.getAsString("id"));
						 errorMsgObj.put("error",errorObj.get("description"));
						 
						 errorMsgArr.add(errorMsgObj);
					 }				 
				 }
				 if(!errorMsgArr.isEmpty())
				 {
					 responseJSON = generateResponse("500","Some Features in FeatureCollection  could not be added.",errorMsgArr);
					 status = Response.Status.INTERNAL_SERVER_ERROR;					
				 }
			}
      
		} catch(Exception ex) {			
			status = Response.Status.INTERNAL_SERVER_ERROR;	
			detailErrArray.add(ex.getMessage());
			responseJSON = generateResponse("500","Error in adding FeatureCollection.",detailErrArray);
		}
    
		//For asynchronous request, log this response message
    if(async) {
      LOGGER.info("request: /collections/"+collectionId+"/items; method:POST; response: \n"+responseJSON);
    }
    
		return Response.status(status)
                   .header("Content-Type", "application/json")
                   .entity(responseJSON).build();
	}

  
	private String generateResponse(String code, String description, JSONArray detailMsgArr) {
		JSONObject resObj = new JSONObject();
		resObj.put("code", code);
		resObj.put("description", description);
		
		if(detailMsgArr != null && !detailMsgArr.isEmpty())
			resObj.put("detail",detailMsgArr);

		return resObj.toString();
	}

	// Prepare response for a single feature
	private String prepareResponseSingleItem(String searchRes, String itemFileString, String collectionId) {

		JSONArray items;		
		String finalResponse;

		DocumentContext elasticResContext = JsonPath.parse(searchRes);

		JsonObject fileObj = (JsonObject) JsonUtil.toJsonStructure(itemFileString);
		String featureTemplateStr = "{\"featurePropPath\":" + fileObj.toString() + "}";

		items = elasticResContext.read("$.hits.hits");

		DocumentContext featureContext = JsonPath.parse(featureTemplateStr);
		if (items != null && !items.isEmpty()) {
			DocumentContext searchItemCtx = JsonPath.parse(items.get(0));

			// Populate feature
			this.populateFeature(featureContext, searchItemCtx);
			JsonObject obj = (JsonObject) JsonUtil.toJsonStructure(featureContext.jsonString());
			JsonObject resObj = obj.getJsonObject("featurePropPath");

			finalResponse = resObj.toString();
		} else {
			finalResponse = this.generateResponse("404", "Record not found.",null);

		}
		finalResponse = finalResponse.replaceAll("\\{collectionId\\}", collectionId);
		return finalResponse;
	}

	private String prepareResponse(String searchRes, HttpServletRequest hsr, String bbox, int limit, String datetime,
			String ids, String intersects, String requestType, String collectionId, String body) {
		
		int numberMatched;		
		net.minidev.json.JSONArray items;
		String numberReturned;
		String itemFileString;
		String finalResponse = "";
		String search_after = "";
		String filePath = "service/config/stac-items.json";
		boolean nextLink = false;

		try {
			itemFileString = this.readResourceFile(filePath, hsr);

			DocumentContext elasticResContext = JsonPath.parse(searchRes);
			DocumentContext resourceFilecontext = JsonPath.parse(itemFileString);
			DocumentContext linksContext = JsonPath
					.parse(this.readResourceFile(resourceFilecontext.read("$.response.links"), hsr));

			JsonObject fileObj = (JsonObject) JsonUtil.toJsonStructure(itemFileString);
			String featureTemplateStr = fileObj.getJsonObject("featurePropPath").toString();
			featureTemplateStr = "{\"featurePropPath\":" + featureTemplateStr + "}";

			numberMatched = elasticResContext.read("$.hits.total.value");
			items = elasticResContext.read("$.hits.hits");
			if(items.size() > limit)
			{
				nextLink = true;
			}
			
			//Geoportal asked for 1 extra record to figure out whether next link is needed				
			int itemActualSize = Math.min(limit, items.size());
			
			resourceFilecontext.set("$.response.timestamp", new Date().toString()).jsonString();
			resourceFilecontext.set("$.response.numberMatched", "" + numberMatched);
			
			//No link for next page
			if(!nextLink)
			{
				linksContext.delete("$.searchItem.links[1]");
			}
			JSONArray jsonArray = new JSONArray();

			for (int i = 0; i < itemActualSize; i++) {
				DocumentContext featureContext = JsonPath.parse(featureTemplateStr);
				DocumentContext searchItemCtx = JsonPath.parse(items.get(i));

				// Populate feature
				boolean success = this.populateFeature(featureContext, searchItemCtx);
				if (success) {
					jsonArray.add(featureContext.read("$.featurePropPath"));
					if (i == (itemActualSize - 1)) {
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

			// Prepare urlparam for next page

			String encodedIntersect = null;
			if (intersects != null && !intersects.isBlank()) {
				if (intersects.contains("%")) {
					encodedIntersect = intersects;
				} else {
					encodedIntersect = URLEncoder.encode(intersects, StandardCharsets.UTF_8.toString());
				}
			}
			String urlparam;
			if (requestType.equalsIgnoreCase("searchPost")) {
				// In post request, other parameters will be part of request body
				urlparam = (search_after != null ? "search_after=" + search_after : "");
				if(nextLink)
					linksContext.set("$.searchItem.links[1].body",(body != null ? JSONValue.parse(body) : ""));

			} else {
				if(nextLink)
				{
					linksContext.delete("$.searchItem.links[1].body");
					linksContext.delete("$.searchItem.links[1].method");
					linksContext.delete("$.searchItem.links[1].merge");
				}				
				
				urlparam = "limit=" + limit + (bbox != null ? "&bbox=" + bbox : "")
						+ (datetime != null ? "&datetime=" + datetime : "")
						+ (search_after != null ? "&search_after=" + search_after : "")
						+ (encodedIntersect != null ? "&intersects=" + encodedIntersect : "")
						+ (ids != null ? "&ids=" + ids : "")
						+((requestType.startsWith("search")) && collectionId != null ? "&collections=" + collectionId : "");
			}
			if (requestType.startsWith("metadataItems"))
				resourceFilecontext.set("$.response.links", linksContext.read("$.metadataItem.links"));

			if (requestType.startsWith("search"))
				resourceFilecontext.set("$.response.links", linksContext.read("$.searchItem.links"));
			
			JsonObject obj = (JsonObject) JsonUtil.toJsonStructure(resourceFilecontext.jsonString());
			JsonObject resObj = obj.getJsonObject("response");

			finalResponse = resObj.toString();

			finalResponse = finalResponse.replaceAll("\\{urlparam\\}", urlparam);
			
			if(requestType.equals("metadataItems")) // These are for links href for collection
			{
				finalResponse = finalResponse.replaceAll("\\{collectionId\\}", (collectionId != null ?collectionId:"{collectionId}"));
			}
			
		} catch (IOException | URISyntaxException e) {
			LOGGER.error("Stac response could not be preapred. " + e.getMessage());
			e.printStackTrace();
		}
		return finalResponse;
	}

	private boolean populateFeature(DocumentContext featureContext, DocumentContext searchItemCtx) {
		HashMap<String, String> propObj = featureContext.read("$.featurePropPath.properties");
		Set<String> propObjKeys = propObj.keySet();
		String propKeyVal;

		ArrayList<String> propToBeRemovedList = new ArrayList<>();
		ArrayList<String> assetToBeRemovedList = new ArrayList<>();
		boolean featureValid = true;

		try {

			String val = featureContext.read("$.featurePropPath.id");
			String recordId = searchItemCtx.read(val).toString();
			featureContext.set("$.featurePropPath.id", searchItemCtx.read(val));

			val = featureContext.read("$.featurePropPath.collection");
			featureContext.set("$.featurePropPath.collection", searchItemCtx.read(val));

			// add bbox, geometry
			this.setBbox(searchItemCtx, featureContext);
			
			JSONArray bboxArr = featureContext.read("$.featurePropPath.bbox");
			//No valid bbox in feature
			if(bboxArr.get(1).toString().contains("$"))
			{
				featureContext.delete("$.featurePropPath.bbox");
			}

			this.setGeometry(searchItemCtx, featureContext);

			// Fill asset
			HashMap<String, JSONObject> assetsObj = featureContext.read("$.featurePropPath.assets");
			Set<String> assetsObjKeys = assetsObj.keySet();

			// Iterate Assets
			HashMap<String, Object> assetObj;
			String assetObjKeyVal;
			for (String assetsObjKey : assetsObjKeys) {
				try {
					assetObj = assetsObj.get(assetsObjKey);
					Set<String> assetObjKeys = assetObj.keySet();

					for (String assetObjKey : assetObjKeys) {
						assetObjKeyVal = String.valueOf(assetObj.get(assetObjKey));
						
						// If it is a json path, set values from search result
						if (assetObjKeyVal.startsWith("$")) {
							if (searchItemCtx.read(assetObjKeyVal) != null) {
								featureContext.set("$.featurePropPath.assets." + assetsObjKey + "." + assetObjKey,
										searchItemCtx.read(assetObjKeyVal));
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

			// STEP: Add_ALL_ASSET assets from stac record, if available
			try {
				HashMap<String, JSONObject> stacRecAssetObj = searchItemCtx.read("$._source.assets");
				assetsObj = featureContext.read("$.featurePropPath.assets");
				if (stacRecAssetObj != null) {
					Set<String> stacRecAssetObjKeys = stacRecAssetObj.keySet();

					for (String stacRecAssetObjKey : stacRecAssetObjKeys) {
						assetsObj.put(stacRecAssetObjKey,
								searchItemCtx.read("$._source.assets." + stacRecAssetObjKey, JSONObject.class));
					}
					featureContext.set("$.featurePropPath.assets", assetsObj);
				}
			} // if json path ($._source.assets) not found,catch exception and ignore
			catch (Exception e) {
				LOGGER.trace("No assets ($._source.assets) in this Stac record with id: " + recordId);

			}

			// Iterate properties, skip property if it is not available			
			for (String propKey : propObjKeys) {
				try {
					propKeyVal = String.valueOf(propObj.get(propKey));
					// If it is a json path, set values from search result
					if (propKeyVal.startsWith("$")) {
						if (searchItemCtx.read(propKeyVal) != null) {
							featureContext.set("$.featurePropPath.properties." + propKey,
									searchItemCtx.read(propKeyVal));
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
			linkSelfHref = linkSelfHref.replaceAll("\\{itemId\\}", featureContext.read("$.featurePropPath.id").toString());
			
			//Support multiple collection, set Item collection id
			linkSelfHref = linkSelfHref.replaceAll("\\{itemCollectionId\\}", featureContext.read("$.featurePropPath.collection"));  
			featureContext.set("$.featurePropPath.links[0].href", linkSelfHref);
			
			String linkParentHref = featureContext.read("$.featurePropPath.links[2].href");
			linkParentHref = linkParentHref.replaceAll("\\{itemCollectionId\\}", featureContext.read("$.featurePropPath.collection"));
			featureContext.set("$.featurePropPath.links[2].href", linkParentHref);
			
			String linkCollectionHref = featureContext.read("$.featurePropPath.links[3].href");
			linkCollectionHref = linkCollectionHref.replaceAll("\\{itemCollectionId\\}", featureContext.read("$.featurePropPath.collection"));
			featureContext.set("$.featurePropPath.links[3].href", linkCollectionHref);
			

		} catch (Exception e) {
			// If json path not found or error in any property, skip this feature
			featureValid = false;
			LOGGER.trace("feature could not be added. Reason : " + e.getMessage());
			// System.out.println("feature could not be added. Reason : " + e.getMessage());
		}

		for (String propToRemove : propToBeRemovedList) {
			featureContext.delete(propToRemove);
		}
		Object assetObj;
		for (String assetToRemove : assetToBeRemovedList) {
			//Assets are populated from Feature in step Add_ALL_ASSET (so first validate if it still needs removal
			assetObj = featureContext.read(assetToRemove);
			if(assetObj instanceof JSONObject)
			{
				JSONObject assetJSONObj = (JSONObject)assetObj;
				if(assetJSONObj.getAsString("href").contains("$."))// Still JSON path from stac-item.json
					featureContext.delete(assetToRemove);
			}
			else
			{
				featureContext.delete(assetToRemove);
			}			
		}
		return featureValid;
	}

	private void setGeometry(DocumentContext searchItemCtx, DocumentContext featureContext) {
		net.minidev.json.JSONArray valArr = featureContext.read("$.featurePropPath.geometry");
		String geometryProp;
		try {
			if (!valArr.isEmpty()) {
				geometryProp = (String) valArr.get(0);
				featureContext.set("$.featurePropPath.geometry", searchItemCtx.read(geometryProp));
			}
		} catch (Exception ex) {
			// If first path does not work, try second one
			if (valArr.size() > 1) {
				geometryProp = (String) valArr.get(1);
				featureContext.set("$.featurePropPath.geometry", searchItemCtx.read(geometryProp));
			}
		}
	}

	private void setBbox(DocumentContext searchItemCtx, DocumentContext featureContext) {
		net.minidev.json.JSONArray valArr = featureContext.read("$.featurePropPath.bbox");
		String bboxProp;
		if (!valArr.isEmpty()) {
			bboxProp = (String) valArr.get(0);
			if (!bboxProp.isBlank() && bboxProp.contains("envelope_geo")) {
				this.setBboxAsEnvelopGeo(searchItemCtx, featureContext, bboxProp);
			} else if (!bboxProp.isBlank() && bboxProp.contains("bbox")) {
				this.setBboxAsBbox(searchItemCtx, featureContext, bboxProp);
			}
		}
		if (valArr.size() > 1) {
			bboxProp = (String) valArr.get(1);
			if (!bboxProp.isBlank() && bboxProp.contains("envelope_geo")) {
				this.setBboxAsEnvelopGeo(searchItemCtx, featureContext, bboxProp);
			} else if (!bboxProp.isBlank() && bboxProp.contains("bbox")) {
				this.setBboxAsBbox(searchItemCtx, featureContext, bboxProp);
			}
		}
	}

	private void setBboxAsEnvelopGeo(DocumentContext searchItemCtx, DocumentContext featureContext, String bboxProp) {
		try {
			JSONArray enveloperArr = searchItemCtx.read(bboxProp);

			// "envelope_geo":[{"type":"envelope","ignore_malformed":"true","coordinates":[[-127.0236257875064,64.01274197384028],[-125.569240728746,63.020232862518167]]}]
			if (enveloperArr != null) {
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
		} catch (Exception ex) {
			// DO nothing. Just skip
		}
	}

	private void setBboxAsBbox(DocumentContext searchItemCtx, DocumentContext featureContext, String bboxProp) {
		try {
			// "bbox":
			// [-74.09957050999664,-4.611277442089833,-73.1088539899217,-3.6165503784726664]
			featureContext.set("$.featurePropPath.bbox", searchItemCtx.read(bboxProp));
		} catch (Exception ex) {
			// DO nothing. Just skip
		}
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
	
  
	@Deprecated
	//Now Collections are stored in a separate index 'çollections'
	private ArrayList<String> getCollectionList() throws Exception {
		//ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
		//ElasticClient client = ElasticClient.newClient();
		String url = client.getTypeUrlForSearch(ec.getIndexName());
		url = url + "/_search";
		String collectionsSearch = "{\"aggregations\": {\"collections\": {\"terms\": {\"field\": \"src_collections_s\"}}}}";

		String response = client.sendPost(url, collectionsSearch, "application/json");
		JSONObject gptResponse = (JSONObject) JSONValue.parse(response); 
		JSONObject gptAggregations = (JSONObject) gptResponse.get("aggregations");
		JSONObject gptCollections = (JSONObject) gptAggregations.get("collections");
		JSONArray gptBuckets = (JSONArray) gptCollections.get("buckets");

		ArrayList<String> collectionsList = new ArrayList<String>();
		for (int i = 0; i < gptBuckets.size(); i++) {
			JSONObject bucket = (JSONObject) gptBuckets.get(i);
			String collectionName = bucket.getAsString("key");
			collectionsList.add(collectionName);

		}
		return collectionsList;
	}
	
  
	private boolean validCollection(String collectionId) throws Exception {
		boolean validId = false;
		if(collectionId != null && !collectionId.isBlank())
		{
			ArrayList<String> collectionList = StacHelper.getCollectionIDList();
			for(int i=0;i<collectionList.size();i++)
			{
				if(collectionList.get(i)!= null && collectionList.get(i).equals(collectionId))
				{
					validId = true;
					break;
				}
			}
		}
		return validId;		
	}

  
	private int setLimit(int limit) {
		if (limit == 0) {
			limit = 10; // default
		}
		if (limit < 0 || limit > 10000) {
			throw new InvalidParameterException("limit", "limit can only be between 1 and 10000");
		}
		return limit;
	}
    

  /*
   * Get the geometry from the field
   *
   * @param item - JSONObject JSON Object of the item. if an item, this is the 
   *               item JSON. if a collection this is the spatial dictionary
   * @param geometryField - the field to get the geometry from
  */
  private String getGeometryFromField(JSONObject item, String geometryField, boolean isCollection) {
    String geometries = null;
    
    switch(geometryField) {
      case "bbox":
        JSONArray bbox = (JSONArray) item.get(geometryField);
        if (isCollection) {
          bbox = (JSONArray) bbox.get(0);
        }
        
        LOGGER.debug("geometry = " + bbox.toString()); 

        geometries = "{\"geometryType\": \"esriGeometryEnvelope\", "
        + "\"geometries\": [{"
        + "\"xmin\": " + bbox.get(0) + ", "
        + "\"ymin\": " + bbox.get(1) + ", "
        + "\"xmax\": " + bbox.get(2) + ", "
        + "\"ymax\": " + bbox.get(3) + "}]}";
        break;

      case "geometry":
        JSONObject geometry = (JSONObject) item.get(geometryField);
        LOGGER.debug("geometry = " + geometry.toString()); 

        String coordinates = geometry.getAsString("coordinates");

        String geometryType = geometry.getAsString("type");
        geometries = "{\"geometryType\": \"" + geometryClient.getArcGISGeometryType(geometryType) + "\", "
        + "\"geometries\": [ "
        + "{ \"rings\": " + coordinates + "}"
        + "]}";
        break;
        
      default:
        LOGGER.error("Unknown geometry field: " + geometryField);
    }

    return geometries;
  }  
    

  /*
   * Project an Individual item
   *
   * @param collection - the collection object of which the item is member
   * @param responseJSON - the item JSON from the index
   * @param sourceCRS - the CRS of the JSON being processed. On output this will be 4326.
   *                    when adding/updating a STAC item, this may be a different CRS.
   *                    the calling function needs to ensure the sourceCRS is supported
   *                    for the collection the item is in.
   * @param outCRS - the requested CRS
   *
   * @returns 
  */
  private JSONObject projectItemGeometries(Collection collection, 
                                           String responseJSON, 
                                           String sourceCRS,
                                           String outCRS) throws ParseException {

    String requestedCRS = StacHelper.getRequestedCRS(collection, outCRS);

    String[] geometryFields = {"geometry", "bbox", "envelope_geo", "shape_geo"};

    // use the STAC item JSON string as JSON object
    JSONParser jsonParser = new JSONParser();
    JSONObject responseObject = (JSONObject) jsonParser.parse(responseJSON);
    
    // Loop over all geometry fields
    for (String thisGeometryField: geometryFields) {
      
      if (responseObject.containsKey(thisGeometryField)) {

        // get the item geometry
        String geometries = geometryClient.getItemGeometry(responseObject, thisGeometryField);

        if ((geometries != null) && (!geometries.isEmpty())) {
          // project the geometry
          String geometryResponse = "";

          if (sourceCRS.contains("EPSG:")) {
            sourceCRS = sourceCRS.replace("EPSG:", "");
          }
          if (requestedCRS.contains("EPSG:")) {
            requestedCRS = requestedCRS.replace("EPSG:", "");
          }

          try {
              geometryResponse = geometryClient.doProjection(geometries, sourceCRS, requestedCRS);
          } catch (IOException ex) {
              java.util.logging.Logger.getLogger(STACService.class.getName()).log(Level.SEVERE, null, ex);
          }

          // if there is a geometry, update the STAC JSON with the projected geometry
          if (!geometryResponse.isBlank()) {

            // get projected geometries as JSON object
            try {
              JSONObject geometryResponseObject = (JSONObject) jsonParser.parse(geometryResponse);
              JSONArray projectedGeometries = (JSONArray) geometryResponseObject.get("geometries");             

              switch (thisGeometryField) {
                case "geometry":
                case "shape_geo":
                  JSONObject rings = (JSONObject) projectedGeometries.get(0);
                  JSONArray theRings = (JSONArray) rings.get("rings");
                  JSONObject newGeometry = new JSONObject();
                  newGeometry.put("type", "Polygon");
                  newGeometry.put("coordinates", theRings);

                  responseObject.put(thisGeometryField, newGeometry);

                  break;

                case "bbox":
                  JSONObject bbox = (JSONObject) projectedGeometries.get(0);
                  JSONArray projectedBbox = new JSONArray();
                  projectedBbox.add(bbox.get("xmin"));
                  projectedBbox.add(bbox.get("ymin"));
                  projectedBbox.add(bbox.get("xmax"));
                  projectedBbox.add(bbox.get("ymax"));

                  responseObject.put("bbox", projectedBbox);

                  break;

                case "envelope_geo":
                  JSONObject envelope = (JSONObject) projectedGeometries.get(0);
                  JSONArray upperLeft = new JSONArray();
                  JSONArray lowerRight = new JSONArray();
                  upperLeft.add(envelope.get("xmin"));
                  upperLeft.add(envelope.get("ymax"));
                  lowerRight.add(envelope.get("xmax"));
                  lowerRight.add(envelope.get("ymin"));

                  JSONArray projectedEnvelope = new JSONArray();
                  projectedEnvelope.add(upperLeft);
                  projectedEnvelope.add(lowerRight);

                  JSONObject newEnvelopeGeometry = new JSONObject();
                  newEnvelopeGeometry.put("type", "Envelope");
                  newEnvelopeGeometry.put("coordinates", projectedEnvelope);

                  JSONArray newEnvelopeGeometries = new JSONArray();
                  newEnvelopeGeometries.add(newEnvelopeGeometry);

                  responseObject.put("envelope_geo", newEnvelopeGeometries);

                  break;

                default:
                  LOGGER.error("Unsupported geometry field: " + thisGeometryField);
              }

            } catch (ParseException ex) {
              LOGGER.error(STACService.class.getName()+ ": " + ex.toString());
            }
          }
        }
        
      }
      
    }

    // get the xom:geometry_wkt dictionary
    String geomWKTField = gc.getGeomWKTField();
    JSONObject properties = (JSONObject) responseObject.get("properties");
    JSONObject geometry_wkt_in = (JSONObject) properties.get(geomWKTField);
    List<String> geometryTypes = new ArrayList<>();
    geometryTypes.add("point");
    geometryTypes.add("linestring");
    geometryTypes.add("polygon");
    geometryTypes.add("polyhedral");
    for (String geometryType: geometryTypes) {
      if (null != geometry_wkt_in) {
        if (geometry_wkt_in.containsKey(geometryType)) {
          String arcgisGeometry = geometryClient.getArcGISGeometry(geometryType.toUpperCase(), geometry_wkt_in);

          if (!arcgisGeometry.isEmpty()) {
            // project the geometry
            String geometryResponse = "";
            try {
              geometryResponse = geometryClient.doProjection(arcgisGeometry, sourceCRS, requestedCRS);
            } catch (IOException ex) {
              LOGGER.error(STACService.class.getName()+ ": " + ex.toString());
            }

            // if projection was successful save the updated WKT and set gsdb:crs property
            if (!geometryResponse.isBlank()) {
              // get projected geometries as JSON object
              try {
                JSONObject geometryResponseObject = (JSONObject) jsonParser.parse(geometryResponse);
                if (geometryResponseObject.containsKey("geometries")) {
                  JSONArray projectedGeometries = (JSONArray) geometryResponseObject.get("geometries");

                  String wktGeometry = geometryClient.getWKTGeometry(geometryType.toUpperCase(), projectedGeometries);
                  JSONObject geometryToUpdate = (JSONObject) geometry_wkt_in.get(geometryType);
                  geometryToUpdate.put("wkt", wktGeometry);

                  properties.put("gsdb:crs", outCRS);
                }
              } catch (ParseException ex) {
                LOGGER.error(STACService.class.getName()+ ": " + ex.toString());
              }
            }
          }
        }
      }
    }

    return responseObject;
  }


  /*
   * Project an Individual collection geometry
   *
   * @param collectionObject - the input collection JSON Object
   * @param inCRS - the CRS of the input
   * @paran outCRS - the requested CRS
  */
  private JSONObject projectCollectionGeometries(String theCollectionJSON, 
                                                 String inCRS, 
                                                 String outCRS) throws ParseException {

    JSONParser jsonParser = new JSONParser();
    JSONObject theCollection = (JSONObject) jsonParser.parse(theCollectionJSON);
    
    String requestedCRS = StacHelper.getRequestedCRS(theCollection, outCRS);

    String[] geometryFields = {"geometry", "bbox"};

    JSONObject responseObject = theCollection;
    JSONObject extent = new JSONObject((Map<String, ?>) responseObject.get("extent"));
    JSONObject spatial = new JSONObject((Map<String, ?>) extent.get("spatial"));

    // Loop over all geometry fields
    for (String thisGeometryField: geometryFields) {

      // get the item geometry
      String geometries = this.getGeometryFromField((JSONObject) spatial, thisGeometryField, true);

      // project the geometry
      String geometryResponse = "";
      try {
          geometryResponse = geometryClient.doProjection(geometries, inCRS, requestedCRS);
      } catch (IOException ex) {
          java.util.logging.Logger.getLogger(STACService.class.getName()).log(Level.SEVERE, null, ex);
      }

      // update the STAC JSON with the projected geometry
      if (!geometryResponse.isBlank()) {

        // get projected geometries as JSON object
        try {
          JSONObject geometryResponseObject = (JSONObject) jsonParser.parse(geometryResponse);
          JSONArray projectedGeometries = (JSONArray) geometryResponseObject.get("geometries");             

          switch (thisGeometryField) {
            case "geometry":
              JSONObject rings = (JSONObject) projectedGeometries.get(0);
              JSONArray theRings = (JSONArray) rings.get("rings");
              JSONObject geometry = (JSONObject) spatial.get("geometry");
              geometry.put("type", "Polygon");
              geometry.put("coordinates", theRings);

              break;

            case "bbox":
              JSONArray bbox = (JSONArray) spatial.get("bbox");
              
              JSONObject newBbox = (JSONObject) projectedGeometries.get(0);
              JSONArray projectedBbox = new JSONArray();
              projectedBbox.add(newBbox.get("xmin"));
              projectedBbox.add(newBbox.get("ymin"));
              projectedBbox.add(newBbox.get("xmax"));
              projectedBbox.add(newBbox.get("ymax"));
              JSONArray firstBbox = new JSONArray();
              firstBbox.add(projectedBbox);
              bbox.set(0, firstBbox);

              break;

            default:
              LOGGER.error("Unsupported geometry field: " + thisGeometryField);
          }
          
          responseObject.put("outCRS", outCRS);

        } catch (ParseException ex) {
          LOGGER.error(STACService.class.getName()+ ": " + ex.toString());
        }
      }
    }

    return responseObject;
  }


  private JSONObject projectSearchResults(
          String responseJSON,
          String inCRS,
          String outCRS )throws ParseException{
    
    
    // get the features from the response
    JSONParser jsonParser = new JSONParser();
    JSONObject responseObject = (JSONObject) jsonParser.parse(responseJSON);
    JSONArray features = (JSONArray) responseObject.get("features");

    // each feature is a STAC item that needs projecting
    for (int i=0; i<features.size(); i++) {
      JSONObject theFeature = (JSONObject) features.get(i);

      // get the collection metadata. the collection Id is in the search result
      String collectionId = theFeature.getAsString("collection");
      Collection collection = new Collection(collectionId);

      // check if outCRS is known for this collection
      List<String> availableCRS = collection.getAvailableCRS();
      if ((availableCRS.contains(outCRS)) || (outCRS.startsWith("EPSG:"))) {

        JSONObject responseJSONObject = (JSONObject) projectItemGeometries(collection, theFeature.toString(), inCRS, outCRS);
        features.set(i, responseJSONObject);
      }

    }
    
    return null;
  }
  
  
  private JSONObject projectIncomingItem(JSONObject item, String collectionId) throws ParseException {
    // 574 project geometries from submitted to native (4326) CRS if possible
    String inCRSField = gc.getGeomCRSField();
    JSONObject responseJSONObject = item;
          
    if (!inCRSField.isEmpty()) {
      JSONObject prop = (JSONObject) item.get("properties");

      // if there is the gsdb:crs field see if projection is needed
      if (prop.containsKey(inCRSField)) {
        String inCRS = prop.getAsString(inCRSField);

        // only project if the inCRS is not 4326
        if (!inCRS.equals(INTERNAL_CRS)) {

          // get the collection metadata
          Collection collection = new Collection(collectionId);

          // check if inCRS is known for this collection
          List<String> availableCRS = collection.getAvailableCRS();
          if ((availableCRS.contains(inCRS)) || (inCRS.startsWith("EPSG:"))) {
            String requestedCRS = StacHelper.getRequestedCRS(collection, inCRS);
            responseJSONObject = projectItemGeometries(collection, item.toString(), requestedCRS, INTERNAL_CRS);
          }
        }
      }
    } else {
      LOGGER.error("CRS field (geomCRSField) not set in app-context.xml.");
    }
    
    return responseJSONObject;
  }
}
