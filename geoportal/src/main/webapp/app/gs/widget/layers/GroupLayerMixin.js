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
define(["dojo/_base/declare",
	"dojo/_base/array",
	 "dojo/promise/all",
	  "dojo/Deferred",
  "./layerUtil",
  "../util",
  "esri4/layers/GroupLayer"],
function(declare, array,all, Deferred, layerUtil, util, GroupLayer) {

  var _def = declare(null, {

    addGroupLayer: function(serviceUrl,item,itemDataObj) {
    	var self = this;
    	
    	var dfd = layerUtil.addGroupLayer(serviceUrl,(item?item.id:null),itemDataObj,self.view,self.referenceId);

      return dfd;
    }
  });

  return _def;
});
