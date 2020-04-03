///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'jimu/BaseFeatureAction',
  'jimu/WidgetManager',
  'jimu/LayerInfos/LayerInfos'
], function(declare, lang, array, BaseFeatureAction, WidgetManager, LayerInfos){
  var clazz = declare(BaseFeatureAction, {
    map: null,
    iconClass: 'icon-show-related-record',

    isFeatureSupported: function(featureSet, layer){
      var layerInfos = LayerInfos.getInstanceSync();
      if(featureSet.features.length === 0 || !layer){
        return false;
      }

      if(layerInfos && layer && layer.relationships && (layer.relationships.length > 0)) {
        var layerInfo = layerInfos.getLayerInfoById(layer.id);
        if(layerInfo) {
          return layerInfo.getRelatedTableInfoArray().then(function(relatedTableInfoArray) {
            if(relatedTableInfoArray.length > 0) {
              return true;
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      } else {
        return false;
      }
    },

    onExecute: function(featureSet, layer){
      var layerInfos = LayerInfos.getInstanceSync();
      var selectedLayerInfo = layerInfos.getLayerInfoById(layer.id);
      var selectedIds = array.map(featureSet.features, lang.hitch(this, function(f) {
        return f.attributes[layer.objectIdField];
      }));

      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId)
      .then(function(attrWidget) {
        attrWidget.showRelatedRecordsFromPopup(selectedLayerInfo, selectedIds);
      });
    }
  });
  return clazz;
});