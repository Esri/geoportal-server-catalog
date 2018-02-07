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
  "dojo/promise/all",
  "dojo/Deferred",
  "dojo/json",
  "./layerItemUtil",
  "./layerUtil",
  "./util",
  "esri/lang",
  "esri/request",
  "esri/arcgis/utils",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/ArcGISImageServiceLayer",
  "esri/layers/ArcGISTiledMapServiceLayer",
  "esri/layers/DynamicLayerInfo",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageParameters",
  "esri/layers/ImageServiceParameters",
  "esri/layers/KMLLayer",
  "esri/layers/LayerDrawingOptions",
  "esri/layers/MosaicRule",
  "esri/layers/RasterFunction",
  "esri/layers/VectorTileLayer",
  "esri/layers/WMSLayer",
  "esri/layers/WMSLayerInfo",
  "esri/dijit/PopupTemplate",
  "esri/InfoTemplate",
  "esri/renderers/jsonUtils",
  "esri/geometry/Extent",
  "esri/SpatialReference"],
function(declare, lang, array, all, Deferred, djJson, layerItemUtil,
  layerUtil, util, esriLang, esriRequest, agsUtils,
  ArcGISDynamicMapServiceLayer, ArcGISImageServiceLayer, ArcGISTiledMapServiceLayer,
  DynamicLayerInfo, FeatureLayer, ImageParameters, ImageServiceParameters, KMLLayer,
  LayerDrawingOptions, MosaicRule, RasterFunction, VectorTileLayer, WMSLayer,
  WMSLayerInfo, PopupTemplate, InfoTemplate, jsonRendererUtils, Extent,
  SpatialReference) {

  var _def = declare(null, {

    i18n: null,
    map: null,

    constructor: function(args) {
      lang.mixin(this, args);
    },

    addItem: function(serviceType,serviceUrl,item,itemUrl) {
      var self = this, dfd = new Deferred();
      util.readItemJsonData(itemUrl).then(function(itemData) {
        return self.addLayer(serviceType,serviceUrl,item,itemData);
      }).then(function(result) {
        dfd.resolve(result);
      }).otherwise(function(error) {
        console.error(error);
        dfd.reject(error);
      });
      return dfd;
    },

    addLayer: function(serviceType,serviceUrl,item,itemData) {
      if (serviceType === "Feature Service") {
        return this.addFeatureService(serviceUrl,item,itemData);
      } else if (serviceType === "Map Service") {
      } else if (serviceType === "Image Service") {
      } else if (serviceType === "WMS") {
      } else if (serviceType === "KML") {
      } else {
        var dfd = new Deferred();
        dfd.resolve(null);
        return dfd;
      }
    },

    addFeatureService: function(serviceUrl,item,itemData) {
      var self = this, dfd = new Deferred();
      var layerIds = null, layerDfds = [], featureLayers = [];

      util.readRestInfo(serviceUrl).then(function(result) {
        console.warn("addFeatureService.serviceInfo",result);
        if (result && typeof result.type === "string" &&
           (result.type === "Feature Layer" || result.type === "Table")) {
          // a single layer registered from a service /FeatureServer/1 or /MapServer/2
          console.log("aaaaaaaa");
          var layer = new FeatureLayer(serviceUrl, {
            id: util.generateId(),
            outFields: ["*"]
          });
          layerDfds.push(layerUtil.waitForLayer(self.i18n,layer));
        } else {
          var list = [];
          if (result && result.layers && result.layers.length > 0) {
            array.forEach(result.layers,function(lyr){
              list.push(lyr);
            });
          }
          if (result && result.tables && result.tables.length > 0) {
            array.forEach(result.tables,function(tbl){
              list.push(tbl);
            });
          }
          if (list.length > 0) {
            array.forEach(list, function(lyr) {
              var bAdd = true;
              if (layerIds !== null && layerIds.length > 0) {
                bAdd = array.some(layerIds, function(lid) {
                  return (lid === lyr.id);
                });
              }
              if (bAdd) {
                var layer = new FeatureLayer(serviceUrl + "/" + lyr.id, {
                  id: util.generateId(),
                  outFields: ["*"]
                });
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
        console.warn("addFeatureService.layerDfds",results);
        array.forEach(results, function(result) {
          featureLayers.push(result);
        });
        featureLayers.reverse();
        return featureLayers;

      }).then(function() {
        array.forEach(featureLayers, function(layer) {
          var opLayer = layerItemUtil.processFeatureLayer(self.i18n,layer,item,itemData);
          if (esriLang.isDefined(opLayer.title)) {
            layer.arcgisProps = {
              title: opLayer.title
            };
            layer._titleForLegend = opLayer.title;
            if (!esriLang.isDefined(layer.title)) {
              layer.title = opLayer.title;
            }
          }
          layerUtil.addLayer(map,layer);
        });
      }).then(function() {
        dfd.resolve(featureLayers);
      }).otherwise(function(error) {
        console.error(error);
        dfd.reject(error);
      });
      return dfd;
    }

  });

  return _def;
});
