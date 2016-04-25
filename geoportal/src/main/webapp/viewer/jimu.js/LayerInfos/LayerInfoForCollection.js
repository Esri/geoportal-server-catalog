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

      this.layerObject = {
        declaredClass: "esri.layers.FeatureCollection", //use getLayerType instead of it.
        type: "FeatureCollection",
        empty: true
      };
    },

    getExtent: function() {

      var graphicsOfAllSubLayer = [],
        extent;
      array.forEach(this.originOperLayer.featureCollection.layers, function(layer) {
        graphicsOfAllSubLayer = graphicsOfAllSubLayer.concat(layer.layerObject.graphics);

      });
      if (graphicsOfAllSubLayer.length === 0) {
        extent = null;
      } else if (graphicsOfAllSubLayer.length === 1) {
        extent = graphicsOfAllSubLayer[0].getLayer().fullExtent;
        extent = this._convertGeometryToMapSpatialRef(extent);
      }else {
        extent = graphicsUtils.graphicsExtent(graphicsOfAllSubLayer);
        extent = this._convertGeometryToMapSpatialRef(extent);
      }
      return extent;
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

      // feature collection can not response event of 'visibility-change'
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
      var newSubLayerInfos = [];
      var operLayer = this.originOperLayer;
      array.forEach(operLayer.featureCollection.layers, function(layerObj) {
        var subLayerInfo;
        if (this._getLayerIndexesInMapByLayerId(layerObj.layerObject.id)) {
          subLayerInfo = LayerInfoFactory.getInstance().create({
            layerObject: layerObj.layerObject,
            title: layerObj.layerObject.label ||
                   layerObj.layerObject.title ||
                   layerObj.layerObject.name ||
                   layerObj.layerObject.id || " ",
            id: layerObj.id || " ",
            collection: {"layerInfo": this},
            selfType: 'collection',
            showLegend: layerObj.showLegend, //temporary code for support showLegend.
            parentLayerInfo: this
          });

          newSubLayerInfos.push(subLayerInfo);
          subLayerInfo.init();
        }
      }, this);
      newSubLayerInfos.reverse();
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
    },

    _getShowLegendOfWebmap: function() {
      // summary:
      //   get setting of showLegend from webmap defination.
      // description:
      //   return true if 'showLegend' has not been cnfigured in webmp
      return this.originOperLayer.featureCollection.showLegend !== undefined ?
             this.originOperLayer.featureCollection.showLegend : true;
    }

  });
});
