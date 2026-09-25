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

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DCAT-US 3.0 <code>dcat:DataService</code>.
 *
 * <p>A collection of operations accessible through an interface (API) that
 * provides access to one or more datasets or data processing functions.</p>
 *
 * @see <a href="https://www.w3.org/TR/vocab-dcat-3/#Class:Data_Service">DCAT 3 Data Service</a>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3DataService {

  /** JSON-LD node identifier (usually a dereferenceable URI). */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type, one of the <code>Dcat3Constants.TYPE_*</code> values. */
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_DATA_SERVICE;

  /** dct:identifier */
  public String identifier;

  /** dct:title */
  public String title;

  /** dct:description */
  public String description;

  /** dct:issued (ISO-8601) */
  public String issued;

  /** dct:modified (ISO-8601) */
  public String modified;

  /** dcat:keyword */
  public List<String> keyword;

  /** dcat:theme */
  public List<String> theme;

  /** dct:language */
  public List<String> language;

  /** dct:publisher */
  public Dcat3Organization publisher;

  /** dct:creator */
  public Dcat3Organization creator;

  /** dcat:contactPoint */
  public List<Dcat3ContactPoint> contactPoint;

  /** dcat:landingPage */
  public Dcat3NodeRef landingPage;

  /** dct:license */
  public String license;

  /** dct:rights */
  public String rights;

  /** dct:accessRights. */
  public String accessRights;

  /** DCAT-US accessLevel: public | restricted public | non-public */
  public String accessLevel;

  /** DCAT-US accessLevelComment */
  public String accessLevelComment;

  /** DCAT-US bureauCode */
  public List<String> bureauCode;

  /** DCAT-US programCode */
  public List<String> programCode;

  /** dcat:endpointURL - the root location of the service. */
  public String endpointURL;

  /** dcat:endpointDescription - description of the service (e.g. capabilities document). */
  public String endpointDescription;

  /** dcat:servesDataset - identifiers of the datasets served by this service. */
  public List<String> servesDataset;

  /** dct:conformsTo - standard the service implements (e.g. OGC WMS). */
  public List<String> conformsTo;

  /** dct:format - the service type (e.g. FeatureServer, WMS). */
  public String format;

  /** dcat:mediaType */
  public String mediaType;

  public Dcat3DataService() {
    this.atType = Dcat3Constants.TYPE_DATA_SERVICE;
  }

  /**
   * Adds a keyword, avoiding duplicates and blanks.
   * @param value keyword
   */
  public void addKeyword(String value) {
    if (value == null || value.trim().isEmpty()) return;
    if (keyword == null) keyword = new ArrayList<>();
    if (!keyword.contains(value)) keyword.add(value);
  }

  /**
   * Adds a theme, avoiding duplicates and blanks.
   * @param value theme
   */
  public void addTheme(String value) {
    if (value == null || value.trim().isEmpty()) return;
    if (theme == null) theme = new ArrayList<>();
    if (!theme.contains(value)) theme.add(value);
  }

  /**
   * Adds a contact point, avoiding blanks.
   * @param value contact point
   */
  public void addContactPoint(Dcat3ContactPoint value) {
    if (value == null) return;
    if (contactPoint == null) contactPoint = new ArrayList<>();
    contactPoint.add(value);
  }

  /**
   * Adds a served dataset reference.
   * @param datasetId dataset <code>@id</code> or identifier
   */
  public void addServesDataset(String datasetId) {
    if (datasetId == null || datasetId.trim().isEmpty()) return;
    if (servesDataset == null) servesDataset = new ArrayList<>();
    if (!servesDataset.contains(datasetId)) servesDataset.add(datasetId);
  }

  /**
   * Adds a conformance class.
   * @param standard standard URI or name
   */
  public void addConformsTo(String standard) {
    if (standard == null || standard.trim().isEmpty()) return;
    if (conformsTo == null) conformsTo = new ArrayList<>();
    if (!conformsTo.contains(standard)) conformsTo.add(standard);
  }
}
