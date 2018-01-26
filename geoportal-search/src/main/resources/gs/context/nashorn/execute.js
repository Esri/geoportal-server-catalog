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

gsConfig = {
  isNashorn: true
};
load("classpath:gs/all.js");

/* entry-point from the JVM */
function execute(nhRequest,sRequestInfo,sSelfInfo) {
  try {
    var requestInfo = JSON.parse(sRequestInfo);
    //requestInfo.taskOptions.verbose = true;

    // to override the base URL if you have a reverse proxy
    //requestInfo.baseUrl = "https://www.geoportal.com/geoportal";

    var selfInfo;
    if (typeof sSelfInfo === "string" && sSelfInfo.length > 0) {
      selfInfo = JSON.parse(sSelfInfo);
    }

    var processor = gs.Object.create(gs.context.nashorn.NashornProcessor).mixin({
      newConfig: function() {
        var config = gs.Object.create(gs.config.Config);
        if (selfInfo && selfInfo.elastic && selfInfo.elastic.searchUrl) {
          // self target for a Geoportal instance
          var targets = config.getTargets();
          targets.self = gs.Object.create(gs.target.elastic.GeoportalTarget).mixin({
            "searchUrl": selfInfo.elastic.searchUrl,
            "itemBaseUrl": requestInfo.baseUrl+"/rest/metadata/item"
          });
          if (typeof selfInfo.elastic.username === "string") {
            // for x-pack
            targets.self.username = selfInfo.elastic.username;
            targets.self.password = selfInfo.elastic.password;
          }
          config.defaultTarget = "self";
        }
        return config;
      }
    });

    processor.execute(requestInfo,function(status,mediaType,entity,headers){
      var hm = null;
      if (Array.isArray(headers) && headers.length > 0) {
        hm = new java.util.HashMap();
        headers.forEach(function(header){
          hm.put(header.name,header.value);
        });
      }
      if (requestInfo.taskOptions.verbose) print(entity);
      nhRequest.putResponse(status,mediaType,entity,hm);
    });

  } catch(error) {
    // TODO include the error message in the json response?
    print("Error processing request.");
    print(error);
    if (error) error.printStackTrace();
    var msg = "{\"error\": \"Error processing request.\"}";
    nhRequest.putResponse(500,"application/json",msg,null);
  }

}
