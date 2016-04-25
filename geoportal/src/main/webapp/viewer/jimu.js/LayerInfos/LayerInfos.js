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
  'dojo/on',
  'dojo/topic',
  'dojo/_base/unload',
  'dojo/Evented',
  'dojo/promise/all',
  './LayerInfoFactory'
], function(declare, array, lang, Deferred, on, topic,
  baseUnload, Evented, all, LayerInfoFactory) {
  var clazz = declare([Evented], {
    map: null,
    _operLayers: null,
    _layerInfos: null,
    _finalLayerInfos: null,
    _tableInfos: null,
    _finalTableInfos: null,
    _basemapLayers: null,

    constructor: function(map, webmapItemData, options) {
      this._basemapLayers = webmapItemData.baseMap.baseMapLayers;
      this._operLayers = webmapItemData.operationalLayers;
      this.tables = webmapItemData.tables;
      this.map = map;
      this.options = options;
      this._initLayerInfos();
      this._initTablesInfos();
      this.update();
      //aspect.after(this.map, "onBaseChange", lang.hitch(this, this._onBasemapChange));
      //on(this.map, "basemap-change", lang.hitch(this, this._onBasemapChange));
      //topic.subscribe('publishData', lang.hitch(this, this._onReceiveBasemapGalleryeData));
      this._bindEvents();
    },

    update: function() {
      this._extraSetLayerInfos();
      this._clearAddedFlag(this._layerInfos);
      this._initFinalTableInfos();
      this._initFinalLayerInfos(this._layerInfos);
      this._markFirstOrLastNode();
    },

    getLayerInfoArrayOfWebmap: function() {
      var layerInfoArrayOfWebmap = [];
      for(var i = this._layerInfos.length - 1; i >= 0; i--) {
        if(!this._layerInfos[i]._extraOfWebmapLayerInfo) {
          layerInfoArrayOfWebmap.push(this._layerInfos[i]);
        }
      }
      return layerInfoArrayOfWebmap;
    },

    getLayerInfoArray: function() {
      return this._finalLayerInfos;
    },

    getTableInfoArray: function() {
      return this._finalTableInfos;
    },

    addFeatureCollection: function(featureLayers, title) {
      var id = this._getUniqueTopLayerInfoId(title);

      var featureCollection = {
        layers: []
      };
      // set layer id
      array.forEach(featureLayers, function(featureLayer, index) {
        featureLayer.id = id + '_' + index;
        featureCollection.layers.push({
          id: featureLayer.id,
          layerObject: featureLayer
        });
      }, this);

      this.map.addLayers(featureLayers);

      var newLayerInfo;
      try {
        newLayerInfo = LayerInfoFactory.getInstance().create({
          featureCollection: featureCollection,
          title: title || id,
          id: id
        }, this.map);
        newLayerInfo.init();
      } catch (err) {
        console.warn(err.message);
        newLayerInfo = null;
      }

      if(newLayerInfo) {
        newLayerInfo._extraOfWebmapLayerInfo = true;
        this._layerInfos.push(newLayerInfo);
        this.update();
        this._onUpdated();
      }

    },

    addTable: function(table) {
      // summary:
      //    add a table to LayerInfos
      // description:
      //    parameter table = {
      //      id: Optional parameters;
      //      title:
      //      url: alternative with featureCollectionData
      //      featureCollectionData: alternative with url
      //      options: Optional parameters; See options list of FeatureLayer's Constructor from
      //               ArcGIS JavaScript API reference.
      //    }
      var tableInfos = [];
      var tableInfo = this._addTable(table, this._finalTableInfos);
      this._tableInfos.push(tableInfo);
      tableInfos.push(tableInfo);
      this._onTableChange(tableInfos, 'added');
    },

    _addTable: function(table, targetTableInfos) {
      var tableInfo;
      try {
        table.layerObject = {
          url: table.url,
          featureCollectionData: table.featureCollectionData,
          empty: true
        };
        table.id = this._getUniqueTableId(table.id);
        table.selfType = 'table';

        tableInfo = LayerInfoFactory.getInstance().create(table);
        tableInfo.init();
      } catch (err) {
        console.warn(err.message);
        tableInfo = null;
      }
      if (tableInfo && targetTableInfos) {
        targetTableInfos.push(tableInfo);
      }
      return tableInfo;
    },


    _getUniqueTableId: function(id) {
      var tableInfos = this._tableInfos.concat(this._finalTableInfos || []);
      return this._getUniqueLayerOrTableId(id, tableInfos);
    },

    _getUniqueTopLayerInfoId: function(id) {
      return this._getUniqueLayerOrTableId(id, this._finalLayerInfos);
    },

    _getUniqueLayerOrTableId: function(id, layerOrTableInfos) {
      var number = 1;
      var tempId;

      if (!id) {
        id = 'table';
      }
      tempId = id;
      while (true) {
        for (var i = 0; i < layerOrTableInfos.length; i++) {
          if (layerOrTableInfos[i].id === tempId) {
            break;
          }
        }
        if (i === layerOrTableInfos.length) {
          return tempId;
        } else {
          tempId = id + '_' + number.toString();
          number++;
        }
      }
    },

    removeTable: function() {

    },

    //callback(layerInfo){
    // return true;   will interrupte traversal
    // return false;  contiue traversal
    //}
    _traversal: function(callback, layerInfoArray) {
      for (var i = 0; i < layerInfoArray.length; i++) {
        if (layerInfoArray[i].traversal(callback)) {
          return true;
        }
      }
      return false;
    },

    //callback(layerInfo){
    // return true;   will interrupte traversal
    // return false;  contiue traversal
    //}
    traversal: function(callback) {
      var layerInfoArray = this.getLayerInfoArray();
      return this._traversal(callback, layerInfoArray);
    },

    //callback(layerInfo){
    // return true;   will interrupte traversal
    // return false;  contiue traversal
    //}
    traversalLayerInfosOfWebmap: function(callback) {
      var layerInfoArray = this.getLayerInfoArrayOfWebmap();
      return this._traversal(callback, layerInfoArray);
    },

    getLayerInfoById: function(layerId) {
      return this._findLayerInfoById(layerId);
    },

    getLayerInfoByTopLayerId: function(layerId) {
      return this._findTopLayerInfoById(layerId);
    },

    moveUpLayer: function(id) {
      var beChangedId = null,
        tempLayerInfo;
      var index = this._getTopLayerInfoIndexById(id),
        l;
      if (index > 0) {
        l = this._finalLayerInfos[index - 1].obtainLayerIndexesInMap().length;
        this._finalLayerInfos[index].moveRightOfIndex(this._finalLayerInfos[index - 1]
          .obtainLayerIndexesInMap()[l - 1].index);
        beChangedId = this._finalLayerInfos[index - 1].id;
        //this.update();
        tempLayerInfo = this._finalLayerInfos[index];
        this._finalLayerInfos.splice(index, 1);
        this._finalLayerInfos.splice(index - 1, 0, tempLayerInfo);
        this._markFirstOrLastNode();
      }
      return beChangedId;
    },

    moveDownLayer: function(id) {
      var beChangedId = null,
        tempLayerInfo;
      var index = this._getTopLayerInfoIndexById(id);
      if (index < (this._finalLayerInfos.length - 1)) {
        this._finalLayerInfos[index].moveLeftOfIndex(this._finalLayerInfos[index + 1]
          .obtainLayerIndexesInMap()[0].index);
        beChangedId = this._finalLayerInfos[index + 1].id;
        //this.update();
        tempLayerInfo = this._finalLayerInfos[index + 1];
        this._finalLayerInfos.splice(index + 1, 1);
        this._finalLayerInfos.splice(index, 0, tempLayerInfo);
        this._markFirstOrLastNode();
      }
      return beChangedId;
    },

    getBasemapLayers: function() {
      var basemapLayers = [];
      array.forEach(this.map.layerIds, function(layerId) {
        var layer = this.map.getLayer(layerId);
        if (layer._basemapGalleryLayerType === "basemap" ||
          layer._basemapGalleryLayerType === "reference") {
          basemapLayers.push(layer);
        }
      }, this);

      if (basemapLayers.length === 0) {
        basemapLayers = this._basemapLayers;
      }

      return basemapLayers;
    },

    getMapNotesLayerInfoArray: function() {
      // summary:
      //    get all map notes layerInfos.
      // description:
      //    return value:
      //      the order is opposite of map.graphicsLayerIds
      return array.filter(this.getLayerInfoArray(), function(layerInfo) {
        // var mapNotesCondition = layerInfo.originOperLayer.featureCollection &&
        //   layerInfo.id.indexOf("mapNotes_") === 0 &&
        //   layerInfo.originOperLayer.layerType === "ArcGISFeatureLayer" &&
        //   !this.map.getLayer(layerInfo.id);
        // return mapNotesCondition;
        return layerInfo.isMapNotesLayerInfo();
      }, this);

    },

    _initLayerInfos: function() {
      var layerInfo;
      this._layerInfos = [];
      array.forEach(this._operLayers, function(operLayer) {
        try {
          layerInfo = LayerInfoFactory.getInstance().create(operLayer);
          layerInfo.init();
        } catch (err) {
          console.warn(err.message);
          layerInfo = null;
        }
        if (layerInfo) {
          this._layerInfos.push(layerInfo);
        }
      }, this);
    },

    _extraSetLayerInfos: function() {
      array.forEach(this._layerInfos, function(layerInfo, index) {
        var newLayerInfo;
        if (layerInfo.layerObject.declaredClass === 'esri.layers.GeoRSSLayer' ||
          layerInfo.layerObject.declaredClass === 'esri.layers.KMLLayer') {
          try {
            newLayerInfo = LayerInfoFactory.getInstance().create(layerInfo.originOperLayer);
            newLayerInfo.init();
          } catch (err) {
            console.warn(err.message);
            newLayerInfo = null;
          }
          if (newLayerInfo) {
            //show new
            layerInfo.destroyLayerInfo();
            this._layerInfos[index] = newLayerInfo;
          }
        } else if (layerInfo.originOperLayer.featureCollection) {
          var subLayerIds = [];
          array.forEach(layerInfo.getSubLayers(), function(subLayerInfo) {
            subLayerIds.push(subLayerInfo.id);
          });
          array.forEach(subLayerIds, function(subLayerId) {
            if (!this.map.getLayer(subLayerId)) {
              layerInfo.removeSubLayerById(subLayerId);
            }
          }, this);

          if (layerInfo.getSubLayers().length === 1) {
            var subLayerInfo = layerInfo.getSubLayers()[0];
            var subLayerObject = this.map.getLayer(subLayerInfo.id);
            subLayerObject.title = layerInfo.title;
            layerInfo.removeSubLayerById(subLayerInfo.id);
          }
        }
      }, this);
    },

    _initFinalLayerInfos: function(layerInfos) {
      //handle order to dicide finalLayerInfos order
      var i, id;
      this._finalLayerInfos = [];
      //for (i = 0; i < this.map.graphicsLayerIds.length; i++) {
      for (i = this.map.graphicsLayerIds.length - 1; i >= 0; i--) {
        id = this.map.graphicsLayerIds[i];
        if (!this._isBasemap(id)) {
          this._addToFinalLayerInfos(this._findLayerInfoByIdAndReturnTopLayer(id, layerInfos),
            id,
            true);
        }
      }

      //for (i = 0; i < this.map.layerIds.length; i++) {
      for (i = this.map.layerIds.length - 1; i >= 0; i--) {
        id = this.map.layerIds[i];
        if (!this._isBasemap(id)) {
          this._addToFinalLayerInfos(this._findLayerInfoByIdAndReturnTopLayer(id, layerInfos),
            id,
            false);
        }
      }
    },

    _isBasemap: function(id) {
      var isBasemap = false;
      // var layerIds = this.map.layerIds;
      // var basemapLayers = [];
      // array.forEach(layerIds, function (layerId) {
      //   var layer = this.map.getLayer(layerId);
      //   if (layer._basemapGalleryLayerType === "basemap" ||
      //         layer._basemapGalleryLayerType === "reference") {
      //     basemapLayers.push(layer);
      //   }
      // }, this);

      // if(basemapLayers.length === 0) {
      //   basemapLayers = this._basemapLayers;
      // }

      var basemapLayers = this.getBasemapLayers();

      for (var i = 0; i < basemapLayers.length; i++) {
        // temporary code
        //if (this._basemapLayers[i].id === id ||
        //this.map.getLayer(id).url === this._basemapLayers[i].layerObject.url) {
        if (basemapLayers[i].id === id) {
          isBasemap = true;
        }
      }

      return isBasemap;
    },

    _addToFinalLayerInfos: function(layerInfo, id, isGraphicLayer) {
      var newLayer;
      var newLayerInfo;
      if (layerInfo) {
        if (!layerInfo._addedFlag && (layerInfo.isGraphicLayer() === isGraphicLayer)) {
          this._finalLayerInfos.push(layerInfo);
          layerInfo._addedFlag = true;
        }
      } else {
        newLayer = this.map.getLayer(id);
        // if newLayer is featueLayer add it.
        //if (newLayer.type && ((newLayer.type === "Feature Layer") ||
        //(newLayer.type === "Table"))) {
        //if (newLayer.declaredClass === 'esri.layers.FeatureLayer') {
        if (newLayer.declaredClass !== "esri.layers.GraphicsLayer" &&
            newLayer.id !== "labels") {
          try {
            newLayerInfo = LayerInfoFactory.getInstance().create({
              layerObject: newLayer,
              title: this._getLayerTitle(newLayer),
              id: newLayer.id || " "
            }, this.map);
            newLayerInfo.init();
          } catch (err) {
            console.warn(err.message);
            newLayerInfo = null;
          }
          if (newLayerInfo) {
            this._finalLayerInfos.push(newLayerInfo);
          }
        }

        // add table for new layerInfo.
        if (newLayer.declaredClass === "esri.layers.ArcGISDynamicMapServiceLayer" ||
          newLayer.declaredClass === "esri.layers.ArcGISTiledMapServiceLayer") {
          if (newLayerInfo) {
            newLayerInfo._getLayerDefinition().then(lang.hitch(this, function(layerDifinition) {
              var newTableInfos = [];
              array.forEach(layerDifinition.tables, function(tableDifination) {
                tableDifination.url = newLayerInfo.getUrl() + '/' + tableDifination.id;
                tableDifination.id = newLayerInfo.id + '_' + tableDifination.id;
                tableDifination.title = this._getLayerTitle(tableDifination);
                var newTalbeInfo = this._addTable(tableDifination, this._finalTableInfos);
                if (newTalbeInfo) {
                  newTableInfos.push(newTalbeInfo);
                }
              }, this);
              this._onTableChange(newTableInfos, 'added');
            }));
          }
        }
      }
    },

    _getLayerTitle: function(layer) {

      if(layer.title) {
        return layer.title;
      }

      var title = layer.label || layer.name || "";
      if (layer.url) {
        var serviceName;
        var serviceKeyWord = "rest/services/";
        var index1 = layer.url.indexOf(serviceKeyWord);
        if (index1 > -1) {
          var index2 = index1 + serviceKeyWord.length;
          serviceName = layer.url.substring(index2).split('/')[0];
          if (title) {
            title = serviceName + " - " + title;
          } else {
            title = serviceName;
          }
        }
      }
      return title || layer.id;
    },

    _findLayerInfoByIdAndReturnTopLayer: function(id, layerInfos) {
      // summary:
      //    recursion find LayerInof in layerInfos and return top layerInfo.
      // description:
      //    if 'layerInfo' parameter is null, use this._finalLayerInfos.
      //    return null if layerInfo does not find.
      var i, layerInfo = null;

      if (!layerInfos) {
        layerInfos = this._finalLayerInfos;
      }
      for (i = 0; i < layerInfos.length; i++) {
        layerInfo = layerInfos[i].findLayerInfoById(id);
        if (layerInfo) {
          layerInfo = layerInfos[i];
          break;
        }
      }
      return layerInfo;
    },

    _findLayerInfoById: function(id, layerInfos) {
      // summary:
      //    recursion find LayerInof in layerInfos and return layerInfo self.
      // description:
      //    if 'layerInfo' parameter is null, use this._finalLayerInfos.
      //    return null if layerInfo does not find.
      var i, layerInfo = null;

      if (!layerInfos) {
        layerInfos = this._finalLayerInfos;
      }
      for (i = 0; i < layerInfos.length; i++) {
        layerInfo = layerInfos[i].findLayerInfoById(id);
        if (layerInfo) {
          break;
        }
      }
      return layerInfo;
    },

    _findTopLayerInfoById: function(id) {
      var i, layerInfo = null;
      var layerInfos = this._finalLayerInfos;
      for (i = 0; i < layerInfos.length; i++) {
        if (layerInfos[i].id === id) {
          layerInfo = layerInfos[i];
          break;
        }
      }
      return layerInfo;
    },

    _getTopLayerInfoIndexById: function(id) {
      var i, index = -1;
      for (i = 0; i < this._finalLayerInfos.length; i++) {
        if (this._finalLayerInfos[i].id === id) {
          index = i;
          break;
        }
      }
      return index;
    },


    _clearAddedFlag: function(layerInfos) {
      array.forEach(layerInfos, function(operLayer) {
        operLayer._addedFlag = false;
      });
    },

    _markFirstOrLastNode: function() {
      var i;
      if (this._finalLayerInfos.length) {
        //clearing first
        for (i = 0; i < this._finalLayerInfos.length; i++) {
          this._finalLayerInfos[i].isFirst = false;
          this._finalLayerInfos[i].isLast = false;
        }

        this._finalLayerInfos[0].isFirst = true;
        this._finalLayerInfos[this._finalLayerInfos.length - 1].isLast = true;

        for (i = 0; i < this._finalLayerInfos.length; i++) {
          if (!this._finalLayerInfos[i].isGraphicLayer()) {
            if (i) {
              (this._finalLayerInfos[i - 1].isLast = true);
            }
            this._finalLayerInfos[i].isFirst = true;
            return;
          }
        }
      }
    },

    _onReceiveBasemapGalleryeData: function(name, widgetId, basemapLayers) {
      /*jshint unused: false*/
      if (name === "BasemapGallery") {
        this._basemapLayers.length = 0;
        array.forEach(basemapLayers, lang.hitch(this, function(basemapLayer) {
          this._basemapLayers.push({
            layerObject: basemapLayer,
            id: basemapLayer.id
          });
        }), this);
        this.update();
        this.emit('layerInfosChanged');
      }
    },

    //need modify
    _onBasemapChange: function(current) {
      var i;
      this._basemapLayers.length = 0;
      for (i = 0; i < current.layers.length; i++) {
        this._basemapLayers.push({
          layerObject: current.layer[i],
          id: current.layers[i].id
        });
      }
    },

    _destroyLayerInfos: function() {
      array.forEach(this.getLayerInfoArray(), lang.hitch(this, function(layerInfo) {
        layerInfo.destroyLayerInfo();
      }));
    },

    _bindEvents: function() {
      // summary:
      //    bind events are listened by this module
      var handleAdd, handleRemove, handleBeforeUnload,
      handleIsShowInMapChanged, handleVisibleChanged;
      //this.own(aspect.after(this.map, "onLayerAddResult",
      //  lang.hitch(this, this._onLayersChange)));
      handleAdd = on(this.map, "layer-add-result", lang.hitch(this, this._onLayersChange, "added"));
      //handleRemove = aspect.after(this.map, "onLayerRemove",
      //  lang.hitch(this, this._onLayersChange));
      handleRemove = on(this.map, "layer-remove",
        lang.hitch(this, this._onLayersChange, "removed"));
      //this.own(handleRemove);
      //aspect.after(this.map, "onLayerReorder", lang.hitch(this, this._onLayersChange));
      //this.own(on(this.map, "LayersAddResult", lang.hitch(this, this._onLayersChangeAdds)));
      //this.own(on(this.map, "layers-add-result", lang.hitch(this, this._onLayersChange)));
      //handleRemoves =  aspect.after(this.map, "onLayersRemoved",
      //  lang.hitch(this, this._onLayersChange));
      //handleRemoves = on(this.map, "layers-removed", lang.hitch(this, this._onLayersChange));
      //this.own(handleRemoves);
      //aspect.after(this.map, "onLayersReorder", lang.hitch(this, this._onLayersChange));

      handleIsShowInMapChanged = topic.subscribe('layerInfos/layerInfo/isShowInMapChanged',
        lang.hitch(this, this._onShowInMapChanged));

      handleVisibleChanged = topic.subscribe('layerInfos/layerInfo/visibleChanged',
        lang.hitch(this, this._onVisibleChanged));

      handleBeforeUnload = on(this.map, "before-unload", lang.hitch(this, function() {
        handleAdd.remove();
        handleRemove.remove();
        handleIsShowInMapChanged.remove();
        handleVisibleChanged.remove();
        this._destroyLayerInfos();
      }));

      baseUnload.addOnUnload(function() {
        handleAdd.remove();
        handleRemove.remove();
        handleBeforeUnload.remove();
        handleIsShowInMapChanged.remove();
        handleVisibleChanged.remove();
      });
    },

    _onLayersChange: function(changedType, evt) {
      /*jshint unused: false*/
      // summary:
      //    response to any layer change.
      // description:
      //    update LayerInfos data and publish event
      //    changedType: "added" or "removed"
      var layerInfo = null,
        layerInfoSelf;
      if (!evt.error &&
        evt.layer.declaredClass !==
        "esri.layers.GraphicsLayer" &&
        !evt.layer._basemapGalleryLayerType) {
        if (changedType === "added") {
          this.update();
          layerInfo = this._findTopLayerInfoById(evt.layer.id);
          layerInfoSelf = this._findLayerInfoById(evt.layer.id);
        } else {
          layerInfo = this._findTopLayerInfoById(evt.layer.id);
          layerInfoSelf = this._findLayerInfoById(evt.layer.id);
          this.update();
        }
        // layerInfos top layer changed.
        this.emit('layerInfosChanged', layerInfo, changedType, layerInfoSelf);
        // layerInfos selfLayer changed.
        // layerInfosWholeChanged
      }
    },

    _onShowInMapChanged: function(changedLayerInfos) {
      this.emit('layerInfosIsShowInMapChanged', changedLayerInfos);
    },

    _onVisibleChanged: function(changedLayerInfos) {
      this.emit('layerInfosIsVisibleChanged', changedLayerInfos);
    },

    _initTablesInfos: function() {
      // var tableInfo, tableInfos = [];
      // array.forEach(this.tables, function(table) {
      //   try {
      //     table.empty = true;
      //     tableInfo = LayerInfoFactory.getInstance().create({
      //       layerObject: table,
      //       title: table.title || table.id || " ",
      //       id: table.id || " ",
      //       selfType: 'table'
      //     });
      //     tableInfo.init();
      //   } catch (err) {
      //     console.warn(err.message);
      //     tableInfo = null;
      //   }
      //   if (tableInfo) {
      //     tableInfos.push(tableInfo);
      //   }
      // }, this);

      // //layerInfos.reverse();
      // this.tableInfos = tableInfos;

      this._tableInfos = [];
      array.forEach(this.tables, function(table) {
        // add table from webmap and does not send 'tableChange' event.
        this._addTable(table, this._tableInfos);
      }, this);
    },

    _initFinalTableInfos: function() {
      this._finalTableInfos = [];
      array.forEach(this._tableInfos, function(tableInfo) {
        this._finalTableInfos.push(tableInfo);
      }, this);
    },

    _onTableChange: function(tableInfos, changedType) {
      this.emit('tableInfosChanged', tableInfos, changedType);
    },

    _onUpdated: function() {
      this.emit('updated');
    }
  });

  // static method to get LayerInfoArray by type, support types:
  //    "FeatureLayer"
  //    "FeatureCollection"
  //    "ArcGISDynamicMapServiceLayer"
  //    "ArcGISTiledMapServiceLayer"
  //    "GeoRSSLayer"
  //    "KMLLayer"
  //    "WMSLayer"
  //    "WTMSLayer"

  clazz.getLayerInfoArrayByType = function(map, layerType) {
    var defRet = new Deferred();
    var layerObjectTypeDefs = [];
    var layerInfoArray = [];

    clazz.getInstance(map, map.iteminfo).then(function(layerInfos) {
      layerInfos.traversal(function(layerInfo) {
        var typeDef = layerInfo.getLayerType();
        typeDef.layerInfo = layerInfo;
        layerObjectTypeDefs.push(typeDef);
      });

      all(layerObjectTypeDefs).then(function(typeResults) {
        array.forEach(typeResults, function(result, index) {
          if (layerType === result) {
            layerInfoArray.push(layerObjectTypeDefs[index].layerInfo);
          }
        });
        defRet.resolve(layerInfoArray);
      });
    });

    return defRet;
  };

  var instance = {
    empty: true,
    map: null,
    layerInfos: null,
    def: new Deferred()
  };
  // Return deferred because refere eatch other between LayerInfoFactory and LayerInfos.
  clazz.getInstance = function(map, webmapItemInfo, options) {
    // summary:
    //   get layerInfs instance.
    // description:
    //    map: esri.map object.
    //    webmapItemInfo: itemInfo of webmap.
    //    options = {
    //    layerOptions: {
    //      id: {
    //            visible: true/false
    //          }
    //      }
    //    }
    //
    if (instance.map && instance.map !== map) {
      instance = {
        empty: true,
        map: null,
        layerInfos: null,
        def: new Deferred()
      };
    }

    if (instance.layerInfos) {
      instance.def.resolve(instance.layerInfos);
    } else if (instance.empty) {
      instance.empty = false;
      if(!options) {
        options = {};
      }
      LayerInfoFactory.getInstance(map, options).init().then(lang.hitch(this, function() {
        var layerInfos = new clazz(map, webmapItemInfo.itemData, options);
        instance.map = map;
        instance.layerInfos = layerInfos;
        instance.def.resolve(layerInfos);
      }));
    } // else request is sending, return def.
    return instance.def;
  };
  return clazz;
});
