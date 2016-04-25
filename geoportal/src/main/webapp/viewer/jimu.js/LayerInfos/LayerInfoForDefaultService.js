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
  'dojo/Deferred',
  'dojo/dom-construct',
  'dojo/promise/all',
  './LayerInfoForDefault',
  './LayerInfos',
  'esri/layers/FeatureLayer',
  'esri/layers/RasterLayer'
], function(declare, array, lang, Deferred, domConstruct, all,
LayerInfoForDefault, LayerInfos, FeatureLayer, RasterLayer) {
  return declare(LayerInfoForDefault, {
    _legendsNode: null,

    _resetLayerObjectVisiblityBeforeInit: function() {
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

    //--------------public interface---------------------------
    getLayerObject: function() {
      var def = new Deferred();
      this.getLayerType().then(lang.hitch(this, function(layerType) {
        if(this.layerObject.empty) {
          if(layerType === "RasterLayer") {
            this.layerObject = new RasterLayer(this.layerObject.url);
          } else  {
            // default as FeatureLayer
            this.layerObject = new FeatureLayer(this.layerObject.url);
          }
          this.layerObject.on('load', lang.hitch(this, function() {
            def.resolve(this.layerObject);
          }));
          this.layerObject.on('error', lang.hitch(this, function(/*err*/) {
            //def.reject(err);
            def.resolve(null);
          }));
        } else if (!this.layerObject.loaded) {
          this.layerObject.on('load', lang.hitch(this, function() {
            def.resolve(this.layerObject);
          }));
          this.layerObject.on('error', lang.hitch(this, function(/*err*/) {
            //def.reject(err);
            def.resolve(null);
          }));
        } else {
          def.resolve(this.layerObject);
        }
      }), lang.hitch(this, function() {
        def.resolve(null);
      }));
      return def;
    },

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

    getLayerType: function() {
      var def = new Deferred();
      var mapService = this.originOperLayer.mapService;
      mapService.layerInfo._getSublayerDefinition(mapService.subId)
      .then(lang.hitch(this, function(layerIdent) {
        if (layerIdent) {
          def.resolve(layerIdent.type.replace(/\ /g, ''));
        } else {
          def.resolve(null);
        }
      }), function() {
        def.resolve(null);
      });

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
        var mapService = this.originOperLayer.mapService;
        mapService.layerInfo._getSublayerDefinition(mapService.subId)
        .then(lang.hitch(this, function(layerIdent){
          if(layerIdent && layerIdent.capabilities.indexOf("Data") >= 0) {
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
      this.controlPopupInfo.enablePopup = true;
      if(mapServiceLayerInfo.controlPopupInfo.infoTemplates) {
        if(!mapServiceLayer.infoTemplates) {
          mapServiceLayer.infoTemplates = {};
        }
        mapServiceLayer.infoTemplates[subId] =
          mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId];
      }
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
        mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId]) {
        def.resolve(mapServiceLayerInfo.controlPopupInfo.infoTemplates[subId]);
      } else {
        if(!mapServiceLayerInfo.controlPopupInfo.infoTemplates){
          mapServiceLayerInfo.controlPopupInfo.infoTemplates = {};
        }
        mapServiceLayerInfo._getSublayerDefinition(subId)
        .then(lang.hitch(this, function(layerDefinition) {
          var popupTemplate = this._getDefaultPopupTemplate(layerDefinition);
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

    getRelatedTableInfoArray: function() {
      var relatedTableInfoArray = [];
      var def = new Deferred();

      var layerObjectDef = this.getLayerObject();
      var layerInfosDef  = LayerInfos.getInstance(this.map, this.map.itemInfo);

      all({
        layerObject: layerObjectDef,
        layerInfos: layerInfosDef
      }).then(lang.hitch(this, function(result) {
        if(result.layerObject && result.layerObject.relationships) {
          var InfoArray;
          var tableInfoArray;
          var layerInfoArray = [];
          this.originOperLayer.mapService.layerInfo.traversal(function(layerInfo) {
            layerInfoArray.push(layerInfo);
          });
          tableInfoArray = result.layerInfos.getTableInfoArray();
          InfoArray = tableInfoArray.concat(layerInfoArray);
          relatedTableInfoArray = this._getRelatedTableInfoArray(result.layerObject, InfoArray);
          def.resolve(relatedTableInfoArray);
        } else {
          def.resolve(relatedTableInfoArray);
        }
      }));


      return def;
    },

    /****************
     * Event
     ***************/
    _onVisibilityChanged: function() {
      // for all subLayers of mapService, do not response VisibilityChanged.
    }

  });
});
