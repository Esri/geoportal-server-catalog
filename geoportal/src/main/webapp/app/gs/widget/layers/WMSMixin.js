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
  "./layerUtil",
  "../util",
  "esri4/layers/WMSLayer",
  "esri4/geometry/Extent",
  "esri4/geometry/SpatialReference"],
function(declare, array, layerUtil, util, WMSLayer, 
  Extent, SpatialReference) {

  var _def = declare(null, {

    addWMS: function(serviceUrl,item,itemDataObj) {
      var self = this;
      var itemHasLayers = false;
      var wkid = null;
      var options = {
        id: util.generateId()
      };
     
      if (itemDataObj) {
    	var itemData = itemDataObj.data; 
        var visibleLayers = [];
        var layerInfos = [];
        array.forEach(itemData.layers, function(layer){ 
          visibleLayers.push(layer.name);
        }, this);

        options = {
          id: util.generateId()};
      }

      var lyr = new WMSLayer(serviceUrl,options);
      lyr.load();
      var dfd = layerUtil.waitForLayer(this.i18n,lyr);
      dfd.then(function(layer) {
        if (!itemHasLayers) {
          self._setWMSVisibleLayers(layer);
        }
        if (wkid && layer.spatialReference) {
          layer.spatialReference.wkid = wkid;
        }
        layerUtil.addMapLayer(self.view,layer,item,self.referenceId);
        dfd.resolve(layer);
      });
      return dfd;
    },

    _setWMSVisibleLayers: function(layer) {
    	var maxLayers = 10, wmsSublyrCollection = [];
        if (layer) {
          array.some(layer.allSublayers._items,function(wmsSublayer){          
            if (typeof wmsSublayer.title === "string" && wmsSublayer.title.length > 0) {
              if (wmsSublyrCollection.length < maxLayers) {            	
              	wmsSublayer.visible = true;
              	wmsSublayer.popupEnabled = true;
              	wmsSublyrCollection.push(wmsSublayer);    
              	
              } else {
                return true;
              }
            }
          });
          layer.sublayers = wmsSublyrCollection;        
        }
    }

  });

  return _def;
});
