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
package com.esri.geoportal.dcat3;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.esri.geoportal.dcat3.model.Dcat3DataService;
import com.esri.geoportal.dcat3.model.Dcat3Dataset;
import com.esri.geoportal.dcat3.model.Dcat3DatasetSeries;
import com.fasterxml.jackson.databind.JsonNode;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * DCAT-US 3.0 streaming service.
 *
 * <p>Endpoints:</p>
 * <ul>
 *   <li><code>GET /dcat3.json</code> - the complete, cached catalog
 *       (<code>dcat:Catalog</code> with <code>dcat:DatasetSeries</code> and
 *       <code>dcat:Dataset</code> members); triggers a background build when no
 *       cache exists yet.</li>
 *   <li><code>GET /dcat3/catalog.json</code> - the catalog header only.</li>
 *   <li><code>GET /dcat3/dataset/{id}</code> - a single <code>dcat:Dataset</code>.</li>
 *   <li><code>GET /dcat3/dataset</code> - all <code>dcat:Dataset</code>.</li>
 *   <li><code>GET /dcat3/datasetSeries</code> - all <code>dcat:DatasetSeries</code>.</li>
 *   <li><code>GET /dcat3/datasetSeries/{id}</code> - a single <code>dcat:DatasetSeries</code>.</li>
 *   <li><code>GET /dcat3/dataService/{id}</code> - the <code>dcat:DataService</code>
 *       entries of an item.</li>
 *   <li><code>GET /dcat3/rebuild</code> - triggers a rebuild of the cache.</li>
 * </ul>
 *
 * @see <a href="https://resources.data.gov/resources/dcat-us3/">DCAT-US 3.0</a>
 */
@RestController
public class Dcat3StreamingService {

  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(Dcat3StreamingService.class);

  /** Response returned while the first document is still being generated. */
  private static final String EMPTY_DCAT3_RESPONSE = """
    {
      "@context": "%s",
      "conformsTo": "%s",
      "@type": "dcat:Catalog",
      "@note": "DCAT-US 3.0 document is not ready yet! The generation process has been started. Please try again later.",
      "dataset": [
      ]
    }""";

  @Autowired
  private Dcat3Cache dcat3Cache;

  @Autowired
  private Dcat3Controller dcat3Controller;

  @Autowired
  private Dcat3Config dcat3Config;

  /* =================================================================== */
  /* Cached catalog                                                      */
  /* =================================================================== */

