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

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.dcat3.model.Dcat3Catalog;
import com.esri.geoportal.dcat3.model.Dcat3ContactPoint;
import com.esri.geoportal.dcat3.model.Dcat3Constants;
import com.esri.geoportal.dcat3.model.Dcat3DataService;
import com.esri.geoportal.dcat3.model.Dcat3Dataset;
import com.esri.geoportal.dcat3.model.Dcat3DatasetSeries;
import com.esri.geoportal.dcat3.model.Dcat3Distribution;
import com.esri.geoportal.dcat3.model.Dcat3Location;
import com.esri.geoportal.dcat3.model.Dcat3PeriodOfTime;
import com.esri.geoportal.lib.elastic.ElasticContext;
import com.esri.geoportal.lib.elastic.http.ElasticClient;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * DCAT-US 3.0 helper.
 *
 * <p>All Elasticsearch / OpenSearch access required to produce a DCAT-US 3.0
 * document is performed <b>directly in Java</b> here (through
 * {@link ElasticClient}). This class replaces the Nashorn <code>gs/context/nashorn/execute.js</code> pipeline
 * used by the legacy <code>com.esri.geoportal.dcat</code> package.</p>
 *
 * <p>Responsibilities:</p>
 * <ul>
 *   <li>building and issuing the paged <code>_search</code> requests
 *       (<code>search_after</code> based deep pagination),</li>
 *   <li>reading the <code>collections</code> index for
 *       <code>dcat:DatasetSeries</code>,</li>
 *   <li>mapping a geoportal <code>_source</code> document to
 *       {@link Dcat3Dataset}, {@link Dcat3DatasetSeries},
 *       {@link Dcat3DataService} and {@link Dcat3Distribution}.</li>
 * </ul>
 */
public class Dcat3Helper {

  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(Dcat3Helper.class);

  /** Content type used for all index requests. */
  private static final String CONTENT_TYPE_JSON = "application/json";

  /** JSON processing. */
  public static final ObjectMapper MAPPER = new ObjectMapper();
  static {
    MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
  }

  private final Dcat3Config config;

  /**
   * Creates instance of the helper.
   * @param config DCAT-US 3.0 configuration
   */
  public Dcat3Helper(Dcat3Config config) {
    this.config = config != null ? config : new Dcat3Config();
  }

  /**
   * Gets the configuration.
   * @return the configuration
   */
  public Dcat3Config getConfig() {
    return config;
  }

  /* =================================================================== */
  /* OpenSearch / Elasticsearch access                                   */
  /* =================================================================== */

  /**
   * Builds the paged query used to walk the whole metadata index.
   *
   * <p>Deep pagination is done with <code>search_after</code> on
   * <code>_id</code>, which is stable and does not suffer from the
   * <code>max_result_window</code> limit.</p>
   *
   * @param searchAfter the <code>_id</code> of the last record of the previous
   *                    page, or <code>null</code> for the first page
   * @param size page size
   * @return the query as a JSON string
   */
  public String prepareDatasetQuery(String searchAfter, int size) {
    ObjectNode query = MAPPER.createObjectNode();
    query.put("track_total_hits", true);
    query.put("size", size > 0 ? size : config.getPageSize());

    ArrayNode sort = query.putArray("sort");
    sort.addObject().put("_id", "asc");

    ArrayNode includes = query.putObject("_source").putArray("includes");
    for (String f : datasetSourceIncludes()) {
      includes.add(f);
    }

    ArrayNode must = MAPPER.createArrayNode();
    appendAccessFilters(must);

    if (!must.isEmpty()) {
      query.putObject("query").putObject("bool").set("must", must);
    } else {
      query.putObject("query").putObject("match_all");
    }

    if (StringUtils.isNotBlank(searchAfter)) {
      query.putArray("search_after").add(searchAfter);
    }

    return query.toString();
  }

  /**
   * Appends the access / approval filters honoring the geoportal security
   * configuration, so that only publicly visible records end up in the
   * published DCAT document.
   * @param must the <code>bool.must</code> array to append to
   */
  private void appendAccessFilters(ArrayNode must) {
    if (!config.getPublicRecordsOnly()) return;

    GeoportalContext gc = GeoportalContext.getInstance();
    if (gc == null) return;

    try {
      if (gc.getSupportsGroupBasedAccess()) {
        ObjectNode term = MAPPER.createObjectNode();
        term.putObject("term").put(sf("query.sysAccess", "sys_access_s"), "public");
        must.add(term);
      }
      if (gc.getSupportsApprovalStatus()) {
        ObjectNode terms = MAPPER.createObjectNode();
        ArrayNode values = terms.putObject("terms").putArray(sf("query.approvalStatus", "sys_approval_status_s"));
        values.add("approved");
        values.add("reviewed");
        must.add(terms);
      }
    } catch (Exception ex) {
      LOGGER.warn("DCAT3: unable to determine access filters.", ex);
    }
  }

