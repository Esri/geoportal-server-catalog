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
package com.esri.geoportal.service.rest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.request.BulkChangeOwnerRequest;
import com.esri.geoportal.lib.elastic.request.ChangeOwnerRequest;
import com.esri.geoportal.lib.elastic.request.DeleteItemRequest;
import com.esri.geoportal.lib.elastic.request.GetItemRequest;
import com.esri.geoportal.lib.elastic.request.GetMetadataRequest;
import com.esri.geoportal.lib.elastic.request.PublishMetadataRequest;
import com.esri.geoportal.lib.elastic.request.RealiasRequest;
import com.esri.geoportal.lib.elastic.request.ReindexRequest;
import com.esri.geoportal.lib.elastic.request.SearchRequest;
import com.esri.geoportal.lib.elastic.request.ValidateMetadataRequest;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

import com.esri.geoportal.lib.elastic.request.TransformMetadataRequest;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

/**
 * Handles /rest/metadata/* requests.
 */
@Path("/metadata")
@Api(value="/rest")
public class MetadataService {
  
  @PUT
  @Path("/bulk/changeOwner")
  @ApiOperation(value="Transfer ownership of all items owned by a user.",
      notes="Requires an Admin role.")
  public Response bulkChangeOwner(
      @Context SecurityContext sc,
      @ApiParam(value="the current owner",required=true) @QueryParam("owner") String owner, 
      @ApiParam(value="the new owner",required=true) @QueryParam("newOwner") String newOwner, 
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    try {
      BulkChangeOwnerRequest request = GeoportalContext.getInstance().getBeanIfDeclared(
        "request.BulkChangeOwnerRequest",BulkChangeOwnerRequest.class,new BulkChangeOwnerRequest());
      request.init(user,pretty);
      request.init(owner,newOwner);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  @DELETE 
  @Path("/item/{id}")
  @ApiOperation(value="Delete an item.",
    notes="Only the item owner (or an Admin) can delete an item.")
  public Response delete(
      @Context SecurityContext sc,
      @ApiParam(value="the item id",required=true) @PathParam("id") String id, 
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return this.deleteItem(user,pretty,id);
  }
  
  @GET 
  @Path("/item/{id}")
  @ApiOperation(value="Get an item.")
  public Response get(
      @Context SecurityContext sc,
      @ApiParam(value="the item id",required=true) @PathParam("id") String id,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty,
      @ApiParam(value="the response format",allowableValues="json,atom,csw") @QueryParam("f") String f,
      @ApiParam(value="true if metadata xml should be included as a json property") @QueryParam("includeMetadata") String incl) {
    //System.err.println("MetadataService.getItem");
    //boolean inclIsFalse = (incl != null && incl.equalsIgnoreCase("false"));
    //boolean includeMetadata = !inclIsFalse;
    boolean inclIsTrue = (incl != null && incl.equalsIgnoreCase("true"));
    boolean includeMetadata = inclIsTrue;
    AppUser user = new AppUser(sc);
    return this.getItem(user,pretty,id,f,includeMetadata);
  }
  
  @GET 
  @Path("/item/{id}/xml")
  @ApiOperation(value="Get the metadata XML for an item.")
  public Response getXml(
      @Context SecurityContext sc,
      @ApiParam(value="the item id") @PathParam("id") String id) {
    AppUser user = new AppUser(sc);
    return this.getMetadata(user,id);
  }
  
  @GET 
  @Path("/item/{id}/html")
  @ApiOperation(value="Get the HTML details for an item.",
      notes="transformed from the metadata XML")
  public Response getHtml(
      @Context SecurityContext sc,
      @ApiParam(value="the item id") @PathParam("id") String id) {
    AppUser user = new AppUser(sc);
    boolean pretty = false;
    return this.transformMetadata(user,pretty,true,id,null,null);
  }
  
  @PUT
  @Path("/item")
  @ApiOperation(value="Publish an item.",
      notes="Requires a Publisher role."+
        "<ul>Content can be supplied as either:"+
        "<li>an XML document representing the metadata for the item</li>"+
        "<li>a JSON document representing the item (use xml='xmlString' to supply the metadata)</li>"+
        "</ul>",
      consumes="application/xml,application/json")
  public Response put(
      String body,
      @Context SecurityContext sc,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty,
      @ApiParam(value="returns immediately if true") @QueryParam("async") boolean async) {
    //System.err.println("request-count="+requestCount.getAndIncrement()+" ...");
    AppUser user = new AppUser(sc);
    if (async) {
      new Thread(() -> {
        this.publishMetadata(user,pretty,null,body);
      }).start();
      String json = "{\"async\": true}";
      return Response.ok(json).type(MediaType.APPLICATION_JSON_TYPE).build();
    } else {
      return this.publishMetadata(user,pretty,null,body);
    }
  }
  
  @PUT
  @Path("/item/{id}")
  @ApiOperation(value="Publish or update item using the supplied identifier.",
      notes="Requires a Publisher role. Only the item owner (or an Admin) can delete an item."+
          "<ul>Content can be supplied as either:"+
          "<li>an XML document representing the metadata for the item</li>"+
          "<li>a JSON document representing the item (use xml='xmlString' to supply the metadata)</li>"+
          "</ul>",
        consumes="application/xml,application/json")
  public Response putWithId(
      String body,
      @Context SecurityContext sc,
      @ApiParam(value="the item id") @PathParam("id") String id, 
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return this.publishMetadata(user,pretty,id,body);
  }
  
  @PUT
  @Path("/item/{id}/owner/{newOwner}")
  @ApiOperation(value="Transfer ownership of an item.",
      notes="Requires an Admin role.")
  public Response putOwner(
      @Context SecurityContext sc,
      @ApiParam(value="the item id") @PathParam("id") String id, 
      @ApiParam(value="the new owner") @PathParam("newOwner") String newOwner, 
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return this.changeOwner(user,pretty,id,newOwner);
  }
  
  @GET 
  @Path("/realias")
  @ApiOperation(value="Reset the index associated with the 'metadata' alias.",
      notes="Requires an Admin role. The active Elasticsearch index is determined by an Elasticsearch alias"+
        " (alias 'metadata' initially pointing to an index named 'metadata_v1').")
  public Response realiasUsingGet(
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty,
      @ApiParam(value="the index to associate with the 'metadata' alias") @QueryParam("indexName") String indexName) {
    AppUser user = new AppUser(sc);
    return this.realias(user,pretty,indexName);
  }
  
  @GET 
  @Path("/reindex")
  @ApiOperation(value="Re-index content.",
      notes="Requires an Admin role. This operation may require a different approach for very large indexes.")
  public Response reindexUsingGet(
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty,
      @ApiParam(value="the source",required=true) @QueryParam("fromIndexName") String fromIndexName,
      @ApiParam(value="the destination",required=true) @QueryParam("toIndexName") String toIndexName,
      @ApiParam(value="a cue for the version of the from index (not currently used).") @QueryParam("fromVersionCue") String fromVersionCue) {
    AppUser user = new AppUser(sc);
    return this.reindex(user,pretty,fromIndexName,toIndexName,fromVersionCue);
  }
  
  @GET 
  @Path("/search")
  @ApiOperation(value="Search for items.")
  @ApiImplicitParams({
    @ApiImplicitParam(name="q",value="the search terms",dataType="string",paramType="query"),
    @ApiImplicitParam(name="from",value="the starting index",dataType="integer",paramType="query"),
    @ApiImplicitParam(name="size",value="the number of items to return",dataType="integer",paramType="query"),
    @ApiImplicitParam(name="bbox",value="the bounding envelope WGS84 (bbox=xmin,ymin,xmax,ymax)",dataType="string",paramType="query"),
    @ApiImplicitParam(name="time",value="the time period for the resource (time=start/end)",dataType="string",paramType="query"),
    @ApiImplicitParam(name="f",value="the response format",dataType="string",paramType="query",allowableValues="json,atom,csw")
  })
  public Response searchUsingGet(
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    String body = null;
    return this.search(user,pretty,hsr,body);
  }
  
  @POST 
  @Path("/search")
  @ApiOperation(value="Search for items.",consumes="application/x-www-form-urlencoded")
  @ApiImplicitParams({
    @ApiImplicitParam(name="q",value="the search terms",dataType="string",paramType="query"),
    @ApiImplicitParam(name="from",value="the starting index",dataType="integer",paramType="query"),
    @ApiImplicitParam(name="size",value="the number of items to return",dataType="integer",paramType="query"),
    @ApiImplicitParam(name="bbox",value="the bounding envelope WGS84 (bbox=xmin,ymin,xmax,ymax)",dataType="string",paramType="query"),
    @ApiImplicitParam(name="time",value="the time period for the resource (time=start/end)",dataType="string",paramType="query"),
    @ApiImplicitParam(name="f",value="the response format",dataType="string",paramType="query",allowableValues="json,atom,csw")
  })
  public Response searchUsingPost(
      String body,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return this.search(user,pretty,hsr,body);
  }
  
  @POST 
  @Path("/transform")
  @ApiOperation(value="Transform an XML document.",
      consumes="application/xml",
      produces="text/html")
  public Response transformUsingPost(
      String xml,
      @Context SecurityContext sc,
      @ApiParam(value="the xslt name",required=true) @QueryParam("xslt") String xslt) {
    AppUser user = new AppUser(sc);
    boolean pretty = false;
    return this.transformMetadata(user,pretty,false,null,xml,xslt);
  }
  
  /*
  @PUT 
  @Path("/transform")
  @ApiOperation(value="Transform an XML document.",
    consumes="application/xml",
    produces="text/html")
  public Response transformUsingPut(
      String xml,
      @Context SecurityContext sc,
      @ApiParam(value="the xslt name",required=true) @QueryParam("xslt") String xslt) {
    AppUser user = new AppUser(sc);
    boolean pretty = false;
    return this.transformMetadata(user,pretty,false,null,xml,xslt);
  }
  */
  
  @POST 
  @Path("/validate")
  @ApiOperation(value="Validate an XML document.",
      consumes="application/xml",
      produces="application/json")
  public Response validateUsingPost(
      String xml,
      @Context SecurityContext sc,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return this.validateMetadata(user,pretty,xml);
  }
  
  /*
  @PUT 
  @Path("/validate")
  @ApiOperation(value="Validate an XML document.",
      consumes="application/xml",
      produces="application/json")
  public Response validateUsingPut(
      String xml,
      @Context SecurityContext sc,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return this.validateMetadata(user,pretty,xml);
  }
  */
  
  /** ======================================================================= */
  
  /**
   * Change owner.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param id the item id
   * @param newOwner the new owner
   * @return the response
   */
  protected Response changeOwner(AppUser user, boolean pretty, String id, String newOwner) {
    try {
      ChangeOwnerRequest request = GeoportalContext.getInstance().getBean(
          "request.ChangeOwnerRequest",ChangeOwnerRequest.class);
      request.init(user,pretty);
      request.init(id,newOwner);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }

  /**
   * Delete an item.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param id the item id
   * @return the response
   */
  protected Response deleteItem(AppUser user, boolean pretty, String id) {
    try {
      DeleteItemRequest request = GeoportalContext.getInstance().getBean(
          "request.DeleteItemRequest",DeleteItemRequest.class);
      request.init(user,pretty);
      request.init(id);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Get an item.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param id the item id
   * @param f the response format
   * @param includeMetadata if true then include metadata
   * @return the response
   */
  protected Response getItem(AppUser user, boolean pretty, String id, String f, boolean includeMetadata) {
    try {
      GetItemRequest request = GeoportalContext.getInstance().getBean(
          "request.GetItemRequest",GetItemRequest.class);  
      request.init(user,pretty);
      request.init(id,f,includeMetadata);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Get item metadata.
   * @param user the active user
   * @param id the item id
   * @return the response
   */
  protected Response getMetadata(AppUser user, String id) {
    boolean pretty = false;
    try {
      GetMetadataRequest request = GeoportalContext.getInstance().getBean(
          "request.GetMetadataRequest",GetMetadataRequest.class); 
      request.init(user,pretty);
      request.init(id);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Publish metadata.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param id the item id
   * @param content the content to publish
   * @return the response
   */
  protected Response publishMetadata( AppUser user, boolean pretty, String id, String content) {
    try {
      //System.err.println("publishMetadata............");
      PublishMetadataRequest request = GeoportalContext.getInstance().getBean(
          "request.PublishMetadataRequest",PublishMetadataRequest.class);
      request.init(user,pretty);
      request.init(id,content);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Reset the index for the metadata alias.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param indexName the index to associated with the metadata alias
   * @return the response
   */
  protected Response realias(AppUser user, boolean pretty, String indexName) {
    try {
      RealiasRequest request = GeoportalContext.getInstance().getBeanIfDeclared(
          "request.RealiasRequest",RealiasRequest.class,new RealiasRequest());
      request.init(user,pretty);
      request.setIndexName(indexName);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Re-index.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param fromIndexName the from index name
   * @param toIndexName the to index name
   * @param fromVersionCue a from version cue
   * @return the response
   */
  protected Response reindex(AppUser user, boolean pretty, String fromIndexName, String toIndexName, String fromVersionCue) {
    try {
      ReindexRequest request = GeoportalContext.getInstance().getBeanIfDeclared(
          "request.ReindexRequest",ReindexRequest.class,new ReindexRequest());
      request.init(user,pretty);
      request.setFromIndexName(fromIndexName);
      request.setToIndexName(toIndexName);
      request.setFromVersionCue(fromVersionCue);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Search.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param hsr the http request
   * @param body the request body
   * @return the response
   */
  protected Response search(AppUser user, boolean pretty, HttpServletRequest hsr, String body) {
    try {
      SearchRequest request = GeoportalContext.getInstance().getBean(
          "request.SearchRequest",SearchRequest.class);
      request.init(user,pretty);
      request.initBaseUrl(hsr,null);
      request.setParameterMap(hsr.getParameterMap());
      request.setBody(body);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Transform metadata.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param id the item id
   * @param xml the metadata
   * @param xslt the xslt to use
   * @return the response
   */
  protected Response transformMetadata(AppUser user, boolean pretty, 
      boolean forItemDetails, String id, String xml, String xslt) {
    try {
      TransformMetadataRequest request = GeoportalContext.getInstance().getBean(
          "request.TransformMetadataRequest",TransformMetadataRequest.class);
      request.init(user,pretty);
      request.setForItemDetails(forItemDetails);
      if (forItemDetails) {
        request.setId(id);
      } else {
        request.setXml(xml);
        request.setXslt(xslt);
      }
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Validate metadata.
   * @param user the active user
   * @param pretty for pretty JSON
   * @param xml the metadata
   * @return the response
   */
  protected Response validateMetadata(AppUser user, boolean pretty, String xml) {
    try {
      ValidateMetadataRequest request = GeoportalContext.getInstance().getBean(
          "request.ValidateMetadataRequest",ValidateMetadataRequest.class);
      request.init(user,pretty);
      request.init(xml);
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Write an exception response.
   * @param t the cause
   * @param pretty for pretty JSON
   * @return the response
   */
  protected Response writeException(Throwable t, boolean pretty) {
    return (new AppResponse()).buildException(t,pretty);
  }

}
