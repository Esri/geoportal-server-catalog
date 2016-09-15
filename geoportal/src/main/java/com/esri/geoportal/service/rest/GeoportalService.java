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
import com.esri.geoportal.base.security.ArcGISAuthenticationProvider;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

import javax.json.Json;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

/**
 * Handles /rest/geoportal requests.
 */
@Path("/geoportal")
@Api(value="/rest")
public class GeoportalService {

  @GET
  @ApiOperation(value="Provides information on the Geoportal application itself.")
  public Response getSelf(
      @Context SecurityContext sc,
      @ApiParam(value="for an indented response") @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(sc);
    return self(user,pretty);
  }
  
  /**
   * Provide information on the Geoportal application itself.
   * @param user the active user
   * @param pretty for pretty JSON
   * @return the response
   */
  protected Response self(AppUser user, boolean pretty) {    
    try {
      GeoportalContext gc = GeoportalContext.getInstance();
      AppResponse response = new AppResponse();
      AppRequest request = new AppRequest() {
        @Override
        public AppResponse execute() throws Exception {
          return null;
        }
      };
      request.init(user,pretty);
      JsonObjectBuilder jso = Json.createObjectBuilder();
      
      jso.add("version",gc.getVersion());
      jso.add("metadataIndexName",gc.getElasticContext().getItemIndexName());
      
      if (user != null && user.getUsername() != null) {
        jso.add("user",Json.createObjectBuilder()
          .add("username",user.getUsername())
          .add("isAdmin",user.isAdmin())
          .add("isPublisher",user.isPublisher())
          .add("isAnonymous",user.isAnonymous())
        );
      }
      
      ArcGISAuthenticationProvider ap = gc.getBeanIfDeclared("arcgisAuthenticationProvider",
          ArcGISAuthenticationProvider.class,null);
      if (ap != null) {
        jso.add("arcgisOAuth",Json.createObjectBuilder()
          .add("appId",ap.getAppId())
          .add("portalUrl",ap.getPortalUrl())
          .add("restUrl",ap.getRestUrl())
          .add("expirationMinutes",ap.getExpirationMinutes())
          .add("showMyProfileLink",ap.getShowMyProfileLink())
        );
        if (ap.getCreateAccountUrl() != null && ap.getCreateAccountUrl().length() > 0) {
          jso.add("createAccountUrl",ap.getCreateAccountUrl());
        }
      }
      
      response.writeOkJson(request,jso);
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
