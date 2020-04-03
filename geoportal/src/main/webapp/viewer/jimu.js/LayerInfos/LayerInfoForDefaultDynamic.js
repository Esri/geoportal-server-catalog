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
  './LayerInfoForDefaultService'
], function(declare, LayerInfoForDefaultService) {
  var clazz = declare(LayerInfoForDefaultService, {

    // operLayer = {
    //    layerObject: layer,
    //    title: layer.label || layer.title || layer.name || layer.id || " ",
    //    id: layerId || " ",
    //    subLayers: [operLayer, ... ],
    //    mapService: {layerInfo: , subId: },
    //    selfType:
    // };
    constructor: function( operLayer, map) {
      /*jshint unused: false*/
    },


    _initVisible: function() {
      /*jshint unused: false*/
      var visible = false, i;
      var mapService = this.originOperLayer.mapService;
      if(mapService) {
        //layer in map service.
        if(mapService.layerInfo._subLayerVisible[mapService.subId]) {
          visible = true;
        }
      }
      this._visible = visible;
    },

    _setTopLayerVisible: function(visible) {
      var mapService = this.originOperLayer.mapService;
      // mapservice
      if(mapService) {
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
              layerInfo._isAllSubLayerVisibleOnPath();
          }
        });
        mapService.layerInfo._setSubLayerVisible(subLayersVisible);
      }
    }

    // show: function() {
    //   var rootLayerInfo = this.getRootLayerInfo();
    //   var checkedInfo = this._prepareCheckedInfoForShowOrHide(true);
    //   rootLayerInfo._setSubLayerVisibleByCheckedInfo(checkedInfo);
    //   rootLayerInfo.show();
    // }

    /*
    _setTopLayerVisible: function(visible) {
      var mapService, subId, i;
      // mapservice
      if(this.originOperLayer.mapService) {
        //this.originOperLayer.mapService.layerInfo
        //._setSubLayerVisible(this.originOperLayer.mapService.subId, visible);
        mapService = this.originOperLayer.mapService;
        //layer in map service.
        if(visible) {
          mapService.layerInfo._subLayerVisible[mapService.subId] = true;
        } else {
          mapService.layerInfo._subLayerVisible[mapService.subId] = false;
        }
        this._visible = visible;
        this.visbleOrInvisilbe();
      }
    },
    */

    /*
    visbleOrInvisilbe: function() {
      var mapService = this.originOperLayer.mapService;
      var layersVisble = {};
      layersVisble[mapService.subId] = this._isAllSubLayerVisibleOnPath();
      mapService.layerInfo._setSubLayerVisible(layersVisble);
    }

    _isAllSubLayerVisibleOnPath: function() {
      var isVisbleOrInvisilbe = true;
      var currentLayerInfo = this;
      while(!currentLayerInfo.isRootLayer()) {
        isVisbleOrInvisilbe = isVisbleOrInvisilbe && currentLayerInfo.isVisible();
        currentLayerInfo = currentLayerInfo.parentLayerInfo;
      }
      return isVisbleOrInvisilbe;
    }

    isVisbleOrInvisilbe: function() {
      var mapService = this.originOperLayer.mapService;
      var currentId = mapService.subId;
      var value = true;

      while(currentId !== -1) {
        value = value && mapService.layerInfo._subLayerVisible[currentId];
        if(!value) {
          break;
        }
        currentId = mapService.layerInfo._getJsapiLayerInfoById(currentId).parentLayerId;
      }
      return value;
    }
    */
    /*
    isVisbleOrInvisilbe: function() {
      var mapService = this.originOperLayer.mapService;
      var level = -1, currentId = mapService.subId, value = 0;
      //var objLayerInfos = mapService.layerInfo.layerObject.layerInfos;
      while(true) {
        level++;
        value = value + mapService.layerInfo._subLayerVisible[currentId];
        var objectLayerInfo = mapService.layerInfo._getJsapiLayerInfoById(currentId);
        if (objectLayerInfo.parentLayerId === -1) {
          if (value > level) {
            //mapService.layerInfo._setSubLayerVisible(mapService.subId, true);
            return true;
          } else {
            //mapService.layerInfo._setSubLayerVisible(mapService.subId, false);
            return false;
          }
          break;
        } else {
          currentId = objectLayerInfo.parentLayerId;
        }
      }
    }
    */

  });
  return clazz;
});
