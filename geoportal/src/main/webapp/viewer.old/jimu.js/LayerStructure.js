define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/Evented',
  './LayerInfos/LayerInfos'
], function(declare, array, lang, on, Evented, LayerInfos) {
  var clazz = declare([Evented], {
    declaredClass: "jimu.LayerStructure",
    map: null,
    _layerInfos: null,
    _eventHandles: null,

    constructor: function(layerInfos) {
      this._layerInfos   = layerInfos;
      this.map           = this._layerInfos.map;
      this._eventHandles = [];
      this._bindEvents();
    },

    getLayerNodes: function() {
      // summary:
      //   Get the operational layerNodes of current map;
      // parameters:
      //   null
      // return value:
      //   LayerNode[]
      return this._getNodesArrayFromInfosArray(this._layerInfos.getLayerInfoArray());
    },

    getTableNodes: function() {
      // summary:
      //   Get the operational tableNodes of current map;
      // parameters:
      //   null
      // return value:
      //   LayerNode[]
      return this._getNodesArrayFromInfosArray(this._layerInfos.getTableInfoArray());
    },

    getWebmapLayerNodes: function() {
      // summary:
      //   Get operational layerNodes that are defined in the webmap;
      // parameters:
      //   null
      // return value:
      //   LayerNode[]
      return this._getNodesArrayFromInfosArray(this._layerInfos.getLayerInfoArrayOfWebmap());
    },

    getWebmapTableNodes: function() {
      // summary:
      //   Get operational tableNodes that are defined in the webmap;
      // parameters:
      //   null
      // return value:
      //   LayerNode[]
      return this._getNodesArrayFromInfosArray(this._layerInfos.getTableInfoArrayOfWebmap());
    },

    addTable: function(table) {
      // summary:
      //   Add a table to layerStructure.
      // parameters:
      //   table = {
      //     id: Optional parameters,
      //     title: title of new table,
      //     url: alternative with featureCollectionData,
      //     featureCollectionData: alternative with url,
      //     options: Optional parameters. See options list of FeatureLayer's Constructor from
      //              ArcGIS JavaScript API reference.
      //    }
      // return value:
      //   LayerNode
      var tableNode = null;
      var tableInfo = this._layerInfos.addTable(table);
      if(tableInfo) {
        tableNode = tableInfo._adaptor;
      }
      return tableNode;
    },

    removeTable: function(nodeId) {
      // summary:
      //   Rmove a tableNode from layerStructure by nodeId.
      // parameters:
      //   nodeId: tableNode id
      // return value:
      //   null
      var tableNode = this.getNodeById(nodeId);
      if(tableNode) {
        this._layerInfos.removeTable(tableNode._layerInfo);
      }
    },

    _traversal: function(callback, nodes) {
      for(var i = 0; i < nodes.length; i++) {
        if(nodes[i].traversal(callback)) {
          return true;
        }
      }
      return false;
    },

    traversal: function(callback) {
      // summary:
      //   Depth-first traversal all ndoes of the layerStructure.
      // parameters:
      //   callback: function(layerNode) {};
      //     parameters:
      //       layerNode:
      //     return value:
      //       boolean;
      //       true: return true will interrupt traversal.
      //       false: return false will continue traversal.
      // return value:
      //   boolean;
      //   return ture means traversal was interrupted.
      //   return false means traversal was complete.
      return this._traversal(callback, this.getLayerNodes().concat(this.getTableNodes()));
    },

    traversalWithNodes: function(callback, nodes) {
      // summary:
      //   Depth-first traversal all ndoes of 'nodes' paramater.
      // parameters:
      //   callback: function(layerNode) {};
      //     parameters:
      //       layerNode:
      //     return value:
      //       boolean;
      //       true: return true will interrupt traversal.
      //       false: return false will continue traversal.
      //   nodes: layerNods array;
      // return value:
      //   boolean;
      //   return ture means traversal was interrupted.
      //   return false means traversal was complete.
      return this._traversal(callback, nodes);
    },

    getNodeById: function(nodeId) {
      // summary:
      //   Get the layerNode/tableNode by Id;
      // parameters:
      //   nodeId: layerNode/tableNode Id;
      // return value:
      //   LayerNode
      var resultNode = null;
      this.traversal(function(layerNode) {
        if(layerNode.id === nodeId) {
          resultNode = layerNode;
          return true;
        }
      });
      return resultNode;
    },

    getBasemapLayerObjects: function() {
      // summary:
      //   Get the layerObjects of basemap;
      // parameters:
      //   null;
      // return value:
      //   LayerObject[]
      return this._layerInfos.getBasemapLayers();
    },

    restoreState: function(options) {
      this._layerInfos.restoreState(options);
    },

    // getState: function() {
    // },

    // moveUpLayerNode: function() {
    // },

    // moveDownLayerNode: function() {
    // },

    destroy: function() {
      array.forEach(this._eventHandles, function(eventHandle) {
        eventHandle.remove();
      });
      this.inherited(arguments);
    },

    _getNodesArrayFromInfosArray: function(layerInfos) {
      var nodes = [];
      array.forEach(layerInfos, function(layerInfo) {
        nodes.push(layerInfo._adaptor);
      }, this);
      return nodes;
    },

    _emitEvent: function() {
      try {
        this.emit.apply(this, arguments);
      } catch (err) {
        console.warn(err);
      }
    },

    _bindEvents: function() {
      var handle;
      handle = on(this._layerInfos,
        'layerInfosChanged',
        lang.hitch(this, this._onLayerNodesStructureChanged));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'tableInfosChanged',
        lang.hitch(this, this._onTableNdoesStructureChanged));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'layerInfosReorder',
        lang.hitch(this, this._onLayerReordered));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'layerInfosIsShowInMapChanged',
        lang.hitch(this, this._onVisibilityChanged));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'layerInfosIsVisibleChanged',
        lang.hitch(this, this._onToggleChanged));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'layerInfosFilterChanged',
        lang.hitch(this, this._onFilterChanged));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'layerInfosRendererChanged',
        lang.hitch(this, this._onRendererChanged));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'layerInfosOpacityChanged',
        lang.hitch(this, this._onOpacityChanged));
      this._eventHandles.push(handle);

      handle = on(this._layerInfos,
        'layerInfosTimeExtentChanged',
        lang.hitch(this, this._onTimeExtentChanged));
      this._eventHandles.push(handle);
    },

    // emit event when layerNode and tableNode changed.
    _onLayerNodesStructureChanged: function(layerInfo, changedType, layerInfoSelf) {
      var changedNodes = [layerInfoSelf._adaptor];
      var changedRootNodes = [layerInfo._adaptor];
      var eventObject = {
        type: changedType,
        layerNodes: changedNodes,
        rootLayerNodes: changedRootNodes
      };
      this._emitEvent(clazz.EVENT_STRUCTURE_CHANGE, eventObject);
      //this._emitEvent(clazz.EVENT_STRUCTURE_CHANGE, changedType, changedNodes, changedRootNodes);
    },

    _onTableNdoesStructureChanged: function(tableInfos, changedType) {
      var changedNodes = this._getNodesArrayFromInfosArray(tableInfos);
      var changedRootNodes = changedNodes;
      var eventObject = {
        type: changedType,
        layerNodes: changedNodes,
        rootLayerNodes: changedRootNodes
      };
      this._emitEvent(clazz.EVENT_STRUCTURE_CHANGE, eventObject);
      //this._emitEvent(clazz.EVENT_STRUCTURE_CHANGE, changedType, changedNodes, changedRootNodes);
    },

    _onLayerReordered: function(layerInfo, changedType) {
      var changedNodes = [layerInfo._adaptor];
      var changedRootNodes = changedNodes;
      var eventObject = {
        type: changedType,
        layerNodes: changedNodes,
        rootLayerNodes: changedRootNodes
      };
      this._emitEvent(clazz.EVENT_STRUCTURE_CHANGE, eventObject);
      //this._emitEvent(clazz.EVENT_STRUCTURE_CHANGE, changedType, changedNodes, changedRootNodes);
    },

    _onVisibilityChanged: function(changedLayerInfos) {
      var changedNodes = this._getNodesArrayFromInfosArray(changedLayerInfos);
      var eventObject = {
        layerNodes: changedNodes
      };
      this._emitEvent(clazz.EVENT_VISIBILITY_CHANGE, eventObject);
    },

    _onToggleChanged: function(changedLayerInfos) {
      var changedNodes = this._getNodesArrayFromInfosArray(changedLayerInfos);
      var eventObject = {
        layerNodes: changedNodes
      };
      this._emitEvent(clazz.EVENT_TOOGLE_CHANGE, eventObject);
    },

    _onFilterChanged: function(changedLayerInfos) {
      var changedNodes = this._getNodesArrayFromInfosArray(changedLayerInfos);
      var eventObject = {
        layerNodes: changedNodes
      };
      this._emitEvent(clazz.EVENT_FILTER_CHANGE, eventObject);
    },

    _onRendererChanged: function(changedLayerInfos) {
      var changedNodes = this._getNodesArrayFromInfosArray(changedLayerInfos);
      var eventObject = {
        layerNodes: changedNodes
      };
      this._emitEvent(clazz.EVENT_RENDERER_CHANGE, eventObject);
    },

    _onOpacityChanged: function(changedLayerInfos) {
      var changedNodes = this._getNodesArrayFromInfosArray(changedLayerInfos);
      var eventObject = {
        layerNodes: changedNodes
      };
      this._emitEvent(clazz.EVENT_OPACITY_CHANGE, eventObject);
    },

    _onTimeExtentChanged: function(changedLayerInfos) {
      var changedNodes = this._getNodesArrayFromInfosArray(changedLayerInfos);
      var eventObject = {
        layerNodes: changedNodes
      };
      this._emitEvent(clazz.EVENT_TIME_EXTENT_CHANGE, eventObject);
    }
  });

  var instance = null;
  clazz.getInstance = function() {
    // need to confirm instance.
    if(!instance || instance._layerInfos._objectId !== LayerInfos.getInstanceSync()._objectId) {
      if(instance) {
        instance.destroy();
      }
      instance = new clazz(LayerInfos.getInstanceSync());
    }
    return instance;
  };


  clazz.createInstance = function(map) {
    var layerStructure = new clazz(LayerInfos.createInstance(map));
    return layerStructure;
  };

  lang.mixin(clazz, {
    STRUCTURE_CHANGE_ADD: LayerInfos.ADDED,
    STRUCTURE_CHANGE_REMOVE: LayerInfos.REMOVED,
    STRUCTURE_CHANGE_SUBNODE_ADD: LayerInfos.SUBLAYER_ADDED,
    STRUCTURE_CHANGE_SUBNODE_REMOVE: LayerInfos.SUBLAYER_REMOVED,
    STRUCTURE_CHANGE_NODE_UPDATE: LayerInfos.UPDATED,
    STRUCTURE_CHANGE_REORDER: LayerInfos.REORDERED,
    EVENT_STRUCTURE_CHANGE: "structure-change",
    EVENT_TOOGLE_CHANGE: "toggle-change",
    EVENT_VISIBILITY_CHANGE: "visibility-change",
    EVENT_FILTER_CHANGE: "filter-change",
    EVENT_RENDERER_CHANGE: "renderer-change",
    EVENT_OPACITY_CHANGE: "opacity-change",
    EVENT_TIME_EXTENT_CHANGE: "time-extent-change"
  });

  return clazz;
});