  /**
   * Streams the cached DCAT-US 3.0 catalog. When no cache exists a placeholder
   * is returned and the generation is started in the background.
   *
   * @param response the servlet response
   * @return the response entity
   */
  @GetMapping(path = "/dcat3.json", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Void> dcat3(HttpServletResponse response) {
    try (OutputStream outStream = response.getOutputStream()) {
      Date lastModified = dcat3Cache.getLastModified();

      if (lastModified != null) {
        try (InputStream input = dcat3Cache.createInputCacheStream()) {
          IOUtils.copy(input, outStream);
        }
        outStream.flush();
        return ResponseEntity.ok().lastModified(lastModified.getTime()).build();
      }

      outStream.write(EMPTY_DCAT3_RESPONSE
              .formatted(dcat3Config.getContext(), dcat3Config.getConformsTo())
              .getBytes("UTF-8"));
      outStream.flush();
      dcat3Controller.generateDcat3Async();
      return ResponseEntity.accepted().build();
    } catch (IOException ex) {
      LOGGER.error("Error streaming the DCAT-US 3.0 document.", ex);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Triggers a rebuild of the cached catalog.
   * @return a short status document
   */
  @GetMapping(path = "/dcat3/rebuild", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<String> rebuild() {
    boolean started = dcat3Controller.generateDcat3Async();
    String body = "{\"status\":\"%s\"}".formatted(started ? "started" : "already running");
    return ResponseEntity.status(started ? HttpStatus.ACCEPTED : HttpStatus.CONFLICT).body(body);
  }

  /* =================================================================== */
  /* Live (non cached) resources                                         */
  /* =================================================================== */

  /**
   * Returns the catalog header (no members).
   * @param request the servlet request
   * @return the <code>dcat:Catalog</code>
   */
  @GetMapping(path = "/dcat3/catalog.json", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> catalog(HttpServletRequest request) {
    return ResponseEntity.ok(ordered(helper().newCatalog(resolveBaseUrl(request))));
  }

  /**
   * Returns a single <code>dcat:Dataset</code> built live from the index.
   * @param id the geoportal item id
   * @param request the servlet request
   * @return the dataset
   */
  @GetMapping(path = "/dcat3/dataset/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> dataset(@PathVariable("id") String id, HttpServletRequest request) {
    try {
      JsonNode source = helper().getItemById(id);
      if (source == null || source.isMissingNode()) {
        return notFound("No dataset found with id '%s'.".formatted(id));
      }
      Dcat3Dataset ds = helper().toDataset(id, source, resolveBaseUrl(request));
      return ResponseEntity.ok(ordered(ds));
    } catch (Exception ex) {
      return error("Error building dcat:Dataset for id '%s'.".formatted(id), ex);
    }
  }

  /**
   * Returns all <code>dcat:Dataset</code> resources built live from the index.
   * @param request the servlet request
   * @return the dataset list
   */
  @GetMapping(path = "/dcat3/dataset", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> datasets(HttpServletRequest request) {
    try {
      Dcat3Helper helper = helper();
      String baseUrl = resolveBaseUrl(request);
      int pageSize = Math.max(1, dcat3Config.getPageSize());
      String searchAfter = null;
      List<Dcat3Dataset> datasets = new ArrayList<>();

      while (true) {
        JsonNode response = helper.searchDatasets(searchAfter, pageSize);
        JsonNode hits = response.path("hits").path("hits");
        if (!hits.isArray() || hits.isEmpty()) {
          break;
        }

        String lastId = null;
        for (JsonNode hit : hits) {
          String id = hit.path("_id").asText(null);
          if (StringUtils.isBlank(id)) {
            continue;
          }
          lastId = id;
          datasets.add(helper.toDataset(id, hit.path("_source"), baseUrl));
        }

        if (StringUtils.isBlank(lastId) || hits.size() < pageSize) {
          break;
        }
        searchAfter = lastId;
      }

      return ResponseEntity.ok(ordered(datasets));
    } catch (Exception ex) {
      return error("Error building the dcat:Dataset list.", ex);
    }
  }

  /**
   * Returns all <code>dcat:DatasetSeries</code> derived from the collections.
   * @param request the servlet request
   * @return the dataset series list
   */
  @GetMapping(path = "/dcat3/datasetSeries", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> datasetSeries(HttpServletRequest request) {
    try {
      String baseUrl = resolveBaseUrl(request);
      List<JsonNode> collections = helper().searchCollections(10000);
      List<Dcat3DatasetSeries> series = collections.stream()
              .map(c -> helper().toDatasetSeries(c, baseUrl, true))
              .toList();
      return ResponseEntity.ok(ordered(series));
    } catch (Exception ex) {
      return error("Error building the dcat:DatasetSeries list.", ex);
    }
  }

  /**
   * Returns a single <code>dcat:DatasetSeries</code>.
   * @param id the collection id
   * @param members when <code>true</code> the member dataset identifiers are resolved
   * @param request the servlet request
   * @return the dataset series
   */
  @GetMapping(path = "/dcat3/datasetSeries/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> datasetSeries(@PathVariable("id") String id,
          @RequestParam(name = "members", required = false, defaultValue = "false") boolean members,
          HttpServletRequest request) {
    try {
      JsonNode collection = helper().getCollectionById(id);
      if (collection == null) {
        return notFound("No dataset series (collection) found with id '%s'.".formatted(id));
      }
      String baseUrl = resolveBaseUrl(request);
      Dcat3DatasetSeries series = helper().toDatasetSeries(collection, baseUrl, members);
      return ResponseEntity.ok(ordered(series));
    } catch (Exception ex) {
      return error("Error building dcat:DatasetSeries for id '%s'.".formatted(id), ex);
    }
  }

  /**
   * Returns the <code>dcat:DataService</code> entries derived from an item.
   * @param id the geoportal item id
   * @param request the servlet request
   * @return the data service list
   */
  @GetMapping(path = "/dcat3/dataService/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> dataService(@PathVariable("id") String id, HttpServletRequest request) {
    try {
      JsonNode source = helper().getItemById(id);
      if (source == null || source.isMissingNode()) {
        return notFound("No dataset found with id '%s'.".formatted(id));
      }
      List<Dcat3DataService> services = helper().toDataServices(id, source, resolveBaseUrl(request));
      return ResponseEntity.ok(ordered(services));
    } catch (Exception ex) {
      return error("Error building dcat:DataService entries for id '%s'.".formatted(id), ex);
    }
  }

  /* =================================================================== */
  /* Internals                                                           */
  /* =================================================================== */

  /**
   * Gets the helper.
   * @return the helper
   */
  private Dcat3Helper helper() {
    return dcat3Controller.getBuilder().getHelper();
  }

  /**
   * Resolves the geoportal base URL, preferring the configured value and
   * falling back to the incoming request.
   * @param request the servlet request
   * @return the base URL without a trailing slash
   */
  private String resolveBaseUrl(HttpServletRequest request) {
    String configured = dcat3Config.getBaseUrl();
    if (StringUtils.isNotBlank(configured)
            && !configured.startsWith("http://localhost:8080/geoportal")) {
      return removeTrailingSlash(configured);
    }
    if (request == null) {
      return removeTrailingSlash(StringUtils.defaultString(configured));
    }

    String scheme = request.getScheme();
    String host = request.getServerName();
    int port = request.getServerPort();
    String ctx = StringUtils.defaultString(request.getContextPath());

    StringBuilder sb = new StringBuilder(scheme).append("://").append(host);
    boolean defaultPort = ("http".equals(scheme) && port == 80) || ("https".equals(scheme) && port == 443);
    if (!defaultPort && port > 0) {
      sb.append(":").append(port);
    }
    sb.append(ctx);
    return removeTrailingSlash(sb.toString());
  }

  private ResponseEntity<String> notFound(String message) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .contentType(MediaType.APPLICATION_JSON)
            .body("{\"code\":404,\"description\":\"%s\"}".formatted(escape(message)));
  }

  private ResponseEntity<String> error(String message, Exception ex) {
    LOGGER.error(message, ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .contentType(MediaType.APPLICATION_JSON)
            .body("{\"code\":500,\"description\":\"%s\"}".formatted(escape(message)));
  }

  private static String escape(String value) {
    return StringUtils.defaultString(value).replace("\\", "\\\\").replace("\"", "\\\"");
  }

  private static String removeTrailingSlash(String value) {
    if (value == null) return null;
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }

  private JsonNode ordered(Object value) {
    JsonNode node = Dcat3Helper.MAPPER.valueToTree(value);
    return Dcat3JsonOrder.order(node, dcat3Config);
  }
}
