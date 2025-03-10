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
  "dojo/_base/lang",
  "dojo/_base/array",
  "dojo/Deferred",
  "dojo/promise/all",
  "./layerUtil",
  "../util",
  "esri4/layers/MapImageLayer",
  "esri4/layers/TileLayer",  
  "esri4/rest/support/ImageParameters",
  "esri4/core/reactiveUtils",
  /*"esri4/layers/LayerDrawingOptions",
  "esri4/layers/DynamicLayerInfo"*/],
function(declare, lang, array, Deferred, all, layerUtil, util,
		MapImageLayer, TileLayer,
  ImageParameters,reactiveUtils/*,LayerDrawingOptions, DynamicLayerInfo*/) {

  var _def = declare(null, {

    addMapService: function(serviceUrl,item,itemData) {
      var self = this, dfd = new Deferred();
      var isSingleFeatureLayer = false;
      util.readRestInfo(serviceUrl).then(function(result) {
    	var response = result.data; 
        if (response && typeof response.type === "string" &&
           (response.type === "Feature Layer" || response.type === "Table")) {
          isSingleFeatureLayer = true;
          return self.addFeatureService(serviceUrl,item,itemData);
        } else {
          var lyr;
          var options = {id: util.generateId()};
          if (response.tileInfo) {
            lyr = new TileLayer(serviceUrl, options);
            lyr.load();
          } else {
            if (response && response.supportedImageFormatTypes &&
                response.supportedImageFormatTypes.indexOf("PNG32") !== -1) {
              options.imageParameters = new ImageParameters();
              options.imageParameters.format = "png32";
            }
            lyr = new MapImageLayer(serviceUrl);
            lyr.load();            
            self._processDynamicLayer(response,lyr,itemData);
          }
          return self._waitThenAddDynamicLayer(lyr,item,itemData);
        }
      }).then(function(result) {
        dfd.resolve(result);
      })
      .catch(function(error) {
        dfd.reject(error);
      });
      return dfd;
    },

    //TODO Test with AGOL Map service
    _processDynamicLayer: function(restResponse,layer,item) {
    	if(!item)
		{
			return;
		}
    	else
		{
			itemData = item.data;
		}    	
      if (!itemData || !itemData.layers || itemData.layers.length === 0) {
        return;
      }
    //  var expressions = [];
      var dynamicSubLayer;
      var dynamicSubLayers = [];
   //   var drawingOptions;
    //  var drawingOptionsArray = [];
      var source;
      array.forEach(itemData.layers, function(sublayer){
//        if (sublayer.definitionExpression) {
//          expressions[sublayers.id] = sublayers.definitionExpression.definitionExpression;
//        }
        if (sublayer.source) {
          dynamicSublayers = null;
          source = sublayer.source;
          if (source.type === "mapLayer") {
            var metaSublayerInfos = array.filter(restResponse.layers, function(rlyr) {
              return rlyr.id === source.mapLayerId;
            });
            if (metaSublayerInfos.length) {
            	dynamicSubLayer = lang.mixin(metaLayerInfos[0], sublayer);
            }
          } else {
        	  dynamicSubLayer = lang.mixin({}, sublayer);
          }
          if (dynamicSubLayer) {
        	  dynamicSubLayer.source = source;
            delete dynamicLayerInfo.popupInfo;
            dynamicSubLayer = new Sublayer(dynamicSubLayer);
            if (itemData.visibleLayers) {
              var vis = ((typeof itemData.visibleLayers) === "string") ?
                itemData.visibleLayers.split(",") : itemData.visibleLayers;
                if(array.indexOf(vis, sublayer.id) > -1) {
                	dynamicSubLayer.visible = true;
                } else {
                	dynamicSubLayer.visible = false;
                }
                
//              if (array.indexOf(vis, sublayer.id) > -1) {
//                dynamicLayerInfo.defaultVisibility = true;
//              } else {
//                dynamicLayerInfo.defaultVisibility = false;
//              }
            }
            if (sublayer.renderer) {
            	dynamicSubLayer.renderer = sublayer.renderer;
            }            
            dynamicSubLayers.push(dynamicSubLayer);
          }
        }
        
      });
//
//      if (expressions.length > 0) {
//        layer.setLayerDefinitions(expressions);
//      }
//      if (dynamicLayerInfos.length > 0) {
//        layer.setDynamicLayerInfos(dynamicLayerInfos, true);
//        if (drawingOptionsArray.length > 0) {
//          layer.setLayerDrawingOptions(drawingOptionsArray, true);
//        }
//      } else {
//        //var checkVisibleLayers = true;
//      }
    },

    _waitThenAddDynamicLayer: function(lyr,item,itemData) {
      var self = this;
      dfd = new Deferred();

      reactiveUtils.watch(() => lyr.loadError,(loadError) => {
    	  if (loadError.message && (loadError.message.indexOf("Unable to complete") !== -1)) {
              console.warn("layerAccessError", loadError);
              dfd.reject(new Error(i18n.search.layerInaccessible));
            } else {
              dfd.reject(loadError);
            }
      });
      reactiveUtils.watch(() => lyr.loaded === true,() => {
    	  console.log("layer loaded");
    	 // var templates = null;
    	 // var popupSet = false;
    	  layerUtil.setMapServicePopupTemplate(lyr,itemData);
          layerUtil.addMapLayer(self.view,lyr,item,self.referenceId);
          dfd.resolve(lyr);
    	  
      });

      return dfd;
    }

  });

  return _def;
});
