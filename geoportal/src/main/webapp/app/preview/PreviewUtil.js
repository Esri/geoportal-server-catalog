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
  "esri4/request",
  "esri4/geometry/Extent",
  "esri4/layers/MapImageLayer",
  "esri4/layers/FeatureLayer",
  "esri4/layers/ImageryLayer",
  "esri4/layers/ImageryTileLayer",
  "esri4/layers/WMSLayer",
  "esri4/layers/WFSLayer",
  "esri4/layers/KMLLayer",
  "esri4/layers/WMTSLayer",
  "esri4/geometry/support/webMercatorUtils",
  "esri4/rest/geometryService",
  "esri4/rest/support/ProjectParameters",
  "esri4/core/reactiveUtils"
],
function (lang, array, domConstruct, i18n,
          esriRequest, Extent,
          MapImageLayer, FeatureLayer, ImageryLayer, ImageryTileLayer,WMSLayer,
          WFSLayer,KMLLayer,WMTSLayer,
          webMercatorUtils, GeometryService, ProjectParameters,reactiveUtils) {
            
  // declare publicly available geometry server 
	var _gs = GeometryService;
	
  // universal error handler
	//Fix error handler
  var _handleError = function(view, error) {
    //map.emit("update-end-always", map);
    console.error(error);
    /*map.errorNode = domConstruct.create("div",{
      innerHTML: i18n.search.preview.error, 
      class: "g-preview-error"
    }, map.container, "first");*/
  };
  
  // sets new extent of the map; uses projection if new extent is not compatible with the map
  var _setExtent = function(view, extent,layerFullExtent) {
    if (!webMercatorUtils.canProject(extent, view)) {
     //TODO Test/fix geometry service projection
      var params = new ProjectParameters();
      params.geometries = [extent];
      params.outSpatialReference = view.spatialReference;
      //const url = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer";
      const url = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer";
      _gs.project(url,params).then(function(result) {
        if (result.length > 0) {          
          view.goTo(result[0]);         
        }
      }).catch( function(error) {
        console.error(error);
      });
    } else {
    	view.goTo(layerFullExtent);
    }
  };
  
  // layer factories each for each supported service type
  var _layerFactories = {
    
    // map server
    "MapServer": function(view, url) {
      var layer = new MapImageLayer({url});
      layer.when(function(){
    	  //TODO fix in all services
    	 // domConstruct.destroy(map.errorNode);
    	  if(layer.fullExtent)
		  {  
    		  var extent = new Extent(layer.fullExtent);
              _setExtent(view, extent,layer.fullExtent);    		
		  }    	 
    	},
    	function(error){
    		_handleError(view, error);
    	}
      );
      view.map.add(layer);
    },
   
    // A single feature layer from the map server; see: _getType() function
    "FeatureLayer": function(view, url) {
      esriRequest(url+"?f=pjson").then(function(response) {
        if (response && response.data) {
          var layer = new FeatureLayer({url:url});
          reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
        	  _handleError(view, layer.loadError);
          });
          reactiveUtils.when(() => layer.loaded === true, () => { 
        	  if (response.data.extent) {
                  var extent = new Extent(response.data.extent);
                  _setExtent(view, extent,response.data.extent);
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
        		array.forEach(response.data.layers, function(layer) {
		            if (layer.defaultVisibility)
		            {
		            	 var layer = new FeatureLayer({url:url+ "/" + layer.id});
		                  reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
		                	  _handleError(view, layer.loadError);
		                  });
		                  reactiveUtils.when(() => layer.loaded === true, () => { 
		                	// domConstruct.destroy(map.errorNode);
		                	  if (response.data.fullExtent) {
		                          var extent = new Extent(response.data.fullExtent);
		                          _setExtent(view, extent,response.data.fullExtent);
		                        }
		                  });		            
		              view.map.add(layer);
		            }
	          });
        	} else {
        		//Check if single layer        	
                if (response.data.defaultVisibility) {                 
                  var layer = new FeatureLayer({url:url});
                  reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
                	  _handleError(view, layer.loadError);
                  });
                  reactiveUtils.when(() => layer.loaded === true, () => { 
                	 // domConstruct.destroy(map.errorNode);
                	  if (response.data.extent) {
                          var extent = new Extent(response.data.extent);
                          _setExtent(view, extent,response.data.extent);
                        }
                  });                  
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
      
      reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
    	  _handleError(view, layer.loadError);
      });
      reactiveUtils.when(() => layer.loaded === true, () => { 
    	 // domConstruct.destroy(map.errorNode);
    	  if (layer.fullExtent) {
              var extent = new Extent(layer.fullExtent);
              _setExtent(view, extent,layer.fullExtent);
            }
      });                  
      view.map.add(layer);
   },
   
   // image tile layer
   "ImageryTileLayer": function(view, url) {
     var layer = new ImageryTileLayer(url);
     
     reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
   	  _handleError(view, layer.loadError);
     });
     reactiveUtils.when(() => layer.loaded === true, () => { 
   	 // domConstruct.destroy(map.errorNode);
   	  if (layer.fullExtent) {
             var extent = new Extent(layer.fullExtent);
             _setExtent(view, extent,layer.fullExtent);
           }
     });                  
     view.map.add(layer);
  },
  
	//KML layer
	  "KML": function(view, url) {
	    var layer = new KMLLayer(url);
	    
	    reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
	  	  _handleError(view, layer.loadError);
	    });
	    reactiveUtils.when(() => layer.loaded === true, () => { 
	  	 // domConstruct.destroy(map.errorNode);
	  	  if (layer.fullExtent) {
	            var extent = new Extent(layer.fullExtent);
	            _setExtent(view, extent,layer.fullExtent);
	          }
	    });                  
	    view.map.add(layer);
	 },
	 
	//WMTS layer
	  "WMTS": function(view, url) {
	    var layer = new WMTSLayer(url);
	    
	    reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
	  	  _handleError(view, layer.loadError);
	    });
	    reactiveUtils.when(() => layer.loaded === true, () => { 
	  	 // domConstruct.destroy(map.errorNode);
    	 if (layer.fullExtents && layer.fullExtents.length >0) {
 	  		 var layerExtent = layer.fullExtents[0];
 	  	  }else if(!layerExtent && layer.fullExtent)
  		  {
  		  	layerExtent = layer.fullExtent;
  		  }
 	  	  if(layerExtent)
  		  {
 	  		  var extent = new Extent(layerExtent);
	          _setExtent(view, extent,extent);
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
      reactiveUtils.when(() => layer.loaded === true, () => { 
 	  	 // domConstruct.destroy(map.errorNode);
 	  	  if (layer.fullExtent) {
 	            var extent = new Extent(layer.fullExtent);
 	            _setExtent(view, extent,layer.fullExtent);
 	          }
 	    }); 
      view.map.add(layer);
    },
 
    "WFS": function(view, url) {
    //  map.emit("update-start-forced", map);
      var urlReq =	url.split('?')[0]
      var layer = new WFSLayer({url:url.split('?')[0]});
      var extentSet = false;
      reactiveUtils.when(() => layer.loadStatus ==="failed", () => { 
    	  _handleError(view, layer.loadError);
      });
      layer.load().then(() => {
          if (!extentSet && layer.fullExtent) {
            var extent = new Extent(layer.fullExtent);
            _setExtent(view, extent,layer.fullExtent);
            extentSet = true;
          }
      });
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