  /**
   * Executes one page of the metadata search.
   * @param searchAfter <code>search_after</code> cursor or <code>null</code>
   * @param size page size
   * @return the parsed Elasticsearch / OpenSearch response
   * @throws Exception if the request fails
   */
  public JsonNode searchDatasets(String searchAfter, int size) throws Exception {
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    ElasticClient client = ElasticClient.newClient();
    String url = client.getTypeUrlForSearch(ec.getIndexName()) + "/_search";
    String query = prepareDatasetQuery(searchAfter, size);

    LOGGER.trace("DCAT3 search url={} query={}", url, query);
    String response = client.sendPost(url, query, CONTENT_TYPE_JSON);
    return MAPPER.readTree(response);
  }

  /**
   * Reads a single metadata item.
   * @param id the item id
   * @return the <code>_source</code> document or <code>null</code> when not found
   * @throws Exception if the request fails
   */
  public JsonNode getItemById(String id) throws Exception {
    ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
    ElasticClient client = ElasticClient.newClient();
    String url = client.getTypeUrlForSearch(ec.getIndexName()) + "/_search";

    ObjectNode query = MAPPER.createObjectNode();
    query.put("size", 1);
    ArrayNode ids = query.putObject("query").putObject("ids").putArray("values");
    ids.add(id);

    String response = client.sendPost(url, query.toString(), CONTENT_TYPE_JSON);
    JsonNode hits = MAPPER.readTree(response).path("hits").path("hits");
    if (hits.isArray() && hits.size() > 0) {
      return hits.get(0).path("_source");
    }
    return null;
  }

  /**
   * Reads the collections index, used to derive <code>dcat:DatasetSeries</code>.
   * @param limit maximum number of collections
   * @return list of collection <code>_source</code> documents (never <code>null</code>)
   */
  public List<JsonNode> searchCollections(int limit) {
    List<JsonNode> result = new ArrayList<>();
    try {
      GeoportalContext gc = GeoportalContext.getInstance();
      if (gc == null || !gc.getSupportsCollections()) return result;

      ElasticContext ec = gc.getElasticContext();
      String collectionIndex = ec.getCollectionIndexName();
      if (StringUtils.isBlank(collectionIndex)) return result;

      ElasticClient client = ElasticClient.newClient();
      String url = client.getTypeUrlForSearch(collectionIndex) + "/_search?size=" + (limit > 0 ? limit : 10000);
      String query = "{\"track_total_hits\":true,\"sort\":[{\"_id\":\"asc\"}]}";

      String response = client.sendPost(url, query, CONTENT_TYPE_JSON);
      JsonNode hits = MAPPER.readTree(response).path("hits").path("hits");
      if (hits.isArray()) {
        for (JsonNode hit : hits) {
          JsonNode source = hit.path("_source");
          if (!source.isMissingNode() && source.isObject()) {
            ObjectNode copy = (ObjectNode) source.deepCopy();
            if (!copy.has("id")) {
              copy.put("id", hit.path("_id").asText());
            }
            result.add(copy);
          }
        }
      }
    } catch (Exception ex) {
      LOGGER.warn("DCAT3: unable to read collections index.", ex);
    }
    return result;
  }

  /**
   * Reads a single collection.
   * @param id the collection id
   * @return the collection <code>_source</code> or <code>null</code>
   */
  public JsonNode getCollectionById(String id) {
    for (JsonNode c : searchCollections(10000)) {
      if (id != null && id.equals(text(c, "id"))) return c;
    }
    return null;
  }

  /**
   * Counts the members of a collection.
   * @param collectionId the collection id
   * @return the number of member datasets, or <code>-1</code> when unknown
   */
  public long countCollectionMembers(String collectionId) {
    try {
      ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
      ElasticClient client = ElasticClient.newClient();
      String url = client.getTypeUrlForSearch(ec.getIndexName()) + "/_count";

      ObjectNode query = MAPPER.createObjectNode();
      query.putObject("query").putObject("term")
                .put(sf("query.collectionMembership", "src_collections_s"), collectionId);

      String response = client.sendPost(url, query.toString(), CONTENT_TYPE_JSON);
      JsonNode count = MAPPER.readTree(response).path("count");
      return count.isNumber() ? count.asLong() : -1L;
    } catch (Exception ex) {
      LOGGER.debug("DCAT3: unable to count members of collection {}.", collectionId, ex);
      return -1L;
    }
  }

