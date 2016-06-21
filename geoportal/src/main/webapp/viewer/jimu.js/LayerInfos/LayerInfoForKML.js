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
  'esri/graphicsUtils',
  'dojo/aspect',
  './LayerInfo',
  './LayerInfoForDefault',
  './LayerInfoFactory',
  'dojo/Deferred'
], function(declare, array, lang, graphicsUtils, aspect, LayerInfo, LayerInfoForDefault,
  LayerInfoFactory, Deferred) {
  return declare(LayerInfo, {
    /*jshint unused: false*/
    constructor: function(/*operLayer, map, options*/) {
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

    _resetLayerObjectVisiblityBeforeInit: function() {
      /* works code for restore at init.
      // if(this._layerOption) {
      //   // according to this._layerOption.visible to set this._visible first.
      //   this._visible = this._layerOption.visible;

      //   // check/unchek all sublayers according to subLayerInfo._layerOption.visible.
      //   array.forEach(this.newSubLayers, function(subLayerInfo) {
      //     if(subLayerInfo._layerOption) {
      //       subLayerInfo._setTopLayerVisible(subLayerInfo._layerOption.visible);
      //     }
      //   }, this);
      // }
      */
      /***code for resotre not at init***/
      if(this._layerOption) {

        // check/unchek all sublayers according to subLayerInfo._layerOption.visible.
        array.forEach(this.newSubLayers, function(subLayerInfo) {
          if(subLayerInfo._layerOption) {
            subLayerInfo.layerObject.setVisibility(subLayerInfo._layerOption.visible);
          }
        }, this);

        // according to this._layerOption.visible to set this._visible after all sublayers setting.
        this._setTopLayerVisible(this._layerOption.visible);
      }
    },

    initVisible: function() {
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

          subLayerInfo = LayerInfoFactory.getInstance().create({
            layerObject: layerObj,
            title: layerObj.label || layerObj.title || layerObj.name || layerObj.id || " ",
            id: layerObj.id || " ",
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
