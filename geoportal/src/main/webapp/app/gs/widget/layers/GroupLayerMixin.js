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
      var itemData;
      var self = this;
      if(itemDataObj)
    	  itemData = itemDataObj.data;
      if(itemData && itemData.layers)
	  {
    	  var groupLayer = new GroupLayer({
    		  title: itemData.title, 
    		  portalItem: {
    		    id: item.id 
    		  }    		 
    		});
    	  groupLayer.load();
    	  var dfd = layerUtil.waitForLayer(self.i18n,groupLayer);
          dfd.then(function(layer) {           
            layerUtil.addMapLayer(self.view,layer,item,self.referenceId);
            dfd.resolve(layer);
          });
	  }
      else
	  {
    	  dfd.reject("no layers to add");
	  }
      return dfd;
    }
  });

  return _def;
});