  /**
   * Resolves the identifiers of the datasets belonging to a collection, used to
   * populate <code>dcat:seriesMember</code>.
   *
   * @param collectionId the collection id
   * @param limit maximum number of members to resolve
   * @return the member item ids (never <code>null</code>)
   */
  public List<String> searchCollectionMemberIds(String collectionId, int limit) {
    List<String> ids = new ArrayList<>();
    if (StringUtils.isBlank(collectionId)) return ids;

    try {
      ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
      ElasticClient client = ElasticClient.newClient();
      String url = client.getTypeUrlForSearch(ec.getIndexName()) + "/_search";

      ObjectNode query = MAPPER.createObjectNode();
      query.put("size", limit > 0 ? limit : 1000);
      query.putArray("sort").addObject().put("_id", "asc");
      query.put("_source", false);

      ArrayNode must = MAPPER.createArrayNode();
      must.addObject().putObject("term").put(sf("query.collectionMembership", "src_collections_s"), collectionId);
      appendAccessFilters(must);
      query.putObject("query").putObject("bool").set("must", must);

      String response = client.sendPost(url, query.toString(), CONTENT_TYPE_JSON);
      JsonNode hits = MAPPER.readTree(response).path("hits").path("hits");
      if (hits.isArray()) {
        for (JsonNode hit : hits) {
          String id = hit.path("_id").asText(null);
          if (StringUtils.isNotBlank(id)) ids.add(id);
        }
      }
    } catch (Exception ex) {
      LOGGER.warn("DCAT3: unable to resolve members of collection {}.", collectionId, ex);
    }
    return ids;
  }

  /**
   * Extracts the total hit count from a search response, supporting both the
   * pre-7.x (<code>total</code> as number) and 7.x+
   * (<code>total.value</code>) layouts.
   * @param searchResponse a parsed search response
   * @return the total number of hits, or <code>-1</code> when unknown
   */
  public static long getTotalHits(JsonNode searchResponse) {
    if (searchResponse == null) return -1L;
    JsonNode total = searchResponse.path("hits").path("total");
    if (total.isNumber()) return total.asLong();
    if (total.isObject() && total.path("value").isNumber()) return total.path("value").asLong();
    return -1L;
  }

  /* =================================================================== */
  /* Mapping: index document -> DCAT-US 3.0                              */
  /* =================================================================== */

  /**
   * Builds the catalog header (no datasets attached).
   * @param baseUrl the geoportal base URL used to build absolute links
   * @return the catalog
   */
  public Dcat3Catalog newCatalog(String baseUrl) {
    String root = StringUtils.defaultIfBlank(baseUrl, config.getBaseUrl());

    Dcat3Catalog catalog = new Dcat3Catalog();
    catalog.homepage = StringUtils.defaultIfBlank(config.getHomepage(), root);
    catalog.issued = nowIso();
    catalog.modified = catalog.issued;
    catalog.rights = config.getRights();
    catalog.addLanguage(config.getLanguage());
    catalog.addConformsTo(config.getConformsTo());
    return catalog;
  }

  /**
   * Maps a geoportal metadata document to a <code>dcat:Dataset</code>.
   *
   * @param id the item id (<code>_id</code>)
   * @param source the <code>_source</code> document
   * @param baseUrl the geoportal base URL used to build absolute links
   * @return the dataset
   */
  public Dcat3Dataset toDataset(String id, JsonNode source, String baseUrl) {
    String root = removeTrailingSlash(StringUtils.defaultIfBlank(baseUrl, config.getBaseUrl()));
    String itemUrl = root + "/rest/metadata/item/" + urlEncode(id);

    Dcat3Dataset ds = new Dcat3Dataset();

    ds.atId = itemUrl;
    ds.identifier = itemUrl;
    ds.title = StringUtils.defaultIfBlank(mappedText(source, "dataset", "title", "title"), id);
    ds.description = StringUtils.defaultIfBlank(mappedText(source, "dataset", "description", "description"), ds.title);
    ds.landingPage = itemUrl + "/html";
    String modifiedValue = firstNonBlank(
            mappedText(source, "dataset", "modified", "sys_modified_dt"),
            mappedText(source, "dataset", "modifiedFallback", "sys_modified_dt"));
    ds.modified = StringUtils.defaultIfBlank(toIso(modifiedValue), nowIso());

    Dcat3ContactPoint contactPoint = config.newContactPoint();
    if (contactPoint != null) ds.addContactPoint(contactPoint);

    for (String kw : mappedTextList(source, "dataset", "keywords", "keywords_s")) {
      ds.addKeyword(kw);
    }
    ds.addTheme(mappedText(source, "dataset", "theme", "itemType_s"));

    Dcat3Location location = toLocation(source.path(sf("dataset.envelope", "envelope_geo")));
    if (location != null) ds.addSpatial(location);

    Dcat3PeriodOfTime temporal = toPeriodOfTime(source.path(sf("dataset.timePeriod", "timeperiod_nst")));
    if (temporal != null && !temporal.isEmpty()) ds.addTemporal(temporal);

    ds.publisher = config.newPublisher();
    List<String> rights = mappedTextList(source, "dataset", "rights", "rights_s");
    ds.rights = rights.isEmpty() ? config.getRights() : String.join("; ", rights);
    ds.license = config.getLicense();

    for (Dcat3Distribution d : toDistributions(id, source, root, itemUrl)) {
      ds.addDistribution(d);
    }

    return ds;
  }

