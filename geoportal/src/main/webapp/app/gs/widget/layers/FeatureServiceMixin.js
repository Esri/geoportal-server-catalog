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
  "esri4/core/lang",
  "esri4/PopupTemplate",
  "esri4/layers/FeatureLayer",
  "esri4/geometry/support/jsonUtils"],
function(declare, array, all, Deferred, layerUtil, util, esriLang, PopupTemplate,
  FeatureLayer, jsonRendererUtils) {

  var _def = declare(null, {

    addFeatureService: function(serviceUrl,item,itemData) {
      var self = this, dfd = new Deferred();
      var layerIds = null, layerDfds = [], featureLayers = [];

      util.readRestInfo(serviceUrl).then(function(result) {
        //console.warn("addFeatureService.serviceInfo",response);
    	var response = result.data;   
        if (response && typeof response.type === "string" &&
           (response.type === "Feature Layer" || response.type === "Table")) {
          // a single layer registered from a service /FeatureServer/1 or /MapServer/2
          var layer = new FeatureLayer(serviceUrl, {
            id: util.generateId(),
            outFields: ["*"]
          });
          layer.load();   
          layerDfds.push(layerUtil.waitForLayer(self.i18n,layer));
        } else {
          var list = [];
          if (response && response.layers && response.layers.length > 0) {
            array.forEach(response.layers,function(lyr){              
              list.push(lyr);
            });
          }
          //TODO is it needed?
//          if (response && response.tables && response.tables.length > 0) {
//            array.forEach(response.tables,function(tbl){            	
//              list.push(tbl);
//            });
//          }
          if (list.length > 0) {
            array.forEach(list, function(lyr) {
              var bAdd = true;
              if (bAdd) {
                var layer = new FeatureLayer(serviceUrl + "/" + lyr.id, {
                  id: util.generateId(),
                  outFields: ["*"]
                });
                layer.load();
                layerDfds.push(layerUtil.waitForLayer(self.i18n,layer));
              }
            });
          } else {
            // TODO popup a message here?
            console.warn("No layers or tables...");
          }
        }
        return all(layerDfds);

      }).then(function(results) {
        //console.warn("addFeatureService.layerDfds",results);
        array.forEach(results, function(result) {
          featureLayers.push(result);
        });
        featureLayers.reverse();
        return featureLayers;

      }).then(function() {
        array.forEach(featureLayers, function(layer) {
          var opLayer = self._processFeatureLayer(layer,item,itemData);
          if (opLayer.title) {
            layer.arcgisProps = {
              title: opLayer.title
            };
            layer._titleForLegend = opLayer.title;
            if (!layer.title) {
              layer.title = opLayer.title;
            }
          }
          layerUtil.addMapLayer(self.view,layer,item,self.referenceId);
        });
      }).then(function() {
        dfd.resolve(featureLayers);
      }).catch(function(error) {
        console.error(error);
        dfd.reject(error);
      });
      return dfd;
    },

//    _makeFeatureLayerTitle: function(pattern,serviceName,layerName) {
//      var n, v, regexp;
//      try {
//        if (serviceName && layerName && (serviceName === layerName)) {
//          return serviceName;
//        } else if (serviceName && layerName) {
//          // try to remove a timestamp suffix
//          n = layerName.indexOf(serviceName);
//          if (n === 0) {
//            v = layerName.substring(n + serviceName.length + 1);
//            if (v.length >= 13) {
//              regexp = /^\d+$/;
//              if (regexp.test(v)) {
//                return serviceName;
//              }
//            }
//          }
//        }
//      } catch (ex) {}
//      v = pattern.replace("{serviceName}",serviceName).replace("{layerName}",layerName);
//      return v;
//    },

    _processFeatureLayer: function(featureLayer,item,itemDataObj) {
      if (!item) return featureLayer;
      var self = this;
      var dlPattern = this.i18n.search.featureLayerTitlePattern;
      var opLayer = null;
      var itemData = itemDataObj.data;
      
      if (itemData && itemData.layers && (itemData.layers.length > 0)) {
        array.some(itemData.layers, function(info) {
          var layerDefinition, jsonRenderer, renderer, isCustomTemplate = false;
          var popInfo, jsonPopInfo, layerPopupTemplate;
          if (info.id === featureLayer.layerId) {
            //console.warn("layerInfo",info);
            if (info.popupInfo) {
              popInfo = info.popupInfo;              
              layerPopupTemplate = layerUtil.newPopupTemplate(popInfo,info.title);
              featureLayer.popupTemplate = layerPopupTemplate;
              isCustomTemplate = true;
            }
            
            if (info.labelIsVisible) {
              featureLayer.labelIsVisible = info.labelIsVisible;
            }
            if (info.refreshInterval) {
              featureLayerrefreshInterval = info.refreshInterval;
            }
           
            layerDefinition = info.layerDefinition;
            if (layerDefinition) {
              if (layerDefinition.definitionExpression) {
                featureLayer.definitionExpression = layerDefinition.definitionExpression;
              }
              if (layerDefinition.displayField) {
                featureLayer.displayField = layerDefinition.displayField;
              }
              
            if (layerDefinition.drawingInfo && layerDefinition.drawingInfo.renderer) {
              jsonRenderer = JSON.parse(
                JSON.stringify(layerDefinition.drawingInfo.renderer)
              );
              featureLayer.renderer = renderer;
            }
              
              if (layerDefinition.minScale) {
                featureLayer.minScale = layerDefinition.minScale;
              }
              if (layerDefinition.maxScale){
                featureLayer.maxScale = layerDefinition.maxScale;
              }
              if (layerDefinition.visible) {
                if (layerDefinition.visible === false) {
                  featureLayer.visibile = false; // TODO?
                }
              }
            }
            if (!isCustomTemplate) {
              self._setFeatureLayerPopupTemplate(featureLayer,info.popupInfo);
            }
            opLayer = {
              url: featureLayer.url,
              id: featureLayer.id,
              itemId: item.id,
              title: item.title
            };
            return true;
          }
        });
        return opLayer;

      } else {
        opLayer = {
          url: featureLayer.url,
          id: featureLayer.id,
          itemId: item.id,
          title: item.title
        };
        self._setFeatureLayerPopupTemplate(featureLayer,null,opLayer.title);
        return opLayer;
      }
    },

    _setFeatureLayerPopupTemplate: function(featureLayer,popupTemplate,title) {
      if (!popupTemplate) {
    	  popupInfo = layerUtil.newPopupInfo(featureLayer,title);
      }
      var template = layerUtil.newPopupTemplate(popupInfo,title);
      featureLayer.popupTemplate = template;
    }

  });

  return _def;

});
