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

public class SearchHit {
  
  private long index;
  private JsonObject item;
  
  public SearchHit(JsonObject item, long index) {
    this.item = item;
    this.index = index;
  }
  
  public String getId() {
    return item.getString("_id");
  }
  
  public long getIndex() {
    return index;
  }
  
  public JsonObject getJsonObject() {
    return item;
  }
  
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
