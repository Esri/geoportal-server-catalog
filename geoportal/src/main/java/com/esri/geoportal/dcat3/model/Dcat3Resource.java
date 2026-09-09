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
 * Common base for every DCAT-US 3.0 cataloged resource
 * (<code>dcat:Resource</code>).
 *
 * <p>Shared by {@link Dcat3Catalog}, {@link Dcat3DatasetSeries}
 * and {@link Dcat3DataService}.</p>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonPropertyOrder({"@id", "@type", "identifier", "title", "description",
  "issued", "modified", "keyword", "theme", "language", "publisher",
  "creator", "contactPoint", "landingPage", "license", "rights", "accessLevel",
  "accessRights", "accessLevelComment", "bureauCode", "programCode"})
public abstract class Dcat3Resource {

  /** JSON-LD node identifier (usually a dereferenceable URI). */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type, one of the <code>Dcat3Constants.TYPE_*</code> values. */
  @JsonProperty("@type")
  public String atType;

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
  public String landingPage;

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
   * Adds a contact point, avoiding duplicates and blanks.
   * @param value contact point
   */
  public void addContactPoint(Dcat3ContactPoint value) {
    if (value == null) return;
    if (contactPoint == null) contactPoint = new ArrayList<>();
    contactPoint.add(value);
  }
}
