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
  "esri/layers/MapImageLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/layers/WMSLayer",
  "esri/geometry/support/webMercatorUtils",
  "esri/rest/geometryService",
  "esri/rest/support/ProjectParameters",
  "esri/core/reactiveUtils"
],
function (lang, array, domConstruct, i18n,
          esriRequest, Extent,
          MapImageLayer, FeatureLayer, ImageryLayer, WMSLayer,
          webMercatorUtils, GeometryService, ProjectParameters,reactiveUtils) {
            
  // declare publicly available geometry server
 // var _gs = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
	var _gs = GeometryService;
	
  // universal error handler
  var _handleError = function(view, error) {
    //map.emit("update-end-always", map);
    console.error(error);
    /*map.errorNode = domConstruct.create("div",{
      innerHTML: i18n.search.preview.error, 
      class: "g-preview-error"
    }, map.container, "first");*/
  };
  
  // sets new extent of the map; uses projection if new extent is not compatible with the map
  var _setExtent = function(view, extent) {
    if (!webMercatorUtils.canProject(extent, view.extent)) {
      var params = new ProjectParameters();
      params.geometries = [extent];
      params.outSpatialReference = map.spatialReference;
      const url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer";

      _gs.project(url,params, function(result) {
        if (result.length > 0) {
          extent = new Extent(result[0]);
          view.extent = extent;
        }
      }, function(error) {
        console.error(error);
      });
    } else {
    	view.extent = extent;
    }
  };
  
  // layer factories each for each supported service type
  var _layerFactories = {
    
    // map server
    "MapServer": function(view, url) {
      var layer = new MapImageLayer({url});
      layer.when(function(){
    	  var extent = new Extent(layer.fullExtent);
          _setExtent(view, extent);
    	 // view.goTo(layer.fullExtent);
    	},
    	function(error)
    	{
    		_handleError(view, error);
    	}
      );
      view.map.add(layer);
      
      /*layer.on("error", function(error) {
        _handleError(view, error);
      });
      layer.on("load", function(response) {
        domConstruct.destroy(map.errorNode);
        if (response && response.layer) {
          if (response.layer.fullExtent) {
            var extent = new Extent(response.layer.fullExtent);
            _setExtent(view, extent);
          }
        } else {
          _handleError(view, "Invalid response received from the server");
        }
      });*/
      
    },
   
    // A single feature layer from the map server; see: _getType() function
    "FeatureLayer": function(view, url) {
      esriRequest(url+"?f=pjson").then(function(response) {
        if (response && response.data) {
          var layer = FeatureLayer({url:url});
          reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
        	  _handleError(view, layer.loadError);
          });
          reactiveUtils.when(() => layer.loaded === true, () => { 
        	  if (response.data.extent) {
                  var extent = new Extent(response.data.extent);
                  _setExtent(view, extent);
                }
          }); 
          view.map.add(layer);
        } else {
          _handleError(view, "Invalid response received from the server");
        }
      }, function(error){
        _handleError(view, error);
      });
    },
    
    // feature server
    "FeatureServer": function(view, url) {
      esriRequest(url+"?f=pjson").then(function(response){
        if (response && response.data){
        	if(response.data.layers)
        	{        
        		array.forEach(response.layers, function(layer) {
		            if (layer.defaultVisibility)
		            {
		            	 var layer = new FeatureLayer({url:url+ "/" + layer.id});
		                  reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
		                	  _handleError(view, layer.loadError);
		                  });
		                  reactiveUtils.when(() => layer.loaded === true, () => { 
		                	  if (response.data.extent) {
		                          var extent = new Extent(response.data.extent);
		                          _setExtent(view, extent);
		                        }
		                  });
		             /* var layer = FeatureLayer(url + "/" + layer.id, {mode: FeatureLayer.MODE_SNAPSHOT});
		              layer.on("error", function(error) {
		                _handleError(view, error);
		              });
		              layer.on("load", function() {
		                domConstruct.destroy(map.errorNode);
		                if (response.fullExtent) {
		                  var extent = new Extent(response.fullExtent);
		                  _setExtent(view, extent);
		                }
		              });*/
		              view.map.add(layer);
		            }
	          });
        	} else {
        		//Check if single layer        	
                if (response.data.defaultVisibility) {
                 // var layer = FeatureLayer(url, {mode: FeatureLayer.MODE_SNAPSHOT});//Not available in JS 4
                  var layer = new FeatureLayer({url:url});
                  reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
                	  _handleError(view, layer.loadError);
                  });
                  reactiveUtils.when(() => layer.loaded === true, () => { 
                	  if (response.data.extent) {
                          var extent = new Extent(response.data.extent);
                          _setExtent(view, extent);
                        }
                  });   
                  
                  //TODO Should I use this?
                  layer.on("layerview-create", function(event){
                	  // The LayerView for the layer that emitted this event
                	  event.layerView;
                	});
                  
                 /* layer.on("load", function() {
                 //   domConstruct.destroy(map.errorNode);
                    if (response.data.extent) {
                      var extent = new Extent(response.data.extent);
                      _setExtent(view, extent);
                    }
                  });*/
                  view.map.add(layer);
                } else {
                  _handleError(view, "Invalid response received from the server");
                }
              }
        	}
        }, 
        function(error){
                _handleError(view, error);
         });
      
    },
    
    // image server
    "ImageServer": function(view, url) {
      var layer = new ImageryLayer(url);
      layer.on("error", function(error) {
        _handleError(view, error);
      });
      layer.on("load", function(response) {
        domConstruct.destroy(map.errorNode);
        if (response && response.layer) {
          if (response.layer.fullExtent) {
            var extent = new Extent(response.layer.fullExtent);
            _setExtent(view, extent);
          }
        } else {
          _handleError(view, "Invalid response received from the server");
        }
      });
      view.map.add(layer);
    },
    
    // WMS server
    "WMS": function(view, url) {
    //  map.emit("update-start-forced", map);
      var urlReq =	url.split('?')[0]
      var layer = new WMSLayer({url:url.split('?')[0]});
      var extentSet = false;
      reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
    	  _handleError(view, layer.loadError);
      });
      layer.load().then(() => {
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
      });
      
/*      layer.on("error", function(error) {
        _handleError(view, error);
      });*/
     
/*      layer.on("load", function(response) {
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
          _handleError(view, "Invalid response received from the server");
        }
      });*/
      view.map.add(layer);
    },
    
    "Shapefile": function(view, url) {
   //   map.emit("update-start-forced", map);
      
      esriRequest(url,
        {responseType:"array-buffer"})
        .then(function(content){
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
            view.map.addMany(layers);
            if (totalExtent) {
              _setExtent(map, totalExtent);
            }
          }
          
         // map.emit("update-end-always", map);
        }, function(err) {
          _handleError(view, "Invalid response received from the server");
        });
      }, function(error){
        _handleError(view, "Invalid response received from the server");
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
    addService: function(view, serviceType) {
      var factory = _layerFactories[_getType(serviceType)];
      if (factory) {
        factory(view, serviceType.url);
      }
    }
    
  };
  
  return oThisObject;
});