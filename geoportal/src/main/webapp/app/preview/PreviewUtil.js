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
define([
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/dom-construct",
  "dojo/i18n!app/nls/resources",
  "esri/request",
  "esri/geometry/Extent",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ArcGISImageServiceLayer"
],
function (lang, array, domConstruct, i18n,
          esriRequest, Extent,
          ArcGISDynamicMapServiceLayer, FeatureLayer, ArcGISImageServiceLayer) {
  
  var _handleError = function(map, error) {
    console.error(error);
    domConstruct.create("div",{
      innerHTML: i18n.search.preview.error, 
      class: "g-preview-error"
    }, map.container, "first");
  };
  
  var _layerFactories = {
    "MapServer": function(map, url) {
      var layer = new ArcGISDynamicMapServiceLayer(url, {});
      layer.on("error", function(error) {
        _handleError(map, error);
      });
      layer.on("load", function(response) {
        if (response && response.layer && response.layer.fullExtent) {
          var extent = new Extent(response.layer.fullExtent);
          map.setExtent(extent, true);
        }
      });
      map.addLayer(layer);
    },
    
    "FeatureServer": function(map, url) {
      esriRequest({url: url + "?f=pjson"}).then(function(response){
        array.forEach(response.layers, function(layer) {
          if (layer.defaultVisibility) {
            var layer = FeatureLayer(url + "/" + layer.id, {mode: FeatureLayer.MODE_SNAPSHOT});
            layer.on("error", function(error) {
              _handleError(map, error);
            });
            map.addLayer(layer);
          }
        });
        if (response && response.fullExtent) {
          var extent = new Extent(response.fullExtent);
          map.setExtent(extent, true);
        }
      }, function(error){
        _handleError(map, error);
      });
    },
    
    "ImageServer": function(map, url) {
      var layer = new ArcGISImageServiceLayer(url);
      layer.on("error", function(error) {
        _handleError(map, error);
      });
      layer.on("load", function(response) {
        if (response && response.layer && response.layer.fullExtent) {
          var extent = new Extent(response.layer.fullExtent);
          map.setExtent(extent, true);
        }
      });
      map.addLayer(layer);
    }
  };
  
  var oThisObject = {
    
    canPreview: function(serviceType) {
      var factory = _layerFactories[serviceType.type];
      return !!factory;
    },
    
    addService: function(map, serviceType) {
      var factory = _layerFactories[serviceType.type];
      if (factory) {
        factory(map, serviceType.url);
      }
    }
    
  };
  
  return oThisObject;
});