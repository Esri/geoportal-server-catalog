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
  'esri/graphicsUtils',
  'dojo/aspect',
  'dojo/topic',
  './LayerInfo',
  './LayerInfoForDefault',
  'jimu/utils',
  'dojo/Deferred',
  'esri/lang'
], function(declare, array, lang, graphicsUtils, aspect, topic, LayerInfo, LayerInfoForDefault,
  jimuUtils, Deferred, esriLang) {
  return declare(LayerInfo, {
    /*jshint unused: false*/
    constructor: function(/*operLayer, map*/) {
      /*jshint unused: false*/
    },

    _getExtentAsync: function() {
      var layers = this.layerObject.getLayers();
      var fullExtent = null;
      var layerExtent = null;
      if(layers.length > 0 && layers[0].declaredClass === "esri.layers.KMLLayer") {
        // it's a kmz layer
        var subKmlLayerInfos = [];
        this.traversal(lang.hitch(this, function(layerInfo) {
          if(layerInfo.id !== this.id && layerInfo.layerObject.declaredClass === "esri.layers.KMLLayer") {
            subKmlLayerInfos.push(layerInfo);
          }
        }));
        array.forEach(subKmlLayerInfos, function(subLayerInfo) {
          layerExtent = subLayerInfo._getExtentAsync();
          fullExtent = fullExtent ? fullExtent.union(layerExtent) : layerExtent;
        }, this);
      } else {
        array.forEach(layers, function(layer) {
          layerExtent = jimuUtils.graphicsExtent(layer.graphics);
          fullExtent = fullExtent ? fullExtent.union(layerExtent) : layerExtent;
        }, this);
      }
      return fullExtent;
    },

    _getExtent: function() {
      var def = new Deferred();
      /*
      var layers = this.layerObject.getLayers();
      var fullExtent = null;
      var layerExtent = null;
      array.forEach(layers, function(layer) {
        layerExtent = layer.initialExtent;
        fullExtent = fullExtent ? fullExtent.union(layerExtent) : layerExtent;
      }, this);
      def.resolve(fullExtent);
      */
      def.resolve(this._getExtentAsync());
      return def;
    },

    // _resetLayerObjectVisiblity: function(layerOptions) {
    //   var layerOption  = layerOptions ? layerOptions[this.id]: null;
    //   if(layerOption) {
    //     // check/unchek all sublayers according to subLayerOption.visible.
    //     array.forEach(this.newSubLayers, function(subLayerInfo) {
    //       var subLayerOption  = layerOptions ? layerOptions[subLayerInfo.id]: null;
    //       if(subLayerOption) {
    //         subLayerInfo.layerObject.setVisibility(subLayerOption.visible);
    //       }
    //     }, this);

    //     // according to layerOption.visible to set this._visible after all sublayers setting.
    //     this._setTopLayerVisible(layerOption.visible);
    //   }
    // },

    _resetLayerObjectVisiblity: function(layerOptions) {
      var layerOption  = layerOptions ? layerOptions[this.id]: null;
      if(layerOption) {
        // prepare checkedInfo for all sublayers according to subLayerOption.visible.
        var subLayersCheckedInfo = {};
        for ( var id in layerOptions) {
          if(layerOptions.hasOwnProperty(id) &&
             (typeof layerOptions[id] !== 'function')) {
            subLayersCheckedInfo[id] = layerOptions[id].visible;
          }
        }
        this._setSubLayerVisibleByCheckedInfo(subLayersCheckedInfo);

        // according to layerOption.visible to set this._visible after all sublayers setting.
        this._setTopLayerVisible(layerOption.visible);
      }
    },

    _setSubLayerVisibleByCheckedInfo: function(checkedInfo) {
      // check/unchek all sublayers according to subLayerOption.visible.
      this.traversal(lang.hitch(this, function(subLayerInfo) {
        if(esriLang.isDefined(checkedInfo[subLayerInfo.id])) {
          subLayerInfo._setTopLayerVisible(checkedInfo[subLayerInfo.id]);
        }
      }));
    },

    _initVisible: function() {
      this._visible = this.originOperLayer.layerObject.visible;
    },

    _setTopLayerVisible: function(visible) {
      if (visible) {
        this.layerObject.show();
      } else {
        this.layerObject.hide();
      }
    },

    //---------------new section-----------------------------------------
    // obtainNewSubLayers: function() {
    //   var newSubLayerInfos = [];
    //   var layers = this.originOperLayer.layerObject.getLayers();
    //   array.forEach(layers, function(layerObj) {
    //     var subLayerInfo, deferred;
    //     if (this._getLayerIndexesInMapByLayerId(layerObj.id)) {

    //       subLayerInfo = this._layerInfoFactory.create({
    //         layerObject: layerObj,
    //         title: layerObj.label || layerObj.title || layerObj.name || layerObj.id || " ",
    //         id: layerObj.id || "-",
    //         subId: layerObj.id || "-",
    //         collection: {"layerInfo": this},
    //         selfType: 'kml',
    //         parentLayerInfo: this
    //       });
    //       newSubLayerInfos.push(subLayerInfo);
    //       subLayerInfo.init();
    //     }
    //   }, this);
    //   this._markInvalidSubLayerInfoThatAsRootLayer();
    //   return newSubLayerInfos;
    // },

    obtainNewSubLayers: function() {
      var newSubLayerInfos = [];

      array.forEach(this._getOperLayerByParentFolderId(-1, this), function(operLayer) {
        var subLayerInfo, deferred;
        subLayerInfo = this._layerInfoFactory.create(operLayer);
        newSubLayerInfos.push(subLayerInfo);
        subLayerInfo.init();
      }, this);
      //this._markInvalidSubLayerInfoThatAsRootLayer();
      return newSubLayerInfos;
    },

    _getOperLayerByParentFolderId: function(parentIdParam, parentLayerInfo) {
      var operLayers = [];
      var layers = this.layerObject.getLayers() || [];
      var folders = this.layerObject.folders || [];
      var subFoldersOfParentIdParam = array.filter(folders, function(folder) {
        if(folder.parentFolderId === parentIdParam) {
          return true;
        } else {
          return false;
        }
      });
      var foldersOrLayers = [];
      if(subFoldersOfParentIdParam.length === 0) {
        // make sure it's a KMZ subLayer
        foldersOrLayers = array.filter(layers, function(layer) {
          if(!this._flag.kmzSubLayersWereHandled) {
            //only add once.
            return true;
          } else {
            return false;
          }
        }, this);
      } else {
        foldersOrLayers = subFoldersOfParentIdParam;
      }

      array.forEach(foldersOrLayers, function(folderOrLayer) {
        var operLayer;
        if(folderOrLayer.declaredClass === "esri.layers.KMLFolder") {
          operLayer = {
            layerObject: folderOrLayer,//{declareClass: "esri.layers.KMLSubFolder", empty: true},
            /* jscs:disable */
            title: folderOrLayer.label || folderOrLayer.title || folderOrLayer.name || /*folderOrLayer.id ||*/ "&lt;no name&gt;",
            id: this._getSubLayerInfoIdForSubFolder(folderOrLayer),
            subId: folderOrLayer.id,
            kml: {"layerInfo": this, currentFolder: folderOrLayer},
            selfType: 'kml',
            parentLayerInfo: parentLayerInfo
          };
        } else if(folderOrLayer.declaredClass === "esri.layers.KMLLayer") {
          // subLayer of KMZ
          var linkInfoName = lang.getObject("linkInfo.name", false, folderOrLayer);
          operLayer = {
            layerObject: folderOrLayer,
            /* jscs:disable */
            title: folderOrLayer.label || folderOrLayer.title || linkInfoName || folderOrLayer.name || folderOrLayer.id || " ",
            id: folderOrLayer.id || "-",
            subId: folderOrLayer.id || "-",
            kml: {"layerInfo": this, currentFolder: null},
            selfType: 'kml',
            parentLayerInfo: parentLayerInfo
          };
          lang.setObject('_wabProperties.kmllayerWasHandled', true, folderOrLayer);
          this._flag.kmzSubLayersWereHandled = true;
        } else {
          // subLayer of KML
          lang.setObject('_wabProperties.kmllayerWasHandled', true, folderOrLayer);
          lang.setObject('_wabProperties.isTemporaryLayer', true, folderOrLayer);
        }
        if(operLayer) {
          operLayers.push(operLayer);
        }
      }, this);
      return operLayers;
    },

    _getAllSubLayerObject: function() {
      // it isn't including subFolders.
      var subLayers = [];
      this.traversal(lang.hitch(this, function(layerInfo) {
        if(layerInfo.layerObject && layerInfo.layerObject.getLayers) {
          subLayers = subLayers.concat(layerInfo.layerObject.getLayers());
        }
      }));
      return subLayers;
    },

    _getSubLayerInfoIdForSubFolder: function(folder) {
      return this.id + "_folder_" + folder.id;
    },
    // _markInvalidSubLayerInfoThatAsRootLayer: function() {
    //   if(this.layerObject && this.layerObject.getLayers) {
    //     array.forEach(this.layerObject.getLayers(), function(subLayerObject) {
    //       var subLayerInfo = this._getLayerInfosObj()._findTopLayerInfoById(subLayerObject.id);
    //       if(subLayerInfo) {
    //         subLayerInfo._flag._invalid = true;
    //       }
    //     }, this);
    //   }
    // },

    _needToRenew: function() {
      return array.some(this._getAllSubLayerObject(), function(subLayerObject) {
        if(!lang.getObject("_wabProperties.kmllayerWasHandled", false, subLayerObject)) {
          return true;
        }
      }, this);
    },

    /***************************************************
     * mehtods about events
     ***************************************************/
    _bindEvent: function() {
      var handle;
      this.inherited(arguments);
      if(this.layerObject && !this.layerObject.empty) {
        // binding subFolder's visibility changed event.
        handle = aspect.after(this.layerObject,
                               'setFolderVisibility',
                               lang.hitch(this, this._onSubFolderVisibleChanged), true);
        this._eventHandles.push(handle);
      }
    },

    _onSubFolderVisibleChanged: function(folder) {
      var subFolderId  = this._getSubLayerInfoIdForSubFolder(folder);
      var subLayerInfo = this.findLayerInfoById(subFolderId);
      if(subLayerInfo) {
        topic.publish('layerInfos/layerInfo/visibleChanged', [subLayerInfo]);
      }
    }

    // //indexes:[{
    // //  isGraphicLayer:
    // //  index:
    // //},{}]
    // //
    // _obtainLayerIndexesInMap: function() {
    //   var indexes = [], index, i;
    //   for (i = 0; i < this.newSubLayers.length; i++) {
    //     index = this._getLayerIndexesInMapByLayerId(this.newSubLayers[i].layerObject.id);
    //     if (index) {
    //       indexes.push(index);
    //     }
    //   }
    //   return indexes;
    // },

    // moveLeftOfIndex: function(index) {
    //   var i;
    //   for (i = this.newSubLayers.length - 1; i >= 0; i--) {
    //     this.map.reorderLayer(this.newSubLayers[i].layerObject, index);
    //   }
    // },

    // moveRightOfIndex: function(index) {
    //   var i;
    //   for (i = 0; i < this.newSubLayers.length; i++) {
    //     this.map.reorderLayer(this.newSubLayers[i].layerObject, index);
    //   }
    // }
  });
});
