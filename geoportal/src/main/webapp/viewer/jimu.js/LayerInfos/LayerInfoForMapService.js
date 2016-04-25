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
  'dojo/json',
  'dojo/aspect',
  'dojo/topic',
  './LayerInfo',
  'esri/request',
  'esri/lang',
  './LayerInfoFactory'
], function(declare, array, lang, Deferred, Json, aspect, topic, LayerInfo,
esriRequest, esriLang, LayerInfoFactory) {
  return declare(LayerInfo, {

    _legendInfo: null,
    _sublayerIdent: null,
    controlPopupInfo: null,
    _jsapiLayerInfos: null,

    constructor: function(operLayer, map, options) {

      this._layerOptions = options.layerOptions ? options.layerOptions: null;

      //other initial methods depend on '_jsapiLayerInfos', so must init first.
      this._initJsapiLayerInfos();

      /*jshint unused: false*/
      this.initSubLayerVisible();

      // init _subLayerIdent.
      this._sublayerIdent = {
        definitions: [],
        empty: true,
        defLoad: new Deferred()
      };
      this._sublayerIdent.definitions[this.layerObject.layerInfos.length - 1] = null;

      // init control popup
      this._initControlPopup();
    },

    _initJsapiLayerInfos: function() {
      var subLayersSettingArray = this.originOperLayer.layers;
      var webmapLayerInfos = array.filter(subLayersSettingArray, function(subLayersSetting) {
        return (esriLang.isDefined(subLayersSetting.id) &&
                esriLang.isDefined(subLayersSetting.name) &&
                esriLang.isDefined(subLayersSetting.minScale) &&
                esriLang.isDefined(subLayersSetting.maxScale) &&
                esriLang.isDefined(subLayersSetting.parentLayerId) &&
                //esriLang.isDefined(subLayersSetting.subLayerIds) &&
                esriLang.isDefined(subLayersSetting.defaultVisibility));
      });
      if(webmapLayerInfos.length > 0) {
        this._jsapiLayerInfos = webmapLayerInfos;
      } else {
        this._jsapiLayerInfos = this.layerObject.layerInfos;
      }
    },

    _idIsInJsapiLayerInfos: function(subId) {
      // var filterdLayerInfos = array.filter(this._jsapiLayerInfos, function(jsapiLayerInfo) {
      //   return jsapiLayerInfo.id === subId;
      // });
      // return filterdLayerInfos.length > 0 ? true : false;
      var jsapiLayerInfo = this._getJsapiLayerInfoById(subId);
      return jsapiLayerInfo === null ? false : true;
    },

    _getJsapiLayerInfoById: function(subId) {
      var jsapiLayerInfo = null;
      for(var i = 0; i < this._jsapiLayerInfos.length; i++) {
        if(this._jsapiLayerInfos[i].id === subId) {
          jsapiLayerInfo = this._jsapiLayerInfos[i];
        }
      }
      return jsapiLayerInfo;
    },

    _initControlPopup: function() {
      this.controlPopupInfo = {
        enablePopup: undefined,
        infoTemplates: lang.clone(this.layerObject.infoTemplates)
      };
      // backup infoTemplates to layer.
      this.layerObject._infoTemplates = lang.clone(this.layerObject.infoTemplates);
      aspect.after(this.layerObject, "setInfoTemplates", lang.hitch(this, function(){
        this.layerObject._infoTemplates = lang.clone(this.layerObject.infoTemplates);
        this.controlPopupInfo.infoTemplates = lang.clone(this.layerObject.infoTemplates);
        this.traversal(function(layerInfo) {
          if(layerInfo._afterSetInfoTemplates) {
            layerInfo._afterSetInfoTemplates();
          }
        });
      }));
    },

    initSubLayerVisible: function(visibleLayersParam) {
      // this.subLayerVisible = [];
      // //the subLayerVisible has the same index width layerInfos.
      // this.subLayerVisible[this.layerObject.layerInfos.length - 1] = 0;

      this.subLayerVisible = {};

      for (var i = 0; i < this.layerObject.layerInfos.length; i++) {
        this.subLayerVisible[this.layerObject.layerInfos[i].id] = 0;
      }

      if(visibleLayersParam) {
        array.forEach(visibleLayersParam, function(visibleLayer) {
          this.subLayerVisible[visibleLayer]++;
        }, this);
      } else if (this.originOperLayer.visibleLayers) {
        // according to webmap info
        array.forEach(this.originOperLayer.visibleLayers, function(visibleLayer) {
          this.subLayerVisible[visibleLayer]++;
        }, this);
      } else {
        // according to mapserver info
        array.forEach(this.layerObject.layerInfos, function(layerInfo) {
          if (layerInfo.defaultVisibility) {
            this.subLayerVisible[layerInfo.id]++;
          }
        }, this);
      }
    },

    getExtent: function() {
      var extent = this.originOperLayer.layerObject.fullExtent ||
        this.originOperLayer.layerObject.initialExtent;
      return this._convertGeometryToMapSpatialRef(extent);
    },

    _resetLayerObjectVisiblityBeforeInit: function() {
      if(this._layerOptions) {
        //reste visibility fo parent layer.
        if(this._layerOption) {
          this.layerObject.setVisibility(this._layerOption.visible);
        }

        //reste visibles of sublayer.
        var visibleLayers = [];
        var visibleLayersForUpdateSubLayerVisible;
        var visibleLayersForSetVisibleLayers;
        var convertVisibleLayersResult;
        var haseConfiguredInLayerOptionsflag = false;
        array.forEach(this._jsapiLayerInfos, function(jsapiLayerInfo) {
          var absoluteSublayerId = this.id + '_' + jsapiLayerInfo.id;
          if(esriLang.isDefined(this._layerOptions[absoluteSublayerId]) &&
             !this._isGroupLayerBySubId(jsapiLayerInfo.id)) {
            haseConfiguredInLayerOptionsflag = true;
            if(this._layerOptions[absoluteSublayerId].visible) {
              visibleLayers.push(jsapiLayerInfo.id);
            }
          }
        }, this);

        convertVisibleLayersResult =
          this._converVisibleLayers(visibleLayers);
        visibleLayersForUpdateSubLayerVisible =
          convertVisibleLayersResult.visibleLayersForUpdateSubLayerVisible;
        visibleLayersForSetVisibleLayers =
          convertVisibleLayersResult.visibleLayersForSetVisibleLayers;

        if((visibleLayersForSetVisibleLayers.length > 0 || haseConfiguredInLayerOptionsflag) &&
            this.layerObject.setVisibleLayers) {
          // init sublayerVisible and call initVisible for all subLayers.
          this.initSubLayerVisible(visibleLayersForUpdateSubLayerVisible);
          this.traversal(function(layerInfo) {
            layerInfo.initVisible();
          });
          //recall setVisibleLayers()
          this.layerObject.setVisibleLayers(visibleLayersForSetVisibleLayers);
        }
      }
    },


    initVisible: function() {
      this._visible = this.originOperLayer.layerObject.visible;
    },

    _setTopLayerVisible: function(visible) {
      this.originOperLayer.layerObject.setVisibility(visible);
      this._visible = visible;
    },

    setSubLayerVisible: function(layersVisible) {
      // summary:
      //   set seblayer visible
      // description:
      //   paramerter:
      //   {subLayerId: visble}
      var ary = [-1, -1, -1], index;
      var visibleLayers = array.filter(this.originOperLayer.layerObject.visibleLayers,
                                       function(visibleSubId) {
        return visibleSubId !== -1;
      });

      for (var child in layersVisible) {
        if(layersVisible.hasOwnProperty(child) &&
           (typeof layersVisible[child] !== 'function') /*&&child !== 'config'*/) {
          var visible = layersVisible[child];
          var subLayerId = Number(child);
          if (visible) {
            index = array.indexOf(visibleLayers, subLayerId);
            if (index < 0) {
              visibleLayers.push(subLayerId);
            }
          } else {
            index = array.indexOf(visibleLayers, subLayerId);
            if (index >= 0) {
              visibleLayers.splice(index, 1);
            }
          }
        }
      }
      ary = ary.concat(visibleLayers);
      this.originOperLayer.layerObject.setVisibleLayers(ary);
    },

    //---------------new section-----------------------------------------
    obtainNewSubLayers: function() {
      var newSubLayers = [];
      var layer = this.originOperLayer.layerObject;
      var serviceLayerType = null;
      if (layer.declaredClass === 'esri.layers.ArcGISDynamicMapServiceLayer') {
        serviceLayerType = "dynamic";
      } else {
        serviceLayerType = "tiled";
      }

      array.forEach(layer.layerInfos, function(layerInfo) {
        var featureLayer = null;
        var url = layer.url + "/" + layerInfo.id;
        var featureLayerId = layer.id + "_" + layerInfo.id;

        // It is a group layer.
        if (layerInfo.subLayerIds && layerInfo.subLayerIds.length > 0) {
          /*
          newSubLayers.push({
            layerObject: featureLayer,
            title: layerInfo.name || layerInfo.id || " ",
            id: featureLayerId || " ",
            subLayers: [],
            mapService: {"layerInfo": this, "subId": layerInfo.id},
            selfType: 'mapservice_' +  serviceLayerType + '_group'
          });
          */
          // it's a fake layerObject, only has a url intent to show Descriptiong in popupMenu
          featureLayer = {
            url: url,
            empty: true
          };
          this._addNewSubLayer(newSubLayers,
                               featureLayer,
                               featureLayerId,
                               layerInfo,
                               serviceLayerType + '_group');
        } else {
          //featureLayer = new FeatureLayer(url);
          // featureLayer.on('load', lang.hitch(this,
          //                                    this._addNewSubLayer,
          //                                    newSubLayers, index,
          //                                    featureLayerId,
          //                                    layerInfo.id,
          //                                    deferreds[index],
          //                                    url,
          //                                    layerInfo));
          // featureLayer.on('error', lang.hitch(this,
          //                                     this._handleErrorSubLayer,
          //                                     newSubLayers,
          //                                     index,
          //                                     featureLayerId,
          //                                     layerInfo.id,
          //                                     deferreds[index],
          //                                     url,
          //                                     layerInfo));
          featureLayer = {
            url: url,
            empty: true
          };
          this._addNewSubLayer(newSubLayers,
                               featureLayer,
                               featureLayerId,
                               layerInfo,
                               serviceLayerType);
        }
      }, this);

      //afer load all featureLayers.
      var finalNewSubLayerInfos = [];
      //reorganize newSubLayers, newSubLayers' element now is:
      //{
      // layerObject:
      // title:
      // id:
      // subLayers:
      //}
      array.forEach(layer.layerInfos, function(layerInfo, i) {
        var parentId = layerInfo.parentLayerId;
        //if fetchs a FeatrueLayer error. does not add it;
        if (parentId !== -1 && this._idIsInJsapiLayerInfos(layerInfo.id)
            /*&& !newSubLayers[layerInfo.id].error && !newSubLayers[parentId].error*/ ) { //****
          var parentLayer = getNewSubLayerBySubId(newSubLayers, parentId);
          if(parentLayer) {
            parentLayer.subLayers.push(newSubLayers[i]);
          }
        }
      }, this);

      array.forEach(layer.layerInfos, function(layerInfo, i) {
        var subLayerInfo;
        //if fetchs a FeatrueLayer error. does not add it;
        if (layerInfo.parentLayerId === -1 && this._idIsInJsapiLayerInfos(layerInfo.id)
           /*&& !newSubLayers[layerInfo.id].error*/ ) {
          subLayerInfo = LayerInfoFactory.getInstance().create(newSubLayers[i]);
          finalNewSubLayerInfos.push(subLayerInfo);
          subLayerInfo.init();
        }
      }, this);

      return finalNewSubLayerInfos;

      function getNewSubLayerBySubId(newSubLayers, subId) {
        var newSubLayer = null;
        for(var i = 0; i < newSubLayers.length; i++) {
          if(newSubLayers[i].mapService.subId === subId) {
            newSubLayer = newSubLayers[i];
            break;
          }
        }
        return newSubLayer;
      }
    },

    _addNewSubLayer: function(newSubLayers,
                              featureLayer,
                              featureLayerId,
                              layerInfo,
                              serviceLayerType) {
      newSubLayers.push({
        layerObject: featureLayer,
        title: layerInfo.name || layerInfo.id || " ",
        id: featureLayerId || " ",
        subLayers: [],
        mapService: {
          "layerInfo": this,
          "subId": layerInfo.id
        },
        selfType: 'mapservice_' + serviceLayerType,
        parentLayerInfo: this
      });
    },

    _handleErrorSubLayer: function(newSubLayers, index, layerId, subId, url, layerInfo) {
      /*jshint unused: false*/
      //newSubLayers[index] = {error: true};
      //var layer = newSubLayers[index];
      newSubLayers[index] = {
        layerObject: null,
        title: layerInfo.name || layerInfo.id || " ",
        id: layerId || " ",
        subLayers: [],
        mapService: {
          "layerInfo": this,
          "subId": subId
        }
      };
    },

    getOpacity: function() {
      if (this.layerObject.opacity) {
        return this.layerObject.opacity;
      } else {
        return 1;
      }
    },

    setOpacity: function(opacity) {
      if (this.layerObject.setOpacity) {
        this.layerObject.setOpacity(opacity);
      }
    },

    getLegendInfo: function(portalUrl) {
      var def = new Deferred();
      if (!this._legendInfo) {
        this._legendRequest(portalUrl).then(lang.hitch(this, function(results) {
          this._legendInfo = results.layers;
          def.resolve(this._legendInfo);
        }), function() {
          def.reject();
        });
      } else {
        def.resolve(this._legendInfo);
      }
      return def;
    },

    // about legend.
    _legendRequest: function(portalUrl) {
      if (this.layerObject.version >= 10.01) {
        return this._legendRequestServer();
      } else {
        return this._legendRequestTools(portalUrl);
      }
    },

    _legendRequestServer: function() {
      var url = this.layerObject.url + "/legend";
      var params = {};
      params.f = "json";
      if (this.layerObject._params.dynamicLayers) {
        params.dynamicLayers = Json.stringify(this._createDynamicLayers(this.layerObject));
        if (params.dynamicLayers === "[{}]") {
          params.dynamicLayers = "[]";
        }
      }
      var request = esriRequest({
        url: url,
        content: params,
        handleAs: 'json',
        callbackParamName: 'callback'
      });
      return request;
    },

    _legendRequestTools: function(portalUrl) {
      var url = portalUrl + "sharing/tools/legend?soapUrl=" + this.layerObject.url;
      var request = esriRequest({
        url: url,
        content: {
          f: 'json'
        },
        handleAs: 'json',
        callbackParamName: 'callback'
      });
      return request;
    },

    _createDynamicLayers: function(layer) {
      var dynLayerObjs = [],
        dynLayerObj,
        infos = layer.dynamicLayerInfos || layer.layerInfos;

      array.forEach(infos, function(info) {
        dynLayerObj = {
          id: info.id
        };
        dynLayerObj.source = info.source && info.source.toJson();

        var definitionExpression;
        if (layer.layerDefinitions && layer.layerDefinitions[info.id]) {
          definitionExpression = layer.layerDefinitions[info.id];
        }
        if (definitionExpression) {
          dynLayerObj.definitionExpression = definitionExpression;
        }
        var layerDrawingOptions;
        if (layer.layerDrawingOptions && layer.layerDrawingOptions[info.id]) {
          layerDrawingOptions = layer.layerDrawingOptions[info.id];
        }
        if (layerDrawingOptions) {
          dynLayerObj.drawingInfo = layerDrawingOptions.toJson();
        }
        dynLayerObj.minScale = info.minScale || 0;
        dynLayerObj.maxScale = info.maxScale || 0;
        dynLayerObjs.push(dynLayerObj);
      });
      return dynLayerObjs;
    },

    // about layer definition
    _getLayerDefinition: function() {
      var def = new Deferred();
      var url = this.layerObject.url;
      this._request(url).then(lang.hitch(this, function(result) {
        def.resolve(result);
      }), function(err) {
        console.error(err.message || err);
        def.resolve(null);
      });
      return def;
    },

    _getSublayerDefinition: function(subId) {
      var def;
      if (this._sublayerIdent.definitions[subId]) {
        def = new Deferred();
        def.resolve(this._sublayerIdent.definitions[subId]);
      } else {
        def = this._layerAndTableRequest(subId);
      }
      return def;
    },

    _layerAndTableRequest: function(subId) {
      if (this.layerObject.version >= 10.11) {
        return this._allLayerAndTableServer(subId);
      } else {
        return this._allLayerAndTable(subId);
      }
    },

    // about all layer and table
    _allLayerAndTableServer: function(subId) {
      var def = new Deferred();
      var url = this.layerObject.url + '/layers';
      if(this._sublayerIdent.empty) {
        this._sublayerIdent.empty = false;
        this._request(url).then(lang.hitch(this, function(results) {
          this._sublayerIdent.definitions = results.layers;
          this._sublayerIdent.defLoad.resolve();
          def.resolve(this._sublayerIdent.definitions[subId]);
        }), lang.hitch(this, function(err) {
          console.error(err.message || err);
          this._sublayerIdent.defLoad.reject();
          this._sublayerIdent.defLoad = new Deferred();
          this._sublayerIdent.empty = true;
          def.resolve(null);
        }));
      } else {
        this._sublayerIdent.defLoad.then(lang.hitch(this, function() {
          def.resolve(this._sublayerIdent.definitions[subId]);
        }), function(err) {
          console.error(err.message || err);
          def.resolve(null);
        });
      }
      return def;
    },

    _allLayerAndTable: function(subId) {
      var def = new Deferred();
      var url = this.layerObject.url + '/' + subId;
      this._request(url).then(lang.hitch(this, function(result) {
        this._sublayerIdent.definitions[subId] = result;
        def.resolve(result);
      }), function(err) {
        console.error(err.message || err);
        def.resolve(null);
      });
      return def;
    },

    _request: function(url) {
      var request = esriRequest({
        url: url,
        content: {
          f: 'json'
        },
        handleAs: 'json',
        callbackParamName: 'callback'
      });
      return request;
    },

    _getSublayerSettingOfWebmap: function(subId) {
      // summary:
      //   get webmap setting for sublayer of mapservice layer;
      // description:
      //   return an object like:{
      //     id: 2,
      //     showLegend: false,
      //     popupInfo: {}
      //   }
      //   return null if sublayer has not been configured.
      var subLayersSettingArray = this.originOperLayer.layers;
      var subLayerSettingArray = array.filter(subLayersSettingArray, function(layerData) {
        return layerData.id === subId;
      });
      return subLayerSettingArray.length === 1 ? subLayerSettingArray[0] : null;
    },

    _getSublayerShowLegendOfWebmap: function(subId) {
      var subLayerSetting = this._getSublayerSettingOfWebmap(subId);
      if(subLayerSetting) {
        return subLayerSetting.showLegend !== undefined ? subLayerSetting.showLegend : true;
      } else {
        // default value is true
        return true;
      }
    },

    _isGroupLayerBySubId: function(subId) {
      var jsapiLayerInfo = this.layerObject.layerInfos[subId];
      if(jsapiLayerInfo.subLayerIds && jsapiLayerInfo.subLayerIds.length > 0) {
        return true;
      } else {
        return false;
      }
    },

    _subLayerVisibleChanged: function() {
      var changedLayerInfos = [];
      this.traversal(function(layerInfo) {
        changedLayerInfos.push(layerInfo);
      });
      topic.publish('layerInfos/layerInfo/visibleChanged', changedLayerInfos);
    },

    /****************
     * Event
     ***************/
    _bindEvent: function() {
      this.inherited(arguments);
      if(this.layerObject && !this.layerObject.empty) {
        this.layerObject.on('visible-layers-change',
                            lang.hitch(this, this._onVisibleLayersChanged));
      }
    },

    _onVisibleLayersChanged: function(event) {
      var visibleLayers = event.visibleLayers;
      if(visibleLayers[0] === -1 &&
         visibleLayers[1] === -1 &&
         visibleLayers[2] === -1) {
        this._subLayerVisibleChanged();
        this._isShowInMapChanged2();
        return;
      }

      var tempVisibleLayers = visibleLayers;
      var convertVisibleLayersResult;
      var visibleLayersForUpdateSubLayerVisible = [];
      var visibleLayersForSetVisibleLayers = [-1, -1, -1];
      // array.forEach(visibleLayers, function(subLayerIndex) {
      //   var layerInfo = this.findLayerInfoById(this.id + '_' + subLayerIndex);
      //   if(this._isGroupLayerBySubId(subLayerIndex)) {
      //     //add all subLayer of group layer.
      //     layerInfo.traversal(function(subLayerInfo) {
      //       tempVisibleLayers.push(subLayerInfo.originOperLayer.mapService.subId);
      //     });
      //   } else {
      //     // add all parent layers of no-group layer.
      //     while(layerInfo &&
      //           layerInfo.originOperLayer.mapService) {
      //       tempVisibleLayers.push(layerInfo.originOperLayer.mapService.subId);
      //       layerInfo = layerInfo.parentLayerInfo;
      //     }
      //   }
      // }, this);

      // // remove repetitions.
      // array.forEach(tempVisibleLayers, function(subLayerIndex) {
      //   if(visibleLayersForUpdateSubLayerVisible.indexOf(subLayerIndex) < 0) {
      //     visibleLayersForUpdateSubLayerVisible.push(subLayerIndex);
      //   }
      // }, this);

      // // remove group layer
      // array.forEach(visibleLayersForUpdateSubLayerVisible, function(subLayerIndex) {
      //   if(!this._isGroupLayerBySubId(subLayerIndex)) {
      //     visibleLayersForSetVisibleLayers.push(subLayerIndex);
      //   }
      // }, this);

      convertVisibleLayersResult = this._converVisibleLayers(tempVisibleLayers);
      visibleLayersForUpdateSubLayerVisible =
        convertVisibleLayersResult.visibleLayersForUpdateSubLayerVisible;

      visibleLayersForSetVisibleLayers =
        visibleLayersForSetVisibleLayers
          .concat(convertVisibleLayersResult.visibleLayersForSetVisibleLayers);


      // init sublayerVisible and call initVisible for all subLayers.
      this.initSubLayerVisible(visibleLayersForUpdateSubLayerVisible);
      this.traversal(function(layerInfo) {
        layerInfo.initVisible();
      });

      //recall setVisibleLayers()
      this.layerObject.setVisibleLayers(visibleLayersForSetVisibleLayers);
    },

    _converVisibleLayers: function(visibleLayers) {
      var result = {
        visibleLayersForUpdateSubLayerVisible: [],
        visibleLayersForSetVisibleLayers: []
      };

      var tempVisibleLayers = visibleLayers;
      array.forEach(visibleLayers, function(subLayerIndex) {
        var layerInfo = this.findLayerInfoById(this.id + '_' + subLayerIndex);
        if(this._isGroupLayerBySubId(subLayerIndex)) {
          //add all subLayer of group layer.
          layerInfo.traversal(function(subLayerInfo) {
            tempVisibleLayers.push(subLayerInfo.originOperLayer.mapService.subId);
          });
        } else {
          // add all parent layers of no-group layer.
          while(layerInfo &&
                layerInfo.originOperLayer.mapService) {
            tempVisibleLayers.push(layerInfo.originOperLayer.mapService.subId);
            layerInfo = layerInfo.parentLayerInfo;
          }
        }
      }, this);

      // remove repetitions.
      array.forEach(tempVisibleLayers, function(subLayerIndex) {
        if(result.visibleLayersForUpdateSubLayerVisible.indexOf(subLayerIndex) < 0) {
          result.visibleLayersForUpdateSubLayerVisible.push(subLayerIndex);
        }
      }, this);

      // remove group layer
      array.forEach(result.visibleLayersForUpdateSubLayerVisible, function(subLayerIndex) {
        if(!this._isGroupLayerBySubId(subLayerIndex)) {
          result.visibleLayersForSetVisibleLayers.push(subLayerIndex);
        }
      }, this);

      return result;
    }

  });
});