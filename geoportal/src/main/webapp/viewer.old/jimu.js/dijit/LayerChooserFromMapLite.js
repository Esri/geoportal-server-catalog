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

define([ 'dojo/on',
    'dojo/_base/declare',
    'dojo/promise/all',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'jimu/dijit/CheckBox',
    'jimu/dijit/LayerChooserFromMap',
    'jimu/LayerStructure'
  ],
  function(on, declare, all, lang, html, array, CheckBox, LayerChooserFromMap, LayerStructure) {

    var LayerChooser = declare([LayerChooserFromMap], {
      templateString:'<div style="width:100%;">' +
        '<div data-dojo-attach-point="errorTipSection" class="error-tip-section">' +
          '<span class="jimu-icon jimu-icon-error"></span>' +
          '<span class="jimu-state-error-text" data-dojo-attach-point="errTip">' +
          '${nls.noLayersTip}</span>' +
        '</div>' +
        '<div data-dojo-attach-point="treeSection" class="tree-section">' +
          '<ul data-dojo-attach-point="treeUl" class="tree-ul tree-root-ul"></ul>' +
        '</div>' +
      '</div>',

      //constructor options:
      //multiple: false, //Can select multiple layers or a single layer.
      //onlyShowVisible: false,                        //optional
      //updateWhenLayerInfosIsShowInMapChanged: false, //optional
      map: null,                                       //optional
      layerStateController: null,                      //optional
      layerState: null,                                //optional
      customFilter: null,                              //optional
      onlySelectLeafLayer: false,                      //optional
      displayLayerTypeIcon: true,                      //optional
      showTables: true,                                //optional
      viewMode: false,                                 //optional
      onlyShowWebMapLayers: false,                     //optional

      //public methods:
      //getSelectedItems

      //events:
      //tree-click
      //update

      layerStructure: null,
      _layerDatas: null,
      _eventHandles: null,

      postMixInProperties:function(){
        this.nls = window.jimuNls.basicLayerChooserFromMap;
      },

      postCreate: function() {
        //this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-basic-layer-chooser-from-map');
        html.addClass(this.domNode, 'jimu-basic-layer-chooser-from-map-lite');

        /*
        this.shelter = new LoadingIndicator({hidden:true});
        this.shelter.placeAt(this.domNode);
        this.shelter.startup();
        */

        // init properties
        this._layerDatas = {};
        this._eventHandles = [];

        // init layerStructure
        if(this.map){
          this.layerStructure = LayerStructure.createInstance(this.map);
        } else {
          this.layerStructure = LayerStructure.getInstance();
        }
        this.layerInfosObj = this.layerStructure._layerInfos;

        // clear layer state
        this.layerState = this._clearLayerState(this.layerState) || {};

        /*
        this.own(on(this.layerStructure,
          LayerStructure.EVENT_STRUCTURE_CHANGE,
          lang.hitch(this, this._onLayerInfosChanged)));
        if(this.updateWhenLayerInfosIsShowInMapChanged) {
          this.own(on(this.layerStructure,
             LayerStructure.EVENT_VISIBILITY_CHANGE,
             lang.hitch(this, this._onLayerInfosIsShowInMapChanged)));
        }
        */

        // init layerStateController
        if(!this.layerStateController) {
          this.layerStateController = new LayerChooser.LayerStateController();
        }

        // init filter
        var filter;
        if(this.customFilter) {
          filter = lang.hitch(this, this.customFilter);
        } else {
          filter = lang.hitch(this, this.filter);
        }
        this.filter = LayerChooserFromMap.andCombineFilters([this.basicFilter, filter]);

        // create tree
        this._createTree();
      },

      _createTree: function() {
        var layerNodes, tableNodes;
        if(this.onlyShowWebMapLayers) {
          layerNodes = this.layerStructure.getWebmapLayerNodes();
          tableNodes = this.layerStructure.getWebmapTableNodes();
        } else {
          layerNodes = this.layerStructure.getLayerNodes();
          tableNodes = this.layerStructure.getTableNodes();
        }
        var createdCount = this._createLayerNodes(layerNodes.concat(this.showTables ? tableNodes : []), this.treeUl);

        if(createdCount > 0) {
          html.setStyle(this.errorTipSection, 'display', 'none');
          this.layerStateController.restoreState(this.layerState, this.layerStructure);
        }
      },

      _createLayerNodes: function(layerNodes, nodeUl) {
        var filterDefs = array.map(layerNodes, function(layerNode) {
          return this.filter(layerNode._layerInfo);
        }, this);

        var createdCount = 0;
        all(filterDefs).then(lang.hitch(this, function(results) {
          array.forEach(results, function(isPass, index) {
            if(isPass) {
              this._createLayerNode(layerNodes[index], nodeUl);
              createdCount++;
            }
          }, this);
        }));

        return createdCount;
      },

      _createLayerNode: function(layerNode, nodeUl) {
        var handle;

        var layerNodeLi = html.create('li', {
          'class': 'tree-node-li',
          'id': 'layerchooserlite-tree-node-li-' + layerNode.id
          //'style': 'display:none'
        }, nodeUl);

        var layerNodeDiv = html.create('div', {
          'class': 'tree-node-div'
        }, layerNodeLi);

        var collapseSpan = html.create('span', {
          'class': 'tree-node-column-span collapse-span'
        }, layerNodeDiv);

        var checkBoxSpan = html.create('span', {
          'class': 'tree-node-column-span check-box-span'
        }, layerNodeDiv);

        var checkBoxDiv = html.create('div', {
          'class': 'tree-node-column-div check-box-div'
        }, checkBoxSpan);

        var displayIconClass = this.displayLayerTypeIcon ? "display" : "";
        var iconSpan = html.create('span', {
          'class': 'tree-node-column-span icon-span ' + displayIconClass
        }, layerNodeDiv);

        /*
        var iconDiv = html.create('div', {
          'class': 'tree-node-column-div icon-div',
          'style': iconSpanStyle
        }, iconSpan);
        */

        // restore layer state
        var state;
        var oldState = this.layerState[layerNode.id];
        if(oldState) {
          state = oldState.selected;
        } else {
          state = this.layerStateController.getState(layerNode);
        }

        var checkBox = new CheckBox({
          'checked': state
        }, checkBoxDiv);

        var titleSpan = html.create('span', {
          'class': 'tree-node-column-span title-span',
          'innerHTML': layerNode.title
        }, layerNodeDiv);


        // create subLayerNode ul
        var subLayerNodeUl = html.create('ul', {
          'class': 'tree-ul tree-subnode-ul',
          'style': 'display:none; '
        }, layerNodeLi);

        var layerData = {
          layerNode: layerNode,
          layerNodeLi: layerNodeLi,
          layerNodeDiv: layerNodeDiv,
          collapseSpan: collapseSpan,
          iconSpan: iconSpan,
          checkBox: checkBox,
          subLayerNodeUl: subLayerNodeUl,
          hasBeenOpened: false
        };

        this._layerDatas[layerNode.id] = layerData;
        if(!layerNode.isLeaf()) {
          html.addClass(collapseSpan, 'is-leaf');
          html.addClass(titleSpan, 'is-leaf');
          handle = on(collapseSpan, 'click', lang.hitch(this, this._onCollapse, layerData));
          this._eventHandles.push(handle);
          handle = on(titleSpan, 'click', lang.hitch(this, this._onCollapse, layerData));
          this._eventHandles.push(handle);
          if(this.onlySelectLeafLayer) {
            checkBox.setStatus(false);
            html.setStyle(checkBoxDiv, 'display', 'none');
          }
        }

        if(this.viewMode === true) {
          checkBox.setStatus(false);
        }

        //this.own(on(checkBox, 'change', lang.hitch(this, this._onCheckBoxChange, layerData)));
        handle = on(checkBox.domNode, 'click', lang.hitch(this, this._onCheckBoxChange, layerData));
        this._eventHandles.push(handle);

        this._setIconImage(layerData, false);

        return layerData;
      },

      _setIconImage: function(layerData, opened) {
        if(!this.displayLayerTypeIcon) {
          return;
        }

        var layerNode = layerData.layerNode;
        var layerTypeDef = layerNode.getLayerType();
        var layerObjectDef = layerNode.getLayerObject();
        all({
          layerType: layerTypeDef,
          layerObject: layerObjectDef
        }).then(lang.hitch(this, function(result) {
          var item;
          if(result.layerType && result.layerObject) {
            item = {
              type: result.layerType,
              layerInfo: layerNode._layerInfo
            };

            var baseUrl = window.location.protocol + "//" + window.location.host + require.toUrl("jimu");
            var imageName = this._getIconImageName(item, opened);
            if (imageName) {
              var backgroundImageUrl = "url(" + baseUrl + "/css/images/" + imageName + ")";
              html.setStyle(layerData.iconSpan, 'background-image', backgroundImageUrl);
            }
          }
        }));
      },

      _getCheckBoxValue: function(checkBox) {
        return checkBox.getStatus() ? checkBox.getValue() : false;
      },

      _clearLayerState: function(layerState) {
        var newLayerState = {};
        if(layerState) {
          this.layerStructure.traversal(lang.hitch(this, function(layerNode) {
            if(layerState[layerNode.id]) {
              newLayerState[layerNode.id] = {
                selected: layerState[layerNode.id].selected
              };
            }
          }));
        }
        return newLayerState;
      },


      _selectOrDeselectLayer: function(layerId, isSelect) {
        var layerData = this._layerDatas[layerId];
        if(layerData) {
          layerData.checkBox.setValue(isSelect);
          this._onCheckBoxChange(layerData);
        }
      },

      selectLayer: function(layerId) {
        this._selectOrDeselectLayer(layerId, true);
      },

      deselectLayer: function(layerId) {
        this._selectOrDeselectLayer(layerId, false);
      },

      // layerState: {
      //  id: {
      //        selected: true/false
      //      }
      //  }
      getState: function() {
        var layerState = lang.clone(this.layerState);

        for (var id in this._layerDatas) {
          if(this._layerDatas.hasOwnProperty(id) && (typeof this._layerDatas[id] !== 'function')) {
            var layerData = this._layerDatas[id];
            var checkBox = layerData.checkBox;
            if(this._getCheckBoxValue(checkBox)) {
              layerState[id] = {selected: true};
            } else {
              layerState[id] = {selected: false};
            }
          }
        }
        return layerState;
      },

      // layerState: {
      //  id: {
      //        selected: true/false
      //      }
      //  }
      restoreState: function(layerState) {
        this.layerState = this._clearLayerState(layerState);
        for (var id in this._layerDatas) {
          if(this._layerDatas.hasOwnProperty(id) &&
             (typeof this._layerDatas[id] !== 'function')) {
            var layerData = this._layerDatas[id];
            var checkBox = layerData && layerData.checkBox;
            var state = this.layerState[id];
            if(state) {
              checkBox.setValue(state.selected);
            } else {
              checkBox.setValue(this.layerStateController.getState(layerData.layerNode));
            }
          }
        }
        this.layerStateController.restoreState(this.layerState, this.layerStructure);
      },

      setViewMode: function(viewMode) {
        for (var id in this._layerDatas) {
          if(this._layerDatas.hasOwnProperty(id) &&
             (typeof this._layerDatas[id] !== 'function')) {
            var layerData = this._layerDatas[id];
            var checkBox = layerData && layerData.checkBox;
            if(viewMode === true) {
              this.viewMode = true;
              checkBox.setStatus(false);
            } else {
              this.viewMode = false;
              checkBox.setStatus(true);
            }
          }
        }
      },

      getSelectedLayerNodes: function() {
        // some selected layers may have not been loaded.
        var selectedLayerNodes = [];
        var layerState =  this.getState();
        for (var id in layerState) {
          if(layerState.hasOwnProperty(id) && (typeof layerState[id] !== 'function')) {
            if(layerState[id].selected) {
              var layerNode = this.layerStructure.getNodeById(id);
              if(layerNode) {
                selectedLayerNodes.push(layerNode);
              }
            }
          }
        }
        return selectedLayerNodes;
      },

      getLoadedLayerNodes: function() {
        var loadedLayerNodes = [];
        for(var id in this._layerDatas) {
          if(this._layerDatas.hasOwnProperty(id) && (typeof this._layerDatas[id] !== 'function')) {
            var layerNode = this.layerStructure.getNodeById(id);
            if(layerNode) {
              loadedLayerNodes.push(layerNode);
            }
          }
        }
        return loadedLayerNodes;
      },

      getLayerAssociateDomNodesById: function(layerId) {
        var domNodes = null;
        var layerData = this._layerDatas[layerId];
        if(layerData) {
          domNodes = {
            collapseIcon: layerData.collapseSpan,
            checkBox: layerData.checkBox.domNode,
            layerTypeIcon: layerData.iconSpan
          };
        }
        return domNodes;
      },

      //compatible with the LayerChooserFromMap
      //return an array, each element has 'name', 'url' and 'layerInfo' attribute
      getSelectedItems: function(){
        var handledItems = [];
        handledItems = array.map(this.getSelectedLayerNodes(), function(layerNode) {
          return {
            name: layerNode.title,
            url: layerNode.getUrl(),
            layerInfo: layerNode._layerInfo
          };
        }, this);
        return handledItems;
      },

      //compatible with the LayerChooserFromMap
      //return an array, each element has 'name', 'url' and 'layerInfo' attribute
      getAllItems: function(){
        var handledItems = [];
        return handledItems;
      },


      _clear:function(){
        // clear this._layerDatas
        this._layerDatas = {};

        // clear this._eventHandles
        array.forEach(this._eventHandles, function(eventHandle) {
          eventHandle.remove();
        }, this);
        this._eventHandles = [];

        // clear tree
        html.empty(this.treeUl);
      },

      destroy: function(){
        this._clear();

        if(this.map) {
          this.layerStructure.destroy();
        }

        if(this.shelter){
          this.shelter.destroy();
          this.shelter = null;
        }

        this.inherited(arguments);
      },

      /*****************************
      * Events
      *****************************/
      _onCollapse: function(layerData) {
        var displayOfSubLayerUl = html.getStyle(layerData.subLayerNodeUl, 'display');
        var collapsed = (displayOfSubLayerUl === "none") ? true : false;
        if(collapsed) {
          html.setStyle(layerData.subLayerNodeUl, 'display', 'block');
          html.addClass(layerData.collapseSpan, 'opened');
        } else {
          html.setStyle(layerData.subLayerNodeUl, 'display', 'none');
          html.removeClass(layerData.collapseSpan, 'opened');
        }

        this._setIconImage(layerData, collapsed);

        if(!layerData.hasBeenOpened) {
          this._createLayerNodes(layerData.layerNode.getSubNodes(), layerData.subLayerNodeUl);
          layerData.hasBeenOpened = true;
        }

      },

      _onCheckBoxChange: function(layerData, evt) {
        this.layerStateController.setState(layerData.layerNode, this._getCheckBoxValue(layerData.checkBox));
        this.emit('selection-change', layerData.layerNode, this._getCheckBoxValue(layerData.checkBox));
        this._onTreeClick(layerData, evt);
      },

      _onLayerInfosChanged: function() {
        /*jshint unused: false*/
        // need to filter the layer.
        this._createTree();
        this.emit('update');
      },

      _onLayerInfosIsShowInMapChanged: function(){
        /*jshint unused: false*/
        // need to filter the layer.
        this._createTree();
        this.emit('update');
      },

      //to be override
      //send 'tree-click' event for compatible with the LayerChooserFromMap
      _onTreeClick: function(layerData, evt){
        /*jshint unused: false*/
        var item = {
          name: layerData.layerNode.title || "",
          parent: null,
          layerInfo: layerData.layerNode._layerInfo,
          type: null,
          layerClass: null,
          id: null,
          isLeaf: layerData.layerNode.isLeaf(),
          hasChildren: layerData.layerNode.isLeaf() ? false : true
        };
        this.emit('tree-click', item, null, evt);
      }
    });

    LayerChooser.LayerStateController = declare(null, {
      // get state for single layer
      getState: function(layerNode) {
        /*jshint unused: false*/
        return true;
      },

      // set state for single layer
      setState: function(layerNode, selected) {
        /*jshint unused: false*/
        return this;
      },

      restoreState: function(layerState, layerStructure) {
        /*jshint unused: false*/
        return this;
      }

    });

    LayerChooser.LayerVisibilityStateController = declare(LayerChooser.LayerStateController, {
      getState: function(layerNode) {
        return layerNode.isToggledOn();
      },

      setState: function(layerNode, selected) {
        /*jshint unused: false*/
        layerNode.toggle();
        return this;
      },

      restoreState: function(layerState, layerStructure) {
        var options = {layerOptions: {}};

        for (var id in layerState) {
          if(layerState.hasOwnProperty(id) &&
             (typeof layerState[id] !== 'function')) {
            var state = layerState[id];
            options.layerOptions[id] = {visible: state.selected};
          }
        }

        layerStructure.restoreState(options);
        return this;
      }
    });
    LayerChooser.layerVisibilityStateController =  new LayerChooser.LayerVisibilityStateController();

    LayerChooser.LayerLegendStateController = declare(LayerChooser.LayerStateController, {
      getState: function(layerNode) {
        //return layerNode.isToggledOnLegendFromWebMap();
        return layerNode.isShowLegend();
      }
    });
    LayerChooser.layerLegendStateController =  new LayerChooser.LayerLegendStateController();

    return LayerChooser;
  });