  /**
   * Maps a geoportal collection document to a <code>dcat:DatasetSeries</code>.
   *
   * @param collection the collection <code>_source</code> document
   * @param baseUrl the geoportal base URL used to build absolute links
   * @param resolveMemberCount when <code>true</code> the number of members is
   *                           resolved through an extra <code>_count</code> call
   * @return the dataset series
   */
  public Dcat3DatasetSeries toDatasetSeries(JsonNode collection, String baseUrl, boolean resolveMemberCount) {
    String root = removeTrailingSlash(StringUtils.defaultIfBlank(baseUrl, config.getBaseUrl()));
    String collectionId = StringUtils.defaultIfBlank(
            mappedText(collection, "collection", "id", "id"),
            mappedText(collection, "collection", "identifier", "identifier"));
    String seriesTitle = StringUtils.defaultIfBlank(
            firstNonBlank(mappedText(collection, "collection", "title", "title"), mappedText(collection, "collection", "name", "name")),
            StringUtils.defaultIfBlank(collectionId, "Dataset Series"));
    String seriesDescription = StringUtils.defaultIfBlank(
            mappedText(collection, "collection", "description", "description"),
            "Geoportal collection '%s'.".formatted(StringUtils.defaultIfBlank(collectionId, seriesTitle)));

    Dcat3DatasetSeries series = new Dcat3DatasetSeries();
    series.atId = root + "/dcat3/datasetSeries/" + urlEncode(collectionId);
    series.title = seriesTitle;
    series.description = seriesDescription;
    series.issued = toIso(firstNonBlank(
            mappedText(collection, "collection", "created", "created"),
            mappedText(collection, "collection", "createdFallback", "sys_created_dt")));
    series.modified = StringUtils.defaultIfBlank(
            toIso(firstNonBlank(mappedText(collection, "collection", "updated", "updated"),
                    mappedText(collection, "collection", "updatedFallback", "sys_modified_dt"))), nowIso());
    series.accrualPeriodicity = firstNonBlank(
            mappedText(collection, "collection", "accrualPeriodicity", "accrualPeriodicity"),
            config.getAccrualPeriodicity());
    series.addSpatial(toLocation(collection.path(sf("collection.envelope", "envelope_geo"))));
    series.addTemporal(toPeriodOfTime(collection.path(sf("collection.timePeriod", "timeperiod_nst"))));

    series.publisher = config.newPublisher();
    Dcat3ContactPoint contactPoint = config.newContactPoint();
    if (contactPoint != null) series.addContactPoint(contactPoint);

    if (resolveMemberCount) {
      List<String> memberIds = searchCollectionMemberIds(collectionId, 1000);
      long count = countCollectionMembers(collectionId);
      boolean completeMemberList = count >= 0 ? count <= memberIds.size() : memberIds.size() < 1000;
      if (!memberIds.isEmpty()) {
        series.first = toDatasetReference(root + "/rest/metadata/item/" + urlEncode(memberIds.get(0)));
        if (completeMemberList) {
          for (String memberId : memberIds) {
            series.addSeriesMember(toDatasetReference(root + "/rest/metadata/item/" + urlEncode(memberId)));
          }
          series.last = toDatasetReference(root + "/rest/metadata/item/" + urlEncode(memberIds.get(memberIds.size() - 1)));
        } else {
          LOGGER.debug("DCAT3: collection {} has more than {} members; omitting incomplete seriesMember list.", collectionId, memberIds.size());
        }
      }
    }

    validateDatasetSeries(series, collectionId);
    return series;
  }

