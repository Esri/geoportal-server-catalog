///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
  'esri/graphic',
  'esri/layers/GraphicsLayer',
  "esri/symbols/PictureMarkerSymbol",
  "esri/InfoTemplate",
  "jimu/shareUtils"
], function (declare, BaseFeatureAction, Graphic, GraphicsLayer, PictureMarkerSymbol,
  InfoTemplate, shareUtils) {
  var clazz = declare(BaseFeatureAction, {
    name: 'AddMarker',
    iconClass: 'icon-add',
    _markerLayer: null,

    isFeatureSupported: function(featureSet) {
      this._getMarkerLayer();
      return this._isSupportType(featureSet) && featureSet.features.length > 0 &&
          featureSet.features[0] && featureSet.features[0].geometry &&
          false === this._isFeatureInMarkerFeatureActionLayer(featureSet/*, this._markerLayer*/);
    },

    onExecute: function (featureSet, layer) {
      this._addMarker(featureSet, layer);
    },

    _getMarkerLayer: function () {
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

    _addMarker: function (featureSet, layer) {
      var geometry = featureSet.features[0].geometry;
      //infoTemplate json
      var json = {};
      //title
      var fieldName = layer.displayField || featureSet.displayFieldName || layer.objectIdField;
      json.title = "";
      if (featureSet.features[0].attributes) {
        if (fieldName) {
          json.title = featureSet.features[0].attributes[fieldName];
          if (!json.title) {
            json.title = "";
          }
        }
      }
      //lon lat / x y
      var centerPoint = {};
      if (geometry.type === "point") {
        centerPoint = geometry;
      } else if (geometry.type === "polygon" || geometry.type === "polyline" || geometry.type === "multipoint") {
        if(this.map.infoWindow && this.map.infoWindow.isShowing){
          //click form infoWindow in map
          centerPoint = this.map.infoWindow.location;
        } else {
          //click form widget like select
          var extent = geometry.getExtent();
          centerPoint = extent.getCenter();
        }
      }

      if (centerPoint.getLongitude() && centerPoint.getLatitude()) {
        json.longitude = centerPoint.getLongitude();
        json.latitude = centerPoint.getLatitude();
      } else if (centerPoint.x && centerPoint.y) {
        json.x = centerPoint.x;
        json.y = centerPoint.y;
      }
      //wkid
      var geometryWkid = "";
      if (geometry && geometry.spatialReference && geometry.spatialReference.wkid) {
        geometryWkid = geometry.spatialReference.wkid;
      }
      json.spatialReference = {
        wkid: geometryWkid
      };

      var xyContent = shareUtils.getXyContent(json);
      var url = shareUtils.getShareUrl(this.map, json, true);
      var shareUrlContent = shareUtils.getShareUrlContent(url);
      //html content
      var content = xyContent + shareUrlContent;

      //add marker to layer
      var pictureSymbol = new PictureMarkerSymbol(require.toUrl('jimu') + '/images/EsriBluePinCircle26.png');
      pictureSymbol.width = 26;
      pictureSymbol.height = 26;
      pictureSymbol.setOffset(0, pictureSymbol.height / 2);
      //pictureSymbol.yoffset = 5;
      var graphic = new Graphic(centerPoint, pictureSymbol, null, null);
      graphic._markerFeatureactionGraphic = featureSet.features[0];
      graphic.infoTemplate = this._setInfoTemplate(content);
      this._markerLayer.add(graphic);

      this._closePopupWindow();
    },
    _setInfoTemplate: function (content) {
      var infoTemplate = new InfoTemplate();
      //infoTemplate.setTitle(json.title || "");
      infoTemplate.setContent(content);
      return infoTemplate;
    },

    _closePopupWindow: function () {
      if (this.map && this.map.infoWindow) {
        this.map.infoWindow.hide();
      }
    },

    _isFeatureInMarkerFeatureActionLayer: function (featureSet/*, markerLayer*/) {
      //feature in "marker-action-layer"
      if (featureSet.features[0] &&
        featureSet.features[0]._graphicsLayer && featureSet.features[0]._graphicsLayer.id) {
        if (featureSet.features[0]._graphicsLayer.id === "marker-feature-action-layer") {
          return true;
        }
      }
      /*allow multiple markers
      //in other layer
      for (var i = 0, len = featureSet.features.length; i < len; i++) {
        var feature = featureSet.features[i];
        if (markerLayer && "undefined" !== typeof markerLayer.graphics) {
          for (var j = 0, lenJ = markerLayer.graphics.length; j < lenJ; j++) {
            var graphic = markerLayer.graphics[j];
            if (graphic._markerFeatureactionGraphic) {
              var flag = (feature === graphic || feature === graphic._markerFeatureactionGraphic);
              if (flag) {
                return true;
              }
            }
          }
        }
      }*/

      return false;
    },
    _isSupportType: function(featureSet) {
      if (featureSet && featureSet.geometryType) {
        //do not support multiple geometrys
        if (featureSet.features && featureSet.features.length && featureSet.features.length > 1) {
          return false;
        }

        var type = featureSet.geometryType;
        return (type === "point" || type === "polygon" || type === "polyline" || type === "multipoint");
      } else {
        return false;
      }
    }
  });
  return clazz;
});