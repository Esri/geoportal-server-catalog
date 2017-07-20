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

(function(){
  
  gs.context.browser.WebContext = gs.Object.create(gs.context.Context,{
    
    sendHttpRequest: {value: function(task,url,data,dataContentType) {
      var promise = this.newPromise();
      var req = new XMLHttpRequest();
      req.onload = function() {
        if (req.status === 200) {
          promise.resolve(req.response);
        } else {
          promise.reject(new Error(req.statusText)); // TODO
        }
      };
      req.onerror = function() {
        promise.reject(new Error("Network error")); // TODO
      };
      if (typeof data !== "undefined" && data !== null) {
        req.open("POST",url);
        if (typeof dataContentType === "string" && dataContentType.length > 0) {
          // TODO Request header field Content-type is not allowed by Access-Control-Allow-Headers in preflight response.
          //req.setRequestHeader("Content-type",dataContentType);
        }
        req.send(data);
      } else {
        req.open("GET",url);
        req.send();
      }
      return promise;
    }}
  
  });
  
}());

