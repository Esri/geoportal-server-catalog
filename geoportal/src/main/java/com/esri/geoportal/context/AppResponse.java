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
package com.esri.geoportal.context;
import com.esri.geoportal.base.metadata.UnrecognizedTypeException;
import com.esri.geoportal.base.metadata.validation.ValidationException;
import com.esri.geoportal.base.util.JsonUtil;
import com.esri.geoportal.base.util.exception.InvalidParameterException;
import com.esri.geoportal.base.util.exception.MissingParameterException;
import com.esri.geoportal.base.util.exception.UsageException;

import java.util.LinkedHashMap;
import java.util.Map;

import javax.json.JsonObjectBuilder;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.xml.transform.TransformerException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;

/**
 * App response.
 */
public class AppResponse {
  
  /** The logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(AppResponse.class);
  
  /** Instance variables. */
  private Map<String,Object> data = new LinkedHashMap<String,Object>();
  private Object entity;
  private Map<String,String> headers = new LinkedHashMap<>();
  private MediaType mediaType;
  private Response.Status status;

  /** Constructor */
  public AppResponse() {}
  
  /** A free form object map associated with this response. */
  public void addHeader(String name, String value) {
    headers.put(name,value);
  }
  
  /** A free form object map associated with this response. */
  public Map<String,Object> getData() {
    return data;
  }
  /** A free form object map associated with this response. */
  public void setData(Map<String,Object> data) {
    this.data = data;
  }

  /** The response entity. */
  public Object getEntity() {
    return entity;
  }
  public void setEntity(Object entity) {
    this.entity = entity;
  }

  /** The response mime-type. */
  public MediaType getMediaType() {
    return mediaType;
  }
  public void setMediaType(MediaType mediaType) {
    this.mediaType = mediaType;
  }

  /** The response status. */
  public Response.Status getStatus() {
    return status;
  }
  public void setStatus(Response.Status status) {
    this.status = status;
  }
  
  /** Methods =============================================================== */
  
  /** Build the rest response. */
  public Response build() {
    ResponseBuilder r = Response.status(getStatus()).entity(getEntity()).type(getMediaType());
    for (Map.Entry<String,String> entry: headers.entrySet()) {
      r.header(entry.getKey(),entry.getValue());
    }
    return r.build();
  }
  
  /**
   * Build an exception response.
   * @param t the cause
   * @param pretty for pretty JSON
   * @return the response
   */
  public Response buildException(Throwable t, boolean pretty) {
    String msg = t.getMessage();
    if (msg == null || msg.length() == 0) {
      msg = "Exception: "+t.toString();
    }
    LOGGER.debug(msg);
    String json = JsonUtil.newErrorResponse(msg,pretty);
    Response.Status status = Response.Status.INTERNAL_SERVER_ERROR;
    
    if (t instanceof AccessDeniedException) {
      status = Response.Status.UNAUTHORIZED;
      LOGGER.trace("Exception",t);
    } else if (t instanceof InvalidParameterException || 
               t instanceof MissingParameterException ||
               t instanceof UsageException) {
      status = Response.Status.BAD_REQUEST;
      LOGGER.trace("Exception",t);
    } else if (t instanceof UnrecognizedTypeException) {
      status = Response.Status.BAD_REQUEST;
      LOGGER.trace("Exception",t);
    } else if (t instanceof ValidationException) {
      json = ((ValidationException)t).toJson(pretty);
      status = Response.Status.BAD_REQUEST;
      LOGGER.trace("Exception",t);
    } else if (t instanceof TransformerException) {
      status = Response.Status.BAD_REQUEST;
      LOGGER.trace("Exception",t);
    } else {
      LOGGER.error("Exception",t);
    }
    return Response.status(status).entity(json).type(
        MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8")).build();
  }
  
  /** Set the response status to ok (HTTP 200). */
  public void setOk() {
    setStatus(Response.Status.OK);
  }
  
  /**
   * Write a json response entity, HTTP 400.
   * @param request the request
   * @param json the json entity 
   */
  public void writeBadRequest(AppRequest request, String json) {
    setEntity(json);
    setMediaType(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    setStatus(Response.Status.BAD_REQUEST);
  }
  
  /**
   * Write an exception to the response, HTTP 500.
   * @param request the request
   * @param t the exception
   */
  public void writeException(AppRequest request, Throwable t) {
    String msg = "Exception: "+t.toString();
    String json = JsonUtil.newErrorResponse(msg,request.getPretty());
    setEntity(json);
    setMediaType(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    setStatus(Response.Status.INTERNAL_SERVER_ERROR);
  }
  
  /** Setup an idIsMissing response. */
  public void writeIdIsMissing(AppRequest request) {
    writeMissingParameter(request,"id");
  }
  
  /**
   * Setup an id not found response (404).
   * @param request the request
   * @param id the id
   */
  public void writeIdNotFound(AppRequest request, String id) {
    String json = JsonUtil.newErrorResponse("Id not found.",request.getPretty());
    setEntity(json);
    setMediaType(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    setStatus(Response.Status.NOT_FOUND);
  }
  
  /**
   * Write a paramater is missing response, HTTP 400.
   * @param request the request
   * @param parameterName the parameter name
   */
  public void writeMissingParameter(AppRequest request, String parameterName) {
    String msg = "Missing parameter: "+parameterName;
    String json = JsonUtil.newErrorResponse(msg,request.getPretty());
    this.writeBadRequest(request,json);
  }
  
  /**
   * Write a json response entity, HTTP 501.
   * @param request the request
   * @param json the json entity 
   */
  public void writeNotImplemented(AppRequest request, String json) {
    setEntity(json);
    setMediaType(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    setStatus(Response.Status.NOT_IMPLEMENTED);
  }
  
  /**
   * Write a json response entity, HTTP 200.
   * @param request the request
   * @param json the json entity 
   */
  public void writeOkJson(AppRequest request, String json) {
    setEntity(json);
    setMediaType(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    setStatus(Response.Status.OK);
  }
  
  /**
   * Write a json response entity, HTTP 200.
   * @param request the request
   * @param jsonBuilder the json entity 
   */
  public void writeOkJson(AppRequest request, JsonObjectBuilder jsonBuilder) {
    String json = JsonUtil.toJson(jsonBuilder.build(),request.getPretty());
    setEntity(json);
    setMediaType(MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    setStatus(Response.Status.OK);
  }
  
}