  /**
   * Validates a dataset series after mapping and logs any missing fields.
   * @param series the series to validate
   * @param collectionId the source collection identifier
   */
  private void validateDatasetSeries(Dcat3DatasetSeries series, String collectionId) {
    if (series == null) return;
    if (StringUtils.isBlank(series.title)) {
      series.title = StringUtils.defaultIfBlank(collectionId, "Dataset Series");
      LOGGER.warn("DCAT3: dataset series {} missing title; using fallback '{}'.", collectionId, series.title);
    }
    if (StringUtils.isBlank(series.description)) {
      series.description = "Geoportal collection '%s'.".formatted(StringUtils.defaultIfBlank(collectionId, series.title));
      LOGGER.warn("DCAT3: dataset series {} missing description; using fallback.", collectionId);
    }
    if (StringUtils.isBlank(series.atId)) {
      LOGGER.warn("DCAT3: dataset series {} missing @id.", collectionId);
    }
    if (series.publisher == null) {
      LOGGER.debug("DCAT3: dataset series {} has no publisher configured.", collectionId);
    }
    if (series.contactPoint == null) {
      LOGGER.debug("DCAT3: dataset series {} has no contact point configured.", collectionId);
    }
  }

  /**
   * Derives the <code>dcat:DataService</code> entries of a metadata document
   * from its <code>resources_nst</code> service endpoints.
   *
   * @param id the item id
   * @param source the <code>_source</code> document
   * @param baseUrl the geoportal base URL used to build absolute links
   * @return list of data services (never <code>null</code>)
   */
  public List<Dcat3DataService> toDataServices(String id, JsonNode source, String baseUrl) {
    List<Dcat3DataService> services = new ArrayList<>();
    if (!config.getIncludeDataServices()) return services;

    String root = removeTrailingSlash(StringUtils.defaultIfBlank(baseUrl, config.getBaseUrl()));
    String datasetId = root + "/rest/metadata/item/" + urlEncode(id);
    String title = StringUtils.defaultIfBlank(mappedText(source, "dataset", "title", "title"), id);

    int index = 0;
    for (JsonNode resource : arrayOf(source.path(sf("dataset.resources", "resources_nst")))) {
      String url = text(resource, sf("dataset.resource.url", "url_s"));
      String urlType = text(resource, sf("dataset.resource.urlType", "url_type_s"));
      if (StringUtils.isBlank(url) || !isHrefValid(url)) continue;
      if (!Dcat3Constants.isServiceType(urlType)) continue;

      Dcat3DataService svc = new Dcat3DataService();
      svc.atId = root + "/dcat3/dataService/" + urlEncode(id) + "/" + (index++);
      svc.identifier = svc.atId;
      svc.title = "%s (%s)".formatted(title, urlType);
      svc.description = "%s endpoint published for '%s'.".formatted(urlType, title);
      svc.endpointURL = url;
      svc.endpointDescription = buildEndpointDescription(url, urlType);
      svc.format = urlType;
      svc.mediaType = Dcat3Constants.MEDIA_TYPE_JSON;
      svc.addServesDataset(datasetId);
      svc.addConformsTo(conformanceClassOf(urlType));
      svc.publisher = config.newPublisher();
      svc.contactPoint = contactPoints(config.newContactPoint());
      svc.license = config.getLicense();
      svc.accessLevel = config.getAccessLevel();
      svc.landingPage = datasetId;
      String modifiedValue = firstNonBlank(
              mappedText(source, "dataset", "modified", "sys_modified_dt"),
              mappedText(source, "dataset", "modifiedFallback", "sys_modified_dt"));
      String createdValue = firstNonBlank(
              mappedText(source, "dataset", "created", "sys_created_dt"),
              mappedText(source, "dataset", "createdFallback", "sys_created_dt"));
      svc.modified = toIso(modifiedValue);
      svc.issued = toIso(createdValue);
      services.add(svc);
    }
    return services;
  }

