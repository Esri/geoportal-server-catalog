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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
 *   <li><code>GET /dcat3/dataset</code> - one page of <code>dcat:Dataset</code>,
 *       paginated via {@code limit}/{@code searchAfter}/{@code searchBefore} (or
 *       {@code from}/{@code size} when other search params are supplied), with
 *       optional {@code next} / {@code previous} links.</li>
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

  /** The only accepted values for the {@code profile} request parameter (case-insensitive). Default is US. */
  private static final Set<String> VALID_PROFILES = Set.of("us", "world");

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
  public ResponseEntity<?> dcat3(@RequestParam(name = "profile", required = false) String profile,
          HttpServletResponse response) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    try (OutputStream outStream = response.getOutputStream()) {
      String resolvedProfile = dcat3Config.resolveProfile(profile);
      Date lastModified = dcat3Cache.getLastModified(resolvedProfile);

      if (lastModified != null) {
        try (InputStream input = dcat3Cache.createInputCacheStream(resolvedProfile)) {
          IOUtils.copy(input, outStream);
        }
        outStream.flush();
        return ResponseEntity.ok().lastModified(lastModified.getTime()).build();
      }

      outStream.write(EMPTY_DCAT3_RESPONSE
              .formatted(dcat3Config.getContext(), dcat3Config.getConformsTo())
              .getBytes("UTF-8"));
      outStream.flush();
      dcat3Controller.generateDcat3Async(resolvedProfile);
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
  public ResponseEntity<String> rebuild(@RequestParam(name = "profile", required = false) String profile) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    boolean started = dcat3Controller.generateDcat3Async(profile);
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
  public ResponseEntity<?> catalog(@RequestParam(name = "profile", required = false) String profile,
          HttpServletRequest request) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    return ResponseEntity.ok(ordered(helper().newCatalog(resolveBaseUrl(request), profile), profile));
  }

  /**
   * Returns a single <code>dcat:Dataset</code> built live from the index.
   * @param id the geoportal item id
   * @param request the servlet request
   * @return the dataset
   */
  @GetMapping(path = "/dcat3/dataset/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> dataset(@PathVariable("id") String id,
          @RequestParam(name = "profile", required = false) String profile,
          HttpServletRequest request) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    try {
      JsonNode source = helper().getItemById(id);
      if (source == null || source.isMissingNode()) {
        return notFound("No dataset found with id '%s'.".formatted(id));
      }
      Dcat3Dataset ds = helper().toDataset(id, source, resolveBaseUrl(request), profile);
      return ResponseEntity.ok(ordered(ds, profile));
    } catch (Exception ex) {
      return error("Error building dcat:Dataset for id '%s'.".formatted(id), ex);
    }
  }

  /**
   * Returns all <code>dcat:Dataset</code> resources built live from the index, one
   * page at a time. Pagination is cursor based using Elasticsearch's
   * <code>search_after</code>: pass the {@code searchAfter} value returned in the
   * response's <code>next</code> link to fetch the following page, or the
   * {@code searchBefore} value returned in the <code>previous</code> link to walk
   * the index backwards. The page size ({@code limit} / {@code size}) is capped
   * at 10000.
   * @param request the servlet request
   * @return a page of the dataset list, with optional {@code next} / {@code previous} links
   */
  @GetMapping(path = "/dcat3/dataset", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> datasets(@RequestParam(name = "profile", required = false) String profile,
          @RequestParam(name = "from", required = false) Integer from,
          @RequestParam(name = "size", required = false) Integer size,
          @RequestParam(name = "sort", required = false) String sort,
          @RequestParam(name = "esdsl", required = false) String esdsl,
          @RequestParam(name = "limit", required = false) Integer limit,
          @RequestParam(name = "searchAfter", required = false) String searchAfter,
          @RequestParam(name = "searchBefore", required = false) String searchBefore,
          HttpServletRequest request) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    try {
      final int hardCap = 10000;
      Dcat3Helper helper = helper();
      String baseUrl = resolveBaseUrl(request);

      // If search params are supplied, return one filtered page matching UI search.
      if (from != null || size != null || StringUtils.isNotBlank(sort) || StringUtils.isNotBlank(esdsl)) {
        int requestedSize = size != null ? Math.min(Math.max(1, size.intValue()), hardCap)
                : Math.max(1, Math.min(dcat3Config.getPageSize(), hardCap));
        int requestedFrom = from != null ? Math.max(1, from.intValue()) : 1;

        JsonNode response = helper.searchDatasets(requestedFrom - 1, requestedSize, sort, esdsl, profile);
        JsonNode hits = response.path("hits").path("hits");
        List<Dcat3Dataset> datasets = new ArrayList<>();
        if (hits.isArray()) {
          for (JsonNode hit : hits) {
            String id = hit.path("_id").asText(null);
            if (StringUtils.isBlank(id)) {
              continue;
            }
            datasets.add(helper.toDataset(id, hit.path("_source"), baseUrl, profile));
          }
        }

        String next = null;
        if (hits.isArray() && hits.size() >= requestedSize) {
          next = buildDatasetsNextUrl(baseUrl, profile, requestedFrom + requestedSize, requestedSize, sort, esdsl, null, null);
        }
        String previous = null;
        if (requestedFrom > 1) {
          int previousFrom = Math.max(1, requestedFrom - requestedSize);
          previous = buildDatasetsNextUrl(baseUrl, profile, previousFrom, requestedSize, sort, esdsl, null, null);
        }
        return ResponseEntity.ok(datasetsPage(datasets, next, previous, profile));
      }

      // Otherwise page through the full index using search_after / search_before.
      int pageSize = limit != null && limit.intValue() > 0 ? Math.min(limit.intValue(), hardCap)
              : Math.max(1, Math.min(dcat3Config.getPageSize(), hardCap));

      boolean backward = StringUtils.isBlank(searchAfter) && StringUtils.isNotBlank(searchBefore);
      String cursor = backward ? searchBefore : searchAfter;

      JsonNode response = helper.searchDatasets(cursor, pageSize, profile, backward);
      JsonNode hits = response.path("hits").path("hits");
      List<Dcat3Dataset> datasets = new ArrayList<>();
      String firstId = null;
      String lastId = null;
      if (hits.isArray()) {
        // Backward queries come back sorted by _id desc; reverse to restore
        // the natural ascending order before building the page.
        List<JsonNode> ordered = new ArrayList<>();
        hits.forEach(ordered::add);
        if (backward) {
          Collections.reverse(ordered);
        }
        for (JsonNode hit : ordered) {
          String id = hit.path("_id").asText(null);
          if (StringUtils.isBlank(id)) {
            continue;
          }
          if (firstId == null) {
            firstId = id;
          }
          lastId = id;
          datasets.add(helper.toDataset(id, hit.path("_source"), baseUrl, profile));
        }
      }

      boolean fullPage = hits.isArray() && hits.size() >= pageSize;

      String next;
      String previous;
      if (backward) {
        // We navigated backward: there is always a page after this one (the
        // page we came from); a further "previous" only exists if this page
        // came back full (suggesting more records before it).
        next = StringUtils.isNotBlank(lastId)
                ? buildDatasetsNextUrl(baseUrl, profile, null, null, null, null, lastId, pageSize)
                : null;
        previous = fullPage && StringUtils.isNotBlank(firstId)
                ? buildDatasetsPrevUrl(baseUrl, profile, firstId, pageSize)
                : null;
      } else {
        next = fullPage && StringUtils.isNotBlank(lastId)
                ? buildDatasetsNextUrl(baseUrl, profile, null, null, null, null, lastId, pageSize)
                : null;
        // A "previous" page only exists once we've moved past the first page,
        // i.e. a searchAfter cursor was supplied on this request.
        previous = StringUtils.isNotBlank(searchAfter) && StringUtils.isNotBlank(firstId)
                ? buildDatasetsPrevUrl(baseUrl, profile, firstId, pageSize)
                : null;
      }
      return ResponseEntity.ok(datasetsPage(datasets, next, previous, profile));
    } catch (Exception ex) {
      return error("Error building the dcat:Dataset list.", ex);
    }
  }

  /**
   * Returns all <code>dcat:DatasetSeries</code> derived from the collections.
   * @param request the servlet request
   * @return the dataset series (collection) list
   */
  @GetMapping(path = "/dcat3/datasetSeries", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> datasetSeries(@RequestParam(name = "profile", required = false) String profile,
          HttpServletRequest request) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    try {
      String baseUrl = resolveBaseUrl(request);
      List<JsonNode> collections = helper().searchCollections(10000);
      List<Dcat3DatasetSeries> series = collections.stream()
              .map(c -> helper().toDatasetSeries(c, baseUrl, false, profile))
              .toList();
      return ResponseEntity.ok(ordered(series, profile));
    } catch (Exception ex) {
      return error("Error building the dcat:DatasetSeries list.", ex);
    }
  }

  /**
   * Returns a single <code>dcat:DatasetSeries</code>.
   * @param id the dataseries(collection) id
   * @param members when <code>true</code> the member dataset identifiers are resolved
   * @param request the servlet request
   * @return the dataset series
   */
  @GetMapping(path = "/dcat3/datasetSeries/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> datasetSeries(@PathVariable("id") String id,
          @RequestParam(name = "members", required = false, defaultValue = "false") boolean members,
          @RequestParam(name = "profile", required = false) String profile,
          HttpServletRequest request) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    try {
      JsonNode collection = helper().getCollectionById(id);
      if (collection == null) {
        return notFound("No dataset series (collection) found with id '%s'.".formatted(id));
      }
      String baseUrl = resolveBaseUrl(request);
      Dcat3DatasetSeries series = helper().toDatasetSeries(collection, baseUrl, members, profile);
      return ResponseEntity.ok(ordered(series, profile));
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
  public ResponseEntity<?> dataService(@PathVariable("id") String id,
          @RequestParam(name = "profile", required = false) String profile,
          HttpServletRequest request) {
    if (!isValidProfile(profile)) {
      return invalidProfileResponse();
    }
    try {
      JsonNode source = helper().getItemById(id);
      if (source == null || source.isMissingNode()) {
        return notFound("No dataset found with id '%s'.".formatted(id));
      }
      List<Dcat3DataService> services = helper().toDataServices(id, source, resolveBaseUrl(request), profile);
      return ResponseEntity.ok(ordered(services, profile));
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

  /**
   * Validates the {@code profile} request parameter: only blank (defaults to
   * US), {@code us} or {@code world} (case-insensitive) are accepted.
   * @param profile the requested profile, or {@code null}/blank for the default
   * @return {@code true} when the profile is blank or one of the accepted values
   */
  private static boolean isValidProfile(String profile) {
    return StringUtils.isBlank(profile) || VALID_PROFILES.contains(profile.trim().toLowerCase());
  }

  /**
   * Builds the standard 400 response returned when an unsupported
   * {@code profile} value is requested.
   * @return the 400 response body
   */
  private static ResponseEntity<String> invalidProfileResponse() {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .contentType(MediaType.APPLICATION_JSON)
            .body("{\"code\":400,\"description\":\"Unsupported profile specified. Valid profiles are US and World only.\"}");
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

  private JsonNode ordered(Object value, String profile) {
    JsonNode node = Dcat3Helper.MAPPER.valueToTree(value);
    return Dcat3JsonOrder.order(node, dcat3Config, profile);
  }

  /**
   * Wraps a page of datasets together with optional {@code next} / {@code previous} links.
   * @param datasets the datasets of the current page
   * @param next the URL of the next page, or {@code null} when there is none
   * @param previous the URL of the previous page, or {@code null} when there is none
   * @param profile the active profile
   * @return the ordered JSON page
   */
  private JsonNode datasetsPage(List<Dcat3Dataset> datasets, String next, String previous, String profile) {
    Map<String, Object> page = new LinkedHashMap<>();
    page.put("dataset", datasets);
    if (StringUtils.isNotBlank(next)) {
      page.put("next", next);
    }
    if (StringUtils.isNotBlank(previous)) {
      page.put("previous", previous);
    }
    return ordered(page, profile);
  }

  /**
   * Builds the {@code previous} link for the <code>/dcat3/dataset</code> endpoint
   * in <code>search_after</code> / <code>search_before</code> mode.
   * @param baseUrl the geoportal base URL
   * @param profile the active profile, or {@code null}
   * @param searchBefore the cursor id (first id of the current page) to search before
   * @param limit the page size to reuse
   * @return the absolute previous-page URL
   */
  private String buildDatasetsPrevUrl(String baseUrl, String profile, String searchBefore, Integer limit) {
    StringBuilder sb = new StringBuilder(StringUtils.defaultString(baseUrl)).append("/dcat3/dataset");
    Map<String, String> params = new LinkedHashMap<>();
    if (StringUtils.isNotBlank(profile)) {
      params.put("profile", profile);
    }
    if (StringUtils.isNotBlank(searchBefore)) {
      params.put("searchBefore", searchBefore);
    }
    if (limit != null) {
      params.put("limit", String.valueOf(limit));
    }

    boolean first = true;
    for (Map.Entry<String, String> entry : params.entrySet()) {
      sb.append(first ? '?' : '&');
      first = false;
      sb.append(entry.getKey()).append('=').append(urlEncode(entry.getValue()));
    }
    return sb.toString();
  }

  /**
   * Builds the {@code next} link for the <code>/dcat3/dataset</code> endpoint,
   * preserving the parameters relevant to the current pagination mode.
   * @param baseUrl the geoportal base URL
   * @param profile the active profile, or {@code null}
   * @param from the next {@code from} value (filtered/offset mode), or {@code null}
   * @param size the {@code size} to reuse (filtered/offset mode), or {@code null}
   * @param sort the {@code sort} to reuse (filtered/offset mode), or {@code null}
   * @param esdsl the {@code esdsl} to reuse (filtered/offset mode), or {@code null}
   * @param searchAfter the cursor id for the next page (search_after mode), or {@code null}
   * @param limit the page size to reuse (search_after mode), or {@code null}
   * @return the absolute next-page URL
   */
  private String buildDatasetsNextUrl(String baseUrl, String profile, Integer from, Integer size,
          String sort, String esdsl, String searchAfter, Integer limit) {
    StringBuilder sb = new StringBuilder(StringUtils.defaultString(baseUrl)).append("/dcat3/dataset");
    Map<String, String> params = new LinkedHashMap<>();
    if (StringUtils.isNotBlank(profile)) {
      params.put("profile", profile);
    }
    if (from != null) {
      params.put("from", String.valueOf(from));
    }
    if (size != null) {
      params.put("size", String.valueOf(size));
    }
    if (StringUtils.isNotBlank(sort)) {
      params.put("sort", sort);
    }
    if (StringUtils.isNotBlank(esdsl)) {
      params.put("esdsl", esdsl);
    }
    if (StringUtils.isNotBlank(searchAfter)) {
      params.put("searchAfter", searchAfter);
    }
    if (limit != null) {
      params.put("limit", String.valueOf(limit));
    }

    boolean first = true;
    for (Map.Entry<String, String> entry : params.entrySet()) {
      sb.append(first ? '?' : '&');
      first = false;
      sb.append(entry.getKey()).append('=').append(urlEncode(entry.getValue()));
    }
    return sb.toString();
  }

  private static String urlEncode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

}
