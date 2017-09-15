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
  'dojo/_base/array',
  'dojo/_base/lang',
  'esri/graphicsUtils',
  'dojo/aspect',
  './LayerInfo',
  './LayerInfoForDefault',
  'dojo/Deferred',
  'esri/lang'
], function(declare, array, lang, graphicsUtils, aspect, LayerInfo, LayerInfoForDefault,
  Deferred, esriLang) {
  return declare(LayerInfo, {
    /*jshint unused: false*/
    constructor: function(/*operLayer, map*/) {
      /*jshint unused: false*/
    },

    getExtent: function() {
      var layers = this.originOperLayer.layerObject.getLayers(),
        fullExtent = null,
        layerExtent;
      array.forEach(layers, function(layer) {
        layerExtent = this._convertGeometryToMapSpatialRef(layer.initialExtent);
        if (fullExtent) {
          fullExtent = fullExtent.union(layerExtent);
        } else {
          fullExtent = layerExtent;
        }
      }, this);
      return fullExtent;
    },

    // _resetLayerObjectVisiblity: function(layerOptions) {
    //   var layerOption  = layerOptions ? layerOptions[this.id]: null;
    //   if(layerOption) {
    //     // check/unchek all sublayers according to subLayerOption.visible.
    //     array.forEach(this.newSubLayers, function(subLayerInfo) {
    //       var subLayerOption  = layerOptions ? layerOptions[subLayerInfo.id]: null;
    //       if(subLayerOption) {
    //         subLayerInfo.layerObject.setVisibility(subLayerOption.visible);
    //       }
    //     }, this);

    //     // according to layerOption.visible to set this._visible after all sublayers setting.
    //     this._setTopLayerVisible(layerOption.visible);
    //   }
    // },

    _resetLayerObjectVisiblity: function(layerOptions) {
      var layerOption  = layerOptions ? layerOptions[this.id]: null;
      if(layerOption) {
        // prepare checkedInfo for all sublayers according to subLayerOption.visible.
        var subLayersCheckedInfo = {};
        for ( var id in layerOptions) {
          if(layerOptions.hasOwnProperty(id) &&
             (typeof layerOptions[id] !== 'function')) {
            subLayersCheckedInfo[id] = layerOptions[id].visible;
          }
        }
        this._setSubLayerVisibleByCheckedInfo(subLayersCheckedInfo);

        // according to layerOption.visible to set this._visible after all sublayers setting.
        this._setTopLayerVisible(layerOption.visible);
      }
    },

    _setSubLayerVisibleByCheckedInfo: function(checkedInfo) {
      // check/unchek all sublayers according to subLayerOption.visible.
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        if(esriLang.isDefined(checkedInfo[subLayerInfo.id])) {
          subLayerInfo.layerObject.setVisibility(checkedInfo[subLayerInfo.id]);
        }
      }, this);
    },

    _initVisible: function() {
      var visible = false, i;
      for (i = 0; i < this.newSubLayers.length; i++) {
        visible = visible || this.newSubLayers[i].layerObject.visible;
      }

      if(visible) {
        this._visible = true;
      }//else _visible keep value, 'undefined' for the first time.
    },

    _setTopLayerVisible: function(visible) {
      if (visible) {
        this._visible = true;
      } else {
        this._visible = false;
      }
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        subLayerInfo.setLayerVisiblefromTopLayer();
      }, this);

      // KML layer does not response event of 'visibility-change' when setTopLayerVisible.
      // show send event at this point.
      this._onVisibilityChanged();
    },

    //---------------new section-----------------------------------------
    obtainNewSubLayers: function() {
      var newSubLayerInfos = [];
      var layers = this.originOperLayer.layerObject.getLayers();
      array.forEach(layers, function(layerObj) {
        var subLayerInfo, deferred;
        if (this._getLayerIndexesInMapByLayerId(layerObj.id)) {
          // subLayerInfo = new LayerInfoForDefault({
          //   layerObject: layerObj,
          //   title: layerObj.label || layerObj.title || layerObj.name || layerObj.id || " ",
          //   id: layerObj.id || " ",
          //   collection: {"layerInfo": this},
          //   selfType: 'kml',
          //   parentLayerInfo: this
          // }, this.map);

          subLayerInfo = this._layerInfoFactory.create({
            layerObject: layerObj,
            title: layerObj.label || layerObj.title || layerObj.name || layerObj.id || " ",
            id: layerObj.id || "-",
            subId: layerObj.id || "-",
            collection: {"layerInfo": this},
            selfType: 'kml',
            parentLayerInfo: this
          });
          newSubLayerInfos.push(subLayerInfo);
          subLayerInfo.init();
        }
      }, this);
      return newSubLayerInfos;
    }
  });
});
