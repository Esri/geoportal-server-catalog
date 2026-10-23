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
 * DCAT-US 3.0 access restriction.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3AccessRestriction {

  /** JSON-LD node type. */
  @JsonProperty("@type")
  public String atType = "AccessRestriction";

  /** Restriction status, typically public / restricted / private. */
  public String restrictionStatus;

  public Dcat3AccessRestriction() {
  }

  public Dcat3AccessRestriction(String restrictionStatus) {
    this.restrictionStatus = restrictionStatus;
  }

  public static Dcat3AccessRestriction of(String restrictionStatus) {
    return new Dcat3AccessRestriction(restrictionStatus);
  }
}
