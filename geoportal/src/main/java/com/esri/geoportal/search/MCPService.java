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

import com.esri.geoportal.service.stac.StacContext;

import java.util.*;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.*;
import net.minidev.json.*;
import net.minidev.json.parser.JSONParser;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;

/**
 * Minimal MCP (Model Context Protocol) adapter for the STAC API.
 */
@ApplicationPath("mcp")
@Path("")
public class MCPService extends Application {

  private static final Logger LOGGER = LoggerFactory.getLogger(MCPService.class);
  private final StacContext sc = StacContext.getInstance();
	
  // Minimal allowlist. Make configurable in your app config.
  private static final Set<String> ALLOWED_ORIGINS = new HashSet<>(Arrays.asList(
      // e.g. "https://your-host", "http://localhost:3000"
  ));

  @Override
  public Set<Class<?>> getClasses() {
    Set<Class<?>> resources = new HashSet<>();
    resources.add(MCPService.class);
    return resources;
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response get(@Context HttpServletRequest req) {
    // Minimal GET support per Streamable HTTP requirements.
    JSONObject ok = new JSONObject();
    ok.put("status", "ok");
    ok.put("endpoint", sc.getStacUrl().replaceAll("/+$", "") + "/mcp");  // req.getRequestURL().toString());
    ok.put("protocolVersion", "2024-11-05");

    return Response.ok(ok).build();

  }

  @POST
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response post(@Context HttpServletRequest req, String body) {
    // Origin validation recommended/required for Streamable HTTP security.
    if (!isOriginAllowed(req)) {
      return Response.status(Response.Status.FORBIDDEN)
          .entity(jsonRpcError(null, -32000, "Origin not allowed", null).toJSONString())
          .build();
    }

    try {
      JSONParser parser = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);
      JSONObject msg = (JSONObject) parser.parse(body);

      Object id = msg.get("id"); // may be null for notifications
      String method = (String) msg.get("method");
      JSONObject params = (JSONObject) msg.get("params");

      if (method == null) {
        return Response.ok(jsonRpcError(id, -32600, "Invalid Request: missing method", null).toJSONString()).build();
      }

      switch (method) {
        case "initialize":
          return Response.ok(handleInitialize(id).toJSONString()).build();

        case "tools/list":
          return Response.ok(handleToolsList(id).toJSONString()).build();

        case "tools/call":
          return Response.ok(handleToolsCall(req, id, params).toJSONString()).build();

        default:
          return Response.ok(jsonRpcError(id, -32601, "Method not found: " + method, null).toJSONString()).build();
      }

    } catch (Exception e) {
      LOGGER.error("MCP error", e);
      return Response.ok(jsonRpcError(null, -32603, "Internal error", e.getMessage()).toJSONString()).build();
    }
  }

  // ---------------- MCP handlers ----------------

  private JSONObject handleInitialize(Object id) {
    JSONObject result = new JSONObject();

    // Minimal server identity
    JSONObject serverInfo = new JSONObject();
    serverInfo.put("name", "geoportal-stac-mcp");
    serverInfo.put("version", "0.1");

    // Minimal capabilities: tools
    JSONObject capabilities = new JSONObject();
    JSONObject tools = new JSONObject();
    tools.put("listChanged", false);
    capabilities.put("tools", tools);

    result.put("serverInfo", serverInfo);
    result.put("capabilities", capabilities);
    result.put("protocolVersion", "2024-11-05");

    return jsonRpcResult(id, result);
  }

  private JSONObject handleToolsList(Object id) {
    JSONArray tools = new JSONArray();

    tools.add(toolDef(
        "stac_search",
        "Search STAC items (maps to /stac/search).",
        searchInputSchema()
    ));

    tools.add(toolDef(
        "stac_list_collections",
        "List STAC collections (maps to /stac/collections).",
        new JSONObject() {{
          put("type", "object");
          put("properties", new JSONObject());
        }}
    ));

    tools.add(toolDef(
        "stac_get_collection",
        "Get a STAC collection (maps to /stac/collections/{collectionId}).",
        new JSONObject() {{
          put("type", "object");
          put("properties", new JSONObject() {{
            put("collectionId", new JSONObject() {{
              put("type", "string");
            }});
          }});
          put("required", new JSONArray() {{ add("collectionId"); }});
        }}
    ));

    JSONObject result = new JSONObject();
    result.put("tools", tools);
    result.put("nextCursor", "");
    result.put("protocolVersion", "2024-11-05");

    return jsonRpcResult(id, result);
  }

  private JSONObject handleToolsCall(HttpServletRequest req, Object id, JSONObject params) throws Exception {
    if (params == null) {
      return jsonRpcError(id, -32602, "Invalid params", "params is required");
    }

    String name = (String) params.get("name");
    JSONObject args = (JSONObject) params.get("arguments");

    if (name == null) {
      return jsonRpcError(id, -32602, "Invalid params", "name is required");
    }

    switch (name) {
      case "stac_search":
        return toolOk(id, callStacSearch(req, args));

      case "stac_list_collections":
        return toolOk(id, callStacGet(req, "/collections"));

      case "stac_get_collection":
        String cid = args != null ? (String) args.get("collectionId") : null;
        if (cid == null || cid.isBlank()) {
          return jsonRpcError(id, -32602, "Invalid params", "collectionId is required");
        }
        return toolOk(id, callStacGet(req, "/collections/" + urlEncode(cid)));

      default:
        return jsonRpcError(id, -32601, "Tool not found: " + name, null);
    }
  }

