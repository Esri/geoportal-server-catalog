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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * DCAT-US 3.0 temporal coverage (<code>dct:PeriodOfTime</code>).
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@JsonPropertyOrder({"@id", "@type", "startDate", "endDate"})
public class Dcat3PeriodOfTime {

  /** JSON-LD node identifier. */
  @JsonProperty("@id")
  public String atId;

  /** JSON-LD node type. */
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_PERIOD_OF_TIME;

  /** dcat:startDate (ISO-8601) */
  public String startDate;

  /** dcat:endDate (ISO-8601) */
  public String endDate;

  public Dcat3PeriodOfTime() {
  }

  /**
   * Creates a period of time.
   * @param startDate begin date
   * @param endDate end date
   */
  public Dcat3PeriodOfTime(String startDate, String endDate) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  /**
   * Checks whether any bound is present.
   * @return <code>true</code> when either start or end date is set
   */
  @JsonIgnore
  public boolean isEmpty() {
    return (startDate == null || startDate.isEmpty())
        && (endDate == null || endDate.isEmpty());
  }
}
