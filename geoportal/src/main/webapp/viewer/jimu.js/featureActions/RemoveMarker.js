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
  '../BaseFeatureAction',
  'esri/layers/GraphicsLayer'
], function(declare, BaseFeatureAction, GraphicsLayer) {
  var clazz = declare(BaseFeatureAction, {
    name: 'RemoveMarker',
    iconClass: 'icon-close',
    _markerLayer: null,

    isFeatureSupported: function(featureSet) {
      this._getMarkerLayer();
      return featureSet.features.length > 0 && featureSet.geometryType &&
        featureSet.features[0] && featureSet.features[0].geometry &&
        true === this._isFeatureInMarkerFeatureActionLayer(featureSet);
    },

    onExecute: function(featureSet) {
      this._removeMarker(featureSet);
    },

    _getMarkerLayer: function() {
      if (this.map.getLayer("marker-feature-action-layer")) {
        this._markerLayer = this.map.getLayer("marker-feature-action-layer");
      } else {
        var layerArgs = {
          id: "marker-feature-action-layer"
        };
        this._markerLayer = new GraphicsLayer(layerArgs);
        this.map.addLayer(this._markerLayer);
        //snapping
        if (this.map.snappingManager) {
          var layerlist = this.map.snappingManager.layerInfos;
          layerlist.push({
            layer: this._markerLayer
          });
          this.map.snappingManager.setLayerInfos(layerlist);
        }
      }
    },

    _removeMarker: function(featureSet) {
      var g = featureSet.features[0];
      if(g._textSymbol){
        //remove lable for marker that create by mapUrlParamsHandler
        this._markerLayer.remove(g._textSymbol);
      }
      this._markerLayer.remove(g);

      if (this.map && this.map.infoWindow) {
        this.map.infoWindow.hide();
      }
    },

    _isFeatureInMarkerFeatureActionLayer: function(featureSet) {
      if (featureSet.features[0] && featureSet.features[0]._graphicsLayer && featureSet.features[0]._graphicsLayer.id) {
        return (featureSet.features[0]._graphicsLayer.id === "marker-feature-action-layer");
      } else {
        return false;
      }
    }

  });
  return clazz;
});