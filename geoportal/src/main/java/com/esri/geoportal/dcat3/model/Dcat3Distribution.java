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

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DCAT-US 3.0 <code>dcat:Distribution</code>.
 *
 * <p>A specific representation of a dataset.</p>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3Distribution {
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_DISTRIBUTION;

  /** dct:title */
  public String title;

  /** dct:description */
  public String description;

  /** dcat:accessURL - a landing page / API root giving access to the distribution. */
  public String accessURL;

  /** dcat:downloadURL - a direct link to a downloadable file for the distribution. */
  public String downloadURL;

  /** dcat:accessService - @id of the dcat:DataService that serves this distribution, when applicable. */
  public String accessService;

  /** List of access restriction labels or URIs. */
  public List<Dcat3AccessRestriction> accessRestriction;

  /** dct:format - human readable format (e.g. Shapefile, WMS). */
  public String format;

  /** dcat:mediaType - IANA media type of the distribution (e.g. application/json). */
  public String mediaType;

  /** DCAT-US describedBy - data dictionary URL. */
  public String describedBy;

  /** dct:modified */
  public String modified;

  /** dct:license */
  public String license;

  /** dct:rights */
  public String rights;

  /** List of CUI restriction labels or URIs. */
  public List<String> cuiRestriction;

  /** DCAT-US useRestriction. */
  public List<String> useRestriction;

  public Dcat3Distribution() {
  }

  /**
   * Creates an access-url based distribution, defaulting the access
   * restriction to <code>public</code>.
   * @param accessURL access URL
   * @param format format label
   * @return the distribution
   */
  public static Dcat3Distribution access(String accessURL, String format) {
    return access(accessURL, format, "public");
  }

  /**
   * Creates an access-url based distribution.
   * @param accessURL access URL
   * @param format format label
   * @param accessRestriction the access restriction status of the parent item
   *        (e.g. <code>public</code> / <code>private</code>); defaults to
   *        <code>public</code> when blank
   * @return the distribution
   */
  public static Dcat3Distribution access(String accessURL, String format, String accessRestriction) {
    Dcat3Distribution d = new Dcat3Distribution();
    d.accessURL = accessURL;
    d.format = format;
    d.accessRestriction = List.of(Dcat3AccessRestriction.of(
            accessRestriction == null || accessRestriction.trim().isEmpty() ? "public" : accessRestriction));
    return d;
  }

  /**
   * Creates a file-access distribution, defaulting the access restriction to
   * <code>public</code>.
   * @param downloadURL download URL
   * @param format format label
   * @return the distribution
   */
  public static Dcat3Distribution download(String downloadURL, String format) {
    return download(downloadURL, format, "public");
  }

  /**
   * Creates a file-access distribution.
   * @param downloadURL download URL
   * @param format format label
   * @param accessRestriction the access restriction status of the parent item
   *        (e.g. <code>public</code> / <code>private</code>); defaults to
   *        <code>public</code> when blank
   * @return the distribution
   */
  public static Dcat3Distribution download(String downloadURL, String format, String accessRestriction) {
    Dcat3Distribution d = new Dcat3Distribution();
    d.downloadURL = downloadURL;
    d.format = format;
    d.accessRestriction = List.of(Dcat3AccessRestriction.of(
            accessRestriction == null || accessRestriction.trim().isEmpty() ? "public" : accessRestriction));
    return d;
  }
}
