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
load("classpath:search/js/WriterBase.js");

G.writers.json = {
  
  writeItem: function(appRequest,appResponse,itemId,itemString,responseString) {
    if (responseString) this._writeAppResponse(appRequest,appResponse,responseString);
    else this._writeAppResponse(appRequest,appResponse,itemString);
  },
  
  writeItems: function(searchRequest,appResponse,searchResponse) {
    this._writeAppResponse(searchRequest,appResponse,searchResponse.toString());
  },
  
  _writeAppResponse: function(appRequest,appResponse,json) {
    json = G.JsonUtil.toJson(G.JsonUtil.toJsonStructure(json),appRequest.getPretty());
    appResponse.setOk();
    appResponse.setMediaType(G.MediaType.APPLICATION_JSON_TYPE.withCharset("UTF-8"));
    appResponse.setEntity(json);
  }
}

function writeItem(appRequest,appResponse,itemId,itemString,responseString) {
  G.writers.json.writeItem(appRequest,appResponse,itemId,itemString,responseString);
}

function writeItems(searchRequest,appResponse,searchResponse) {
  G.writers.json.writeItems(searchRequest,appResponse,searchResponse);
}
