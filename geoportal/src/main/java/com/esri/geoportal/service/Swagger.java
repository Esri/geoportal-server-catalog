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
import com.esri.geoportal.context.GeoportalContext;

import java.net.URI;
import java.net.URLEncoder;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

/**
 * Swagger API configuration and redirect.
 */
@ApplicationPath("swagger")
@Path("")
public class Swagger extends Application {

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> resources = new HashSet<Class<?>>();
    resources.add(Swagger.class);
    
    try {
      if (GeoportalContext.getInstance().getBeanIfDeclared("swaggerConfig") != null) {
        resources.add(io.swagger.jaxrs.listing.ApiListingResource.class);
        resources.add(io.swagger.jaxrs.listing.SwaggerSerializers.class); 
      }
    } catch(Exception ex) {
      ex.printStackTrace();
    }
    return resources;
  }

  @GET
  public Response swagger(
      @Context HttpServletRequest hsr) {
    try {
      io.swagger.jaxrs.config.BeanConfig cfg = (io.swagger.jaxrs.config.BeanConfig)GeoportalContext
          .getInstance().getBeanIfDeclared("swaggerConfig");
      if (cfg != null) {
        String cp = hsr.getContextPath();
        String p = URLEncoder.encode(cp+"/swagger/swagger.json","UTF-8");
        URI uri = new URI(cp+"/swagger-ui/index.html?url="+p);
        //System.err.println("/swagger redirect: "+uri.toString());
        return Response.temporaryRedirect(uri).build();
      }
    } catch(Exception ex) {
      ex.printStackTrace();
    }
    return null;
  }

}
