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
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.dcat3.model.Dcat3Catalog;
import com.esri.geoportal.dcat3.model.Dcat3Dataset;
import com.esri.geoportal.dcat3.model.Dcat3DatasetSeries;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * DCAT-US 3.0 builder.
 *
 * <p>Builds the aggregated DCAT-US 3.0 catalog document. Unlike the legacy
 * {@code com.esri.geoportal.dcat.DcatBuilder} - which delegated to the Nashorn
 * script {@code gs/context/nashorn/execute.js} - this builder performs every
 * OpenSearch / Elasticsearch operation <b>directly in Java</b> through
 * {@link Dcat3Helper}.</p>
 *
 * <p>The document is streamed record by record so that arbitrarily large
 * catalogs can be produced with a constant memory footprint:</p>
 * <pre>
 * {
 *   "@context": "...", "conformsTo": "...", "@type": "dcat:Catalog", ...
 *   "dataset": [
 *      { "@type": "dcat:Dataset", ... }
 *   ]
 * }
 * </pre>
 */
public class Dcat3Builder {

  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(Dcat3Builder.class);

  private final Dcat3Cache dcat3Cache;
  private final Dcat3Config config;
  private final Dcat3Helper helper;

  /**
   * Creates instance of the builder.
   * @param dcat3Cache the DCAT-US 3.0 cache
   * @param config the DCAT-US 3.0 configuration
   */
  public Dcat3Builder(Dcat3Cache dcat3Cache, Dcat3Config config) {
    this.dcat3Cache = dcat3Cache;
    this.config = config != null ? config : new Dcat3Config();
    this.helper = new Dcat3Helper(this.config);
  }

  /**
   * Gets the helper used by this builder.
   * @return the helper
   */
  public Dcat3Helper getHelper() {
    return helper;
  }

  /**
   * Gets the configuration.
   * @return the configuration
   */
  public Dcat3Config getConfig() {
    return config;
  }

  /**
   * Builds the aggregated DCAT-US 3.0 document into the cache.
   * @param dcat3Context the build context
   */
  public void build(Dcat3Context dcat3Context) {
    long started = System.currentTimeMillis();
    LOGGER.info("Starting building aggregated DCAT-US 3.0 file...");

    Dcat3CacheOutputStream outputStream = null;
    PrintWriter writer = null;
    boolean complete = false;

    try {
      outputStream = dcat3Cache.createOutputCacheStream();
      writer = new PrintWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));

      ObjectWriter jsonWriter = config.getPrettyPrint()
              ? Dcat3Helper.MAPPER.writerWithDefaultPrettyPrinter()
              : Dcat3Helper.MAPPER.writer();

      String baseUrl = config.getBaseUrl();

      writeCatalogHeader(writer, jsonWriter, baseUrl);
      writer.println();
      writer.print("\"dataset\": [");

      long counter = 0;
      counter += writeDatasets(writer, jsonWriter, dcat3Context, baseUrl, counter);

      writer.println();
      writer.println("]");
      writer.println("}");
      writer.flush();

      if (!dcat3Context.isRunning()) {
        throw new IOException("DCAT-US 3.0 build was aborted.");
      }

