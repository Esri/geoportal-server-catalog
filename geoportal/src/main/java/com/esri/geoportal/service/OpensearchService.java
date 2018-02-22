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
package com.esri.geoportal.service;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.request.OpensearchRequest;

import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.core.UriInfo;

/**
 * Opensearch service provider.
 */
@ApplicationPath("deprecatedopensearch")
@Path("")
public class OpensearchService extends Application {
  
  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> resources = new HashSet<Class<?>>();
    resources.add(OpensearchService.class);
    return resources;
  }
  
  @GET
  @Path("/description")
  public Response getDescription(
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @Context UriInfo uriInfo) {
    // http://localhost:8080/geoportal2/opensearch/description
    AppUser user = new AppUser(sc);
    boolean pretty = false;
    return description(user,pretty,hsr);
  }
  
  @GET 
  public Response searchUsingGet(
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    String body = null;
    return this.search(user,pretty,hsr,body);
  }
  
  @POST 
  public Response searchUsingPost(
      String body,
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return this.search(user,pretty,hsr,body);
  }
  
  /**
   * Return the Opensearch descriptor.
   * @param user the active user
   * @param pretty for pretty response
   * @param hsr the http request
   * @return the response
   */
  protected Response description(AppUser user, boolean pretty, HttpServletRequest hsr) {
    try {
      OpensearchRequest request = GeoportalContext.getInstance().getBean(
          "request.OpensearchRequest",OpensearchRequest.class);
      request.init(user,pretty);
      request.initBaseUrl(hsr,null);
      AppResponse response = request.description();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }
  
  /**
   * Search.
   * @param user the active user
   * @param hsr the http request
   * @param body the request body
   * @return the response
   */
  protected Response search(AppUser user, boolean pretty, HttpServletRequest hsr, String body) {
    try {
      OpensearchRequest request = GeoportalContext.getInstance().getBean(
          "request.OpensearchRequest",OpensearchRequest.class);
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
   * Write an exception response.
   * @param t the cause
   * @param pretty for pretty JSON
   * @return the response
   */
  protected Response writeException(Throwable t, boolean pretty) {
    return (new AppResponse()).buildException(t,pretty);
  }

}
