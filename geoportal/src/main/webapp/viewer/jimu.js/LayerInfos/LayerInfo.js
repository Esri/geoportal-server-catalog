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
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/promise/all',
  //'./NlsStrings',
  'dojo/dom-construct',
  'dojo/topic',
  'dojo/aspect',
  'jimu/portalUrlUtils',
  'jimu/portalUtils',
  './RequestBuffer',
  'esri/request',
  'esri/config',
  'esri/tasks/ProjectParameters',
  'esri/SpatialReference',
  'esri/geometry/webMercatorUtils'
], function(declare, array, lang, Deferred, all, /*NlsStrings,*/ domConstruct, topic, aspect,
portalUrlUtils, portalUtils, RequestBuffer, esriRequest, esriConfig, ProjectParameters,
SpatialReference, webMercatorUtils) {
  var clazz = declare(null, {
    originOperLayer:          null,
    layerObject:              null,
    map:                      null,
    title:                    null,
    id:                       null,
    subId:                    null,
    newSubLayers:             null,
    parentLayerInfo:          null,
    _oldIsShowInMap:          null,
    _oldFilter:               null,
    _eventHandles:            null,
    _subLayerInfoIndex:       null,
    _serviceDefinitionBuffer: null,

    constructor: function(operLayer, map, layerInfoFactory, layerInfosInstanceWrap) {
      this.originOperLayer = operLayer;
      this.layerObject = operLayer.layerObject;
      this.map = map;
      this.title = this.originOperLayer.title;
      this.id = this.originOperLayer.id;
      this.subId = this.originOperLayer.subId !== undefined ? this.originOperLayer.subId : this.id;
      this.parentLayerInfo = operLayer.parentLayerInfo ? operLayer.parentLayerInfo : null;
      this._eventHandles = [];
      this._layerInfoFactory = layerInfoFactory;
      this._layerInfosInstanceWrap = layerInfosInstanceWrap;
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

    getExtent: function() {
      // implemented by sub class.
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
      //    recursion find LayerInof in subLayerInfos.
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
      if(this.isRootLayer && layerOption) {
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

    _convertGeometryToMapSpatialRef: function(geometry) {
      /*
      if (this.map.spatialReference.isWebMercator()) {
        if (!geometry.spatialReference.isWebMercator()) {
          return webMercatorUtils.geographicToWebMercator(geometry);
        }
      } else {
        if (geometry.spatialReference.isWebMercator()) {
          return webMercatorUtils.webMercatorToGeographic(geometry);
        }
      }
      return geometry;
      */
      var def = new Deferred();
      if (this.map.spatialReference.equals(geometry.spatialReference)) {
        def.resolve([geometry]);
        return def;
      }
      if (this.map.spatialReference.isWebMercator() &&
          geometry.spatialReference.equals(new SpatialReference(4326))) {
        def.resolve([webMercatorUtils.geographicToWebMercator(geometry)]);
        return def;
      }
      if (this.map.spatialReference.equals(new SpatialReference(4326)) &&
          geometry.spatialReference.isWebMercator()) {
        def.resolve([webMercatorUtils.webMercatorToGeographic(geometry)]);
        return def;
      }
      var params = new ProjectParameters();
      params.geometries = [geometry];
      params.outSR = this.map.spatialReference;
      return esriConfig.defaults.geometryService.project(params);
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
      return this._layerInfosInstanceWrap.layerInfos;
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

    // now it is used for Attribute.
    getPopupInfo: function() {
      // summary:
      //   get popupInfo from webmap defination.
      // description:
      //   return null directly if the has not configured popupInfo in webmap.
      return this.originOperLayer.popupInfo;
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
      //   return null if does not have or cannot get it.
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
      //   operation will skip if layer not support filter.
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
                   (layerObject.capabilities && layerObject.capabilities.indexOf("Query") >= 0)) {
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
          subLayerInfo.destroyLayerInfo();
        }
      });
      this.newSubLayers = tempSubLayerInfos;
    },

    destroy: function() {
      array.forEach(this._eventHandles, function(eventHandle) {
        eventHandle.remove();
      });
      // destroy labelLayer and relatedLabelLayer
      this.destroyLabelLayer();
      this.inherited(arguments);
    },

    destroyLayerInfo: function() {
      // After root traversal for destroy.
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        subLayerInfo.destroyLayerInfo();
      });
      this.destroy();
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

    isCurrentScaleInTheScaleRange: function() {
      var scaleRange = this.getScaleRange();
      var mapScale = this.map.getScale();
      var isInTheScaleRange;
      if((scaleRange.minScale === 0) && (scaleRange.maxScale === 0)) {
        isInTheScaleRange = true;
      } else {
        if((scaleRange.minScale === 0 ? true : scaleRange.minScale > mapScale) &&
           (scaleRange.maxScale === 0 ? true : mapScale > scaleRange.maxScale)) {
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

    // return itemId if the layer is added from an item of Portal.
    // there is _itemId attribute of LayerObject which is added by widget's
    // result(such as Analysis)
    isItemLayer: function() {
      return this.originOperLayer.itemId ||
        lang.getObject("_wabProperties.itemLayerInfo.itemId", false, this.layerObject);
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
        var itemInfo = new clazz.ItemInfo(rootLayerInfo);
        itemInfo.onLoad().then(lang.hitch(this, function() {
          itemInfoDef.resolve(itemInfo);
        }));
      } else {
        itemInfoDef.resolve(null);
      }
      return itemInfoDef;
    },

    /* todo...
    getItemInfoSync: function() {
    },
    */

    // todo ...
    isHostedLayer: function() {
      var def = new Deferred();
      var url = this.getUrl();
      if(url) {
        esriRequest({
          url: url,
          content: {
            f: 'json'
          },
          handleAs: 'json',
          callbackParamName: 'callback'
        }).then(lang.hitch(this, function(layerDefinition) {
          var isHostedLayer;
          if(layerDefinition && layerDefinition.serviceItemId) {
            isHostedLayer = true;
          } else {
            isHostedLayer = false;
          }
          def.resolve(isHostedLayer);
        }));
      } else {
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
    }

  });

  clazz.ItemInfo = declare(null, {
    originItemInfo: null,
    _itemInfoLoadedDef: null,
    _layerDefinition: null,

    constructor: function(layerInfo) {
      this._itemInfoLoadedDef = new Deferred();
      var itemId = layerInfo.isItemLayer();
      if(itemId) {
        var appConfig = window.appConfig || window.getAppConfig();
        var portalUrl =
          portalUrlUtils.getStandardPortalUrl((appConfig && appConfig.map.portalUrl) || window.portalUrl);
        var portal = portalUtils.getPortal(portalUrl);
        var itemInfoDef = portal.getItemById(itemId);
        /*
        var layerDefinitionDef = this._getLayerDefinition();
        all({
          itemInfo: itemInfoDef,
          layerDefinition: layerDefinitionDef
        })
        */

        itemInfoDef.then(lang.hitch(this, function(itemInfo) {
          this.originItemInfo = itemInfo;
          this._itemInfoLoadedDef.resolve(this);
        }), lang.hitch(this, function(error) {
          if(error && error.message) {
            console.log(error.message);
          }
          this._itemInfoLoadedDef.resolve(this);
        }));
      } else {
        this._itemInfoLoadedDef.resolve(this);
      }
    },

    onLoad: function() {
      return this._itemInfoLoadedDef;
    }

    /*
    isHostedLayerSync: function() {
      var isHostedLayer;
      if(this._layerDefinition && this._layerDefinition.serviceItemId) {
        isHostedLayer = true;
      } else {
        isHostedLayer = false;
      }
      return isHostedLayer;
    },

    _getLayerDefinition: function(layerInfo) {
      var request;
      var url = layerInfo.getUrl();
      if(url) {
       request = esriRequest({
          url: url,
          content: {
            f: 'json'
          },
          handleAs: 'json',
          callbackParamName: 'callback'
        });
      } else {
        request = new Deferred();
        request.resolve(null);
      }
      return request;
    }
    */
  });

  return clazz;
});
