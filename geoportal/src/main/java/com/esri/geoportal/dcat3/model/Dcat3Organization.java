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
 * DCAT-US 3.0 publisher / creator (<code>org:Organization</code>).
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3Organization {

  /** JSON-LD node identifier. */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type. */
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_ORGANIZATION;

  /** foaf:name */
  public String name;

  /** org:subOrganizationOf */
  public Dcat3Organization subOrganizationOf;

  public Dcat3Organization() {
  }

  /**
   * Creates an organization.
   * @param name the organization name
   */
  public Dcat3Organization(String name) {
    this.name = name;
  }

  /**
   * Creates a shallow copy.
   * @return copy of this organization
   */
  public Dcat3Organization copy() {
    Dcat3Organization copy = new Dcat3Organization();
    copy.atId = atId;
    copy.atType = atType;
    copy.name = name;
    copy.subOrganizationOf = subOrganizationOf != null ? subOrganizationOf.copy() : null;
    return copy;
  }
}
