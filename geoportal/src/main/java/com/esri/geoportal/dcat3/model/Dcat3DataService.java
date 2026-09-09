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
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * DCAT-US 3.0 <code>dcat:DataService</code>.
 *
 * <p>A collection of operations accessible through an interface (API) that
 * provides access to one or more datasets or data processing functions.</p>
 *
 * @see <a href="https://www.w3.org/TR/vocab-dcat-3/#Class:Data_Service">DCAT 3 Data Service</a>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonPropertyOrder({"@id", "@type", "identifier", "title", "description",
  "endpointURL", "endpointDescription", "servesDataset", "conformsTo",
  "format", "mediaType", "issued", "modified", "keyword", "theme", "language",
  "publisher", "creator", "contactPoint", "landingPage", "license", "rights",
  "accessRights", "accessLevel", "accessLevelComment", "bureauCode", "programCode"})
public class Dcat3DataService extends Dcat3Resource {

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
