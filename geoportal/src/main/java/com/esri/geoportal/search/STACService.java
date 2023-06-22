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
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
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
import javax.ws.rs.GET;
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

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.ResourcePath;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.esri.geoportal.lib.elastic.http.request.GetItemRequest;



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
			response = this.readResourceFile("service/config/stac-description.json",hsr);
	
		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
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
			responseJSON = this.readResourceFile("service/config/stac-conformance.json",hsr);		
			
		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;			
			
			responseJSON = ("{\"error\":\"STAC API Conformance response could not be generated.\"}");
			
		}
		return Response.status(status).entity(responseJSON).build();
		
	}
  
  @GET
  @Path("/api")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getApi(@Context HttpServletRequest hsr) {
	  String responseJSON = null;
		Status status = Response.Status.OK;
		try {
			responseJSON = this.readResourceFile("service/config/stac-api.json",hsr);
		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API description response could not be generated.\"}");
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
			responseJSON = this.readResourceFile("service/config/stac-collections.json",hsr);
			
		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
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
			responseJSON = this.readResourceFile("service/config/stac-collection-metadata.json",hsr);
	
		} catch (Exception e) {
			LOGGER.error("Error in conformance " + e);
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API collection response could not be generated.\"}");
		}
		return Response.status(status).entity(responseJSON).build();
  }
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("/collections/metadata/items")
	public Response getItems(@Context HttpServletRequest hsr, 
			@QueryParam("limit") int limit,
			@QueryParam("bbox") String bbox,
			@QueryParam("datetime") String datetime,
			@QueryParam("from") int from) throws UnsupportedEncodingException {
		String responseJSON = null;
		String response="";
		Status status = Response.Status.OK;
		limit = setLimit(limit);
		
		String query="";
				
		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			ElasticClient client = ElasticClient.newClient();
			String url = client.getTypeUrlForSearch(ec.getIndexName());
			Map<String, String> queryMap = new HashMap<String,String>();
			
			if(bbox !=null && bbox.length()>0)
				queryMap.put("bbox", bbox);
			if(datetime !=null && datetime.length()>0)
				queryMap.put("datetime", datetime);
			
			if(from >0)
			{
				url = url+"/_search?size="+limit+"&from="+from;
			}
			else
				url = url+"/_search?size="+limit;
			
			
			query = this.prepareQuery(queryMap);
			if(query.length()>0)
				response = client.sendPost(url,query,"application/json");
			else
				response = client.sendGet(url);
			
			responseJSON = this.prepareResponse(response,hsr,bbox,from,limit,datetime);

		} catch (Exception e) {
			LOGGER.error("Error in getting items " + e.getCause());
			e.printStackTrace();
			status = Response.Status.INTERNAL_SERVER_ERROR;
			responseJSON = ("{\"error\":\"STAC API Collection metadata items response could not be generated.\"}");
		}
		return Response.status(status).entity(responseJSON).build();
	}


private String prepareResponse(String response,HttpServletRequest hsr,String bbox, int from,int limit, String datetime) {
		JsonObject resObj = (JsonObject) JsonUtil.toJsonStructure(response);
		int numberMatched;
		JsonArray items =null;
		String numberReturned="";
		String itemFileString="";
		try {
			itemFileString = this.readResourceFile("service/config/stac-items.json",hsr);
			if(resObj.getJsonObject("hits") != null)
			{
				numberMatched = resObj.getJsonObject("hits").getJsonObject("total").getInt("value");
				
				items = resObj.getJsonObject("hits").getJsonArray("hits");
				numberReturned = String.valueOf(items.size());
				itemFileString = itemFileString.replaceAll("\\{numberMatched\\}",""+numberMatched);
				itemFileString = itemFileString.replaceAll("\\{numberReturned\\}",numberReturned);
				itemFileString = itemFileString.replaceAll("\\{start\\}",""+from);				
				itemFileString = itemFileString.replaceAll("\\{features\\}", items.toString());
				
				//Prepare urlparam for next page from=next&size=limit&bbox=bbox
				int next = from+limit;
				String urlparam = "from="+next+"&limit="+limit+"&bbox="+bbox+"&datetime="+datetime;
				
				itemFileString = itemFileString.replaceAll("\\{urlparam\\}", ""+urlparam);
			//	TODO
			//	this.createRecord(items);
				
			}
			
		} catch (IOException | URISyntaxException e) {
			
			e.printStackTrace();
		}		
		return itemFileString;
	}

