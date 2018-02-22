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
import com.esri.geoportal.base.util.Val;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.request.CswRequest;
import com.esri.geoportal.lib.elastic.request.OpensearchRequest;
import com.esri.geoportal.lib.elastic.response.OwsException;

import java.util.Enumeration;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.springframework.security.access.AccessDeniedException;

import javax.ws.rs.core.SecurityContext;
import javax.ws.rs.core.UriInfo;

/**
 * CSW service provider.
 */
@ApplicationPath("deprecatedcsw")
@Path("")
public class CswService extends Application {

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> resources = new HashSet<Class<?>>();
    resources.add(CswService.class);
    return resources;
  }

  @GET
  public Response csw(
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @Context UriInfo uriInfo,
      @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    String body = null;
    String qstr = hsr.getQueryString();
    if ((qstr == null) || (qstr.length() == 0)) {
      Enumeration<String> en = hsr.getHeaders("Accept");
      while (en.hasMoreElements()) {
        String s = en.nextElement();
        if ((s != null) && (s.indexOf("application/opensearchdescription+xml") != -1)) {
          return this.opensearchDescription(user,pretty,hsr);
        }
      }
      return this.getCapabilities(user,pretty,hsr,body);
    }
    return this.execute(user,pretty,hsr,body);
  }

  /**
   * Execute a GetRecords or GetRecordById request.
   * @param user the active user
   * @param pretty for pretty response
   * @param hsr the http request
   * @param body String body the request body
   * @return the response
   */
  protected Response execute(AppUser user, boolean pretty, HttpServletRequest hsr, String body) {
    try {
      CswRequest request = GeoportalContext.getInstance().getBean(
          "request.CswRequest",CswRequest.class);
      request.init(user,pretty);
      request.initBaseUrl(hsr,null);
      request.setParameterMap(hsr.getParameterMap());
      request.setBody(body);

      request.setAcceptHeader(hsr.getHeader("accept"));
      String outputFormat = Val.trim(hsr.getParameter("outputFormat"));
      if (outputFormat == null) {
        String accept = hsr.getHeader("accept");
        if (accept != null) {
          if (accept.equalsIgnoreCase("application/atom+xml")) {
            outputFormat = "application/atom+xml";
            request.getOverrideParameters().put("outputFormat",outputFormat);
          }
        }
      }
      AppResponse response = request.execute();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }

  /**
   * Execute a GetCapabilities request.
   * @param user the active user
   * @param pretty for pretty response
   * @param hsr the http request
   * @param body String body the request body
   * @return the response
   */
  protected Response getCapabilities(AppUser user, boolean pretty, HttpServletRequest hsr, String body) {
    try {
      CswRequest request = GeoportalContext.getInstance().getBean(
          "request.CswRequest",CswRequest.class);
      request.init(user,pretty);
      request.initBaseUrl(hsr,null);
      request.setParameterMap(hsr.getParameterMap());
      request.setBody(body); 
      request.setAcceptHeader(hsr.getHeader("accept"));
      AppResponse response = request.getCapabilities();
      return response.build();
    } catch (Throwable t) {
      return this.writeException(t,pretty);
    }
  }

  /**
   * Return the Opensearch descriptor.
   * @param user the active user
   * @param pretty for pretty response
   * @param hsr the http request
   * @return the response
   */
  protected Response opensearchDescription(AppUser user, boolean pretty, HttpServletRequest hsr) {
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
   * Write an exception response.
   * @param t the cause
   * @param pretty for pretty JSON
   * @return the response
   */
  protected Response writeException(Throwable t, boolean pretty) {
    // TODO logging??
    if (t instanceof OwsException) {
      String xml = ((OwsException)t).getReport();
      return Response.status(Status.BAD_REQUEST).entity(xml).type(
          MediaType.APPLICATION_XML_TYPE.withCharset("UTF-8")).build();
    } else {
      Response.Status status = Response.Status.INTERNAL_SERVER_ERROR;
      if (t instanceof AccessDeniedException) {
        status = Response.Status.UNAUTHORIZED;
      }
      OwsException e = new OwsException(t);
      String xml = e.getReport();
      return Response.status(status).entity(xml).type(
          MediaType.APPLICATION_XML_TYPE.withCharset("UTF-8")).build();
    }
  }

}
