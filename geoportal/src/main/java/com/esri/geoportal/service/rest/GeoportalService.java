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
import com.esri.geoportal.base.security.Group;
import com.esri.geoportal.context.AppRequest;
import com.esri.geoportal.context.AppResponse;
import com.esri.geoportal.context.AppUser;
import com.esri.geoportal.context.GeoportalContext;

import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.servlet.http.HttpServletRequest;
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
public class GeoportalService {

  @GET
  public Response getSelf(
      @Context SecurityContext sc,
      @Context HttpServletRequest hsr,
      @QueryParam("pretty") boolean pretty) {
    AppUser user = new AppUser(hsr,sc);
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
      jso.add("supportsApprovalStatus",gc.getSupportsApprovalStatus());
      jso.add("supportsGroupBasedAccess",gc.getSupportsGroupBasedAccess());
      
      if (user != null && user.getUsername() != null) {
        JsonObjectBuilder jsoUser = Json.createObjectBuilder()
          .add("username",user.getUsername())
          .add("isAdmin",user.isAdmin())
          .add("isPublisher",user.isPublisher())
          .add("isAnonymous",user.isAnonymous());
        if (gc.getSupportsGroupBasedAccess()) {
          JsonArrayBuilder jsaGroups = Json.createArrayBuilder();
          List<Group> groups = user.getGroups();
          if (groups != null) {
            for (Group group: groups) {
              jsaGroups.add(Json.createObjectBuilder()
                .add("id",group.id)
                .add("name",group.name)
              );
            }         
          }
          jsoUser.add("groups",jsaGroups);
        }
        jso.add("user",jsoUser);
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