  /**
   * Builds all <code>dcat:Distribution</code> entries of a metadata document.
   *
   * <p>Service endpoints are emitted as standard distributions using only the
   * mandatory and recommended distribution fields.</p>
   *
   * @param id the item id
   * @param source the <code>_source</code> document
   * @param root the geoportal base URL (no trailing slash)
   * @param itemUrl the URL of the geoportal item
   * @return list of distributions (never <code>null</code>)
   */
  public List<Dcat3Distribution> toDistributions(String id, JsonNode source, String root, String itemUrl) {
    List<Dcat3Distribution> distributions = new ArrayList<>();
    List<String> seen = new ArrayList<>();

    // metadata representations of the item itself
    Dcat3Distribution json = Dcat3Distribution.access(itemUrl, "JSON");
    json.title = "Metadata (JSON)";
    json.description = "Metadata (JSON)";
    distributions.add(json);
    seen.add(itemUrl);

    String metadataType = text(source, sf("dataset.metadataType", "sys_metadatatype_s"));
    if (!"json".equalsIgnoreCase(StringUtils.defaultString(metadataType))) {
      Dcat3Distribution html = Dcat3Distribution.access(itemUrl + "/html", "HTML");
      html.title = "Metadata (HTML)";
      html.description = "Metadata (HTML)";
      distributions.add(html);

      Dcat3Distribution xml = Dcat3Distribution.access(itemUrl + "/xml", "XML");
      xml.title = "Metadata (XML)";
      xml.description = "Metadata (XML)";
      distributions.add(xml);
    }

    // direct file
    String fileid = text(source, sf("dataset.fileId", "fileid"));
    if (isHrefValid(fileid) && !seen.contains(fileid)) {
      Dcat3Distribution file = Dcat3Distribution.download(fileid, "File");
      file.title = "Download";
      file.description = "Download";
      distributions.add(file);
      seen.add(fileid);
    }

    // linked resources
    for (JsonNode resource : arrayOf(source.path(sf("dataset.resources", "resources_nst")))) {
      String url = text(resource, sf("dataset.resource.url", "url_s"));
      String urlType = text(resource, sf("dataset.resource.urlType", "url_type_s"));
      if (!isHrefValid(url) || seen.contains(url)) continue;
      seen.add(url);

      Dcat3Distribution d = Dcat3Distribution.access(url, StringUtils.defaultIfBlank(urlType, "Web Resource"));
      d.title = StringUtils.defaultIfBlank(urlType, "Resource");
      d.description = d.title;
      String modifiedValue = firstNonBlank(
              mappedText(source, "dataset", "modified", "sys_modified_dt"),
              mappedText(source, "dataset", "modifiedFallback", "sys_modified_dt"));
      d.modified = toIso(modifiedValue);
      d.license = config.getLicense();
      distributions.add(d);
    }

    // thumbnail
    String thumbnail = text(source, sf("dataset.thumbnail", "thumbnail_s"));
    if (isHrefValid(thumbnail) && !seen.contains(thumbnail)) {
      Dcat3Distribution thumb = Dcat3Distribution.access(thumbnail, "Thumbnail");
      thumb.title = "Thumbnail";
      thumb.description = "Thumbnail";
      distributions.add(thumb);
    }

    return distributions;
  }

  /* =================================================================== */
  /* Mapping internals                                                   */
  /* =================================================================== */

  /**
   * Populates the properties shared by all cataloged resources.
   * @param ds the target resource
   * @param id the item id
   * @param source the <code>_source</code> document
   * @param root the geoportal base URL (no trailing slash)
   * @param itemUrl the URL of the geoportal item
   */
  private void populateCommon(Dcat3Dataset ds, String id, JsonNode source, String root, String itemUrl) {
    // Dataset mapping is performed directly in toDataset(); this helper is retained
    // for backward compatibility with earlier internal call sites.
  }

  /**
   * Determines the DCAT-US access level of an item.
   * @param source the <code>_source</code> document
   * @return one of the <code>Dcat3Constants.ACCESS_LEVEL_*</code> values
   */
  private String resolveAccessLevel(JsonNode source) {
    String access = text(source, sf("query.sysAccess", "sys_access_s"));
    if (StringUtils.isBlank(access)) return config.getAccessLevel();
    if ("public".equalsIgnoreCase(access)) return Dcat3Constants.ACCESS_LEVEL_PUBLIC;
    if ("private".equalsIgnoreCase(access)) return Dcat3Constants.ACCESS_LEVEL_NON_PUBLIC;
    return Dcat3Constants.ACCESS_LEVEL_RESTRICTED;
  }

  private String sf(String key, String fallback) {
    return config.getSourceField(key, fallback);
  }

  private String sf(String key, String fieldName, String fallback) {
    return config.getSourceField(key, fieldName, fallback);
  }

  private String mappedText(JsonNode source, String prefix, String fieldName, String fallback) {
    return text(source, sf(prefix + "." + fieldName, fieldName, fallback));
  }

  private List<String> mappedTextList(JsonNode source, String prefix, String fieldName, String fallback) {
    return textList(source, sf(prefix + "." + fieldName, fieldName, fallback));
  }

