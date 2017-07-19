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
function execute(nhRequest,sRequestInfo) {
  
  var requestInfo = JSON.parse(sRequestInfo);
  //requestInfo.taskOptions.verbose = true;
  
  // to override the base URL if you have a reverse proxy
  //requestInfo.baseUrl = "https://www.geoportal.com/geoportal";
  
  var processor = gs.Object.create(gs.context.nashorn.NashornProcessor).mixin({
    newConfig: function() {
      var config = gs.Object.create(gs.config.Config);
      return config;
    }
  });
  
  processor.execute(requestInfo,function(status,mediaType,entity,task){
    nhRequest.putResponse(status,mediaType,entity);
  });
  
  //print("done ...");
}

