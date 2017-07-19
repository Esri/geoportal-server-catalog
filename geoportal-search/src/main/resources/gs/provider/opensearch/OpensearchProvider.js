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
  
  gs.provider.opensearch.OpensearchProvider = gs.Object.create(gs.provider.Provider,{
    
    chkBBoxParam: {value: function(task) {
      if (task.hasError) return;
      var bbox = task.request.chkParam("bbox");
      if (bbox === null || bbox.length === 0) return;
      var a = bbox.split(","); 
      if (a.length > 3) {
        var n = task.val.strToNum(a[0].trim(),1);
        if (n > 10000) {
          // TODO send JSON
          var msg = "invalidBoundingBoxCoords";
          var response = task.response;
          response.put(response.Status_BAD_REQUEST,response.MediaType_TEXT_PLAIN,msg);
          task.hasError = true;
        }
      }
    }},
    
    description: {value: function(task) {
      var promise = task.context.newPromise();
      var opensearchUrl = task.baseUrl+"/opensearch"; // TODO doc or config?
      var xml = task.context.readResourceFile(task.config.opensearchDescriptionFile,"UTF-8");
      xml = xml.trim();
      xml = xml.replace(/{opensearch.url}/g,task.val.escXml(opensearchUrl));
      xml = xml.replace(/{base.url}/g,task.val.escXml(task.baseUrl));
      var response = task.response;
      response.put(response.Status_OK,response.MediaType_APPLICATION_XML,xml);
      promise.resolve();
      return promise;
    }},
    
    execute: {value: function(task) {
      var v = task.request.getUrlPath();
      var isDescription = task.val.endsWith(v,"/opensearch/description"); // TODO doc or config?
      if (!isDescription) {
        var vals = task.request.getHeaderValues("Accept");
        if (vals !== null && vals.length > 0) {
          isDescription = vals.some(function(s){
            return (s.indexOf("application/opensearchdescription+xml") !== -1);
          });
        }
      }
      if (isDescription) {
        return this.description(task);
      } else {
        this.chkBBoxParam(task)
        if (task.hasError) {
          var promise = task.context.newPromise();
          promise.reject();
          return promise;
        } else {
          var ids = task.request.getIds();
          if (Array.isArray(ids) && ids.length === 1) {
            task.request.isItemByIdRequest = true;
          }
          task.request.f = "atom";
          return this.search(task);
        }
      }
    }},
    
    search: {value: function(task) {
      var promise = task.context.newPromise();
      task.request.parseF(task);
      this.setWriter(task);
      task.target.parseRequest(task);
      var p2 = task.target.search(task);
      p2.then(function(searchResult){
        task.writer.write(task,searchResult);
        promise.resolve();
      })["catch"](function(error){
        var msg = "Search error";
        if (typeof error.message === "string" && error.message.length > 0) {
          msg = error.message;
        }
        // TODO JSON?
        var response = task.response;
        response.put(response.Status_INTERNAL_SERVER_ERROR,response.MediaType_TEXT_PLAIN,msg);
        task.hasError = true;
        promise.reject();
      });
      return promise;
    }}
  
  });
  
}());
