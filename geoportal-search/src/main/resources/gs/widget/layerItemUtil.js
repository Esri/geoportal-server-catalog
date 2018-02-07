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
  "./util",
  "esri/lang",
  "esri/dijit/PopupTemplate",
  "esri/renderers/jsonUtils"],
function(array, Deferred, util, esriLang, PopupTemplate, jsonRendererUtils) {

  var _def = {

    makeFeatureLayerTitle: function(pattern,serviceName,layerName) {
      var n, v, regexp;
      try {
        if (serviceName && layerName && (serviceName === layerName)) {
          return serviceName;
        } else if (serviceName && layerName) {
          // try to remove a timestamp suffix
          n = layerName.indexOf(serviceName);
          if (n === 0) {
            v = layerName.substring(n + serviceName.length + 1);
            if (v.length >= 13) {
              regexp = /^\d+$/;
              if (regexp.test(v)) {
                return serviceName;
              }
            }
          }
        }
      } catch (ex) {}
      v = pattern.replace("{serviceName}",serviceName).replace("{layerName}",layerName);
      return v;
    },

    processFeatureLayer: function(i18n,featureLayer,item,itemData) {
      if (!item) return featureLayer;
      var self = this;
      var dlPattern = i18n.search.featureLayerTitlePattern;
      var opLayer = null;
      if (itemData && itemData.layers && (itemData.layers.length > 0)) {
        array.some(itemData.layers, function(info) {
          var layerDefinition, jsonRenderer, renderer, isCustomTemplate = false;
          var popInfo, jsonPopInfo, infoTemplate;
          if (info.id === featureLayer.layerId) {
            //console.warn("layerInfo",info);
            if (info.popupInfo) {
              popInfo = info.popupInfo;
              jsonPopInfo = JSON.parse(JSON.stringify(popInfo));
              infoTemplate = new PopupTemplate(jsonPopInfo);
              featureLayer.setInfoTemplate(infoTemplate);
              isCustomTemplate = true;
            }
            if (esriLang.isDefined(info.showLabels)) {
              featureLayer.setShowLabels(info.showLabels);
            }
            if (esriLang.isDefined(info.refreshInterval)) {
              featureLayer.setRefreshInterval(info.refreshInterval);
            }
            if (esriLang.isDefined(info.showLegend)) {
              // TODO?
              console.log("");
            }
            if (esriLang.isDefined(info.timeAnimation)) {
              if (info.timeAnimation === false) {
                // TODO?
                console.log("");
              }
            }
            layerDefinition = info.layerDefinition;
            if (layerDefinition) {
              if (layerDefinition.definitionExpression) {
                featureLayer.setDefinitionExpression(layerDefinition.definitionExpression);
              }
              if (layerDefinition.displayField) {
                featureLayer.displayField(layerDefinition.displayField);
              }
              if (layerDefinition.drawingInfo) {
                if (layerDefinition.drawingInfo.renderer) {
                  jsonRenderer = JSON.parse(
                    JSON.stringify(layerDefinition.drawingInfo.renderer)
                  );
                  renderer = jsonRendererUtils.fromJson(jsonRenderer);
                  if (jsonRenderer.type && (jsonRenderer.type === "classBreaks")) {
                    renderer.isMaxInclusive = true;
                  }
                  featureLayer.setRenderer(renderer);
                }
                if (esriLang.isDefined(layerDefinition.drawingInfo.transparency)) {
                  // TODO validate before setting?
                  featureLayer.setOpacity(1 - (layerDefinition.drawingInfo.transparency / 100));
                }
              }
              if (esriLang.isDefined(layerDefinition.minScale)) {
                featureLayer.setMinScale(layerDefinition.minScale);
              }
              if (esriLang.isDefined(layerDefinition.maxScale)) {
                featureLayer.setMaxScale(layerDefinition.maxScale);
              }
              if (esriLang.isDefined(layerDefinition.defaultVisibility)) {
                if (layerDefinition.defaultVisibility === false) {
                  featureLayer.setVisibility(false); // TODO?
                }
              }
            }
            if (!isCustomTemplate) {
              self.setFeatureLayerInfoTemplate(featureLayer,info.popupInfo);
            }
            opLayer = {
              url: featureLayer.url,
              id: featureLayer.id,
              itemId: item.id,
              title: self.makeFeatureLayerTitle(dlPattern,item.title,featureLayer.name)
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
          title: self.makeFeatureLayerTitle(dlPattern,item.title,featureLayer.name)
        };
        self.setFeatureLayerInfoTemplate(featureLayer,null,opLayer.title);
        return opLayer;
      }
    },

    setFeatureLayerInfoTemplate: function(featureLayer,popupInfo,title) {
      /*
      if (!popupInfo) {
        popupInfo = this._newPopupInfo(featureLayer,title);
      }
      var template = this._newInfoTemplate(popupInfo, title);
      featureLayer.setInfoTemplate(template);
      */
    },

  };

  return _def;

});
