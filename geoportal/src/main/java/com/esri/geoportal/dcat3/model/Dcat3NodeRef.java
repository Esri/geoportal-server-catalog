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

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Lightweight JSON-LD node reference used for linked DCAT-US objects such as
 * landing pages and controlled vocabulary terms.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3NodeRef {

  public static final String ACCESS_RESTRICTION_URL = "https://resources.data.gov/standards/catalog/dcat-us-3/constraints-and-restrictions/#access-restriction";
  public static final String LANDING_PAGE_TYPE = "Document";

  /** JSON-LD node identifier. */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type. */
  @JsonProperty("@type")
  public String atType;

  /** Human-readable label. */
  public String title;

  public Dcat3NodeRef() {
  }

  public Dcat3NodeRef(String atId) {
    this.atId = atId;
  }

  public Dcat3NodeRef(String atId, String atType, String title) {
    this.atId = atId;
    this.atType = atType;
    this.title = title;
  }

  public static Dcat3NodeRef document(String atId, String title) {
    return new Dcat3NodeRef(atId, LANDING_PAGE_TYPE, title);
  }

  public static Dcat3NodeRef accessRestriction() {
    return new Dcat3NodeRef(ACCESS_RESTRICTION_URL, LANDING_PAGE_TYPE, "Access Restriction");
  }
}
