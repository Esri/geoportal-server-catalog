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
  'dojo/promise/all',
  //'./NlsStrings',
  'dojo/dom-construct',
  'dojo/topic',
  'esri/config',
  'esri/tasks/ProjectParameters',
  'esri/SpatialReference',
  'esri/geometry/webMercatorUtils'
], function(declare, array, lang, Deferred, all,
/*NlsStrings,*/ domConstruct, topic, esriConfig, ProjectParameters,
SpatialReference, webMercatorUtils) {
  return declare(null, {
    originOperLayer: null,
    layerObject:     null,
    map:             null,
    title:           null,
    id:              null,
    newSubLayers:    null,
    parentLayerInfo: null,
    _oldIsShowInMap: null,
    _eventHandles:   null,

    constructor: function(operLayer, map, options) {
      this.originOperLayer = operLayer;
      this.layerObject = operLayer.layerObject;
      this.map = map;
      this.title = this.originOperLayer.title;
      this.id = this.originOperLayer.id;
      this._layerOption = options.layerOptions ? options.layerOptions[this.id]: null;
      this.parentLayerInfo = operLayer.parentLayerInfo ? operLayer.parentLayerInfo : null;
      this.nls = window.jimuNls.layerInfosMenu;
      this._eventHandles = [];
    },

    init: function() {
      // new section
      // the order in init method can not changed.
      this.newSubLayers = this.obtainNewSubLayers();
      this._resetLayerObjectVisiblityBeforeInit();
      this.initVisible();
      if (this.originOperLayer.popupInfo) {
        this.popupVisible = true;
      }
      // init _oldIsShowInMap, must after initVisible()
      this._oldIsShowInMap = this.isShowInMap();
      this._bindEvent();
    },

    // to decide layer display in whitch group, now only has two groups: graphic or nographic
    isGraphicLayer: function() {
      var layerIndexesInMap = this._obtainLayerIndexesInMap();
      // to decide layer display in whitch group, now only has two groups: graphic or nographic
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
    moveLeftOfIndex: function(index) {
      this.map.reorderLayer(this.layerObject, index);
    },

    // *************** need to refactor.
    moveRightOfIndex: function(index) {
      this.map.reorderLayer(this.layerObject, index);
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

    setSubLayerVisible: function(subLayerId, visible) {
      /*jshint unused: false*/
      // implemented by sub class.
    },

    setLayerVisiblefromTopLayer: function() {
      // implemented by sub class.
    },

    _resetLayerObjectVisiblityBeforeInit: function() {
      // implemented by sub class.
      // Does not do anything by default.
    },

    initVisible: function() {
      // implemented by sub class.
    },

    // about layer visible.
    isVisible: function() {
      return this._visible;
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


    _isShowInMapChanged: function(oldIsShowInMap) {
      // summary:
      //   Judge is show in map changed after contorl from layerInfo.
      // description:
      //   paramerter:
      //     oldIsShowInMap
      //   result:
      //     publish 'isShowInMapChanged' event with all changed layers, if
      //     current layer is changed.
      //     all sublayer will changed if current layer is changed.
      var newIsShowInMap = this.isShowInMap();
      if (oldIsShowInMap === newIsShowInMap) {
        return;
      } else if(newIsShowInMap === false) {
        //hide map's popup.
        this.map.infoWindow.hide();
      }
      var changedLayerInfos = [];
      this.traversal(function(layerInfo) {
        changedLayerInfos.push(layerInfo);
      });
      topic.publish('layerInfos/layerInfo/isShowInMapChanged', changedLayerInfos);
    },

    _isShowInMapChanged2: function() {
      var newIsShowInMap = this.isShowInMap();
      // if (this._oldIsShowInMap === newIsShowInMap) {
      //   return;
      // } else if(newIsShowInMap === false) {
      //   //hide map's popup.
      //   this.map.infoWindow.hide();
      // }

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

    _visibleChanged: function() {
      var changedLayerInfos = [this];
      topic.publish('layerInfos/layerInfo/visibleChanged', changedLayerInfos);
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

    // return itemId if the layer is added from an item of Portal.
    // there is _itemId attribute of LayerObject which is added by widget's
    // result(such as Analysis)
    _isItemLayer: function() {
      return this.originOperLayer.itemId || this.layerObject._itemId;
    },

    _getShowLegendOfWebmap: function() {
      // summary:
      //   get setting of showLegend from webmap defination.
      // description:
      //   return true if 'showLegend' has not been cnfigured in webmp
      return this.originOperLayer.showLegend !== undefined ?
             this.originOperLayer.showLegend : true;
    },
    //--------------public interface---------------------------
    getLayerObject: function() {
      var def = new Deferred();
      if (this.layerObject) {
        def.resolve(this.layerObject);
      } else {
        def.reject("layerObject is null");
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
      //   return null directly if has not configured filter in webmap.
      return this.originOperLayer.layerDefinition ?
             this.originOperLayer.layerDefinition.definitionExpression :
             null;
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
      return this.layerObject.url;
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

    getRelatedTableInfoArray: function() {
      var def = new Deferred();
      def.resolve([]);
      return def;
    },

    removeSubLayerById: function(id) {
      var tempSubLayerInfos = [];
      array.forEach(this.newSubLayers, function(subLayerInfo) {
        if(subLayerInfo.id !== id) {
          tempSubLayerInfos.push(subLayerInfo);
        }
      });
      this.newSubLayers = tempSubLayerInfos;
    },

    destroy: function() {
      array.forEach(this._eventHandles, function(eventHandle) {
        eventHandle.remove();
      });
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

    /****************
     * Event
     ***************/
    _bindEvent: function() {
      if(this.layerObject && !this.layerObject.empty) {
        var handle = this.layerObject.on('visibility-change',
                                     lang.hitch(this, this._onVisibilityChanged));
        this._eventHandles.push(handle);
      }
    },

    _onVisibilityChanged: function() {
      //var oldVisible = this._visible;
      // updte visible
      this.initVisible();

      // send event
      this._visibleChanged();
      //_isShowInMapChanged2 is dependent on _visible,
      // so muse update _visible(useing this.initVisible) at before
      this._isShowInMapChanged2();
    }
  });
});
