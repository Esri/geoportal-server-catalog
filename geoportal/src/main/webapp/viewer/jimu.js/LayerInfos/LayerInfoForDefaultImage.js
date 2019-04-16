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
  'dojo/dom-construct',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/aspect',
  'esri/request',
  './LayerInfoForDefault'
], function(declare, domConstruct, array, lang, Deferred, all, aspect, esriRequest, LayerInfoForDefault) {
  var clazz = declare(LayerInfoForDefault, {
    constructor: function() {
      this._addImageServiceLayerType();
    },

    _addImageServiceLayerType: function() {
      if (this.layerObject.serviceDataType &&
        (this.layerObject.serviceDataType === "esriImageServiceDataTypeVector-UV" ||
          this.layerObject.serviceDataType === "esriImageServiceDataTypeVector-MagDir")) {
        this.layerObject.type = "ArcGISImageServiceVectorLayer";
      } else {
        this.layerObject.type = "ArcGISImageServiceLayer";
      }
    },

    _initLegendsNode: function(legendsNode) {
      // if(this.originOperLayer.wms.wmsLayerInfo.legendURL) {
      //   var legendImg = domConstruct.create("img", {
      //     "class": "legend-div-image",
      //     "src": this.originOperLayer.wms.wmsLayerInfo.legendURL
      //   });
      //   on(legendImg, 'load', function(){
      //     domConstruct.empty(legendsNode);
      //     var legendDiv = domConstruct.create("div", {
      //       "class": "legend-div"
      //     }, legendsNode);
      //     html.place(legendImg, legendDiv);
      //   });
      // } else {
      //   domConstruct.empty(legendsNode);
      // }

      if(this.layerObject.version >= 10.2) {
        this._legendRequestServer().then(lang.hitch(this, function(response) {
          domConstruct.empty(legendsNode);

          array.forEach(response.layers, function(layer) {
            array.forEach(layer.legend, function(legend) {
              if (legend.label === "<all other values>") {
                return;
              }
              var legendDiv = domConstruct.create("div", {
                "class": "legend-div"
              }, legendsNode);

              var symbolDiv = domConstruct.create("div", {
                "class": "legend-symbol jimu-float-leading",
                "style": "width:50px;height:50px;position:relative"
              }, legendDiv);

              var imgSrc = null;
              if (legend.imageData) {
                imgSrc = "data:" + legend.contentType + ";base64," + legend.imageData;
              } else {
                imgSrc = legend.url;
              }
              domConstruct.create("img", {
                "class": "legend-symbol-image",
                "style":"overflow:auto;margin:auto;position:absolute;top:0;left:0;bottom:0;right:0",
                "src": imgSrc
              }, symbolDiv);

              domConstruct.create("div", {
                "class": "legend-label jimu-float-leading",
                "innerHTML": legend.label || " "
              }, legendDiv);
            }, this);
          }, this);
        }), lang.hitch(this, function() {
          domConstruct.empty(legendsNode);
        }));
      } else {
        domConstruct.empty(legendsNode);
      }
    },


    _legendRequestServer: function() {
      var url = this.layerObject.url + "/legend";
      var params = {};
      params.f = "json";

      if (this.layerObject._params.bandIds) {
        params.bandIds = this.layerObject._params.bandIds;
      }

      if (this.layerObject._params.renderingRule) {
        params.renderingRule = this.layerObject._params.renderingRule;
      }

      var request = esriRequest({
        url: url,
        content: params,
        handleAs: 'json',
        callbackParamName: 'callback'
      });
      return request;
    },

    // summary:
    //    get support table info.
    // description:
    //    return value:{
    //      isSupportedLayer: true/false,
    //      isSupportQuery: true/false,
    //      layerType: layerType.
    //    }
    getSupportTableInfo: function() {

      // var def = new Deferred();
      // var resultValue = {
      //   isSupportedLayer: false,
      //   isSupportQuery: true,
      //   layerType: null
      // };

      // this.getLayerType().then(lang.hitch(this, function(layerType) {
      //   resultValue.layerType = layerType;
      //   if (this._getLayerTypesOfSupportTable().indexOf(layerType) >= 0) {
      //     resultValue.isSupportedLayer = true;
      //   }
      //   def.resolve(resultValue);
      // }), function() {
      //   def.resolve(resultValue);
      // });
      // return def;

      var def = new Deferred();
      var resultValue = {
        isSupportedLayer: false,
        isSupportQuery: false,
        layerType: null
      };
      var typeDef = this.getLayerType();
      var layerObjectDef = this.getLayerObject();

      all({
        type: typeDef,
        layerObject: layerObjectDef
      }).then(lang.hitch(this, function(res){
        var layerType = res.type;
        var layerObject = res.layerObject;
        resultValue.layerType = layerType;
        if (this._getLayerTypesOfSupportTable().indexOf(layerType) >= 0) {
          resultValue.isSupportedLayer = true;
        }
        if (layerObject.capabilities && layerObject.capabilities.indexOf("Catalog") >= 0) {
          resultValue.isSupportQuery = true;
        } else {
          resultValue.isSupportedLayer = false;
        }
        def.resolve(resultValue);
      }), function() {
        def.resolve(resultValue);
      });
      return def;
    },

    /***************************************************
     * methods for control service definition
     ***************************************************/
    _getServiceDefinition: function() {
      var url = this.getUrl();
      var requestProxy = this._serviceDefinitionBuffer.getRequest(this.subId);
      return requestProxy.request(url);
    },

    /****************
     * Event
     ***************/
    _bindEvent: function() {
      var handle;
      this.inherited(arguments);
      if(this.layerObject && !this.layerObject.empty) {
        handle = aspect.after(this.layerObject,
                              'setRenderingRule',
                              lang.hitch(this, this._onRendererChanged));
        this._eventHandles.push(handle);
      }
    }

  });
  return clazz;
});
