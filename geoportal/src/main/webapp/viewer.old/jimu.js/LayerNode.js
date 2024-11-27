define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/Evented'
], function(declare, array, lang, Deferred, Evented) {
  var clazz = declare([Evented], {
    declaredClass: "jimu.LayerNode",
    _layerInfo:  null,
    map:         null,
    title:       null,
    id:          null,
    subId:       null,
    layerObject: null,

    constructor: function(layerInfo) {
      this._layerInfo = layerInfo;
      this.map = layerInfo.map;
      this.title = layerInfo.title;
      this.id = layerInfo.id;
      this.subId = layerInfo.subId;
      //this.layerObject = layerInfo.layerObject;
    },

    isLeaf: function() {
      // summary:
      //   Returns true if the node is leaf node.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.isLeaf();
    },

    isRoot: function() {
      // summary:
      //   Returns true if the node is root node.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.isRootLayer();
    },

    toggle: function() {
      // summary:
      //   Toggle layerNode, layer will be shown if all parent nodes on the path are toggled on.
      // parameters:
      //   null
      // return value:
      //   null
      this._layerInfo.setTopLayerVisible(!this.isToggledOn());
    },

    isToggledOn: function() {
      // summary:
      //   Returns true if the layerNode is toggled on.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.isVisible();
    },

    show: function() {
      // summary:
      //   Makes the current layer visible on the map.
      // parameters:
      //   null
      // return value:
      //   null
      this._layerInfo.show();
    },

    hide: function() {
      // summary:
      //   Makes the current layer invisible on the map.
      // parameters:
      //   null
      // return value:
      //   null
      this._layerInfo.hide();
    },

    isVisible: function() {
      // summary:
      //   Returns true if the layer is visible.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.isShowInMap();
    },

    traversal: function(callback) {
      // summary:
      //   Depth-first traversal all ndoes of the current layerNode.
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
      return this._layerInfo.traversal(function(layerInfo) {
        return callback(layerInfo._adaptor);
      });
    },

    getNodeById: function(nodeId) {
      // summary:
      //   Gets the node/subNode by Id;
      // parameters:
      //   nodeId: node/subNode Id;
      // return value:
      //   LayerNode
      var resultNode = null;
      var layerInfo = this._layerInfo.findLayerInfoById(nodeId);
      if(layerInfo) {
        resultNode = layerInfo._adaptor;
      }
      return resultNode;
    },

    getExtent: function() {
      // summary:
      //   Gets the extent of the current layerNode;
      // parameters:
      //   null
      // return value:
      //   Deferred;
      //   resolve value: Extent
      return this._layerInfo.getExtent();
    },

    getOpacity: function() {
      // summary:
      //   Gets the opacity of the current layer;
      // parameters:
      //   null
      // return value:
      //   Integer
      return this._layerInfo.getOpacity();
    },

    setOpacity: function(opacity) {
      // summary:
      //   Sets the opacity for the current layer;
      // parameters:
      //   opacity: Interger
      // return value:
      //   null
      this._layerInfo.setOpacity(opacity);
    },

    getServiceDefinition: function() {
      // summary:
      //   Gets the service definition from its server;
      // parameters:
      //   null
      // return value:
      //   Deferred;
      //   resolve value:
      //     JSON/XML
      //     null: resolves null if the service definition failed to load.
      return this._layerInfo.getServiceDefinition();
    },

    getLayerObject: function() {
      // summary:
      //   Gets the current layer object;
      // parameters:
      //   null
      // return value:
      //   Deferred;
      //   resolve value:
      //     Layer
      //     null: resolves null if the layer object failed to load.
      return this._layerInfo.getLayerObject();
    },

    getRootNode: function() {
      // summary:
      //   Gets the root node of the current layerNode;
      // parameters:
      //   null
      // return value:
      //   LayerNode
      return this._layerInfo.getRootLayerInfo()._adaptor;
    },

    getParentNode: function() {
      // summary:
      //   Gets the parent node of the current layerNode;
      // parameters:
      //   null
      // return value:
      //   LayerNode
      var parentNode;
      var parentLayerInfo = this._layerInfo.parentLayerInfo;
      if(parentLayerInfo) {
        parentNode = parentLayerInfo._adaptor;
      } else {
        parentNode = null;
      }
      return parentNode;
    },

    getSubNodes: function() {
      // summary:
      //   Gets the subNodes of the current layerNode;
      // parameters:
      //   null
      // return value:
      //   LayerNode[]
      return this._getNodesArrayFromInfosArray(this._layerInfo.getSubLayers());
    },

    getNodeLevel: function() {
      // summary:
      //    Gets the level of the current layerNode, rootNode's level is 0;
      // parameters:
      //   null
      // return value:
      //   Integer
      return this._layerInfo.getLayerLevel();
    },

    getLayerType: function() {
      // summary:
      //   Gets the current layer type;
      // parameters:
      //   null
      // return value:
      //   Deferred;
      //   resolve value: String
      return this._layerInfo.getLayerType();
    },

    getPopupInfoFromWebmap: function() {
      // summary:
      //   Gets the popupInfo from the webmap;
      // parameters:
      //   null
      // return value:
      //   JSON
      //   null: returns null if the popupInfo wasn't defined in the webmap;
      return this._layerInfo.getPopupInfo();
    },

    getPopupInfo: function() {
      // summary:
      //   Gets the popupInfo from the current layer;
      // parameters:
      //   null
      // return value:
      //   JSON
      //   null: returns null if the layer doesn't have popupInfo;
      return this._layerInfo.getPopupInfoFromLayerObject();
    },

    loadPopupInfo: function() {
      // summary:
      //   Gets the popupInfo from the current layer, and try to load the default
      //   popupInfo if the layer doesn't have popupInfo;
      // parameters:
      //   null
      // return value:
      //   Deferred;
      //   resolve value:
      //     JSON
      //     null: returns null if the popupInfo failed to load
      return this._layerInfo.loadPopupInfo();
    },

    getInfoTemplate: function() {
      // summary:
      //   Gets the infoTemplate from the current layer;
      // parameters:
      //   null
      // return value:
      //   JSON
      //   null: returns null if the layer doesn't have infoTemplate;
      return this._layerInfo.getInfoTemplate();
    },

    loadInfoTemplate: function() {
      // summary:
      //   Gets the infoTemplate from the current layer, and try to load the default
      //   infoTemplate if the layer doesn't have infoTemplate;
      // parameters:
      //   null
      // return value:
      //   Deferred;
      //   resolve value:
      //     JSON
      //     null: returns null if the infoTemplate failed to load
      return this._layerInfo.loadInfoTemplate();
    },

    getFilterFromWebmap: function() {
      // summary:
      //   Gets the definition expression from the webmap;
      // parameters:
      //   null
      // return value:
      //   JSON
      //   null: returns null if the definition expression wasn't defined in the webmap;
      return this._layerInfo.getFilterOfWebmap();
    },

    getFilter: function() {
      // summary:
      //   Gets the definition expression from the current layer;
      // parameters:
      //   null
      // return value:
      //   JSON
      //   null: returns null if the layer doesn't have definition expression;
      return this._layerInfo.getFilter();
    },

    setFilter: function(layerDefinitionExpression) {
      // summary:
      //   Set the definition expression for current layer;
      // parameters:
      //   String
      // return value:
      //   null
      this._layerInfo.setFilter(layerDefinitionExpression);
    },

    isShowLegend: function() {
      // summary:
      //   Gets the show legend information for current layer;
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this.isShowLegendFromWebmap();
    },

    isShowLegendFromWebmap: function() {
      // summary:
      //   Gets the show legend information from the webmap;
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.getShowLegendOfWebmap();
    },

    isToggledOnLegendFromWebMap: function() {
      // summary:
      //   Gets the is is toggled on of legend information from the webmap;
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo._getShowLegendOfWebmap();
    },

    getUrl: function() {
      // summary:
      //   Gets the URL of the current layer;
      // parameters:
      //   null
      // return value:
      //   String
      //   null: returns null if the layer doesn't have URL;
      return this._layerInfo.getUrl();
    },

    getRelatedNodes: function() {
      // summary:
      //   Gets the related layerNodes array associated with the current layer.
      // parameters:
      //   null
      // return value:
      //   Deferred;
      //   resolve value:
      //     LayerNode[]
      var def = new Deferred();
      this._layerInfo.getRelatedTableInfoArray().then(lang.hitch(this, function(relatedTableInfoArray) {
        def.resolve(this._getNodesArrayFromInfosArray(relatedTableInfoArray));
      }));
      return def;
    },

    // removeSubNodeById: function() {
    //   // need to update removeSubLayerInfoByid:
    //   // 1, find all subLayerInfos
    //   // 2, send event.
    // },

    isVisibleAtMapScale: function() {
      // summary:
      //   Returns true if the layer is visible at the current map scale.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.isInScale();
    },

    enablePopup: function() {
      // summary:
      //   Enables the popup.
      // parameters:
      //   null
      // return value:
      //   Boolean
      //   true: enabled
      //   false: disabled
      return this._layerInfo.enablePopup();
    },

    disablePopup: function() {
      // summary:
      //   Disable the popup.
      // parameters:
      //   null
      // return value:
      //   Boolean
      //   true: enabled
      //   false: disabled
      return this._layerInfo.disablePopup();
    },

    isPopupEnabled: function() {
      // summary:
      //   Returns true if the popup is enabled.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.isPopupEnabled();
    },

    isItemLayer: function() {
      // summary:
      //   Returns a basic item information if layer is a item layer,
      //   else returns null.
      // parameters:
      //   null
      // return value:
      //   basicItemInfo = {
      //     portalUrl:
      //     itemId:
      //   }
      return this._layerInfo.isItemLayer();
    },

    getItemInfo: function() {
      // summary:
      //   Gets the item info associated with the current layer.
      // parameters:
      //   null
      // return value:
      //   ItemInfo
      return this._layerInfo.getItemInfo();
    },

    isHostedService: function() {
      // summary:
      //   Resolves true if the service of current layer is a hosted service.
      // parameters:
      //   null
      // return value:
      //   Deferred:
      //   resolve value:
      //     Bollean
      return this._layerInfo.isHostedService();
    },

    isHostedLayer: function() {
      // summary:
      //   Resolves true if the layer is a hosted layer.
      // parameters:
      //   null
      // return value:
      //   Deferred:
      //   resolve value:
      //     Bollean
      return this._layerInfo.isHostedLayer();
    },

    canShowLabel: function() {
      // summary:
      //   Returns true if the layer can show label.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.canShowLabel();
    },

    isLabelVisble: function() {
      // summary:
      //   Returns true if the layer's label is visible.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return this._layerInfo.isShowLabels();
    },

    showLabel: function() {
      // summary:
      //   Shows the labels in the map.
      // parameters:
      //   null
      // return value:
      //   null
      this._layerInfo.showLabels();
    },

    hideLabel: function() {
      // summary:
      //   Hides the labels in the map.
      // parameters:
      //   null
      // return value:
      //   null
      this._layerInfo.hideLabels();
    },

    isTable: function() {
      // summary:
      //   Returns true if the current layer is a table.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return !!this._layerInfo.isTable;
    },

    isTiled: function() {
      // summary:
      //   Returns true if the current layer is tiled.
      //   Note: only supports tiled mapservice layer currently.
      // parameters:
      //   null
      // return value:
      //   Boolean
      return !!this._layerInfo.isTiled;
    },

    isEditable: function(user) {
      // summary:
      //   Returns true if the current layer is editable.
      // parameters:
      //   userPrivileges
      // return value:
      //   Boolean
      return this._layerInfo.isEditable(user);
    },

    zoomTo: function(extent) {
      // summary:
      //   Zoom map to the extent, if the extent parameter is empty, will zoom to layer's extent.
      // parameters:
      //   Extent
      // return value:
      //   Deferred
      return this._layerInfo.zoomTo(extent);
    },

    emitEvent: function(eventName) {
      /*
      var newArguments = [];
      array.forEach(arguments, function(arg) {
        newArguments.push(arg);
      });
      */
      try {
        var newEventName = null;
        switch (eventName) {
          case 'isVisibleChanged':
            newEventName = clazz.EVENT_TOOGLE_CHANGE;
            break;
          case 'isShowInMapChanged':
            newEventName = clazz.EVENT_VISIBILITY_CHANGE;
            break;
          case 'filterChanged':
            newEventName = clazz.EVENT_FILTER_CHANGE;
            break;
          case 'rendererChanged':
            newEventName = clazz.EVENT_RENDERER_CHANGE;
            break;
          case 'opacityChanged':
            newEventName = clazz.EVENT_OPACITY_CHANGE;
            break;
          case 'timeExtentChanged':
            newEventName = clazz.EVENT_TIME_EXTENT_CHANGE;
            break;
        }
        //this.emit.apply(this, newArguments);
        if(newEventName) {
          this.emit(newEventName);
        }
      } catch (err) {
        console.error(err);
      }
    },

    destroy: function() {
      this.inherited(arguments);
    },

    _getNodesArrayFromInfosArray: function(layerInfos) {
      var nodes = [];
      array.forEach(layerInfos, function(layerInfo) {
        nodes.push(layerInfo._adaptor);
      }, this);
      return nodes;
    }

  });

  lang.mixin(clazz, {
    EVENT_TOOGLE_CHANGE: "toggle-change",
    EVENT_VISIBILITY_CHANGE: "visibility-change",
    EVENT_FILTER_CHANGE: "filter-change",
    EVENT_RENDERER_CHANGE: "renderer-change",
    EVENT_OPACITY_CHANGE: "opacity-change",
    EVENT_TIME_EXTENT_CHANGE: "time-extent-change"
  });
  return clazz;
});
