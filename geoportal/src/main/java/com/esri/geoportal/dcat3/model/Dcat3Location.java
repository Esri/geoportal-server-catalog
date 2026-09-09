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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DCAT-US 3.0 spatial coverage (<code>dct:Location</code>).
 *
 * <p>DCAT-US allows the spatial coverage to be expressed either as a simple
 * "west,south,east,north" string or as a <code>dct:Location</code> node with
 * <code>dcat:bbox</code> / <code>locn:geometry</code>. This class produces the
 * latter, richer, form.</p>
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Dcat3Location {

  /** JSON-LD node type. */
  @JsonProperty("@type")
  public String atType = Dcat3Constants.TYPE_LOCATION;

  /** dct:identifier. */
  public String identifier;

  /** dct:prefLabel. */
  public String prefLabel;

  /** dct:inScheme. */
  public String inScheme;

  /** dct:otherIdentifier. */
  public List<String> otherIdentifier;

  /** dcat:bbox expressed as WKT (<code>POLYGON((...))</code>). */
  public String bbox;

  /** locn:geometry expressed as GeoJSON. */
  public String geometry;

  /** dcat:centroid expressed as WKT (<code>POINT(x y)</code>). */
  public String centroid;

  /** Convenience: [west, south, east, north]. Not serialized. */
  @JsonIgnore
  public List<Double> extent;

  public Dcat3Location() {
  }

  /**
   * Builds a location from a bounding box.
   * @param west minimum longitude
   * @param south minimum latitude
   * @param east maximum longitude
   * @param north maximum latitude
   * @return the location or <code>null</code> when any coordinate is missing
   */
  public static Dcat3Location fromBBox(Double west, Double south, Double east, Double north) {
    if (west == null || south == null || east == null || north == null) return null;

    Dcat3Location loc = new Dcat3Location();
    loc.extent = List.of(west, south, east, north);
    loc.bbox = "POLYGON((%1$s %2$s,%3$s %2$s,%3$s %4$s,%1$s %4$s,%1$s %2$s))"
            .formatted(fmt(west), fmt(south), fmt(east), fmt(north));
    loc.geometry = "{\"type\":\"Polygon\",\"coordinates\":[[[%1$s,%2$s],[%3$s,%2$s],[%3$s,%4$s],[%1$s,%4$s],[%1$s,%2$s]]]}"
            .formatted(fmt(west), fmt(south), fmt(east), fmt(north));
    loc.centroid = "POINT(%s %s)".formatted(fmt((west + east) / 2d), fmt((south + north) / 2d));
    return loc;
  }

  /**
   * Formats a coordinate without scientific notation / trailing noise.
   * @param d coordinate
   * @return formatted coordinate
   */
  private static String fmt(double d) {
    if (d == Math.floor(d) && !Double.isInfinite(d)) {
      return Long.toString((long) d);
    }
    return Double.toString(d);
  }
}
