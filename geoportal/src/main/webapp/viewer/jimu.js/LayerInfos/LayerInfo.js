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
  'dojo/promise/all',
  //'./NlsStrings',
  'dojo/dom-construct',
  'dojo/topic',
  'dojo/aspect',
  'dojo/Evented',
  //'dojo/request/xhr',
  'dojo/request/script',
  'jimu/portalUrlUtils',
  'jimu/portalUtils',
  'jimu/LayerNode',
  'jimu/utils',
  './RequestBuffer',
  'esri/kernel',
  'esri/request'
], function(declare, array, lang, Deferred, all, /*NlsStrings,*/ domConstruct, topic, aspect,
Evented, /*xhr,*/ scriptRequest, portalUrlUtils, portalUtils, LayerNode, jimuUtils, RequestBuffer, esriNS, esriRequest) {
  var clazz = declare([Evented], {
    declaredClass:            "jimu.LayerInfo",
    originOperLayer:          null,
    layerObject:              null,
    map:                      null,
    title:                    null,
    id:                       null,
    subId:                    null,
    newSubLayers:             null,
    parentLayerInfo:          null,
    isTable:                  null,
    isTiled:                  null,
    _oldIsShowInMap:          null,
    _oldFilter:               null,
    _eventHandles:            null,
    _subLayerInfoIndex:       null,
    _serviceDefinitionBuffer: null,
    _flag:                    null,
    _objectId:                null,
    _itemInfo:                null,
    _adaptor:                 null,

    constructor: function(operLayer, map, layerInfoFactory, layerInfos) {
      this.originOperLayer = operLayer;
      this.layerObject = operLayer.layerObject;
      this.map = map;
      this.title = this.originOperLayer.title;
      this.id = this.originOperLayer.id;
      this.subId = this.originOperLayer.subId !== undefined ? this.originOperLayer.subId : this.id;
      this.parentLayerInfo = operLayer.parentLayerInfo ? operLayer.parentLayerInfo : null;
      this.isTable = false;
      this.isTiled = false;
      this._eventHandles = [];
      this._layerInfoFactory = layerInfoFactory;
      this._layerInfos = layerInfos;
      this._flag = {};
      this._objectId = Math.random();
      this._adaptor = new LayerNode(this);
    },

    init: function() {
      // new section
      // the order of methods below cannot be changed.
      this.newSubLayers = this.obtainNewSubLayers();
      // init _subLayerInfoIndex
      this._initSubLayerInfoIndex();
      //this._resetLayerObjectVisiblityBeforeInit();
      this._initVisible();
      if (this.originOperLayer.popupInfo) {
        this.popupVisible = true;
      }
      // init _oldIsShowInMap, must after _initVisible()
      this._oldIsShowInMap = this.isShowInMap();
      // init _oldFilter
      this._initOldFilter();
      // init _serviceDefinitionBuffer
      this._initServiceDefinitionBuffer();

      this._bindEvent();
    },

    _initOldFilter: function() {
      // implemented by sub class.
      this._oldFilter = null;
    },

    _initServiceDefinitionBuffer: function() {
      this._serviceDefinitionBuffer = new RequestBuffer(lang.hitch(this, this._serviceDefinitionRequest));
    },

    // to decide layer display in whitch group, now only has two groups: graphic or nongraphic
    isGraphicLayer: function() {
      var layerIndexesInMap = this._obtainLayerIndexesInMap();
      return layerIndexesInMap.length ? layerIndexesInMap[0].isGraphicLayer : false;
    },

    obtainLayerIndexesInMap: function() {
      return this._obtainLayerIndexesInMap();
    },

    getObjectId: function() {
      return this._objectId;
    },

    // about transparency
    getOpacity: function() {
      var i, opacity = 0;
      for (i = 0; i < this.newSubLayers.length; i++) {
        if (this.newSubLayers[i].layerObject.opacity) {
          opacity = this.newSubLayers[i].layerObject.opacity > opacity ?
                    this.newSubLayers[i].layerObject.opacity :
                    opacity;
        } else {
          return 1;
        }
      }
      return opacity;
    },

    setOpacity: function(opacity) {
      array.forEach(this.newSubLayers, function(subLayer) {
        if (subLayer.layerObject.setOpacity) {
          subLayer.layerObject.setOpacity(opacity);
        }
      });
    },

    // about change layer order.
    moveLayerByIndex: function(index) {
      this.map.reorderLayer(this.layerObject, index);
      //topic.publish('layerInfos/layerReorder');
    },

    //callback(layerInfo){
    // return true;   will interrupte traversal
    // return false;  contiue traversal
    //}
    traversal: function(callback) {
      if(callback(this)) {
        return true;
      }
      var subLayerInfos = this.getSubLayers();
      for(var i = 0; i < subLayerInfos.length; i++) {
        if (subLayerInfos[i].traversal(callback)) {
          return true;
        }
      }
    },

    findLayerInfoById: function(id) {
      // summary:
      //    recursively find LayerInof from all subLayerInfos.
      // description:
      //    return null if does not find.
      var layerInfo = null;
      var i = 0;
      if (this.id && this.id === id) {
        return this;
      } else {
        for(i = 0; i < this.newSubLayers.length; i++) {
          layerInfo = this.newSubLayers[i].findLayerInfoById(id);
          if (layerInfo) {
            break;
          }
        }
        return layerInfo;
      }
    },

    // public function, base calss has only.
    setTopLayerVisible: function(visible) {
      //var oldIsShowInMap = this.isShowInMap();
      this._setTopLayerVisible(visible);
      //this._isShowInMapChanged(oldIsShowInMap);
    },

    _setTopLayerVisible: function(visible) {
      /*jshint unused: false*/
      // implemented by sub class.
    },

    _setSubLayerVisible: function(subLayerId, visible) {
      /*jshint unused: false*/
      // implemented by sub class.
    },

    setLayerVisiblefromTopLayer: function() {
      // implemented by sub class.
    },

    _resetLayerObjectVisiblity: function(/*layerOptions*/) {
      // implemented by sub class.
      // Does not do anything by default.
    },

    // layerOptions: {
    //  id: {
    //        visible: true/false
    //      }
    //  }
    resetLayerObjectVisibility: function(layerOptions) {
      //dos not have the capability to reset visiblility for sublayers.
      var layerOption  = layerOptions ? layerOptions[this.id]: null;
      if(this.isRootLayer() && layerOption) {
        this._resetLayerObjectVisiblity(layerOptions);
      }
    },

    _initVisible: function() {
      // implemented by sub class.
    },

    // about layer visible.
    isVisible: function() {
      return this._visible ? true : false;
    },

    show: function() {
      this._setTopLayerVisible(true);
    },

    hide: function() {
      this._setTopLayerVisible(false);
    },

    //about layer indexes
    //indexes:[{
    //  isGraphicLayer:
    //  index:
    //},{}]
    //
    _obtainLayerIndexesInMap: function() {
      var indexes = [];
      var index;
      index = this._getLayerIndexesInMapByLayerId(this.id);
      if (index) {
        indexes.push(index);
      }
      return indexes;
    },

    _getLayerIndexesInMapByLayerId: function(id) {
      var i;
      for (i = 0; i < this.map.graphicsLayerIds.length; i++) {
        if (this.map.graphicsLayerIds[i] === id) {
          return {
            isGraphicLayer: true,
            index: i
          };
        }
      }

      for (i = 0; i < this.map.layerIds.length; i++) {
        if (this.map.layerIds[i] === id) {
          return {
            isGraphicLayer: false,
            index: i
          };
        }
      }
      return null;
    },


    /*
    _onSubLayerVisibleChange: function(subLayerInfo, visibleFlage, visible) {
      if(this.responseVisibleChangeFlag) {
        subLayerInfo.visible = visible;
        if(visible && this.originOperLayer.featureCollection) {
          this._visible = visible;
        }
      }
      this.responseVisibleChage = true;
    },*/


    _isShowInMapChanged: function() {
      var showInMapChanged = false;
      var newIsShowInMap = this.isShowInMap();
      if(newIsShowInMap === false) {
        //hide map's popup.
        this.map.infoWindow.hide();
      }
      if (this._oldIsShowInMap !== newIsShowInMap) {
        // update _oldIsShowInMap
        this._oldIsShowInMap = newIsShowInMap;
        showInMapChanged = true;
      }
      return showInMapChanged;
    },

    _isShowInMapChanged2: function() {
      // summary:
      //   Judge is show in map changed after contorl from layerInfo.
      // description:
      //   result:
      //     publish 'isShowInMapChanged' event with all changed layerInfos
      var changedLayerInfos = [];
      this.traversal(function(layerInfo) {
        if(layerInfo._isShowInMapChanged()) {
          changedLayerInfos.push(layerInfo);
        }
      });
      topic.publish('layerInfos/layerInfo/isShowInMapChanged', changedLayerInfos);
    },

    /*
    _isShowInMapChanged2: function() {
      // summary:
      //   Judge is show in map changed after contorl from layerInfo.
      // description:
      //   result:
      //     publish 'isShowInMapChanged' event with all changed layerInfos
      var newIsShowInMap = this.isShowInMap();

      if(newIsShowInMap === false) {
        //hide map's popup.
        this.map.infoWindow.hide();
      }
      if (this._oldIsShowInMap !== newIsShowInMap) {
        // update _oldIsShowInMap
        this._oldIsShowInMap = newIsShowInMap;
        // send event
        topic.publish('layerInfos/layerInfo/isShowInMapChanged', [this]);
      }
      array.forEach(this.getSubLayers(), function(subLayerInfo) {
        subLayerInfo._isShowInMapChanged2();
      });
    },
    */

    _visibleChanged: function() {
      var changedLayerInfos = [this];
      topic.publish('layerInfos/layerInfo/visibleChanged', changedLayerInfos);
    },

    _initSubLayerInfoIndex: function() {
      var subLayerInfoIndex = {};
      // for rootLayer only
      if(this.isRootLayer()) {
        this.traversal(function(subLayerInfo) {
          if(!subLayerInfo.isRootLayer()) {
            subLayerInfoIndex[subLayerInfo.subId] = subLayerInfo;
          }
        });
      }
      this._subLayerInfoIndex = subLayerInfoIndex;
    },

    _getLayerInfosObj: function() {
      return this._layerInfos;
    },

    // new section--------------------------------------------------------------------

    obtainNewSubLayers: function( /*operLayer*/ ) {
      //implemented by sub class.
      var newSubLayers = [];
      return newSubLayers;
    },

    createLegendsNode: function() {
      var legendsNode = domConstruct.create("div", {
        "class": "legends-div"
      });
      return legendsNode;
    },

    drawLegends: function(legendsNode, portalUrl) {
      /*jshint unused: false*/
      // implemented by sub class.
    },

    _getLayerTypesOfSupportTable: function() {
      var layerTypesOfSupportTable =
          "FeatureLayer,CSVLayer,Table,ArcGISImageServiceLayer,StreamLayer," +
          "ArcGISImageServiceVectorLayer";
      return layerTypesOfSupportTable;
    },

    _getShowLegendOfWebmap: function() {
      // summary:
      //   get setting of showLegend from webmap defination.
      // description:
      //   return true if 'showLegend' has not been cnfigured in webmp
      return this.originOperLayer.showLegend !== undefined ?
             this.originOperLayer.showLegend : true;
    },

    _needToRenew: function() {
      return false;
    },

    /***************************************************
     * methods for control service definition
     ***************************************************/

    _getServiceDefinition: function() {
      var def = new Deferred();
      def.resolve(null);
      return def;
    },

    _serviceDefinitionRequest: function(url) {
      return this._normalRequest(url, {f: 'json'}, 'json');
    },

    // publicInterFace
    getServiceDefinition: function() {
      return this._getServiceDefinition();
    },

    /***************************************************
     * methods for requests
     ***************************************************/
    _normalRequest: function(url, content, handleAs) {
      var request = esriRequest({
        url: url,
        content: content,
        handleAs: handleAs,
        callbackParamName: 'callback'
      });
      return request;
    },

    //--------------public interface---------------------------
    getLayerObject: function() {
      var def = new Deferred();
      if (this.layerObject) {
        def.resolve(this.layerObject);
      } else {
        def.resolve(null);
      }
      return def;
    },

    getLayerObjectTryUsingFeatureService: function() {
      return this.getLayerObject();
    },

    getSubLayers: function() {
      return this.newSubLayers;
    },

    isLeaf: function() {
      if(this.getSubLayers().length === 0) {
        return true;
      } else {
        return false;
      }
    },

    isRootLayer: function() {
      if(!this.parentLayerInfo) {
        return true;
      } else {
        return false;
      }
    },

    // root layerInfo's level is 0;
    getLayerLevel: function() {
      var level = 0;
      var currentLayerInfo = this;
      while(currentLayerInfo.parentLayerInfo) {
        level++;
        currentLayerInfo = currentLayerInfo.parentLayerInfo;
      }
      return level;
    },

    getRootLayerInfo: function() {
      var rootLayerInfo = this;
      while(rootLayerInfo.parentLayerInfo) {
        rootLayerInfo = rootLayerInfo.parentLayerInfo;
      }

      return rootLayerInfo;
    },

    isShowInMap: function() {
      var isShow = true;
      var currentLayerInfo = this;
      while(currentLayerInfo) {
        isShow = isShow && currentLayerInfo.isVisible();
        currentLayerInfo = currentLayerInfo.parentLayerInfo;
      }
      return isShow;
    },

    getLayerType: function() {
      var layerTypeArray = [null], def = new Deferred();
      if (this.layerObject.declaredClass) {
        layerTypeArray = this.layerObject.declaredClass.split(".");
      }
      def.resolve(layerTypeArray[layerTypeArray.length - 1]);
      return def;
    },

    // getPopupInfoFromWebmap
    getPopupInfo: function() {
      // summary:
      //   get popupInfo from webmap defination.
      // description:
      //   return null directly if the has not configured popupInfo in webmap.
      return this.originOperLayer.popupInfo;
    },

    getPopupInfoFromLayerObject: function() {
      var infoTemplate = this.getInfoTemplate();
      var popupInfo = null;
      if(infoTemplate) {
        popupInfo = infoTemplate.info;
      }
      return popupInfo;
    },

    loadPopupInfo: function() {
      var def = new Deferred();
      this.loadInfoTemplate().then(lang.hitch(this, function(infoTemplate) {
        var popupInfo = null;
        if(infoTemplate) {
          popupInfo = infoTemplate.info;
        }
        def.resolve(popupInfo);
      }));
      return def;
    },

    loadInfoTemplate: function() {
      // summary:
      //   get info template by asyn.
      // description:
      //   load default fields and return default infoTemplate if the layer has no infoTemplate.
      // implemented by sub class.
      var def = new Deferred();
      def.resolve(null);
      return def;
    },

    getInfoTemplate: function() {
      // summary:
      //   get info template.
      // description:
      //   return null directly if the Layer has no infoTemplate.
      // implemented by sub class.
      return null;
    },

    getFilterOfWebmap: function() {
      // summary:
      //   get filter from webmap defination.
      // description:
      //   return null directly if filter has not been configured in webmap.
      return this.originOperLayer.layerDefinition ?
             this.originOperLayer.layerDefinition.definitionExpression :
             null;
    },

    getFilter: function() {
      // summary:
      //   get filter from layerObject.
      // description:
      //   return null if it does not have or cannot get it.
      // implemented by sub class.
      return null;
    },

    setFilter: function(/*layerDefinitionExpression*/) {
      // summary:
      //   set layer definition expression to layerObject.
      // paramtter
      //   layerDefinitionExpression: layer definition expression
      //   set 'null' to delete layer definition expression
      // description:
      //   operation will skip layer if it does not support filter.
      // implemented by sub class.
      // Todo... consider tableInfo, should return a def.
    },

    getShowLegendOfWebmap: function() {
      // summary:
      //   get setting of showLegend from webmap defination.
      // description:
      //   return true if 'showLegend' has not been cnfigured in webmp
      var tempLayerInfo = this;
      var result = true;
      while(tempLayerInfo) {
        result = result && tempLayerInfo._getShowLegendOfWebmap();
        tempLayerInfo = tempLayerInfo.parentLayerInfo;
      }
      return result;
    },

    getUrl: function() {
      return this.layerObject.url || this.layerObject._url;
    },

    // search types on all sublayers by recursion
    // be used to layerInfoDijit.
    hasLayerTypes: function(types) {
      /*jshint unused: false*/
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

        if(!layerObject) {
          resultValue.isSupportQuery = false;
        } else if(this.parentLayerInfo && this.parentLayerInfo.isMapNotesLayerInfo()) {
          resultValue.isSupportQuery = false;
        } else if (!layerObject.url ||
                   (layerObject.capabilities &&
                    layerObject.capabilities.indexOf &&
                    layerObject.capabilities.indexOf("Query") >= 0)) {
          resultValue.isSupportQuery = true;
        }

        def.resolve(resultValue);
      }), function() {
        def.resolve(resultValue);
      });
      return def;
    },

    // summary:
    //   get related tableInfo array
    // parameters:
    //   relationshipRole: optional
    //       "esriRelRoleOrigin"
    //       "esriRelRoleDestination"
    getRelatedTableInfoArray: function(relationshipRole) {
      /*jshint unused: false*/
      var def = new Deferred();
      def.resolve([]);
      return def;
    },

    removeSubLayerById: function(id) {
      var tempSubLayerInfos = [];
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        if(subLayerInfo.id !== id) {
          tempSubLayerInfos.push(subLayerInfo);
        } else {
          subLayerInfo.destroy();
        }
      });
      this.newSubLayers = tempSubLayerInfos;
    },

    releaseResource: function() {
      array.forEach(this._eventHandles, function(eventHandle) {
        eventHandle.remove();
      });
      // destroy labelLayer and relatedLabelLayer
      this.destroyLabelLayer();
      // destroy layerInfo adaptor
      if(this._adaptor) {
        this._adaptor.destroy();
      }
    },

    destroy: function() {
      // After root traversal for destroy.
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        subLayerInfo.destroy();
      });
      this.releaseResource();
      this.inherited(arguments);
    },

    update: function() {
      // destory all subLayerInfos
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        subLayerInfo.destroy();
      });
      // release releaseResource
      this.releaseResource();
      // init
      this.init();
    },

    isMapNotesLayerInfo: function() {
      // summary:
      //    is map notes layerInfo means that layerInfo is root of map notes.
      var isMapNotesLayerInfo;
      if (this.originOperLayer.featureCollection &&
        this.id.indexOf("mapNotes_") === 0 &&
        this.originOperLayer.layerType === "ArcGISFeatureLayer" &&
        !this.map.getLayer(this.id)) {
        isMapNotesLayerInfo = true;
      } else {
        isMapNotesLayerInfo = false;
      }
      return isMapNotesLayerInfo;
    },

    /********************************************
     * methods for control extent and scale range
     ********************************************/

    /*
    _getUnionExtentForLayers: function(layerInfos) {
      var extent = null;
      var _extentDefs = [];
      array.forEach(layerInfos, function(layerInfo) {
        _extentDefs.push(layerInfo._getExtent());
      }, this);

      return all(_extentDefs).then(lang.hitch(this, function(extents) {
        array.forEach(extents, function(ext) {
          if(ext) {
            extent = extent ? extent.union(ext) : ext;
          }
        }, this);
        return extent;
      }));
    },
    */

    _getExtent: function() {
      // default extent
      var def = new Deferred();
      def.resolve(this.layerObject.fullExtent || this.layerObject.initialExtent);
      return def;
    },

    getExtent: function() {
      var def = new Deferred();
      this._getExtent().then(lang.hitch(this, function(_extent) {
        jimuUtils.projectToMapSpatialReference(this.map, _extent).then(lang.hitch(this, function(extent) {
          def.resolve(extent);
        }), lang.hitch(this, function() {
          def.resolve(null);
        }));
      }), lang.hitch(this, function() {
        def.resolve(null);
      }));
      return def;
    },

    zoomTo: function(extentParam) {
      var def;
      if(extentParam) {
        def = jimuUtils.projectToMapSpatialReference(this.map, extentParam).then(lang.hitch(this, function(extent) {
          return this._zoomTo(extent);
        }));
      } else {
        def = this.getExtent().then(lang.hitch(this, function(extent) {
          return this._zoomTo(extent);
        }));
      }
      return def;
    },

    _zoomTo: function(extentParam) {
      if(!jimuUtils.isValidExtent(extentParam)) {
        return;
      }
      var extent = lang.clone(extentParam);
      var layerScaleRange = this.getLayerScaleRange();
      var minScale = layerScaleRange.minScale;
      var maxScale = layerScaleRange.maxScale;

      if(extent.isSinglePoint) {
        /*
        var mapScale = this.map.getScale();
        var targetScale;
        if ((minScale > 0 && mapScale > minScale)) {
          targetScale = jimuUtils.getMedianScale(this.map, minScale, maxScale);
        } else if ((mapScale < maxScale)) {
          targetScale = jimuUtils.getScaleForNextTileLevel(this.map, maxScale, false);
        } else {
          targetScale = jimuUtils.getMedianScale(this.map, mapScale, maxScale);
        }
        if(targetScale) {
          // if targetScale is null, means there is no sclae can display point.
          extent = jimuUtils.adjustHeightToAspectRatio(this.map, extent);
          extent = jimuUtils.getExtentForScale(extent, this.map.width, targetScale);
          this.map.setExtent(extent);
        }
        */
        var targetScale = jimuUtils.getTargetScale(this.map, 3, minScale, maxScale);
        if(targetScale) {
          extent = jimuUtils.adjustHeightToAspectRatio(this.map, extent);
          extent = jimuUtils.getExtentForScale(extent, this.map.width, targetScale);
          this.map.setExtent(extent);
        }
      } else {
        extent = jimuUtils.adjustExtentToAspectRatio(this.map, extent);
        var expectScale = jimuUtils.getScaleForExtent(extent, this.map.width);
        if (minScale > 0 && expectScale > minScale) {
          // zoom in
          minScale = jimuUtils.getScaleForNextTileLevel(this.map, minScale, true);
          extent = jimuUtils.adjustHeightToAspectRatio(this.map, extent);
          extent = jimuUtils.getExtentForScale(extent, this.map.width, minScale);
          this.map.setExtent(extent);
        } else if (expectScale < maxScale) {
          // zoom out
          maxScale = jimuUtils.getScaleForNextTileLevel(this.map, maxScale, false);
          extent = jimuUtils.adjustHeightToAspectRatio(this.map, extent);
          extent = jimuUtils.getExtentForScale(extent, this.map.width, maxScale);
          this.map.setExtent(extent);
        } else {
          this.map.setExtent(extent, true);
        }
      }

    },

    mergeScale: function(minScale1, maxScale1, minScale2, maxScale2) {
      var minScale = 0, maxScale = 0;
      if (minScale1 === 0 && minScale2 > 0) {
        minScale = minScale2;
      } else if (minScale1 > 0 && minScale2 === 0) {
        minScale = minScale1;
      } else if (minScale1 > 0 && minScale2 > 0) {
        minScale = Math.min(minScale1, minScale2);
      }
      maxScale = Math.max(maxScale1, maxScale2);

      return {
        minScale: minScale,
        maxScale: maxScale
      };
    },

    unionScale: function(minScale1, maxScale1, minScale2, maxScale2) {
      var minScale = 0, maxScale = 0;
      if (minScale1 === 0 || minScale2 === 0) {
        minScale = 0;
      } else {
        minScale = Math.max(minScale1, minScale2);
      }
      maxScale = Math.min(maxScale1, maxScale2);

      return {
        minScale: minScale,
        maxScale: maxScale
      };
    },

    getScaleRange: function() {
      var scaleRange;
      if(this.layerObject &&
         (this.layerObject.minScale >= 0) &&
         (this.layerObject.maxScale >= 0)) {
        scaleRange = {
          minScale: this.layerObject.minScale,
          maxScale: this.layerObject.maxScale
        };
      } else {
        scaleRange = {
          minScale: 0,
          maxScale: 0
        };
      }
      return scaleRange;
    },

    getLayerScaleRange: function() {
      // get scale range that considers all subLayers

      var subLayersScaleRange;
      var rootLayerScaleRange = this.getScaleRange();
      var layerScaleRange;

      this.traversal(lang.hitch(this, function(layerInfo) {
        if(layerInfo.id !== this.id) {
          var scaleRange = layerInfo.getScaleRange();
          subLayersScaleRange = subLayersScaleRange ?
                                this.unionScale(subLayersScaleRange.minScale,
                                                subLayersScaleRange.maxScale,
                                                scaleRange.minScale,
                                                scaleRange.maxScale) :
                                scaleRange;
        }
      }));

      if(subLayersScaleRange) {
        layerScaleRange = this.mergeScale(rootLayerScaleRange.minScale,
                                          rootLayerScaleRange.maxScale,
                                          subLayersScaleRange.minScale,
                                          subLayersScaleRange.maxScale);
      } else {
        layerScaleRange = rootLayerScaleRange;
      }
      return layerScaleRange;
    },

    isCurrentScaleInTheScaleRange: function() {
      var scaleRange = this.getScaleRange();
      var mapScale = this.map.getScale();
      var isInTheScaleRange;
      if((scaleRange.minScale === 0) && (scaleRange.maxScale === 0)) {
        isInTheScaleRange = true;
      } else {
        if((scaleRange.minScale === 0 ? true : scaleRange.minScale >= mapScale) &&
           (scaleRange.maxScale === 0 ? true : mapScale >= scaleRange.maxScale)) {
          isInTheScaleRange = true;
        } else {
          isInTheScaleRange = false;
        }
      }
      return isInTheScaleRange;
    },

    isInScale: function() {
      var isInScale = true;
      var currentLayerInfo = this;
      while(currentLayerInfo) {
        isInScale = currentLayerInfo.isCurrentScaleInTheScaleRange();
        currentLayerInfo = currentLayerInfo.parentLayerInfo;
        if(!isInScale) {
          break;
        }
      }
      return isInScale;
    },

    enablePopup: function() {
      // implemented by sub class.
    },

    disablePopup: function() {
      // implemented by sub class.
    },

    isPopupEnabled: function() {
      // implemented by sub class.
      // default reture false;
      return false;
    },


    // summary:
    //   get capabilities that defined in the webmap
    // descriptors:
    //   return null if no capabilities.
    getCapabilitiesOfWebMap: function() {
      return this.originOperLayer.capabilities;
    },

    // returns basicItemInfo if the layer is added from an item of Portal.
    // there is _wabProperties.itemInfo attribute of LayerObject which is added by widget's
    // result (such as Analysis)
    isItemLayer: function() {
      return this._getBasicItemInfo();
    },

    isPublicService: function() {
      var retDef = new Deferred();
      var url = this.getUrl() + '?f=json';
      /*
      if(url) {
        url = portalUrlUtils.removeProtocol(url);
        xhr(url, {
          handleAs: 'json',
          headers: {'X-Requested-With': null}
        }).then(lang.hitch(this, function(response) {
          var error = response && response.error;
          //{error: {code: 499, "message": "Token Required", "details":[]}
          if(error) {
            retDef.resolve(false);
          } else {
            retDef.resolve(true);
          }
        }), lang.hitch(this, function() {
          retDef.resolve(false);
        }));
      } else {
        retDef.resolve(true);
      }
      */
      if(url) {
        var appProtocol = portalUrlUtils.getProtocol(window.location.href);
        if(appProtocol === "https") {
          url = portalUrlUtils.setHttpsProtocol(url);
        }
        // consider the situation of some hosted service might https only.
        //url = portalUrlUtils.removeProtocol(url);
        scriptRequest.get(url, {
          jsonp: "callback"
        }).then(lang.hitch(this, function(response) {
          var error = response && response.error;
          if(error) {
            retDef.resolve(false);
          } else {
            retDef.resolve(true);
          }
        }), lang.hitch(this, function() {
          retDef.resolve(false);
        }));
      } else {
        retDef.resolve(true);
      }
      return retDef;
    },

    isEditable: function() {
      var isEditable = false;
      var hasEditPrivilege = true;

      var portal = portalUtils.getPortal(window.portalUrl);
      var isPublicServiceDef = this.isPublicService();
      var retDef = new Deferred();
      var userDef = new Deferred();
      portal.getUser().then(lang.hitch(this, function(user) {
        userDef.resolve(user);
      }), lang.hitch(this, function() {
        userDef.resolve(null);
      }));

      all({
        user: userDef,
        isPublicService: isPublicServiceDef
      }).then(lang.hitch(this, function(result) {
        var userPrivileges = result.user && result.user.privileges;
        var isPublicService = result.isPublicService;

        if (userPrivileges &&
            array.indexOf(userPrivileges, "features:user:edit") === -1 &&
            esriNS.id &&
            !isPublicService) {
          // user no 'edit-privilige' doesn't have permission to edit non-public layers
          // other all conditions have permission to edit layers, this logic same as js-api, but it
          // cannot addrees the below situation:
          // for a non-public layer (layer has credential):
          //   1, longin user who without edit privilege does not have editing permission.
          //   2, anonymous user has permission to edit this non-public layer (layer has credential).
          hasEditPrivilege = false;
        }

        if(this.layerObject && this.layerObject.isEditable) {
          if(this.layerObject.isEditable() && hasEditPrivilege) {
            isEditable = true;
          } else {
            isEditable = false;
          }
          /* else if(layerObject.userIsAdmin) {
           // not sure whether need to check the layerObject.userIsAdmin
            isEditable = true;
          }*/
        } else {
          isEditable = false;
        }
        retDef.resolve(isEditable);
      }), lang.hitch(this, function() {
        retDef.resolve(false);
      }));

      return retDef;
    },

    // basicItemInfo = {
    //   portalUrl:
    //   itemId:
    // }
    _getBasicItemInfo: function() {
      var basicItemInfo = null;
      var rootLayerInfo = this.getRootLayerInfo();
      var appConfig = window.appConfig || window.getAppConfig();
      var itemLayerInfoInLayerObject = lang.getObject("_wabProperties.itemLayerInfo", false, rootLayerInfo.layerObject);
      if(rootLayerInfo.originOperLayer.itemId) {
        basicItemInfo = {};
        basicItemInfo.itemId = rootLayerInfo.originOperLayer.itemId;
        basicItemInfo.portalUrl = portalUrlUtils.getStandardPortalUrl(appConfig.map.portalUrl || appConfig.portalUrl);
      } else if(itemLayerInfoInLayerObject &&
                itemLayerInfoInLayerObject.portalUrl &&
                itemLayerInfoInLayerObject.itemId){
        basicItemInfo = {};
        basicItemInfo.itemId = itemLayerInfoInLayerObject.itemId;
        basicItemInfo.portalUrl = portalUrlUtils.getStandardPortalUrl(itemLayerInfoInLayerObject.portalUrl);
      }
      return basicItemInfo;
    },

    getItemInfo: function() {
      // summary:
      //   get itemInfo by asyn.
      // description:
      //   return a itemInfo object.
      //   return null if layer is not a itemLayer.
      var itemInfoDef = new Deferred();
      var rootLayerInfo = this.getRootLayerInfo();
      if(rootLayerInfo.isItemLayer()) {
        if(!rootLayerInfo._itemInfo) {
          rootLayerInfo._itemInfo = new clazz.ItemInfo(this, rootLayerInfo);
        }
        rootLayerInfo._itemInfo.onLoad().then(lang.hitch(this, function() {
          itemInfoDef.resolve(rootLayerInfo._itemInfo);
        }), lang.hitch(this, function() {
          itemInfoDef.resolve(null);
        }));
      } else {
        itemInfoDef.resolve(null);
      }
      return itemInfoDef;
    },

    isHostedService: function() {
      var def = new Deferred();
      this._getServiceDefinition().then(lang.hitch(this, function(serviceDefinition) {
        var isHostedService;
        if(serviceDefinition && serviceDefinition.serviceItemId) {
          isHostedService = true;
        } else {
          isHostedService = false;
        }
        def.resolve(isHostedService);
      }));

      return def;
    },

    isHostedLayer: function() {
      var def;
      if(this.isItemLayer()) {
        def = this.isHostedService();
      } else {
        def = new Deferred();
        def.resolve(false);
      }

      return def;
    },

    // control labels
    obtainLabelControl: function() {
      // implemented by sub class.
    },

    restoreLabelControl: function() {
      // implemented by sub class.
    },

    destroyRealtedLabelLayer: function() {
      // implemented by sub class.
    },

    destroyLabelLayer: function() {
      // implemented by sub class.
    },

    canShowLabel: function() {
      // implemented by sub class.
    },

    isShowLabels: function() {
      // implemented by sub class.
    },

    showLabels: function() {
      // implemented by sub class.
    },

    hideLabels: function() {
      // implemented by sub class.
    },

    /****************
     * Event
     ***************/
    emitEvent: function() {
      try {
        this.emit.apply(this, arguments);
        if(this._adaptor) {
          this._adaptor.emitEvent.apply(this._adaptor, arguments);
        }
      } catch (err) {
        console.error(err);
      }
    },

    _bindEvent: function() {
      var handle;
      if(this.layerObject && !this.layerObject.empty) {
        // bind visibilit-change event
        handle = this.layerObject.on('visibility-change',
                                     lang.hitch(this, this._onVisibilityChanged));
        this._eventHandles.push(handle);

        // bind filter change event
        handle = aspect.after(this.layerObject,
                               'setDefinitionExpression',
                               lang.hitch(this, this._onFilterChanged));
        this._eventHandles.push(handle);

        // setRenderer event, just for the layer that has 'setRenderer' method.
        handle = aspect.after(this.layerObject,
                              'setRenderer',
                              lang.hitch(this, this._onRendererChanged));
        this._eventHandles.push(handle);

        // bind opacity-change event, just for root layer.
        if(this.isRootLayer()) {
          handle = this.layerObject.on('opacity-change',
                                       lang.hitch(this, this._onOpacityChanged));
          this._eventHandles.push(handle);
        }

        // bind time extent change event when map's time extend has been changed. just for root layer.
        if(this.isRootLayer()) {
          handle = this.map.on('time-extent-change', lang.hitch(this, function() {
            if(this.layerObject && this.layerObject.useMapTime) {
              this._onTimeExtentChanged();
            }
          }));
          this._eventHandles.push(handle);
        }

        // bind time extent change event. just for root layer.
        if(this.isRootLayer()) {
          handle = aspect.after(this.layerObject, 'setTimeDefinition', lang.hitch(this, function() {
            if(this.layerObject &&
               this.layerObject.timeInfo &&
               this.layerObject.mode === esri.layers.FeatureLayer.MODE_SNAPSHOT) { //jshint ignore: line
              this._onTimeExtentChanged();
            }
          }));
          this._eventHandles.push(handle);
        }
      }
    },

    _onVisibilityChanged: function() {
      //var oldVisible = this._visible;
      // updte visible
      this._initVisible();

      // send event
      this._visibleChanged();
      //_isShowInMapChanged2 is dependent on _visible,
      // so muse update _visible(useing this._initVisible) at before
      this._isShowInMapChanged2();
    },

    _onFilterChanged: function() {
      var oldFilter = this._oldFilter ? this._oldFilter : null;
      var currentFilter = this.layerObject.getDefinitionExpression();
      currentFilter = currentFilter ? currentFilter : null;

      if(oldFilter !== currentFilter) {
        topic.publish('layerInfos/layerInfo/filterChanged', [this]);
        // update old layerDefinitions
        this._oldFilter = currentFilter;
      }
    },

    _onRendererChanged: function() {
      var changedLayerInfos = [this];
      topic.publish('layerInfos/layerInfo/rendererChanged', changedLayerInfos);
    },

    _onOpacityChanged: function() {
      var changedLayerInfos = [this];
      topic.publish('layerInfos/layerInfo/opacityChanged', changedLayerInfos);
    },

    _onTimeExtentChanged: function() {
      var changedLayerInfos = [];
      var subServiceDefinitionDefs = [];
      this.traversal(function(layerInfo) {
        var def = layerInfo.getServiceDefinition().then(function(serviceDefinition) {
          if(serviceDefinition && serviceDefinition.timeInfo) {
            changedLayerInfos.push(layerInfo);
          }
          //todo... need to sync 'time extent' to subLayerObject
        });
        subServiceDefinitionDefs.push(def);
      });

      all(subServiceDefinitionDefs).then(lang.hitch(this, function() {
        topic.publish('layerInfos/layerInfo/timeExtentChanged', changedLayerInfos);
      }));
    }
  });

  clazz.ItemInfo = declare(null, {
    _currentLayerInfo:  null,
    _rootLayerInfo:     null,
    _portalUrl:         null,
    _itemId:            null,
    _item:              null,
    _itemData:          null,
    _serviceDefinition: null,
    _itemInfoLoadedDef: null,

    constructor: function(currentLayerInfo, rootLayerInfo) {
      this._currentLayerInfo = currentLayerInfo;
      this._rootLayerInfo    = rootLayerInfo;
      this._loadResource();
    },

    _loadResource: function() {
      this._itemInfoLoadedDef = new Deferred();
      var basicItemInfo = this._rootLayerInfo.isItemLayer();
      if(basicItemInfo) {
        this._portalUrl = basicItemInfo.portalUrl;
        this._itemId = basicItemInfo.itemId;
        var portal = portalUtils.getPortal(this._portalUrl);
        var itemDef = portal.getItemById(this._itemId);
        var itemDataDef = portal.getItemData(this._itemId);
        var serviceDefinitionDef = this._currentLayerInfo._getServiceDefinition();
        all({
          item: itemDef,
          itemData: itemDataDef,
          serviceDefinition: serviceDefinitionDef
        }).then(lang.hitch(this, function(result) {
          this._item = result.item;
          this._itemData = result.itemData;
          this._serviceDefinition = result.serviceDefinition;
          this._itemInfoLoadedDef.resolve(this);
        }), lang.hitch(this, function(error) {
          if(error && error.message) {
            console.log(error.message);
          }
          this._itemInfoLoadedDef.reject();
        }));
      } else {
        this._itemInfoLoadedDef.reject();
      }
    },

    onLoad: function() {
      return this._itemInfoLoadedDef;
    },

    getPortalUrl: function() {
      return this._portalUrl;
    },

    getItemId: function() {
      return this._itemId;
    },

    getItem: function() {
      return this._item;
    },

    getItemData: function() {
      return this._itemData;
    },

    isHostedLayer: function() {
      var isHostedLayer;
      if(this._serviceDefinition && this._serviceDefinition.serviceItemId) {
        isHostedLayer = true;
      } else {
        isHostedLayer = false;
      }
      return isHostedLayer;
    }

  });

  return clazz;
});
