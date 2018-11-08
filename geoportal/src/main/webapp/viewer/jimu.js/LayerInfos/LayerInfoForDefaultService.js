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
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/dom-construct',
  './LayerInfoForDefault',
  './LayerObjectFacory'
], function(declare, array, lang, Deferred, domConstruct, LayerInfoForDefault, LayerObjectFacory) {
  return declare(LayerInfoForDefault, {
    _legendsNode: null,
    //_layerObjectLoadingIndicator: null,
    _layerObjectFacory: null,

    constructor: function() {
      /*
      // init _layerObjectLoadingIndicator
      this._layerObjectLoadingIndicator = {
        loadingFlag: false,
        loadedDef: new Deferred()
      };
      */

      // init _layerObjectFacory
      this._layerObjectFacory = new LayerObjectFacory(this);
    },

    _resetLayerObjectVisiblity: function() {
      // do not do anything.
    },

    _loadLegends: function(portalUrl) {
      var defRet = new Deferred();
      var mapService = this.originOperLayer.mapService;
      mapService.layerInfo.getLegendInfo(portalUrl).then(lang.hitch(this, function(legendInfo) {
        defRet.resolve(legendInfo);
      }));
      return defRet;
    },

    drawLegends: function(legendsNode, portalUrl) {
      this._loadLegends(portalUrl).then(lang.hitch(this, function(legendInfo) {
        this._initLegendsNode(legendInfo, legendsNode);
      }));
    },

    _initLegendsNode: function(legendInfo, legendsNode) {
      var mapService = this.originOperLayer.mapService;
      //var loadingImg = query(".legends-loading-img", legendsNode)[0];
      if (legendInfo/*&& loadingImg*/) {
        domConstruct.empty(legendsNode);
        //draw legend
        var legendLayer = null;
        for(var i = 0; i < legendInfo.length; i++) {
          if ( legendInfo[i].layerId === mapService.subId) {
            legendLayer = legendInfo[i];
            break;
          }
        }
        if (!legendLayer) {
          return;
        }

        var legendsTable = domConstruct.create("table", {
          "class": "legend-table",
          "style": "font-size: 12px"
        }, legendsNode);

        array.forEach(legendLayer.legend, function(legend) {
          if (legend.label === "<all other values>") {
            return;
          }
          var legendTr = domConstruct.create("tr", {
            "class": "legend-tr",
            "style": "border: 1px solid"
          }, legendsTable);

          var symbolTd = domConstruct.create("td", {
            "class": "legend-symbol-td",
            "style": ""
          }, legendTr);

          var imgSrc = null;
          if (legend.imageData) {
            imgSrc = "data:" + legend.contentType + ";base64," + legend.imageData;
          } else {
            imgSrc = legend.url;
          }
          domConstruct.create("img", {
            "class": "legend-symbol-image",
            "style": "overflow:auto;margin:auto;top:0;left:0;bottom:0;right:0",
            "src": imgSrc
          }, symbolTd);

          domConstruct.create("td", {
            "class": "legend-label-td",
            "innerHTML": legend.label || " ",
            "style": "padding-left: 5px"
          }, legendTr);


          // var legendDiv = domConstruct.create("div", {
          //   "class": "legend-div"
          // }, legendsNode);

          // var symbolDiv = domConstruct.create("div", {
          //   "class": "legend-symbol jimu-float-leading",
          //   "style": "width:50px;height:50px;position:relative"
          // }, legendDiv);

          // var imgSrc = null;
          // if (legend.imageData) {
          //   imgSrc = "data:" + legend.contentType + ";base64," + legend.imageData;
          // } else {
          //   imgSrc = legend.url;
          // }
          // domConstruct.create("img", {
          //   "class": "legend-symbol-image",
          //   "style": "overflow:auto;margin:auto;position:absolute;top:0;left:0;bottom:0;right:0",
          //   "src": imgSrc
          // }, symbolDiv);

          // domConstruct.create("div", {
          //   "class": "legend-label jimu-float-leading",
          //   "innerHTML": legend.label || " "
          // }, legendDiv);
        }, this);
      }
    },

    _initControlPopup: function() {
      var mapServiceLayer = this.originOperLayer.mapService.layerInfo.layerObject;
      var subId = this.originOperLayer.mapService.subId;
      this.controlPopupInfo = {
        enablePopup: (mapServiceLayer.infoTemplates && mapServiceLayer.infoTemplates[subId]) ?
                      true:
                      false,
        infoTemplates: undefined
      };
    },

    _afterSetInfoTemplates: function() {
      var mapServiceLayer = this.originOperLayer.mapService.layerInfo.layerObject;
      var subId = this.originOperLayer.mapService.subId;
      if(!this.controlPopupInfo.enablePopup && mapServiceLayer.infoTemplates) {
        delete mapServiceLayer.infoTemplates[subId];
      }
    },

    _getShowLegendOfWebmap: function() {
      var subId = this.originOperLayer.mapService.subId;
      return this.originOperLayer.mapService.layerInfo._getSublayerShowLegendOfWebmap(subId);
    },


    /***************************************************
     * methods for control service definition
     ***************************************************/
    // async method, return a deferred.
    _getServiceDefinition: function() {
      var mapServiceSubId = this.originOperLayer.mapService.mapServiceSubId;
      return this.originOperLayer.mapService.layerInfo._getSubserviceDefinition(mapServiceSubId);
    },

    /***************************************************
     * methods for control service definition
     ***************************************************/

    _getLayerObject: function(url) {
      var def = new Deferred();
      var layerObjectDef;
      if(url) {
        layerObjectDef = this._layerObjectFacory.getLayerObjectWithUrl(url);
      } else {
        layerObjectDef = this._layerObjectFacory.getLayerObject();
      }

      layerObjectDef.then(lang.hitch(this, function(layerObject) {
        if(this.layerObject.empty && layerObject) {
          this.layerObject = layerObject;
        }
        def.resolve(layerObject);
      }));
      return def;
    },

    //--------------public interface---------------------------


    getLayerObject: function() {
      return this._getLayerObject();
    },

    getLayerObjectTryUsingFeatureService: function() {
      var featureServiceUrl;
      if(this.isItemLayer()) {
        return this.getItemInfo().then(lang.hitch(this, function(itemInfo) {
          if(itemInfo && /*itemInfo.isHostedLayer() &&*/ itemInfo.getItemData() &&
             itemInfo.getItemData().layers) {
            array.some(itemInfo.getItemData().layers, function(layer) {
              if(layer.id === this.subId) {
                featureServiceUrl = layer.layerUrl;
                return true;
              }
            }, this);
          }

          if(featureServiceUrl) {
            return this._getLayerObject(featureServiceUrl);
          } else {
            return this._getLayerObject();
          }
        }));
      } else {
        return this.getLayerObject();
      }
    },

    /*
    getLayerObject: function() {
      var def = new Deferred();
      // if this.layerInfo is groupLayerInfo
      if(this.getSubLayers().length > 0) {
        return this._getGroupLayerObject();
      }

      var loadHandle, loadErrorHandle;
      this.getLayerType().then(lang.hitch(this, function(layerType) {
        if(this.layerObject.empty) {
          if(layerType === "RasterLayer") {
            this.layerObject = new RasterLayer(this.layerObject.url);
          } else if(layerType === "FeatureLayer") {
            this.layerObject = new FeatureLayer(this.layerObject.url,
                                                this._getLayerOptionsForCreateLayerObject());
          } else if(layerType === "StreamLayer") {
            this.layerObject = new StreamLayer(this.layerObject.url);
          } else if(layerType === "ArcGISImageServiceLayer") {
            this.layerObject = new ArcGISImageServiceLayer(this.layerObject.url);
          } else if(layerType === "ArcGISImageServiceVectorLayer") {
            this.layerObject = new ArcGISImageServiceVectorLayer(this.layerObject.url);
          }// else resolve with null at below;
          // temporary solution, partly supports kind of layerTypes. Todo...***
          // need a layerObject factory.

          if(this.layerObject.empty) {
            def.resolve();
          } else {
            // consider the condition of layer that there is no 'on' method. Todo...
            this._layerObjectLoadingIndicator.loadingFlag = true;
            loadHandle = this.layerObject.on('load', lang.hitch(this, function() {
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
              this.layerObject.id = this.id;
              def.resolve(this.layerObject);
              this._layerObjectLoadingIndicator.loadedDef.resolve(this.layerObject);
              if(loadHandle.remove) {
                loadHandle.remove();
              }
            }));
            loadErrorHandle = this.layerObject.on('error', lang.hitch(this, function() {
              def.resolve(null);
              this._layerObjectLoadingIndicator.loadedDef.resolve(null);
              if(loadErrorHandle.remove) {
                loadErrorHandle.remove();
              }
            }));
          }
        } else if(this._layerObjectLoadingIndicator.loadingFlag) {
          this._layerObjectLoadingIndicator.loadedDef.then(lang.hitch(this, function(layerObject) {
            def.resolve(layerObject);
          }));
        } else {
          // layerObject exist at initial.
          def.resolve(this.layerObject);
        }
      }), lang.hitch(this, function() {
        def.resolve(null);
      }));
      return def;
    },

    _getGroupLayerObject: function() {
      var def = new Deferred();
      if(this.layerObject.empty) {
        // *** will improve.
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
          this.layerObject.id = this.id;
          def.resolve(this.layerObject);
        }), function(err) {
          def.reject(err);
        });
      } else {
        def.resolve(this.layerObject);
      }
      return def;
    },
    */

    // now it is used for Attribute.
    getPopupInfo: function() {
      // summary:
      //   get popupInfo from webmap defination.
      // description:
      //   return null directly if the has not configured popupInfo in webmap.
      var popupInfo = null;
      var layers = this.originOperLayer.mapService.layerInfo.originOperLayer.layers;
      if(layers) {
        for(var i = 0; i < layers.length; i++) {
          if(layers[i].id === this.originOperLayer.mapService.subId) {
            popupInfo = layers[i].popupInfo;
            break;
          }
        }
      }
      return popupInfo;
    },

    getFilterOfWebmap: function() {
      // summary:
      //   get filter from webmap defination.
      // description:
      //   return null directly if the has not configured filter in webmap.
      var filter = null;
      var layers = this.originOperLayer.mapService.layerInfo.originOperLayer.layers;
      if(layers) {
        for(var i = 0; i < layers.length; i++) {
          if(layers[i].id === this.originOperLayer.mapService.subId) {
            filter = layers[i].layerDefinition ?
                     layers[i].layerDefinition.definitionExpression :
                     null;
            break;
          }
        }
      }
      return filter;
    },

    getFilter: function() {
      // summary:
      //   get filter from layerObject.
      // description:
      //   return null if does not have or cannot get it.
      var filter;
      var mapService = this.originOperLayer.mapService;
      if(mapService.layerInfo.layerObject &&
         mapService.layerInfo.layerObject.layerDefinitions) {
        filter = mapService.layerInfo.layerObject.layerDefinitions[mapService.subId];
      } else {
        filter = null;
      }
      return filter;
    },

    setFilter: function(layerDefinitionExpression) {
      // summary:
      //   set layer definition expression to layerObject.
      // paramtter
      //   layerDefinitionExpression: layer definition expression
      //   set 'null' to delete layer definition express
      // description:
      //   operation will skip if layer not support filter.
      var layerDefinitions;
      var mapService = this.originOperLayer.mapService;
      if(mapService.layerInfo.layerObject &&
         mapService.layerInfo.layerObject.setLayerDefinitions) {
        if(mapService.layerInfo.layerObject.layerDefinitions) {
          layerDefinitions = array.map(mapService.layerInfo.layerObject.layerDefinitions,
                                       function(layerDefinition) {
            return layerDefinition;
          });
        } else {
          layerDefinitions = [];
        }

        layerDefinitions[mapService.subId] = layerDefinitionExpression;
        mapService.layerInfo.layerObject.setLayerDefinitions(layerDefinitions);
      }
    },

    getLayerType: function() {
      var def = new Deferred();
      // if this.layerInfo is groupLayerInfo
      if(this.getSubLayers().length > 0) {
        def.resolve("GroupLayer");
      } else {
        this._getServiceDefinition().then(lang.hitch(this, function(serviceDefinition) {
          if (serviceDefinition) {
            def.resolve(serviceDefinition.type.replace(/\ /g, ''));
          } else {
            def.resolve(null);
          }
        }), function() {
          def.resolve(null);
        });
      }

      return def;
    },

    // summary:
    //    is support table.
    // description:
    //    return value:{
    //      isSupportedLayer: true/false,
    //      isSupportQuery: true/false,
    //      layerType: layerType
    //    }
    getSupportTableInfo: function() {
      var def = new Deferred();
      var resultValue = {
        isSupportedLayer: false,
        isSupportQuery: false,
        layerType: null
      };
      this.getLayerType().then(lang.hitch(this, function(layerType){
        resultValue.layerType = layerType;
        if (this._getLayerTypesOfSupportTable().indexOf(layerType) >= 0) {
          resultValue.isSupportedLayer = true;
        }
        this._getServiceDefinition().then(lang.hitch(this, function(serviceDefinition){
          if(serviceDefinition && serviceDefinition.capabilities.indexOf("Data") >= 0) {
            resultValue.isSupportQuery = true;
          }
          def.resolve(resultValue);
        }), function(){
          def.resolve(resultValue);
        });
      }), function() {
        def.resolve(resultValue);
      });
      return def;
    },

    // control popup
    enablePopup: function() {
      var mapServiceLayerInfo = this.originOperLayer.mapService.layerInfo;
      var mapServiceLayer = mapServiceLayerInfo.layerObject;
      var subId = this.originOperLayer.mapService.subId;

      return this.loadInfoTemplate().then(lang.hitch(this, function() {
        if(mapServiceLayerInfo.controlPopupInfo.infoTemplates &&
          mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId]) {
          this.controlPopupInfo.enablePopup = true;
          if(!mapServiceLayer.infoTemplates) {
            mapServiceLayer.infoTemplates = {};
          }
          mapServiceLayer.infoTemplates[subId] =
            mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId];
          return true;
        } else {
          return false;
        }
      }));
    },

    disablePopup: function() {
      var mapServiceLayer = this.originOperLayer.mapService.layerInfo.layerObject;
      var subId = this.originOperLayer.mapService.subId;
      this.controlPopupInfo.enablePopup = false;
      if(mapServiceLayer.infoTemplates) {
        delete mapServiceLayer.infoTemplates[subId];
      }
    },

    loadInfoTemplate: function() {
      var def = new Deferred();
      var mapServiceLayerInfo = this.originOperLayer.mapService.layerInfo;
      var subId = this.originOperLayer.mapService.subId;
      if(mapServiceLayerInfo.controlPopupInfo.infoTemplates &&
        mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId] &&
        mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId].infoTemplate) {
        def.resolve(mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId].infoTemplate);
      } else {
        if(!mapServiceLayerInfo.controlPopupInfo.infoTemplates){
          mapServiceLayerInfo.controlPopupInfo.infoTemplates = {};
        }
        /*
        mapServiceLayerInfo._getSublayerDefinition(subId)
        .then(lang.hitch(this, function(layerDefinition) {
          var popupTemplate = this._getDefaultPopupTemplate(layerDefinition);
        */
        this.getLayerObject()
        .then(lang.hitch(this, function(layerObject) {
          var popupTemplate = this._getDefaultPopupTemplate(layerObject);
          mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId] = {
            infoTemplate: popupTemplate,
            layerUrl: null
          };
          def.resolve(popupTemplate);
        }), lang.hitch(this, function() {
          def.resolve(null);
        }));
      }
      return def;
    },

    getInfoTemplate: function() {
      var mapServiceLayerInfo = this.originOperLayer.mapService.layerInfo;
      var subId = this.originOperLayer.mapService.subId;
      if(mapServiceLayerInfo.controlPopupInfo.infoTemplates &&
        mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId] &&
        mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId].infoTemplate) {
        return mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId].infoTemplate;
      } else {
        return null;
      }
    },

    getScaleRange: function() {
      var scaleRange;
      var mapService = this.originOperLayer.mapService;
      var jsapiLayerInfo = mapService.layerInfo._getJsapiLayerInfoById(mapService.subId);

      if(jsapiLayerInfo &&
         (jsapiLayerInfo.minScale >= 0) &&
         (jsapiLayerInfo.maxScale >= 0)) {
        scaleRange = {
          minScale: jsapiLayerInfo.minScale,
          maxScale: jsapiLayerInfo.maxScale
        };
      } else {
        scaleRange = {
          minScale: 0,
          maxScale: 0
        };
      }

      return scaleRange;
    },

    /****************
     * Event
     ***************/
    _onVisibilityChanged: function() {
      // for all subLayers of mapService, do not response VisibilityChanged.
    }

  });
});