//	private void createRecord(JsonArray items) {
//		JsonObject feature = JsonUtil.newObject();
//		
//		for(int i=0;i<items.size();i++)
//		{
//			JsonObject item = (JsonObject) items.get(i);
//
//		}
//		
//		// logic for 'geometry' property
//	      var geom = {};
//
//	      // per OGC Records API, polygon schema should have min 4 coordinates
//	      // https://github.com/opengeospatial/ogcapi-records/blob/master/core/openapi/schemas/polygonGeoJSON.yaml
//	      // response from elastic search has 2 coords - upper left and lower right - so create 4 coords to 
//	      // conform to OGC Records 
//	      if (item._source.envelope_geo) {
//	        var xmin = item._source.envelope_geo.coordinates[0][0];
//	        var xmax = item._source.envelope_geo.coordinates[1][0];
//	        var ymin = item._source.envelope_geo.coordinates[1][1];
//	        var ymax = item._source.envelope_geo.coordinates[0][1];
//
//	        var coord = [
//	          [xmin, ymin],
//	          [xmin, ymax],
//	          [xmax, ymax],
//	          [xmax, ymin],
//	          [xmin, ymin],
//	        ];      
//
//	        geom = {
//	          type: 'Polygon',
//	          coordinates: coord
//	        };
//	      }          
//
//	      // logic for 'time' property - per OGC Records API, 'time' should have min 2 dates. 
//	      // https://github.com/opengeospatial/ogcapi-records/blob/master/core/openapi/schemas/recordGeoJSON.yaml
//	      // TBD - decide which date fields to read. 
//	      var timeProperty = null;
//	      if (item._source.timeperiod_nst && item._source.timeperiod_nst.begin_dt && item._source.timeperiod_nst.end_dt) {
//	        // For now if result has time range, returns the dates else null
//	        timeProperty = [item._source.timeperiod_nst.begin_dt, item._source.timeperiod_nst.end_dt];
//	      } 
//
//	      var feat = {
//	        id: item._id,
//	        type: 'Feature',
//	        geometry: geom,
//	        time: timeProperty,
//
//	        // TBD - for now, sending back all properties from elastic search response, but have to decide how
//	        // to map response properties with OGC Records 'recordGeoJSON' schema
//	        // https://github.com/opengeospatial/ogcapi-records/blob/master/core/openapi/schemas/recordGeoJSON.yaml
//	        properties: item._source 
//	        // properties: {
//	        //   type: item._source.sys_metadatatype_s,
//	        //   title: item._source.title,
//	        //   recordCreated: item._source.sys_created_dt,
//	        //   recordUpdated: item._source.sys_modified_dt
//	          
//	        // }
//	      };
//	      return feat;
//	}

private String prepareQuery(Map<String,String> queryMap) {	  
	  String queryStr = "";  	  
	 JsonArrayBuilder builder = Json.createArrayBuilder();
		
	 if (queryMap.containsKey("bbox"))
	 {
 		String bboxQry = this.prepareBbox((String)queryMap.get("bbox"));
 		if(bboxQry.length()>0)
 			builder.add(JsonUtil.toJsonStructure(bboxQry));
 			
	 }
	 if (queryMap.containsKey("datetime"))
	 {
		 String dateTimeQry = this.prepareDateTime(queryMap.get("datetime"));
		 if(dateTimeQry.length()>0)
			 builder.add(JsonUtil.toJsonStructure(dateTimeQry));
     }
	 JsonArray filter = builder.build();
	 if(filter.size()>0)
		 queryStr = "{\"query\":{\"bool\": {\"must\":"+JsonUtil.toJson(filter)+"}}}";
	return queryStr;
	}

