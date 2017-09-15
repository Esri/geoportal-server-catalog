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
  'dojo/_base/html',
  'dojo/dom-construct',
  'dojo/on',
  './LayerInfoForDefault'
], function(declare, array, html, domConstruct, on, LayerInfoForDefault) {
  var clazz = declare(LayerInfoForDefault, {


    constructor: function(operLayer, map) {
      this.layerObject = operLayer.layerObject;
      /*jshint unused: false*/
    },

    getExtent: function() {
    },

    _resetLayerObjectVisiblity: function() {
      // do not do anything.
    },

    _initVisible: function() {
      var visible = false;
      this.traversal(function(layerInfo) {
        var index = array.indexOf(layerInfo.layerObject.visibleLayers, layerInfo.subId);
        if (index >= 0) {
          visible = true;
          return true;
        }
      });

      this._visible = visible;
    },

    _setVisible: function(visible) {
      this._visible = visible ? true : false;
    },

    _setTopLayerVisible: function(visible) {
      var wms = this.originOperLayer.wms;

      if(visible) {
        this._visible = true;
      } else {
        this._visible = false;
      }

      var subLayersVisible = {};
      this.traversal(function(layerInfo) {
        if (layerInfo.getSubLayers().length === 0) {
          subLayersVisible[layerInfo.subId] =
            layerInfo._isAllSubLayerVisibleOnPath();
        }
      });
      wms.layerInfo._setSubLayerVisible(subLayersVisible);
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

    /***************************************************
     * methods for control layer definition
     ***************************************************/
    _getServiceDefinition: function() {
      var url = this.getUrl();
      var requestProxy = this._serviceDefinitionBuffer.getRequest(this.subId);
      return requestProxy.request(url);
    },

    _serviceDefinitionRequest: function(url) {
      return this._normalRequest(url, {'SERVICE': 'WMS', 'REQUEST': 'GetCapabilities'}, 'xml');
    },
    //---------------new section-----------------------------------------
    // operLayer = {
    //    layerObject: layer,
    //    title: layer.label || layer.title || layer.name || layer.id || " ",
    //    id: layerId || " ",
    //    subLayers: [operLayer, ... ],
    //    wms: {"layerInfo": this, "subId": layerInfo.name, "wmsLayerInfo": layerInfo},
    // };

    obtainNewSubLayers: function() {
      var newSubLayerInfos = [];
      var wms = this.originOperLayer.wms;
      array.forEach(wms.wmsLayerInfo.subLayers, function(wmsLayerInfo){
        var subLayerInfo;
        var operLayer = wms.layerInfo._getOperLayerFromWMSLayerInfo(wmsLayerInfo, this);
        subLayerInfo = this._layerInfoFactory.create(operLayer);

        newSubLayerInfos.push(subLayerInfo);
        subLayerInfo.init();
      }, this);

      return newSubLayerInfos;
    },

    drawLegends: function(legendsNode) {
      this._initLegendsNode(legendsNode);
    },

    _initLegendsNode: function(legendsNode) {
      if(this.originOperLayer.wms.wmsLayerInfo.legendURL) {
        var legendImg = domConstruct.create("img", {
          "class": "legend-div-image",
          "src": this.originOperLayer.wms.wmsLayerInfo.legendURL
        });
        on(legendImg, 'load', function(){
          domConstruct.empty(legendsNode);
          var legendDiv = domConstruct.create("div", {
            "class": "legend-div"
          }, legendsNode);
          html.place(legendImg, legendDiv);
        });
      } else {
        domConstruct.empty(legendsNode);
      }
    },

    getOpacity: function() {
    },

    setOpacity: function(opacity) {
      /*jshint unused: false*/
    },

    /****************
     * Event
     ***************/
    _bindEvent: function() {
      // because layerObject is WMS layer.
      // so does not call inherited(arguments),
      // so does not listen _onVisibilityChanged() for subLayer

      // So far, JS-API does not support event for 'visible-layers-change'
      // this.layerObject.on('visible-layers-change',
      //                       lang.hitch(this, this._onVisibleLayersChanged));
    },

    _onVisibleLayersChanged: function() {
    },

    getScaleRange: function() {
      return this.originOperLayer.wms.layerInfo.getScaleRange();
    }

  });
  return clazz;
});
