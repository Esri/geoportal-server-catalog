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
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * DCAT-US 3.0 <code>dcat:Distribution</code>.
 *
 * <p>A specific representation of a dataset.</p>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonPropertyOrder({"title", "description", "accessURL", "accessRestriction",
  "cuiRestriction", "describedBy", "format", "license", "modified",
  "rights", "useRestriction"})
public class Dcat3Distribution {

  /** dct:title */
  public String title;

  /** dct:description */
  public String description;

  /** dcat:accessURL - a landing page / API root giving access to the distribution. */
  public String accessURL;

  /** List of access restriction labels or URIs. */
  public List<String> accessRestriction;

  /** dct:format - human readable format (e.g. Shapefile, WMS). */
  public String format;

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
   * Creates an access-url based distribution.
   * @param accessURL access URL
   * @param format format label
   * @return the distribution
   */
  public static Dcat3Distribution access(String accessURL, String format) {
    Dcat3Distribution d = new Dcat3Distribution();
    d.accessURL = accessURL;
    d.format = format;
    return d;
  }

  /**
   * Creates a file-access distribution.
   * @param accessURL access URL
   * @param format format label
   * @return the distribution
   */
  public static Dcat3Distribution download(String accessURL, String format) {
    Dcat3Distribution d = new Dcat3Distribution();
    d.accessURL = accessURL;
    d.format = format;
    return d;
  }
}
