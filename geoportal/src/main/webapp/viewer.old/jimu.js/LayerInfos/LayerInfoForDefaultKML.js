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
  'dojo/dom-construct',
  './LayerInfoForDefault'
], function(declare, array, domConstruct, LayerInfoForDefault) {
  var clazz = declare(LayerInfoForDefault, {


    constructor: function(operLayer, map) {
      this.layerObject = operLayer.layerObject;
      /*jshint unused: false*/
    },

    _resetLayerObjectVisiblity: function() {
      // do not do anything.
    },

    _initVisible: function() {
      //originOperLayer.kml is not the root of KML.
      var kml = this.originOperLayer.kml;
      var visibleFolders = kml.layerInfo.originOperLayer.visibleFolders;
      if(kml.layerInfo.isRootLayer() && visibleFolders) {
        var index = visibleFolders.indexOf(this.subId);
        if(index > -1) {
          this._visible = true;
        } else {
          this._visible = false;
        }
      } else {
        this._visible = this.originOperLayer.kml.currentFolder.visible;
      }
    },

    _setTopLayerVisible: function(visible) {
      var currentFolder = this.originOperLayer.kml.currentFolder;
      this._visible = visible;
      this.originOperLayer.kml.layerInfo.layerObject.setFolderVisibility(currentFolder, visible);
    },


    // show: function() {
    //   var rootLayerInfo = this.getRootLayerInfo();
    //   var checkedInfo = this._prepareCheckedInfoForShowOrHide(true);
    //   rootLayerInfo._setSubLayerVisibleByCheckedInfo(checkedInfo);
    //   rootLayerInfo.show();
    // },

    // hide: function() {
    //   var rootLayerInfo = this.getRootLayerInfo();
    //   var checkedInfo = this._prepareCheckedInfoForShowOrHide(false);
    //   rootLayerInfo._setSubLayerVisibleByCheckedInfo(checkedInfo);
    //   rootLayerInfo.hide();
    // },

    //---------------new section-----------------------------------------

    obtainNewSubLayers: function() {
      var newSubLayerInfos = [];
      var kml = this.originOperLayer.kml;
      if(kml.currentFolder) {
        array.forEach(kml.layerInfo._getOperLayerByParentFolderId(kml.currentFolder.id, this), function(operLayer){
          var subLayerInfo;
          subLayerInfo = this._layerInfoFactory.create(operLayer);
          newSubLayerInfos.push(subLayerInfo);
          subLayerInfo.init();
        }, this);
      }

      return newSubLayerInfos;
    },

    getOpacity: function() {
    },

    setOpacity: function(opacity) {
      /*jshint unused: false*/
    },
    drawLegends: function(legendsNode) {
      domConstruct.empty(legendsNode);
    },

    /****************
     * Event
     ***************/
    _bindEvent: function() {
      //
    },

    _onVisibleLayersChanged: function() {
    },

    getScaleRange: function() {
      return this.getRootLayerInfo().getScaleRange();
    }

  });
  return clazz;
});
