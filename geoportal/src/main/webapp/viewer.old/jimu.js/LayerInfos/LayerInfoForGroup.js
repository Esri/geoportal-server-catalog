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
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/Deferred',
  'esri/request',
  './LayerInfo'
], function(declare, array, lang, Deferred, esriRequest,
LayerInfo) {
  var clazz = declare(LayerInfo, {

    constructor: function(operLayer, map, layerInfoFactory, noLegend) { //done
      /*jshint unused: false*/
      this.noLegend = noLegend;
    },

    _initVisible: function() { // done
      /*jshint unused: false*/
      var visible = false, i;
      var mapService = this.originOperLayer.mapService;
      if(this.originOperLayer.mapService) {
        // layer or group in map service.
        if(this.originOperLayer.subLayers.length > 0) {
          //group in map service.
          /*
          for(i=0; i<this.newSubLayers.length; i++) {
            visible = visible || this.newSubLayers[i].isVisible();
          }*/
          //visible = true;
          if(mapService.layerInfo._subLayerVisible[mapService.subId]) {
            visible = true;
          }
        } else {
          //layer in map service.
          if(mapService.layerInfo._subLayerVisible[mapService.subId]) {
            visible = true;
          }
        }
      }
      this._visible = visible;
    },

    _setTopLayerVisible: function(visible) { //done
      var mapService;
      // mapservice
      if(this.originOperLayer.mapService) {
        mapService = this.originOperLayer.mapService;
        if(this.originOperLayer.subLayers.length > 0) {
          //group in map service.
          if(visible) {
            mapService.layerInfo._subLayerVisible[mapService.subId] = true;
          } else {
            mapService.layerInfo._subLayerVisible[mapService.subId] = false;
          }
          this._visible = visible;

          var subLayersVisible = {};
          this.traversal(function(layerInfo) {
            if (layerInfo.getSubLayers().length === 0) {
              subLayersVisible[layerInfo.originOperLayer.mapService.subId] =
                layerInfo.isVisbleOrInvisilbe();
            }
          });
          mapService.layerInfo._setSubLayerVisible(subLayersVisible);
        }
      }
    },

    setLayerVisiblefromTopLayer: function() { // done
    },

    _visibleChanged: function(visible) { //done
      /*jshint unused: false*/
      // does not publish event for grouplayer, pulish event on
      // LayerInfoForMapService.
    },

    _sevVisible: function(visible) { //done
      this.visible = visible;
    },

    //---------------new section-----------------------------------------
    // operLayer = {
    //    layerObject: layer,
    //    title: layer.label || layer.title || layer.name || layer.id || " ",
    //    id: layerId || " ",
    //    subLayers: [operLayer, ... ],
    //    mapService: {layerInfo: , subId: },
    //    collection: {layerInfo: }
    //    selfType: dynamic | tiled | group
    // };

    obtainNewSubLayers: function() {//done
      var newSubLayers = [];
      array.forEach(this.originOperLayer.subLayers, function(subOperLayer){
        var subLayerInfo;
        // create sub layer
        subOperLayer.parentLayerInfo = this;
        subLayerInfo = this._layerInfoFactory.create(subOperLayer);
        newSubLayers.push(subLayerInfo);
        subLayerInfo.init();
      }, this);
      return newSubLayers;

    },

    getOpacity: function() { // done
    },

    setOpacity: function(opacity) {
      /*jshint unused: false*/
    },

    getLayerObject: function() {// done
      var def = new Deferred();
      if(this.layerObject.empty) {
        // *** will improve.
        esriRequest({
          url: this.layerObject.url,
          handleAs: 'json',
          callbackParamName: 'callback',
          timeout: 100000,
          content: {f: 'json'}
        }).then(lang.hitch(this, function(res){
          var url = this.layerObject.url;
          this.layerObject = res;
          this.layerObject.url = url;
          this.layerObject.id = this.id;
          def.resolve(this.layerObject);
        }), function(err) {
          def.reject(err);
        });
      } else {
        def.resolve(this.layerObject);
      }
      return def;
    },

    getLayerType: function() {//done
      var def = new Deferred();
      def.resolve("GroupLayer");
      return def;
    },

    _getShowLegendOfWebmap: function() {// done
      var subId = this.originOperLayer.mapService.subId;
      return this.originOperLayer.mapService.layerInfo._getSublayerShowLegendOfWebmap(subId);
    },

    getScaleRange: function() {//done
      var scaleRange;
      var mapService = this.originOperLayer.mapService;
      var jsapiLayerInfo = mapService.layerInfo._getJsapiLayerInfoById(mapService.subId);

      if(jsapiLayerInfo &&
         (jsapiLayerInfo.minScale >= 0) &&
         (jsapiLayerInfo.maxScale >= 0)) {
        scaleRange = {
          minScale: jsapiLayerInfo.minScale,
          maxScale: jsapiLayerInfo.maxScale
        };
      } else {
        scaleRange = {
          minScale: 0,
          maxScale: 0
        };
      }
      return scaleRange;
    }

  });
  return clazz;
});
