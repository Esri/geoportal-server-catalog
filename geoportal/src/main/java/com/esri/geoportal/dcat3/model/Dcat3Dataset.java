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
 * DCAT-US 3.0 <code>dcat:Dataset</code>.
 *
 * <p>A collection of data, published or curated by a single agent, and
 * available for access or download in one or more representations.</p>
 *
 * @see <a href="https://resources.data.gov/standards/catalog/dcat-us-3/dataset/">DCAT-US 3.0</a>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3Dataset {

  /** JSON-LD node identifier. */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type. */
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_DATASET;

  /** dct:identifier (mandatory). */
  public String identifier;

  /** dct:title (mandatory). */
  public String title;

  /** dct:description (mandatory). */
  public String description;

  /** dcat:contactPoint (mandatory). */
  public List<Dcat3ContactPoint> contactPoint;

  /** List of access restrictions related to the dataset. */
  public List<Dcat3AccessRestriction> accessRestriction;

  /** Controlled Unclassified Information restriction. */
  public List<String> cuiRestriction;

  /** DCAT-US describedBy - data dictionary URL. */
  public String describedBy;

  /** dcat:distribution. */
  public List<Dcat3Distribution> distribution;

  /** Date on which the dataset was added to the catalog. */
  public String inventoried;

  /** dcat:keyword. */
  public List<String> keyword;

  /** dcat:landingPage. */
  public Dcat3NodeRef landingPage;

  /** dct:license. */
  public String license;

  /** dct:modified (ISO-8601). */
  public String modified;

  /** dct:publisher. */
  public Dcat3Organization publisher;

  /** dct:rights. */
  public String rights;

  /** dct:spatial. */
  public List<Dcat3Location> spatial;

  /** dct:temporal. */
  public List<Dcat3PeriodOfTime> temporal;

  /** dcat:theme. */
  public List<String> theme;

  /** List of use restrictions related to the dataset. */
  public List<String> useRestriction;

  public Dcat3Dataset() {
  }

  /**
   * Adds a distribution.
   * @param dist the distribution (ignored when <code>null</code> or without any URL)
   */
  public void addDistribution(Dcat3Distribution dist) {
    if (dist == null) return;
    if (dist.accessURL == null || dist.accessURL.isEmpty()) return;
    if (distribution == null) distribution = new ArrayList<>();
    distribution.add(dist);
  }

  /**
   * Adds a contact point.
   * @param value contact point
   */
  public void addContactPoint(Dcat3ContactPoint value) {
    if (value == null) return;
    if (contactPoint == null) contactPoint = new ArrayList<>();
    contactPoint.add(value);
  }

  /**
   * Adds a keyword.
   * @param value keyword
   */
  public void addKeyword(String value) {
    if (value == null || value.trim().isEmpty()) return;
    if (keyword == null) keyword = new ArrayList<>();
    if (!keyword.contains(value)) keyword.add(value);
  }

  /**
   * Adds a theme.
   * @param value theme
   */
  public void addTheme(String value) {
    if (value == null || value.trim().isEmpty()) return;
    if (theme == null) theme = new ArrayList<>();
    if (!theme.contains(value)) theme.add(value);
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
}
