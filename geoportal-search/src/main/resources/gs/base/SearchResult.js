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
  
  gs.base.SearchResult = gs.Object.create(gs.Proto,{
  
    items: {writable: true, value: null},
    itemsPerPage: {writable: true, value: 10},
    jsonResponse: {writable: true, value: null},
    startIndex: {writable: true, value: 1},
    totalHits: {writable: true, value: 0},
  
    init: {value: function(task) {
      this.startIndex = 1;
      if (task.request.queryIsZeroBased) this.startIndex = 0;
      var from = task.request.getFrom();
      from = task.val.strToInt(from,null);
      if (typeof from === "number" && from >= 0) {
        if (from > 0 || task.request.queryIsZeroBased) {
          this.startIndex = from;
        }
      } 
      var size = task.request.getSize();
      size = task.val.strToInt(size,null);
      if (typeof size === "number" && size >= 0) {
        this.itemsPerPage = size;
      } else if (typeof size === "number" && size < 0) {
        this.itemsPerPage = 0; 
      } 
      return this;
    }}
  
  });
  
}());