  // ---------------- STAC call helpers ----------------

  private String callStacSearch(HttpServletRequest req, JSONObject args) {
    // Minimal: use POST /stac/search with JSON body of args (if provided).
    String path = "/search";
    String payload = (args != null ? args.toJSONString() : "{}");
    return callStacPost(req, path, payload, "application/json");
  }

  private String callStacGet(HttpServletRequest req, String stacPath) {
    Client client = ClientBuilder.newClient();
    String url = stacBaseUrl(req) + stacPath;
    return client
            .target(url)
            .request()
            .accept("application/geo+json", "application/json")
            .get(String.class);
  }

  private String callStacPost(HttpServletRequest req, String stacPath, String payload, String contentType) {
    Client client = ClientBuilder.newClient();
    String url = stacBaseUrl(req) + stacPath;
    return client
            .target(url)
            .request()
            .accept("application/geo+json", "application/json")
            .post(Entity.entity(payload, contentType), String.class);
  }

  private String stacBaseUrl(HttpServletRequest req) {
    // Mirrors STACService.getBaseUrl(), but returns the /stac base.
    String ctxPath = req.getContextPath();

    // Build base URL from trusted server attributes instead of the raw request URL
    String scheme = req.getScheme();
    String host = req.getServerName();
    int port = req.getServerPort();

    StringBuilder baseUrl = new StringBuilder();
    baseUrl.append(scheme).append("://").append(host);

    boolean isDefaultPort = ("http".equalsIgnoreCase(scheme) && port == 80)
        || ("https".equalsIgnoreCase(scheme) && port == 443);
    if (!isDefaultPort && port > 0) {
      baseUrl.append(":").append(port);
    }

    if (ctxPath != null && !ctxPath.isEmpty()) {
      if (!ctxPath.startsWith("/")) {
        baseUrl.append("/");
      }
      baseUrl.append(ctxPath);
    }

    return baseUrl.append("/stac").toString();
  }

  private String urlEncode(String s) {
    try { return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8.toString()); }
    catch (Exception e) { return s; }
  }

  // ---------------- JSON-RPC helpers ----------------

  private JSONObject jsonRpcResult(Object id, Object result) {
    JSONObject resp = new JSONObject();
    resp.put("jsonrpc", "2.0");
    resp.put("id", id);
    resp.put("result", result);
    return resp;
  }

  private JSONObject jsonRpcError(Object id, int code, String message, Object data) {
    JSONObject err = new JSONObject();
    err.put("code", code);
    err.put("message", message);
    if (data != null) err.put("data", data);

    JSONObject resp = new JSONObject();
    resp.put("jsonrpc", "2.0");
    resp.put("id", id);
    resp.put("error", err);
    return resp;
  }

  private JSONObject toolOk(Object id, String text) {
    JSONObject result = new JSONObject();
    JSONArray content = new JSONArray();
    JSONObject chunk = new JSONObject();
    chunk.put("type", "text");
    chunk.put("text", text);
    content.add(chunk);
    result.put("content", content);
    result.put("isError", false);
    result.put("protocolVersion", "2024-11-05");
    return jsonRpcResult(id, result);
  }

  private JSONObject toolDef(String name, String description, JSONObject inputSchema) {
    JSONObject tool = new JSONObject();
    tool.put("name", name);
    tool.put("description", description);
    tool.put("inputSchema", inputSchema);
    return tool;
  }

  private JSONObject searchInputSchema() {
    // Minimal schema aligned with your existing /search parameters
    JSONObject props = new JSONObject();
    props.put("bbox", new JSONObject() {{ put("type", "string"); }});
    props.put("datetime", new JSONObject() {{ put("type", "string"); }});
    props.put("collections", new JSONObject() {{ put("type", "array"); put("items", new JSONObject() {{ put("type","string"); }}); }});
    props.put("ids", new JSONObject() {{ put("type", "array"); put("items", new JSONObject() {{ put("type","string"); }}); }});
    props.put("limit", new JSONObject() {{ put("type", "integer"); }});
    props.put("intersects", new JSONObject() {{ put("type", "object"); }});
    props.put("outCRS", new JSONObject() {{ put("type", "string"); }});
    return new JSONObject() {{
      put("type", "object");
      put("properties", props);
    }};
  }

  private boolean isOriginAllowed(HttpServletRequest req) {
    String origin = req.getHeader("Origin");
    if (origin == null || origin.isBlank()) {
      // Many server-to-server calls won’t set Origin; allow.
      return true;
    }
    if (ALLOWED_ORIGINS.isEmpty()) {
      // If you prefer strict mode, flip this to false.
      return true;
    }
    return ALLOWED_ORIGINS.contains(origin);
  }
}