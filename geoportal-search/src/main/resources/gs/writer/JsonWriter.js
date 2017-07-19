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
      // TODO when to return a single atom entry?
      //task.request.isItemByIdRequest = true;
      /*
      if (task.request.isItemByIdRequest) {
        if (!searchResult.items || searchResult.items.length === 0) {
          // // TODO send JSON
          task.response.put(task.response.Status_NOT_FOUND,task.response.MediaType_TEXT_PLAIN,null);
        } else {
          if (task.provider.isCswProvider) {
            this._writeItem(task,searchResult);
          } else {
            this._writeItems(task,searchResult);
          }
        }
      } else {
        this._writeItems(task,searchResult);
      }
      */
      var result;
      if (searchResult.jsonResponse) {
        result = searchResult.jsonResponse;
      } else {
        result = {}; // TODO?
      }
      if (task.request.pretty) result = JSON.stringify(result,null,2);
      else result = JSON.stringify(result);
      this._writeResponse(task,result);
    }},
    
    /* .......................................................................................... */
    
    _writeItem: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: true};
      var xmlBuilder = task.context.newXmlBuilder();
      xmlBuilder.writeStartDocument();
      this._writeEntry(task,xmlBuilder,searchResult.items[0],options);
      xmlBuilder.writeEndDocument();
      this._writeResponse(task,xmlBuilder);
    }},
    
    _writeItems: {value: function(task,searchResult) {
      var now = task.val.nowAsString();
      var options = {now: now, entryOnly: false};
      
      var items = searchResult.items ? searchResult.items : [];
      var totalHits = searchResult.totalHits;
      var startIndex = searchResult.startIndex;
      var itemsPerPage = searchResult.itemsPerPage;
      
      var result = {
        items: []
      }
      
      //xmlBuilder.writeElement(task.uris.URI_OPENSEARCH,"totalResults",""+totalHits);
      //xmlBuilder.writeElement(task.uris.URI_OPENSEARCH,"startIndex",""+startIndex);
      //xmlBuilder.writeElement(task.uris.URI_OPENSEARCH,"itemsPerPage",""+itemsPerPage);
      
      if (itemsPerPage > 0) {
        for (var i=0;i<items.length;i++) {
          var entry = task.target.itemToJson(task,items[i]);
          result.items.push(entry);
        }
      }
      
      if (task.request.pretty) result = JSON.stringify(result,null,2);
      else result = JSON.stringify(result);
      this._writeResponse(task,result);
    }},
    
    _writeResponse: {value: function(task,result) {
      var response = task.response;
      response.put(response.Status_OK,response.MediaType_APPLICATION_JSON,result);
    }}
  
  });

}());
