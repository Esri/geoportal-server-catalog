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
package com.esri.geoportal.dcat3;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.lang3.StringUtils;

import com.esri.geoportal.dcat3.model.Dcat3Constants;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Applies configurable JSON property ordering for DCAT3 resources.
 */
public final class Dcat3JsonOrder {

  private Dcat3JsonOrder() {
  }

  public static JsonNode order(JsonNode node, Dcat3Config config) {
    return order(node, config, null);
  }

  public static JsonNode order(JsonNode node, Dcat3Config config, String profile) {
    if (node == null || config == null) return node;
    if (node.isArray()) {
      ArrayNode array = Dcat3Helper.MAPPER.createArrayNode();
      for (JsonNode item : node) {
        array.add(order(item, config, profile));
      }
      return array;
    }
    if (!node.isObject()) {
      return node;
    }

    ObjectNode src = (ObjectNode) node;
    ObjectNode ordered = Dcat3Helper.MAPPER.createObjectNode();
    List<String> classPropertyOrder = config.getClassProperty(profile, typeKey(src));

    for (String name : classPropertyOrder) {
      JsonNode value = src.get(name);
      if (value != null) {
        ordered.set(name, order(value, config, profile));
      }
    }

    Iterator<String> names = src.fieldNames();
    while (names.hasNext()) {
      String name = names.next();
      if (!ordered.has(name)) {
        ordered.set(name, order(src.get(name), config, profile));
      }
    }
    return ordered;
  }

  private static String typeKey(ObjectNode node) {
    String atType = Dcat3Helper.text(node, "@type");
    if (Dcat3Constants.TYPE_DATASET.equals(atType)) return "Dcat3Dataset";
    if (Dcat3Constants.TYPE_DATA_SERVICE.equals(atType)) return "Dcat3DataService";
    if (Dcat3Constants.TYPE_DATASET_SERIES.equals(atType)) return "Dcat3DatasetSeries";
    if (Dcat3Constants.TYPE_ORGANIZATION.equals(atType)) return "Dcat3Organization";
    if (Dcat3Constants.TYPE_PERIOD_OF_TIME.equals(atType)) return "Dcat3PeriodOfTime";
    if (Dcat3Constants.TYPE_CONTACT.equals(atType)) return "Dcat3ContactPoint";

    if (node.has("dataset") || node.has("conformsTo") || node.has("themeTaxonomy")) {
      return "Dcat3Catalog";
    }
    if (node.has("accessURL") && node.has("format")) {
      return "Dcat3Distribution";
    }

    List<String> resourceHints = new ArrayList<>(List.of("identifier", "title", "description", "publisher"));
    int score = 0;
    for (String hint : resourceHints) {
      if (node.has(hint)) score++;
    }
    return score >= 2 ? "Dcat3DataService" : StringUtils.EMPTY;
  }
}
