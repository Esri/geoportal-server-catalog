
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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Deferred',
  './RequestBuffer',
  'esri/layers/FeatureLayer',
  'esri/layers/RasterLayer',
  'esri/layers/StreamLayer',
  'esri/layers/ArcGISImageServiceLayer',
  'esri/layers/ArcGISImageServiceVectorLayer'
], function(declare, lang, array, Deferred, RequestBuffer,
FeatureLayer, RasterLayer, StreamLayer, ArcGISImageServiceLayer,
ArcGISImageServiceVectorLayer) {
  return declare(null, {
    _layerInfo:         null,
    _layerObjectBuffer: null,

    constructor: function(layerInfo) {
      this._layerInfo = layerInfo;
      this._initLayerObjectBuffer();
    },

    _initLayerObjectBuffer: function() {
      this._layerObjectBuffer = new RequestBuffer(lang.hitch(this, this._getLayerObject));
    },

    getLayerObject: function() {
      var requestProxy = this._layerObjectBuffer.getRequest(this._layerInfo.subId);
      return requestProxy.request();
    },

    /***************************************************
     * methods for get layer object
     ***************************************************/
    _getLayerObject: function() {
      var layerObject;
      var def = new Deferred();
      var url = this._layerInfo.getUrl();
      this._layerInfo.getLayerType().then(lang.hitch(this, function(layerType) {

        var options = lang.mixin(this._getLayerOptionsForCreateLayerObject(),
                             this._layerInfo.originOperLayer.options || {}) || {};
        switch (layerType) {
        case "FeatureLayer":
          layerObject = new FeatureLayer(url, options);
          break;
        case "RasterLayer":
          layerObject = new RasterLayer(url);
          break;
        case "StreamLayer":
          layerObject = new StreamLayer(url);
          break;
        case "ArcGISImageServiceLayer":
          layerObject = new ArcGISImageServiceLayer(url);
          break;
        case "ArcGISImageServiceVectorLayer":
          layerObject = new ArcGISImageServiceVectorLayer(url);
          break;
        case "Table":
          if(this._layerInfo.layerObject &&
             this._layerInfo.layerObject.url){
            layerObject = new FeatureLayer(url, options);
          } else if (this._layerInfo.layerObject &&
                     this._layerInfo.layerObject.featureCollectionData) {
            layerObject = new FeatureLayer(this._layerInfo.layerObject.featureCollectionData,
                                                 options);
            def.resolve(layerObject);
            return def;
          } else {
            def.resolve(null);
            return def;
          }
          break;
        case "GroupLayer":
          def = this._getGroupLayerObject();
          return def;
        default:
          def.resolve(null);
          return def;
        }

        var loadHandle = layerObject.on('load', lang.hitch(this, function() {
          /*
          // change layer.name, just for subLayers of mapService now, need move to layerObject factory.
          // Todo...
          if(!this.layerObject.empty &&
             this.layerObject.name &&
             !lang.getObject("_wabProperties.originalLayerName", false, this.layerObject)) {
            lang.setObject('_wabProperties.originalLayerName',
                           this.layerObject.name,
                           this.layerObject);
            this.layerObject.name = this.title;
          }
          layerObject.id = this._layerInfo.id;
          */
          this._setLayerObjectProperties(layerObject);
          def.resolve(layerObject);
          if(loadHandle.remove) {
            loadHandle.remove();
          }
        }));

        var loadErrorHandle = layerObject.on('error', lang.hitch(this, function(err) {
          def.reject(err);
          if(loadErrorHandle.remove) {
            loadErrorHandle.remove();
          }
        }));
      }), lang.hitch(this, function() {
        def.reject();
      }));

      return def;
    },

    _getGroupLayerObject: function() {
      var def = new Deferred();
      this._layerInfo._getServiceDefinition().then(lang.hitch(this, function(serviceDefinition) {
        var layerObject;
        if(serviceDefinition === null) {
          def.reject();
        } else {
          var url = this._layerInfo.getUrl();
          layerObject = serviceDefinition;
          layerObject.url = url;
          layerObject.id = this._layerInfo.id;
          def.resolve(layerObject);
        }
      }));
      return def;
    },

    _getLayerOptionsForCreateLayerObject: function() {
      var options = {};
      // assign id
      //options.id = this._layerInfo.id;
      // prepare outFileds for create feature layer.
      var outFields = [];
      var infoTemplate = this._layerInfo.getInfoTemplate();
      if(infoTemplate && infoTemplate.info && infoTemplate.info.fieldInfos) {
        array.forEach(infoTemplate.info.fieldInfos, function(fieldInfo) {
          if(fieldInfo.visible) {
            outFields.push(fieldInfo.fieldName);
          }
        }, this);
      } else {
        outFields = ["*"];
      }
      options.outFields = outFields;

      // assign capabilities
      //options.resourceInfo = {capabilities: ["Query"]};

      /*
      // prepare popupInfo of webmap for talbe (just for table).
      if(this._layerInfo.originOperLayer.popupInfo && this._layerInfo.isTable) {
        var popupTemplate = new PopupTemplate(this._layerInfo.originOperLayer.popupInfo);
        if(popupTemplate ) {
          options.infoTemplate = popupTemplate;
        }
      }
      */
      return options;
    },

    _setLayerObjectProperties: function(layerObject) {
      // change layer.name
      if(layerObject.name &&
         !lang.getObject("_wabProperties.originalLayerName", false, layerObject)) {
        lang.setObject('_wabProperties.originalLayerName', layerObject.name, layerObject);
        layerObject.name = this._layerInfo.title;
      }
      layerObject.id = this._layerInfo.id;
    }

  });
});