      complete = true;
      LOGGER.info("Completed building aggregated DCAT-US 3.0 file: {} resources in {} ms.",
              counter, System.currentTimeMillis() - started);
    } catch (Exception ex) {
      LOGGER.error("Error building aggregated DCAT-US 3.0 file!", ex);
    } finally {
      if (writer != null) {
        writer.flush();
      }
      if (outputStream != null) {
        try {
          if (complete) {
            outputStream.close();
          } else {
            outputStream.abort();
          }
        } catch (IOException ignore) {
          LOGGER.debug("Error finalizing DCAT-US 3.0 cache stream.", ignore);
        }
      }
    }
  }

  /* =================================================================== */
  /* Streaming internals                                                 */
  /* =================================================================== */

  /**
   * Writes the opening brace and all catalog level properties, leaving the
   * document open so that the <code>dataset</code> array can be streamed.
   *
   * @param writer the output writer
   * @param jsonWriter the JSON serializer
   * @param baseUrl the geoportal base URL
   * @throws IOException if serialization fails
   */
  private void writeCatalogHeader(PrintWriter writer, ObjectWriter jsonWriter, String baseUrl)
          throws IOException {
    Dcat3Catalog catalog = helper.newCatalog(baseUrl);
    catalog.dataset = null;

    ObjectNode envelope = Dcat3Helper.MAPPER.createObjectNode();
    envelope.put("@context", config.getContext());
    envelope.put("conformsTo", config.getConformsTo());
    envelope.put("describedBy", config.getDescribedBy());

    String envelopeJson = jsonWriter.writeValueAsString(envelope).stripTrailing();
    JsonNode orderedCatalog = Dcat3JsonOrder.order(Dcat3Helper.MAPPER.valueToTree(catalog), config);
    String catalogJson = jsonWriter.writeValueAsString(orderedCatalog).stripTrailing();

    writer.print(envelopeJson.substring(0, envelopeJson.length() - 1));
    writer.print(",");
    writer.print(catalogJson.substring(1, catalogJson.length() - 1));
    writer.print(",");
  }

  /**
   * Streams the <code>dcat:DatasetSeries</code> resources derived from the
   * geoportal collections index.
   *
   * @param writer the output writer
   * @param jsonWriter the JSON serializer
   * @param dcat3Context the build context
   * @param baseUrl the geoportal base URL
   * @param alreadyWritten number of entries already written to the array
   * @return the number of entries written
   * @throws IOException if serialization fails
   */
  private long writeDatasetSeries(PrintWriter writer, ObjectWriter jsonWriter,
          Dcat3Context dcat3Context, String baseUrl, long alreadyWritten) throws IOException {
    if (!config.getIncludeDatasetSeries()) return 0;

    long written = 0;
    List<JsonNode> collections = helper.searchCollections(10000);
    for (JsonNode collection : collections) {
      if (!dcat3Context.isRunning()) break;
      Dcat3DatasetSeries series = helper.toDatasetSeries(collection, baseUrl, true);
      writeEntry(writer, jsonWriter, series, alreadyWritten + written);
      written++;
    }

    if (written > 0) {
      LOGGER.info("DCAT-US 3.0: wrote {} dcat:DatasetSeries entries.", written);
    }
    return written;
  }

  /**
   * Streams the <code>dcat:Dataset</code> resources by walking the metadata
   * index page by page using <code>search_after</code>.
   *
   * @param writer the output writer
   * @param jsonWriter the JSON serializer
   * @param dcat3Context the build context
   * @param baseUrl the geoportal base URL
   * @param alreadyWritten number of entries already written to the array
   * @return the number of entries written
   * @throws Exception if the search or serialization fails
   */
  private long writeDatasets(PrintWriter writer, ObjectWriter jsonWriter,
          Dcat3Context dcat3Context, String baseUrl, long alreadyWritten) throws Exception {
    long written = 0;
    long total = -1;
    String searchAfter = null;

    while (dcat3Context.isRunning()) {
      JsonNode response = helper.searchDatasets(searchAfter, config.getPageSize());
      if (total < 0) {
        total = Dcat3Helper.getTotalHits(response);
      }

      JsonNode hits = response.path("hits").path("hits");
      if (!hits.isArray() || hits.isEmpty()) break;

      String lastId = null;
      for (JsonNode hit : hits) {
        if (!dcat3Context.isRunning()) break;

        String id = hit.path("_id").asText(null);
        if (StringUtils.isBlank(id)) continue;
        lastId = id;

        Dcat3Dataset ds = helper.toDataset(id, hit.path("_source"), baseUrl);
        writeEntry(writer, jsonWriter, ds, alreadyWritten + written);
        written++;
      }

      if (StringUtils.isBlank(lastId)) break;
      searchAfter = lastId;

      if (written % 1000 == 0) {
        LOGGER.info("DCAT-US 3.0: processed {} of {} dcat:Dataset entries.", written, total);
      }
      if (hits.size() < config.getPageSize()) break;
    }

    LOGGER.info("DCAT-US 3.0: wrote {} dcat:Dataset entries.", written);
    return written;
  }

  /**
   * Writes a single entry into the streamed <code>dataset</code> array.
   *
   * @param writer the output writer
   * @param jsonWriter the JSON serializer
   * @param resource the resource to write
   * @param index index of the entry within the array
   * @throws IOException if serialization fails
   */
  private void writeEntry(PrintWriter writer, ObjectWriter jsonWriter, Object resource, long index)
          throws IOException {
    if (index > 0) {
      writer.print(",");
    }
    writer.println();
    JsonNode ordered = Dcat3JsonOrder.order(Dcat3Helper.MAPPER.valueToTree(resource), config);
    writer.print(jsonWriter.writeValueAsString(ordered));
  }

  /* =================================================================== */
  /* On demand (non cached) generation                                   */
  /* =================================================================== */

  /**
   * Builds a complete, in-memory catalog. Intended for small catalogs and for
   * the "live" REST endpoints; the cached document produced by
   * {@link #build(Dcat3Context)} should be preferred for large catalogs.
   *
   * @param baseUrl the geoportal base URL
   * @param maxDatasets maximum number of datasets to include
   * @return the catalog
   * @throws Exception if the search fails
   */
  public Dcat3Catalog buildInMemory(String baseUrl, int maxDatasets) throws Exception {
    Dcat3Catalog catalog = helper.newCatalog(baseUrl);

    int written = 0;
    String searchAfter = null;
    while (written < maxDatasets) {
      int pageSize = Math.min(config.getPageSize(), maxDatasets - written);
      JsonNode response = helper.searchDatasets(searchAfter, pageSize);
      JsonNode hits = response.path("hits").path("hits");
      if (!hits.isArray() || hits.isEmpty()) break;

      String lastId = null;
      for (JsonNode hit : hits) {
        String id = hit.path("_id").asText(null);
        if (StringUtils.isBlank(id)) continue;
        lastId = id;
        catalog.addDataset(helper.toDataset(id, hit.path("_source"), baseUrl));
        written++;
      }
      if (StringUtils.isBlank(lastId)) break;
      searchAfter = lastId;
      if (hits.size() < pageSize) break;
    }

    return catalog;
  }
}
