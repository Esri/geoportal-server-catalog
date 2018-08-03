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
package com.esri.geoportal.lib.elastic.http.util;
import javax.json.JsonObject;

/**
 * A search hit.
 */
public class SearchHit {
  
  /** Instance variables. */
  private long index;
  private JsonObject item;
  
  /**
   * Constructor.
   * @param item the item
   * @param index the index within the array of search hits
   */
  public SearchHit(JsonObject item, long index) {
    this.item = item;
    this.index = index;
  }
  
  /**
   * The id.
   * @return the id
   */
  public String getId() {
    return item.getString("_id");
  }
  
  /**
   * The index within the array of search hits
   * @return the index
   */
  public long getIndex() {
    return index;
  }
  
  /**
   * The item.
   * @return the item
   */
  public JsonObject getJsonObject() {
    return item;
  }
  
  /**
   * The item _source as a string.
   * @return the -source string
   */
  public String sourceAsString() {
    if (this.item != null && this.item.containsKey("_source")) {
      JsonObject source = this.item.getJsonObject("_source");
      if (source != null) {
        return source.toString();
      }
    }
    return null;
  }

}
