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

  gs.writer.JsonWriter = gs.Object.create(gs.writer.Writer,{
  
    write: {value: function(task,searchResult) {
      var json;
      if (searchResult.jsonResponse) {
        json = searchResult.jsonResponse;
        this.writeResponse(task,json);
      } else {
        if (task.provider.isCswProvider && task.request.isItemByIdRequest) {
          this.writeItem(task,searchResult);
        } else {
          this.writeItems(task,searchResult);
        }
      }
    }},
    
    writeEntry: {value: function(task,results,item,options) {
      var json = task.target.itemToJson(task,item) || {};
      results.push(json);
      //this.beforeEndEntry(task,xmlBuilder,item,options,entry);
    }},
    
    writeItem: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: true};
      var results = [];
      this.writeEntry(task,results,searchResult.items[0],options);
      var response = {};
      if (results.length > 0) response = results[0];
      this.writeResponse(task,response);
    }},
    
    writeItems: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: false};
      
      var items = searchResult.items ? searchResult.items : [];
      var response = {
        start: searchResult.startIndex,
        num: items.length, // searchResult.itemsPerPage?
        total: searchResult.totalHits,
        nextStart: searchResult.calcNextRecord(task),
        results: []
      };
      
      if (searchResult.itemsPerPage > 0) {
        for (var i=0;i<items.length;i++) {
          this.writeEntry(task,response.results,items[i],options);
        }
      }
      this.writeResponse(task,response);
    }},
    
    writeResponse: {value: function(task,json) {
      var str;
      if (task.request.pretty) {
        str = JSON.stringify(json,null,2);
      } else {
        str = JSON.stringify(json);
      }
      var response = task.response;
      response.put(response.Status_OK,response.MediaType_APPLICATION_JSON,str);
    }}
  
  });

}());
