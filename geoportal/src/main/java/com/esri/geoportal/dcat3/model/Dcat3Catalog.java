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

/**
 * DCAT-US 3.0 <code>dcat:Catalog</code>.
 *
 * <p>The catalog resource itself exposes only the mandatory and recommended
 * fields from the DCAT-US 3.0 catalog schema page.</p>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3Catalog {

  /** dcat:dataset (mandatory). */
  public List<Dcat3Dataset> dataset;

  /** dct:conformsTo (recommended). */
  public List<String> conformsTo;

  /** foaf:homepage (recommended). */
  public String homepage;

  /** dct:issued (recommended). */
  public String issued;

  /** dct:language (recommended). */
  public List<String> language;

  /** dct:modified (recommended). */
  public String modified;

  /** dct:rights (recommended). */
  public String rights;

  /** dct:spatial (recommended). */
  public List<Dcat3Location> spatial;

  /** dcat:themeTaxonomy (recommended). */
  public List<String> themeTaxonomy;

  public Dcat3Catalog() {
  }

  /**
   * Adds a dataset to the catalog.
   * @param ds dataset
   */
  public void addDataset(Dcat3Dataset ds) {
    if (ds == null) return;
    if (dataset == null) dataset = new ArrayList<>();
    dataset.add(ds);
  }

  /**
   * Adds a conforming standard or profile URI.
   * @param value URI
   */
  public void addConformsTo(String value) {
    if (value == null || value.trim().isEmpty()) return;
    if (conformsTo == null) conformsTo = new ArrayList<>();
    if (!conformsTo.contains(value)) conformsTo.add(value);
  }

  /**
   * Adds a language.
   * @param value language code
   */
  public void addLanguage(String value) {
    if (value == null || value.trim().isEmpty()) return;
    if (language == null) language = new ArrayList<>();
    if (!language.contains(value)) language.add(value);
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
   * Adds a theme taxonomy URI.
   * @param value URI
   */
  public void addThemeTaxonomy(String value) {
    if (value == null || value.trim().isEmpty()) return;
    if (themeTaxonomy == null) themeTaxonomy = new ArrayList<>();
    if (!themeTaxonomy.contains(value)) themeTaxonomy.add(value);
  }
}