private String prepareDateTime(String datetime) {
	String query="";	
	String  dateTimeFld = "sys_modified_dt";
	String dateTimeFldQuery = "";
	//Find from and to dates https://api.stacspec.org/v1.0.0/ogcapi-features/#tag/Features/operation/getFeatures
//	Either a date-time or an interval, open or closed. Date and time expressions adhere to RFC 3339. Open intervals are expressed using double-dots.
//	Examples:
//	A date-time: "2018-02-12T23:20:50Z"
//	A closed interval: "2018-02-12T00:00:00Z/2018-03-18T12:31:12Z"
//	Open intervals: "2018-02-12T00:00:00Z/.." or "../2018-03-18T12:31:12Z"
	
	String fromField = datetime;
	String toField = "";
	List<String> dateFlds = Arrays.asList(datetime.split("/"));
	
	if(dateFlds.size()>1)
	{
		fromField = dateFlds.get(0);
		toField = dateFlds.get(1);
	}
	if(toField.equals("") || toField.equals("..")) {
		dateTimeFldQuery = "{\"gte\": \""+fromField+"\"}";
	}
	else if(fromField.equals(".."))
	{
		dateTimeFldQuery ="{\"lte\":\""+toField+"\"}";
	}
	else
	{
		dateTimeFldQuery ="{\"gte\": \""+fromField+"\",\"lte\":\""+toField+"\"}";
	}

	query = "{\"range\": {\""+dateTimeFld+"\":"+dateTimeFldQuery+"}}";
	
	return query;
	
}

private String prepareBbox(String bboxString) {
	 String field = "envelope_geo";
	  String spatialType = "geo_shape"; // geo_shape or geo_point
	  String relation = "intersects";
	 List <String> bbox = Arrays.asList(bboxString.split(",", -1));

     double coords[] = {-180.0,-90.0,180.0,90.0} ;
     String query = "";      
     if (bbox.size()> 3) { 
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
    	 query= "{\""+spatialType+"\": {\""+field+"\": {\"shape\": {\"type\": \"envelope\","
					+"\"coordinates\": [["+coords[0]+","+coords[3]+"], ["+coords[2]+","+coords[1]+"]]"
				+"},\"relation\": \""+relation+"\"}}}";
		}
	return query;
}

private int setLimit(int limit) {
		if(limit==0 || limit >10000)
		{
			limit =10; //default
		}		
		return limit;
	}

  @GET
  @Path("collections/metadata/items/{featureId}")
  public Response getItem(@Context HttpServletRequest hsr, @PathParam("featureId") String id) {	 
	  //To test 92e7716e2865405fb94ed14585649d0f
	  GetItemRequest request = GeoportalContext.getInstance().getBean(
	          "request.GetItemRequest",GetItemRequest.class);  
	  request.init(id, null,false);
	    try {
	      AppResponse response = request.executeNOAuth();
	      return response.build();
	    } catch (Exception ex) {
	    	LOGGER.error("Error in get item " + ex.getCause());
			
			String responseJSON = ("{\"error\":\"STAC API feature response could not be generated.\"}");
			 return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(responseJSON).build();
		} 	    
  }

  
  public String getBaseUrl(HttpServletRequest hsr) {	   
	    
	    StringBuffer requestURL = hsr.getRequestURL();
	    String ctxPath = hsr.getContextPath();
	    String baseUrl = requestURL.substring(0,requestURL.indexOf(ctxPath)+ctxPath.length());
	    return baseUrl+"/stac";
	  }
 
  public String readResourceFile(String path, HttpServletRequest hsr) 
	      throws IOException, URISyntaxException {
	    ResourcePath rp = new ResourcePath();
	    URI uri = rp.makeUrl(path).toURI();
	    String filedataString = new String(Files.readAllBytes(Paths.get(uri)),"UTF-8");
	    
	    if (filedataString != null) 
	    	filedataString = filedataString.trim();
	    String requestURL = hsr.getRequestURL().toString();
	    //Remove last /
	    requestURL = requestURL.substring(0,requestURL.length()-1);
	    
	    //Replace {url}
	    filedataString = filedataString.replaceAll("\\{url\\}", this.getBaseUrl(hsr));
	    return filedataString;	
	  } 
  
 
  
}

