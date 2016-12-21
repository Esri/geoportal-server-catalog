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

import java.io.File;
import java.nio.file.Files;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Application;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Swagger API configuration and redirect.
 * <p>
 *   http://host:port/geoportal/swagger/swagger.json
 * </p>
 */
@ApplicationPath("swagger")
@Path("swagger.json")
public class Swagger extends Application {

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> resources = new HashSet<Class<?>>();
    resources.add(Swagger.class);
    return resources;
  }

  @GET
  public Response getFile(@Context HttpServletRequest hsr) {
    boolean pretty = false;
    try {
      String fileName = "swagger/swagger.json";
      String contextPath = hsr.getContextPath();
      if (contextPath == null || contextPath.length() == 0) {
        contextPath = "/";
      }
      ClassLoader classLoader = this.getClass().getClassLoader();
      File file = new File(classLoader.getResource(fileName).getFile());
      String v = new String(Files.readAllBytes(file.toPath()),"UTF-8");
      v = v.replaceAll("\\$\\{contextPath}",contextPath);
      return Response.ok(v).type(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8")).build();
    } catch(Exception ex) {
      ex.printStackTrace();
      return (new AppResponse()).buildException(ex,pretty);
    }
  }

}
