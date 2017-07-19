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

  gs.provider.Provider = gs.Object.create(gs.Proto,{
  
    execute: {value: function(task) {}},
  
    setWriter: {value: function(task) {
      var k, f = task.request.f;
      for (var k in task.writers) {
        if (task.writers.hasOwnProperty(k)) {
          if (typeof k === "string" && typeof f === "string") {
            if (k.toLowerCase() === f.toLowerCase()) {
              task.writer = task.writers[k];
              break;
            }
          }
        }
      }
    }}
  
  });
  
}());
