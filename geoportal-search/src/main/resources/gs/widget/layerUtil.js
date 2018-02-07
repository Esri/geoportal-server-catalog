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
define(["dojo/_base/array",
  "dojo/Deferred",
  "./util"],
function(array, Deferred, util) {

  var _def = {

    addLayer: function(map,layer,item) {
      //console.warn("_addLayer",layer);
      //console.warn("map",this.map);
      if (map && layer) {
        layer.xtnAddData = true; // TODO?
        if (item) {
          layer.xtnItemId = item.id; // TODO?
          if (!layer.arcgisProps && item) {
            layer.arcgisProps = {
              title: item.title
            };
            layer._titleForLegend = item.title;
          }
          if (!esriLang.isDefined(layer.title)) {
            layer.title = item.title;
          }
          // TODO is Web AppBuilder?
          layer._wabProperties =  {
            itemLayerInfo: {
              itemId: item.id,
              itemUrl: this.itemUrl, // TODO?
              portalUrl: item.portalUrl // TODO?
            }
          };
        }
        map.addLayer(layer);
      }
    },

    findLayersAdded: function(map,itemId) {
      var ids = [], itemIds = [], layers = [];
      var response = {
        itemIds: itemIds,
        layers: layers
      };
      if (!map) {
        return response;
      }
      var checkId = (typeof itemId === "string" && itemId.length > 0);
      array.forEach(map.layerIds, function(id) {
        ids.push(id);
      });
      array.forEach(map.graphicsLayerIds, function(id) {
        ids.push(id);
      });
      array.forEach(ids, function(id) {
        var lyr = map.getLayer(id);
        if (lyr && typeof lyr.xtnItemId === "string" && lyr.xtnItemId.length > 0) {
          //console.warn("found added layer",lyr);
          if (!checkId || lyr.xtnItemId === itemId) {
            layers.push(lyr);
            if (itemIds.indexOf(lyr.xtnItemId) === -1) {
              itemIds.push(lyr.xtnItemId);
            }
          }
        }
      });
      return response;
    },

    waitForLayer: function(i18n,layer) {
      var dfd = new Deferred();
      var handles = [];
      if (layer.loaded) {
        dfd.resolve(layer);
        return dfd;
      }
      if (layer.loadError) {
        dfd.reject(layer.loadError);
        return dfd;
      }
      var clearHandles = function() {
        array.forEach(handles, function(h) {
          h.remove();
        });
      };
      //console.warn("_waitForLayer");
      handles.push(layer.on("load", function(layerLoaded) {
        //console.warn("_waitForLayer.load",layerLoaded);
        clearHandles();
        dfd.resolve(layerLoaded.layer);
      }));
      handles.push(layer.on("error", function(layerError) {
        //console.warn("_waitForLayer.error",layerError);
        clearHandles();
        var error = layerError.error;
        try {
          if (error.message && (error.message.indexOf("Unable to complete") !== -1)) {
            console.warn("layerAccessError", error);
            dfd.reject(new Error(i18n.search.layerInaccessible));
          } else {
            dfd.reject(error);
          }
        } catch (ex) {
          //console.warn("layerAccessError",ex);
          dfd.reject(error);
        }
      }));
      return dfd;
    }

  };

  return _def;

});
