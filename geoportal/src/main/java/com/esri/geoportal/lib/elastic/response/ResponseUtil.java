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
package com.esri.geoportal.lib.elastic.response;
import java.util.List;
import java.util.Map;

/**
 * Response utilities.
 */
public class ResponseUtil {

  /** Newline - \r\n */
  public static final String NL = "\r\n";

  /** MIMETYPE_ATOM - application/atom+xml */
  public static final String MIMETYPE_ATOM = "application/atom+xml";

  /** URI__ATOM - http://www.w3.org/2005/Atom */
  public static final String URI_ATOM = "http://www.w3.org/2005/Atom";

  /** URI_CSW - http://www.opengis.net/cat/csw/3.0 */
  public static final String URI_CSW = "http://www.opengis.net/cat/csw/3.0";

  /** URI_DC - http://purl.org/dc/elements/1.1/ */
  public static final String URI_DC = "http://purl.org/dc/elements/1.1/";

  /** URI_DCT - http://purl.org/dc/terms/ */
  public static final String URI_DCT = "http://purl.org/dc/terms/";

  /** URI_GEO - http://a9.com/-/opensearch/extensions/geo/1.0/ */
  public static final String URI_GEO = "http://a9.com/-/opensearch/extensions/geo/1.0/";

  /** URI_GEOPOS - http://www.w3.org/2003/01/geo/wgs84_pos# */
  public static final String URI_GEOPOS = "http://www.w3.org/2003/01/geo/wgs84_pos#";

  /** URI_GEORSS - http://www.georss.org/georss */
  public static final String URI_GEORSS = "http://www.georss.org/georss";

  /** URI_GEORSS - http://www.georss.org/georss/10 */
  public static final String URI_GEORSS10 = "http://www.georss.org/georss/10";

  /** URI_TIME - http://a9.com/-/opensearch/extensions/time/1.0/ */
  public static final String URI_TIME = "http://a9.com/-/opensearch/extensions/time/1.0/";

  /** URI_OPENSEARCH - http://a9.com/-/spec/opensearch/1.1/ */
  public static final String URI_OPENSEARCH = "http://a9.com/-/spec/opensearch/1.1/";

  /** URI_OWS - http://www.opengis.net/ows/2.0 */
  public static final String URI_OWS = "http://www.opengis.net/ows/2.0";

  /** XML_HEADER - <?xml version="1.0" encoding="UTF-8" ?> */
  public static final String XML_HEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

  @SuppressWarnings("rawtypes")
  public static double[] getExtentFromSource(Object extent) {
    if (extent == null) return null;
    if (extent instanceof Map) {
      Object type = ((Map)extent).get("type");
      Object coords = ((Map)extent).get("coordinates");
      if (type != null && type instanceof String && type.equals("envelope")) {
        if (coords != null && coords instanceof List) {
          List l = (List)coords;
          if (l.size() == 2) {
            Object topLeft = l.get(0);
            Object bottomRight = l.get(1);
            if (topLeft != null && topLeft instanceof List && bottomRight != null && bottomRight instanceof List) {
              List tl = (List)topLeft;
              List br = (List)bottomRight;
              try {
                double[] coordinates = new double[4];
                coordinates[0] = (double)tl.get(0);
                coordinates[1] = (double)br.get(1);
                coordinates[2] = (double)br.get(0);
                coordinates[3] = (double)tl.get(1);
                return coordinates;
              } catch (Exception e) {}
            }
          }
        }
      }
    }
    return null;
  }

}