  private List<String> datasetSourceIncludes() {
    LinkedHashSet<String> includes = new LinkedHashSet<>();

    for (Map.Entry<String, String> e : config.getSourceFieldMappings().entrySet()) {
      String key = StringUtils.defaultString(e.getKey());
      String value = StringUtils.trimToNull(e.getValue());
      if (value == null) continue;
      if (key.startsWith("dataset.") || key.startsWith("query.")) {
        includes.add(value);
      }
    }

    for (String fieldName : config.getClassProperty("Dcat3Dataset")) {
      String sourceField = StringUtils.trimToNull(sf("dataset." + fieldName, fieldName, fieldName));
      if (sourceField != null && !sourceField.startsWith("@")) {
        includes.add(sourceField);
      }
    }
    return new ArrayList<>(includes);
  }

  private static String removeTrailingSlash(String value) {
    if (value == null) return null;
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }

  /**
   * Converts <code>envelope_geo</code> to a <code>dct:Location</code>.
   * @param envelopeGeo the <code>envelope_geo</code> node
   * @return the location or <code>null</code>
   */
  public static Dcat3Location toLocation(JsonNode envelopeGeo) {
    for (JsonNode env : arrayOf(envelopeGeo)) {
      JsonNode coordinates = env.path("coordinates");
      if (!coordinates.isArray() || coordinates.size() != 2) continue;
      JsonNode topLeft = coordinates.get(0);
      JsonNode bottomRight = coordinates.get(1);
      if (!topLeft.isArray() || topLeft.size() != 2) continue;
      if (!bottomRight.isArray() || bottomRight.size() != 2) continue;

      Double west = topLeft.get(0).isNumber() ? topLeft.get(0).asDouble() : null;
      Double north = topLeft.get(1).isNumber() ? topLeft.get(1).asDouble() : null;
      Double east = bottomRight.get(0).isNumber() ? bottomRight.get(0).asDouble() : null;
      Double south = bottomRight.get(1).isNumber() ? bottomRight.get(1).asDouble() : null;

      Dcat3Location loc = Dcat3Location.fromBBox(west, south, east, north);
      if (loc != null) return loc;
    }
    return null;
  }

  /**
   * Converts <code>timeperiod_nst</code> to a <code>dct:PeriodOfTime</code>.
   * @param timePeriod the <code>timeperiod_nst</code> node
   * @return the period or <code>null</code>
   */
  public static Dcat3PeriodOfTime toPeriodOfTime(JsonNode timePeriod) {
    for (JsonNode tp : arrayOf(timePeriod)) {
      String begin = toIso(text(tp, "begin_dt"));
      String end = toIso(text(tp, "end_dt"));
      if (StringUtils.isNotBlank(begin) || StringUtils.isNotBlank(end)) {
        return new Dcat3PeriodOfTime(begin, end);
      }
    }
    return null;
  }

  /**
   * Builds a capabilities / service description URL where applicable.
   */
  private static String buildEndpointDescription(String url, String urlType) {
    if (url == null) return null;
    String separator = url.contains("?") ? "&" : "?";
    if ("WMS".equalsIgnoreCase(urlType)) return url + separator + "service=WMS&request=GetCapabilities";
    if ("WFS".equalsIgnoreCase(urlType)) return url + separator + "service=WFS&request=GetCapabilities";
    if ("WCS".equalsIgnoreCase(urlType)) return url + separator + "service=WCS&request=GetCapabilities";
    if ("WMTS".equalsIgnoreCase(urlType)) return url + separator + "service=WMTS&request=GetCapabilities";
    if ("CSW".equalsIgnoreCase(urlType)) return url + separator + "service=CSW&request=GetCapabilities";
    if (urlType != null && urlType.endsWith("Server")) return url + separator + "f=json";
    return url;
  }

  /**
   * Maps a geoportal resource type to a standard/conformance class.
   */
  private static String conformanceClassOf(String urlType) {
    if (urlType == null) return null;
    switch (urlType.toUpperCase()) {
      case "WMS":  return "http://www.opengeospatial.org/standards/wms";
      case "WFS":  return "http://www.opengeospatial.org/standards/wfs";
      case "WCS":  return "http://www.opengeospatial.org/standards/wcs";
      case "WMTS": return "http://www.opengeospatial.org/standards/wmts";
      case "WPS":  return "http://www.opengeospatial.org/standards/wps";
      case "SOS":  return "http://www.opengeospatial.org/standards/sos";
      case "CSW":  return "http://www.opengeospatial.org/standards/cat";
      default:      return "https://developers.arcgis.com/rest/";
    }
  }

