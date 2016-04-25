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
  'esri/graphicsUtils',
  './LayerInfo',
  './LayerInfoFactory'
], function(declare, array, graphicsUtils, LayerInfo,
LayerInfoFactory) {
  return declare(LayerInfo, {

    constructor: function( /*operLayer, map*/ ) {

      //this.layerObject = null;
    },

    getExtent: function() {
      var graphics = this.layerObject.items, extent;
      if (graphics.length === 0) {
        return null;
      } else {
        extent = graphicsUtils.graphicsExtent(graphics);
        return this._convertGeometryToMapSpatialRef(extent);
      }

    },

    initVisible: function() {
      // var visible = false, i;
      // if (this.newSubLayers.length) {
      //   for (i = 0; i < this.newSubLayers.length; i++) {
      //     visible = visible || this.newSubLayers[i].layerObject.visible;
      //   }
      // } else {
      //   visible = false;
      // }
      // this._visible = visible;

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

      // GeoRss layer does not response event of 'visibility-change' when setTopLayerVisible.
      // show send event at this point.
      this._onVisibilityChanged();
    },

    /*
    setSubLayerVisible: function(subLayerId, visible) {
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        if ((subLayerInfo.layerObject.id === subLayerId || (subLayerId === null))) {
          subLayerInfo.layerObject.visible = visible;
          if (this._visible && subLayerInfo.layerObject.visible) {
            subLayerInfo.layerObject.show();
          } else {
            subLayerInfo.layerObject.hide();
          }
        }
      }, this);
    },
    */

    //---------------new section-----------------------------------------
    obtainNewSubLayers: function() {
      /*jshint unused: false*/
      var newSubLayerInfos = [];
      var operLayer = this.originOperLayer;
      // getFeatureLayers() method can not get sub layers if GroRSS's sublayer has not been loaded.
      var layerObjects = this.layerObject.getFeatureLayers();
      array.forEach(layerObjects, function(layerObject) {
        var subLayerInfo;
        subLayerInfo = LayerInfoFactory.getInstance().create({
          layerObject: layerObject,
          title: layerObject.label ||
                 layerObject.title ||
                 layerObject.name ||
                 layerObject.id || " ",
          id: layerObject.id || " ",
          // template use 'collection', because it same with collection
          collection: {"layerInfo": this},
          selfType: 'geo_rss',
          parentLayerInfo: this
        });
        newSubLayerInfos.push(subLayerInfo);
        subLayerInfo.init();
      }, this);

      return newSubLayerInfos;
    },

    //indexes:[{
    //  isGraphicLayer:
    //  index:
    //},{}]
    //
    _obtainLayerIndexesInMap: function() {
      var indexes = [], index, i;
      for (i = 0; i < this.newSubLayers.length; i++) {
        index = this._getLayerIndexesInMapByLayerId(this.newSubLayers[i].layerObject.id);
        if (index) {
          indexes.push(index);
        }
      }
      return indexes;
    },

    moveLeftOfIndex: function(index) {
      var i;
      for (i = this.newSubLayers.length - 1; i >= 0; i--) {
        this.map.reorderLayer(this.newSubLayers[i].layerObject, index);
      }
    },

    moveRightOfIndex: function(index) {
      var i;
      for (i = 0; i < this.newSubLayers.length; i++) {
        this.map.reorderLayer(this.newSubLayers[i].layerObject, index);
      }
    }

    // _onVisibilityChanged: function() {
    //   // // updte visible
    //   // if(event !== "setVisibleByLayerInfo") {
    //   //   //this._visible = this.layerObject.visible;
    //   //   this.initVisible();
    //   // }
    //   this.initVisible();
    //   // send event
    //   this._visibleChanged();
    //   //_isShowInMapChanged2 is dependent on _visible,
    //   // so muse update _visible(useing this.initVisible) at before
    //   this._isShowInMapChanged2();
    // }

  });
});
