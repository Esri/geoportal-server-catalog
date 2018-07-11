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
  private JsonObject json;
  
  public SearchHit(JsonObject json, long index) {
    this.json = json;
    this.index = index;
  }
  
  public String getId() {
    return json.getString("_id");
  }
  
  public long getIndex() {
    return index;
  }

}