  /**
   * Maps a geoportal resource type to an IANA media type.
   */
  private static String mediaTypeOf(String urlType) {
    if (urlType == null) return Dcat3Constants.MEDIA_TYPE_OCTET_STREAM;
    switch (urlType.toUpperCase()) {
      case "KML": return "application/vnd.google-earth.kml+xml";
      case "SHP": return "application/zip";
      case "CSV": return "text/csv";
      case "PDF": return "application/pdf";
      case "WMS":
      case "WFS":
      case "WCS":
      case "WMTS":
      case "CSW": return Dcat3Constants.MEDIA_TYPE_XML;
      default:
        return Dcat3Constants.isServiceType(urlType)
                ? Dcat3Constants.MEDIA_TYPE_JSON
                : Dcat3Constants.MEDIA_TYPE_HTML;
    }
  }

  /**
   * Reads a textual property.
   */
  public static String text(JsonNode node, String name) {
    if (node == null) return null;
    JsonNode v = node.path(name);
    if (v.isMissingNode() || v.isNull()) return null;
    if (v.isArray()) {
      return v.size() > 0 ? StringUtils.trimToNull(v.get(0).asText()) : null;
    }
    return StringUtils.trimToNull(v.asText());
  }

  /**
   * Reads a property as a list of strings, tolerating single values.
   */
  public static List<String> textList(JsonNode node, String name) {
    List<String> values = new ArrayList<>();
    if (node == null) return values;
    JsonNode v = node.path(name);
    if (v.isMissingNode() || v.isNull()) return values;
    if (v.isArray()) {
      for (JsonNode item : v) {
        String s = StringUtils.trimToNull(item.asText());
        if (s != null && !values.contains(s)) values.add(s);
      }
    } else {
      String s = StringUtils.trimToNull(v.asText());
      if (s != null) values.add(s);
    }
    return values;
  }

  /**
   * Normalizes a node into an iterable of nodes.
   */
  public static Iterable<JsonNode> arrayOf(JsonNode node) {
    List<JsonNode> list = new ArrayList<>();
    if (node == null || node.isMissingNode() || node.isNull()) return list;
    if (node.isArray()) {
      Iterator<JsonNode> it = node.elements();
      while (it.hasNext()) {
        JsonNode n = it.next();
        if (n != null && !n.isNull()) list.add(n);
      }
    } else {
      list.add(node);
    }
    return list;
  }

  /**
   * Returns the first non blank value.
   */
  public static String firstNonBlank(String... values) {
    if (values == null) return null;
    for (String v : values) {
      if (StringUtils.isNotBlank(v)) return v;
    }
    return null;
  }

  /**
   * Checks whether a href uses a supported protocol.
   */
  public static boolean isHrefValid(String href) {
    if (StringUtils.isBlank(href)) return false;
    String lower = href.toLowerCase();
    return lower.startsWith("http://") || lower.startsWith("https://")
        || lower.startsWith("ftp://") || lower.startsWith("ftps://");
  }

  /**
   * Normalizes a date to an ISO-8601 instant.
   */
  public static String toIso(String value) {
    if (StringUtils.isBlank(value)) return null;
    String v = value.trim();
    try {
      return OffsetDateTime.parse(v).withOffsetSameInstant(ZoneOffset.UTC)
              .format(DateTimeFormatter.ISO_INSTANT);
    } catch (Exception ignore) {
    }
    try {
      return Instant.parse(v).toString();
    } catch (Exception ignore) {
    }
    try {
      long epoch = Long.parseLong(v);
      return Instant.ofEpochMilli(epoch).toString();
    } catch (Exception ignore) {
    }
    return v;
  }

  /**
   * Current time as an ISO-8601 instant.
   */
  public static String nowIso() {
    return Instant.now().toString();
  }

  /**
   * URL encodes a path segment.
   */
  public static String urlEncode(String value) {
    return java.net.URLEncoder.encode(StringUtils.defaultString(value),
            java.nio.charset.StandardCharsets.UTF_8);
  }

  /**
   * Wraps a contact point into the schema-compliant array form.
   * @param contactPoint contact point
   * @return singleton array or <code>null</code>
   */
  private static List<Dcat3ContactPoint> contactPoints(Dcat3ContactPoint contactPoint) {
    if (contactPoint == null) return null;
    return List.of(contactPoint);
  }

  /**
   * Builds a minimal dataset reference object.
   * @param datasetId the dataset @id
   * @return the reference or null
   */
  private static Dcat3Dataset toDatasetReference(String datasetId) {
    if (StringUtils.isBlank(datasetId)) return null;
    Dcat3Dataset dataset = new Dcat3Dataset();
    dataset.atId = datasetId;
    dataset.identifier = datasetId;
    return dataset;
  }
}
