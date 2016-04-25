///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
  './LayerInfo',
  './LayerInfoFactory'
], function(declare, array, lang, Deferred, esriRequest,
LayerInfo, LayerInfoFactory) {
  var clazz = declare(LayerInfo, {

    constructor: function(operLayer, map, options, noLegend) {
      /*jshint unused: false*/
      this.noLegend = noLegend;
    },

    getExtent: function() {
    },

    initVisible: function() {
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
          if(mapService.layerInfo.subLayerVisible[mapService.subId] > 0) {
            visible = true;
          }
        } else {
          //layer in map service.
          if(mapService.layerInfo.subLayerVisible[mapService.subId] > 0) {
            visible = true;
          }
        }
      }
      this._visible = visible;
    },

    _setTopLayerVisible: function(visible) {
      var mapService;
      // mapservice
      if(this.originOperLayer.mapService) {
        //this.originOperLayer.mapService.layerInfo
        //.setSubLayerVisible(this.originOperLayer.mapService.subId, visible);
        mapService = this.originOperLayer.mapService;
        if(this.originOperLayer.subLayers.length > 0) {
          // //group in map service.
          // for(i=0; i<this.newSubLayers.length; i++) {
          //   subId = this.newSubLayers[i].originOperLayer.mapService.subId;
          //   if(visible) {
          //     mapService.layerInfo.subLayerVisible[subId]++;
          //   } else {
          //     mapService.layerInfo.subLayerVisible[subId]--;
          //   }
          //   if(mapService.layerInfo.subLayerVisible[subId] > 0) {
          //     mapService.layerInfo.setSubLayerVisible(subId, true);
          //   } else {
          //     mapService.layerInfo.setSubLayerVisible(subId, false);
          //   }
          // }
          if(visible) {
            mapService.layerInfo.subLayerVisible[mapService.subId]++;
          } else {
            mapService.layerInfo.subLayerVisible[mapService.subId]--;
          }
          this._visible = visible;

          var subLayersVisible = {};
          this.traversal(function(layerInfo) {
            if (layerInfo.getSubLayers().length === 0) {
              subLayersVisible[layerInfo.originOperLayer.mapService.subId] =
                layerInfo.isVisbleOrInvisilbe();
            }
          });
          mapService.layerInfo.setSubLayerVisible(subLayersVisible);
        }
      }
    },

    setLayerVisiblefromTopLayer: function() {
    },

    _visibleChanged: function(visible) {
      /*jshint unused: false*/
      // does not publish event for grouplayer, pulish event on
      // LayerInfoForMapService.
    },

    _sevVisible: function(visible) {
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

    obtainNewSubLayers: function() {
      var newSubLayers = [];
      array.forEach(this.originOperLayer.subLayers, function(subOperLayer){
        var subLayerInfo;
        // create sub layer
        subOperLayer.parentLayerInfo = this;
        subLayerInfo = LayerInfoFactory.getInstance().create(subOperLayer);
        newSubLayers.push(subLayerInfo);
        subLayerInfo.init();
      }, this);
      return newSubLayers;

    },

    getOpacity: function() {
    },

    setOpacity: function(opacity) {
      /*jshint unused: false*/
    },

    getLayerObject: function() {
      var def = new Deferred();
      if(this.layerObject.empty) {

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
          def.resolve(this.layerObject);
        }), function(err) {
          def.reject(err);
        });
      } else {
        def.resolve(this.layerObject);
      }
      return def;
    },

    getLayerType: function() {
      var def = new Deferred();
      def.resolve("GroupLayer");
      return def;
    },

    _getShowLegendOfWebmap: function() {
      var subId = this.originOperLayer.mapService.subId;
      return this.originOperLayer.mapService.layerInfo._getSublayerShowLegendOfWebmap(subId);
    }

  });
  return clazz;
});
