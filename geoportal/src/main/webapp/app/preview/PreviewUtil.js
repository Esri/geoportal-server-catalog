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
  "esri/layers/ArcGISImageServiceLayer",
  "esri/layers/WMSLayer",
  "esri/geometry/webMercatorUtils",
  "esri/tasks/GeometryService",
  "esri/tasks/ProjectParameters"
],
function (lang, array, domConstruct, i18n,
          esriRequest, Extent,
          ArcGISDynamicMapServiceLayer, FeatureLayer, ArcGISImageServiceLayer, WMSLayer,
          webMercatorUtils, GeometryService, ProjectParameters) {
            
  // declare publicly available geometry server
  var _gs = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
  
  // universal error handler
  var _handleError = function(map, error) {
    map.emit("update-end-always", map);
    console.error(error);
    map.errorNode = domConstruct.create("div",{
      innerHTML: i18n.search.preview.error, 
      class: "g-preview-error"
    }, map.container, "first");
  };
  
  // sets new extent of the map; uses projection if new extent is not compatible with the map
  var _setExtent = function(map, extent) {
    if (!webMercatorUtils.canProject(extent, map)) {
      var params = new ProjectParameters();
      params.geometries = [extent];
      params.outSR = map.spatialReference;
      
      _gs.project(params, function(result) {
        if (result.length > 0) {
          extent = new Extent(result[0]);
          map.setExtent(extent, true);
        }
      }, function(error) {
        console.error(error);
      });
    } else {
      map.setExtent(extent, true);
    }
  };
  
  // layer factories each for each supported service type
  var _layerFactories = {
    
    // map server
    "MapServer": function(map, url) {
      var layer = new ArcGISDynamicMapServiceLayer(url, {});
      layer.on("error", function(error) {
        _handleError(map, error);
      });
      layer.on("load", function(response) {
        domConstruct.destroy(map.errorNode);
        if (response && response.layer) {
          if (response.layer.fullExtent) {
            var extent = new Extent(response.layer.fullExtent);
            _setExtent(map, extent);
          }
        } else {
          _handleError(map, "Invalid response received from the server");
        }
      });
      map.addLayer(layer);
    },
   
    // A single feature layer from the map server; see: _getType() function
    "FeatureLayer": function(map, url) {
      esriRequest({url: url + "?f=pjson"}).then(function(response) {
        if (response) {
          var layer = FeatureLayer(url, {mode: FeatureLayer.MODE_SNAPSHOT});
          layer.on("error", function(error) {
            _handleError(map, error);
          });
          layer.on("load", function(error) {
            domConstruct.destroy(map.errorNode);
          });
          map.addLayer(layer);
          if (response.extent) {
            var extent = new Extent(response.extent);
            _setExtent(map, extent);
          }
        } else {
          _handleError(map, "Invalid response received from the server");
        }
      }, function(error){
        _handleError(map, error);
      });
    },
    
    // feature server
    "FeatureServer": function(map, url) {
      esriRequest({url: url + "?f=pjson"}).then(function(response){
        if (response && response.layers) {
          array.forEach(response.layers, function(layer) {
            if (layer.defaultVisibility) {
              var layer = FeatureLayer(url + "/" + layer.id, {mode: FeatureLayer.MODE_SNAPSHOT});
              layer.on("error", function(error) {
                _handleError(map, error);
              });
              layer.on("load", function(error) {
                domConstruct.destroy(map.errorNode);
              });
              map.addLayer(layer);
            }
          });
          if (response.fullExtent) {
            var extent = new Extent(response.fullExtent);
            _setExtent(map, extent);
          }
        } else {
          _handleError(map, "Invalid response received from the server");
        }   
      }, function(error){
        _handleError(map, error);
      });
    },
    
    // image server
    "ImageServer": function(map, url) {
      var layer = new ArcGISImageServiceLayer(url);
      layer.on("error", function(error) {
        _handleError(map, error);
      });
      layer.on("load", function(response) {
        domConstruct.destroy(map.errorNode);
        if (response && response.layer) {
          if (response.layer.fullExtent) {
            var extent = new Extent(response.layer.fullExtent);
            _setExtent(map, extent);
          }
        } else {
          _handleError(map, "Invalid response received from the server");
        }
      });
      map.addLayer(layer);
    },
    
    // WMS server
    "WMS": function(map, url) {
      var layer = new WMSLayer(url.split('?')[0]);
      layer.on("error", function(error) {
        _handleError(map, error);
      });
      var extentSet = false;
      layer.on("load", function(response) {
        domConstruct.destroy(map.errorNode);
        if (response && response.layer) {
          var visibleLayers = lang.clone(layer.visibleLayers);
          var visibleLayersModified = false;
          array.forEach(response.layer.layerInfos, function(lyr) {
            if (visibleLayers.indexOf(lyr.name) < 0) {
              visibleLayers.push(lyr.name);
              visibleLayersModified = true;
            }
          });
          if (visibleLayersModified) {
            layer.setVisibleLayers(visibleLayers);
          }
          if (!extentSet && response.layer.fullExtent) {
            var extent = new Extent(response.layer.fullExtent);
            _setExtent(map, extent);
            extentSet = true;
          }
        } else {
          _handleError(map, "Invalid response received from the server");
        }
      });
      map.addLayer(layer);
    },
    
    "Shapefile": function(map, url) {
      map.emit("update-start-forced", map);
      
      esriRequest({
        url:url,
        handleAs:"arraybuffer"
      }).then(function(content){
        
        var formData = new FormData();
        formData.append("file", new Blob([content], {type: "multipart/form-data"}));
        
        esriRequest({
          url: "http://www.arcgis.com/sharing/rest/content/features/generate",
          content: {
            f: "json",
            filetype: "shapefile",
            publishParameters: JSON.stringify({name: "features"})
          },
          form: formData,
          usePost: true,
          handleAs: "json"
        }).then(function(result) {
          
          var layers = [];
          var totalExtent = null;
          
          array.forEach(result.featureCollection.layers, function(layerInfo) {
            var layer = new FeatureLayer(layerInfo);
            layers.push(layer);
            
            if (layer.fullExtent) {
              if (totalExtent == null) {
                totalExtent = layer.fullExtent;
              } else {
                totalExtent = totalExtent.union(layer.fullExtent);
              }
            }
          });
          
          if (layers.length > 0) {
            map.addLayers(layers);
            if (totalExtent) {
              _setExtent(map, totalExtent);
            }
          }
          
          map.emit("update-end-always", map);
        }, function(err) {
          _handleError(map, "Invalid response received from the server");
        });
      }, function(error){
        _handleError(map, "Invalid response received from the server");
      });
    }
  };
  
  _getType = function(serviceType) {
    var type = serviceType.type;
    if (type === "MapServer" && serviceType.url.match(/MapServer\/\d+$/)) {
      type = "FeatureLayer";
    }
    return type;
  };
  
  // This is an object to be returned as a widget
  var oThisObject = {
    
    // check if service is supported
    canPreview: function(serviceType) {
      var factory = _layerFactories[_getType(serviceType)];
      return !!factory;
    },
    
    // create layer for the service and add it to the map
    addService: function(map, serviceType) {
      var factory = _layerFactories[_getType(serviceType)];
      if (factory) {
        factory(map, serviceType.url);
      }
    }
    
  };
  
  return oThisObject;
});