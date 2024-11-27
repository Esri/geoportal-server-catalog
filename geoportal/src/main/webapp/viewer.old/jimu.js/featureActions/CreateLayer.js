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
  'dojo/_base/html',
  'dojo/json',
  'dojo/on',
  'esri/layers/FeatureLayer',
  'esri/renderers/jsonUtils',
  'esri/symbols/jsonUtils',
  '../BaseFeatureAction',
  'jimu/dijit/Popup',
  'jimu/dijit/Search',
  'jimu/LayerInfos/LayerInfos',
  'jimu/utils'
], function(declare, lang, html, Json, on, FeatureLayer, rendererJsonUtils,
  symbolJsonUtils, BaseFeatureAction,
  Popup, JimuInput, LayerInfos, jimuUtils){
  var clazz = declare(BaseFeatureAction, {
    name: 'CreateLayer',
    iconClass: 'icon-create-layer',

    isFeatureSupported: function(featureSet, layer){
      return featureSet.features.length > 0 &&
             featureSet.features[0].geometry &&
             layer &&
             layer.geometryType &&
             layer.fields &&
             layer.objectIdField;
    },

    // Must provide objectIdField option if feature does not have 'objectid' field.
    onExecute: function(featureSet, layer){
      var featureLayer, serviceRendererJson, selectionSymbol, layerRenderer;
      var layerDefinition = {
        geometryType: layer.geometryType,
        fields: lang.clone(layer.fields),
        objectIdField: layer.objectIdField
      };
      var featureCollection = {
        layerDefinition: layerDefinition,
        featureSet: featureSet.toJson()
      };
      featureLayer = new FeatureLayer(featureCollection);

      // set service renderer by default
      var serviceDefJson = layer._json ? Json.parse(layer._json) : null;
      if(serviceDefJson &&
         serviceDefJson.drawingInfo &&
         serviceDefJson.drawingInfo.renderer) {
        serviceRendererJson = serviceDefJson.drawingInfo.renderer;
        layerRenderer = rendererJsonUtils.fromJson(serviceRendererJson);
      } else {
        layerRenderer = rendererJsonUtils.fromJson(layer.renderer.toJson());
      }
      featureLayer.setRenderer(layerRenderer);

      // set selection symbol.
      selectionSymbol = layer.getSelectionSymbol();
      if (selectionSymbol) {
        featureLayer.setSelectionSymbol(symbolJsonUtils.fromJson(selectionSymbol.toJson()));
      }

      this._popupAddLayer(featureLayer);
    },

    _popupAddLayer: function(featureLayer) {
      var blurHandle;
      var content = html.create('div', {style: 'padding: 0 10px 0 10px;'});
      var jimuInput = new JimuInput({
                            placeholder: window.jimuNls.layerInfosMenu.labelLayer
                          }).placeAt(content);
      html.setStyle(jimuInput.searchBtn, 'display', 'none');

      var popup = new Popup({
        content: content,
        titleLabel: window.jimuNls.featureActions.CreateLayer,
        width: 525,
        height: 180,
        buttons: [{
          label: window.jimuNls.common.ok,
          onClick: lang.hitch(this, function() {
            featureLayer.name = jimuUtils.stripHTML(jimuInput.getValue());
            this._addLayerToMap(featureLayer);
            popup.close();
            if(blurHandle && blurHandle.remove) {
              blurHandle.remove();
            }
          })
        }, {
          label: window.jimuNls.common.cancel,
          classNames: ['jimu-btn-vacation'],
          onClick: lang.hitch(this, function() {
            popup.close();
            if(blurHandle && blurHandle.remove) {
              blurHandle.remove();
            }
          })
        }]
      });
      jimuInput.inputSearch.focus();
      popup.disableButton(0);
      blurHandle = on(jimuInput.inputSearch, 'keyup', function() {
        var layerName = jimuInput.getValue();
        if(layerName) {
          popup.enableButton(0);
        } else {
          popup.disableButton(0);
        }
      });
    },

    _addLayerToMap: function(featureLayer) {
      var layerInfosObj  = LayerInfos.getInstanceSync();
      // prepare for endable popup
      var addLayerHandle = on(layerInfosObj,
          'layerInfosChanged',
          lang.hitch(this, function(changedLayerInfo) {
            if(featureLayer.id === changedLayerInfo.id) {
              changedLayerInfo.enablePopup();
              addLayerHandle.remove();
            }
          }));
      this.map.addLayer(featureLayer);
    }

  });
  return clazz;
});
