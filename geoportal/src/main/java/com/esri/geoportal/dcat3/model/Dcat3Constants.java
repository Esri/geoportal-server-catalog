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
package com.esri.geoportal.dcat3.model;

/**
 * DCAT-US 3.0 constants.
 *
 * @see <a href="https://resources.data.gov/resources/dcat-us3/">DCAT-US 3.0</a>
 * @see <a href="https://www.w3.org/TR/vocab-dcat-3/">W3C DCAT 3</a>
 */
public final class Dcat3Constants {

  private Dcat3Constants() {
  }

  /* ------------------------------------------------------------------ */
  /* Profile URI's (overridable through Dcat3Config)                     */
  /* ------------------------------------------------------------------ */

  /** Default JSON-LD @context of the DCAT-US 3.0 profile. */
  public static final String DEFAULT_CONTEXT = "https://resources.data.gov/resources/dcat-us/v3/context.jsonld";

  /** Default profile the produced document conforms to. */
  public static final String DEFAULT_CONFORMS_TO = "https://resources.data.gov/resources/dcat-us/v3";

  /** Default JSON schema describing the produced catalog. */
  public static final String DEFAULT_DESCRIBED_BY = "https://resources.data.gov/resources/dcat-us/v3/schema/catalog.json";

  /* ------------------------------------------------------------------ */
  /* RDF class names (JSON-LD @type)                                     */
  /* ------------------------------------------------------------------ */

  /** dcat:Catalog. */
  public static final String TYPE_CATALOG = "dcat:Catalog";

  /** dcat:CatalogRecord. */
  public static final String TYPE_CATALOG_RECORD = "dcat:CatalogRecord";

  /** dcat:Dataset. */
  public static final String TYPE_DATASET = "dcat:Dataset";

  /** dcat:DatasetSeries. */
  public static final String TYPE_DATASET_SERIES = "dcat:DatasetSeries";

  /** dcat:DataService. */
  public static final String TYPE_DATA_SERVICE = "dcat:DataService";

  /** dcat:Distribution. */
  public static final String TYPE_DISTRIBUTION = "dcat:Distribution";

  /** org:Organization. */
  public static final String TYPE_ORGANIZATION = "org:Organization";

  /** vcard:Contact. */
  public static final String TYPE_CONTACT = "vcard:Contact";

  /** dct:PeriodOfTime. */
  public static final String TYPE_PERIOD_OF_TIME = "dct:PeriodOfTime";

  /** dct:Location. */
  public static final String TYPE_LOCATION = "dct:Location";

  /* ------------------------------------------------------------------ */
  /* Common values                                                       */
  /* ------------------------------------------------------------------ */

  /** Public access level. */
  public static final String ACCESS_LEVEL_PUBLIC = "public";

  /** Restricted access level. */
  public static final String ACCESS_LEVEL_RESTRICTED = "restricted public";

  /** Non public access level. */
  public static final String ACCESS_LEVEL_NON_PUBLIC = "non-public";

  /** Generic binary media type. */
  public static final String MEDIA_TYPE_OCTET_STREAM = "application/octet-stream";

  /** Media type of the geoportal item (JSON). */
  public static final String MEDIA_TYPE_JSON = "application/json";

  /** Media type of the geoportal item (XML). */
  public static final String MEDIA_TYPE_XML = "application/xml";

  /** Media type of the geoportal item (HTML). */
  public static final String MEDIA_TYPE_HTML = "text/html";

  /**
   * Resource types (<code>resources_nst.url_type_s</code>) which represent an
   * API endpoint and therefore are exposed as <code>dcat:DataService</code>
   * rather than as a plain <code>dcat:Distribution</code>.
   */
  public static final String[] SERVICE_URL_TYPES = {
    "FeatureServer", "Feature Service",
    "MapServer", "Map Service",
    "ImageServer", "Image Service",
    "SceneServer", "Scene Service",
    "VectorTileServer", "Vector Tile Service",
    "GeocodeServer", "Geocoding Service",
    "GeoDataServer", "Geodata Service",
    "GeometryServer", "Geometry Service",
    "GlobeServer", "Globe Service",
    "GPServer", "Geoprocessing  Service",
    "NAServer", "Network Analysis Service",
    "WMS", "WFS", "WCS", "WMTS", "WPS", "SOS", "CSW", "IMS", "ArcIMS"
  };

  /**
   * Checks whether given resource type represents a data service.
   * @param urlType the value of <code>resources_nst.url_type_s</code>
   * @return <code>true</code> when the type denotes a service endpoint
   */
  public static boolean isServiceType(String urlType) {
    if (urlType == null) return false;
    for (String t : SERVICE_URL_TYPES) {
      if (t.equalsIgnoreCase(urlType)) return true;
    }
    return false;
  }
}
