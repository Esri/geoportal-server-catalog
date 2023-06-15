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
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Set;

import javax.json.JsonObject;
import javax.json.JsonStructure;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.container.AsyncResponse;
import javax.ws.rs.container.Suspended;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.SecurityContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.ResourcePath;



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
  
  @POST
  @Consumes({MediaType.APPLICATION_FORM_URLENCODED})
  public void post(@Suspended final AsyncResponse asyncResponse,
      @Context HttpServletRequest hsr,
      MultivaluedMap<String, String> requestParams) {
    new SearchRequest(asyncResponse).execute(hsr,requestParams);
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
  @Path("/collections/metadata/items")
  public void getItem(@Context HttpServletRequest hsr) {
    
  }
  
  @GET
  @Path("collections/metadata/queryables")
  public void getQueryables(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
  }

  

  @GET
  @Path("/search")
  public void getSearch(@Suspended final AsyncResponse asyncResponse,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr) {
    new SearchRequest(asyncResponse).execute(hsr);
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

