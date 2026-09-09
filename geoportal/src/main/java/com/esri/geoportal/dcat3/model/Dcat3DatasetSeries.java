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
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * DCAT-US 3.0 <code>dcat:DatasetSeries</code>.
 *
 * <p>A dataset series is a group of related datasets that are published
 * separately. Unlike {@link Dcat3Dataset}, a dataset series does not extend
 * the dataset schema; it exposes only the properties documented on the
 * DCAT-US 3.0 schema reference page for this class. In geoportal a dataset
 * series is derived from a <em>collection</em>.</p>
 *
 * @see <a href="https://resources.data.gov/standards/catalog/dcat-us-3/dataset-series/">DCAT-US 3.0 Dataset Series</a>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonPropertyOrder({"@id", "@type", "title", "description", "issued",
  "modified", "accrualPeriodicity", "publisher", "contactPoint", "spatial",
  "temporal", "seriesMember", "first", "last"})
public class Dcat3DatasetSeries {

  /** JSON-LD node identifier (recommended). */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type (optional). */
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_DATASET_SERIES;

  /** dct:title (mandatory). */
  public String title;

  /** dct:description (mandatory). */
  public String description;

  /** dct:issued - release date of the series (optional). */
  public String issued;

  /** dct:modified - most recent date the series changed (recommended). */
  public String modified;

  /** dct:accrualPeriodicity - update frequency of the series (optional). */
  public String accrualPeriodicity;

  /** dct:publisher - organization maintaining the series (recommended). */
  public Dcat3Organization publisher;

  /** dcat:contactPoint (recommended). */
  public List<Dcat3ContactPoint> contactPoint;

  /** dct:spatial - geographic coverage of the series (recommended). */
  public List<Dcat3Location> spatial;

  /** dct:temporal - time periods covered by the series (recommended). */
  public List<Dcat3PeriodOfTime> temporal;

  /** dcat:seriesMember - members of the dataset series (recommended). */
  public List<Dcat3Dataset> seriesMember;

  /** dcat:first - first dataset in an ordered series (recommended). */
  public Dcat3Dataset first;

  /** dcat:last - last dataset in an ordered series (recommended). */
  public Dcat3Dataset last;

  public Dcat3DatasetSeries() {
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
   * Adds a spatial coverage entry.
   * @param value location
   */
  public void addSpatial(Dcat3Location value) {
    if (value == null) return;
    if (spatial == null) spatial = new ArrayList<>();
    spatial.add(value);
  }

  /**
   * Adds a temporal coverage entry.
   * @param value period of time
   */
  public void addTemporal(Dcat3PeriodOfTime value) {
    if (value == null || value.isEmpty()) return;
    if (temporal == null) temporal = new ArrayList<>();
    temporal.add(value);
  }

  /**
   * Adds a series member.
   * @param datasetId dataset <code>@id</code> or identifier
   */
  public void addSeriesMember(String datasetId) {
    addSeriesMember(ref(datasetId));
  }

  /**
   * Adds a series member reference.
   * @param dataset dataset reference
   */
  public void addSeriesMember(Dcat3Dataset dataset) {
    if (dataset == null || dataset.atId == null || dataset.atId.trim().isEmpty()) return;
    if (seriesMember == null) seriesMember = new ArrayList<>();
    for (Dcat3Dataset existing : seriesMember) {
      if (existing != null && dataset.atId.equals(existing.atId)) return;
    }
    seriesMember.add(dataset);
  }

  /**
   * Builds a minimal dataset reference.
   * @param datasetId dataset <code>@id</code> or identifier
   * @return the reference or <code>null</code>
   */
  private static Dcat3Dataset ref(String datasetId) {
    if (datasetId == null || datasetId.trim().isEmpty()) return null;
    Dcat3Dataset dataset = new Dcat3Dataset();
    dataset.atId = datasetId;
    dataset.identifier = datasetId;
    return dataset;
  }
}
