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
  'dijit/_WidgetBase',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-construct',
  'dojo/on',
  'dojo/query',
  'jimu/dijit/CheckBox',
  'jimu/dijit/DropMenu',
  './PopupMenu',
  'dijit/_TemplatedMixin',
  'dojo/text!./LayerListView.html',
  'dojo/dom-class',
  'dojo/dom-style',
  './NlsStrings'
], function(_WidgetBase, declare, lang, array, domConstruct, on, query,
  CheckBox, DropMenu, PopupMenu, _TemplatedMixin, template,
  domClass, domStyle, NlsStrings) {

  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    _currentSelectedLayerRowNode: null,
    operationsDropMenu: null,
    _layerNodeHandles: null,

    postMixInProperties: function() {
      this.inherited(arguments);
      this.nls = NlsStrings.value;
      this._layerNodeHandles = {};
    },

    postCreate: function() {
      array.forEach(this.operLayerInfos.getLayerInfoArray(), function(layerInfo) {
        this.drawListNode(layerInfo, 0, this.layerListTable);
      }, this);

      array.forEach(this.operLayerInfos.getTableInfoArray(), function(layerInfo) {
        this.drawListNode(layerInfo, 0, this.tableListTable);
      }, this);
      this._initOperations();
    },

    drawListNode: function(layerInfo, level, toTableNode, position) {
      var nodeAndSubNode, showLegendDiv;
      if(this.isLayerHiddenInWidget(layerInfo)) {
        return;
      }
      if (layerInfo.newSubLayers.length === 0) {
        //addLayerNode
        nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, position);
        //add legend node
        if (this.config.showLegend) {
          this.addLegendNode(layerInfo, level, nodeAndSubNode.subNode);
        } else {
          showLegendDiv = query(".showLegend-div", nodeAndSubNode.currentNode)[0];
          if(showLegendDiv) {
            domClass.add(showLegendDiv, 'hidden');
          }
        }
        return;
      }
      //addLayerNode
      nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, position);
      array.forEach(layerInfo.newSubLayers, lang.hitch(this, function(level, subLayerInfo) {
        this.drawListNode(subLayerInfo, level + 1, nodeAndSubNode.subNode);
      }, level));
    },

    addLayerNode: function(layerInfo, level, toTableNode, position) {
      var layerTrNode,
        layerTdNode, ckSelectDiv, ckSelect, imageNoLegendDiv, handle,
        imageNoLegendNode, popupMenuNode, i, imageShowLegendDiv, popupMenu, divLabel;

      var rootLayerInfo = layerInfo.getRootLayerInfo();
      if(!this._layerNodeHandles[rootLayerInfo.id]) {
        this._layerNodeHandles[rootLayerInfo.id] = [];
      }

      var layerTrNodeClass = "layer-tr-node-" + layerInfo.id;
      layerTrNode = domConstruct.create('tr', {
        'class': 'jimu-widget-row layer-row ' +
          ( /*visible*/ false ? 'jimu-widget-row-selected ' : ' ') + layerTrNodeClass,
        'layerTrNodeId': layerInfo.id
      });
      domConstruct.place(layerTrNode, toTableNode, position);

      layerTdNode = domConstruct.create('td', {
        'class': 'col col1'
      }, layerTrNode);

      for (i = 0; i < level; i++) {
        domConstruct.create('div', {
          'class': 'begin-blank-div jimu-float-leading',
          'innerHTML': ''
        }, layerTdNode);
      }

      imageShowLegendDiv = domConstruct.create('div', {
        'class': 'showLegend-div jimu-float-leading',
        'imageShowLegendDivId': layerInfo.id
      }, layerTdNode);

      ckSelectDiv = domConstruct.create('div', {
        'class': 'div-select jimu-float-leading'
      }, layerTdNode);

      ckSelect = new CheckBox({
        checked: layerInfo.isVisible(), //layerInfo.visible
        'class': "visible-checkbox-" + layerInfo.id
      });

      domConstruct.place(ckSelect.domNode, ckSelectDiv);

      imageNoLegendDiv = domConstruct.create('div', {
        'class': 'noLegend-div jimu-float-leading'
      }, layerTdNode);

      var imageName;
      if (layerInfo.isTable) {
        imageName = 'images/table.png';
      } else {
        imageName = 'images/noLegend.png';
      }

      imageNoLegendNode = domConstruct.create('img', {
        'class': 'noLegend-image',
        'src': this.layerListWidget.folderUrl + imageName,
        'alt': 'l'
      }, imageNoLegendDiv);

      if (layerInfo.noLegend || layerInfo.isTable) {
        domStyle.set(imageShowLegendDiv, 'display', 'none');
        domStyle.set(ckSelectDiv, 'display', 'none');
        domStyle.set(imageNoLegendDiv, 'display', 'block');
      }

      // set tdNode width
      domStyle.set(layerTdNode, 'width', level * 12 + 40 + 'px');

      var layerTitleTdNode = domConstruct.create('td', {
        'class': 'col col2'
      }, layerTrNode);

      var grayedTitleClass = '';
      try {
        if (!layerInfo.isInScale()) {
          grayedTitleClass = 'grayed-title';
        }
      } catch (err) {
        console.warn(err.message);
      }
      var layerTitleDivIdClass = 'layer-title-div-' + layerInfo.id;
      divLabel = domConstruct.create('div', {
        'innerHTML': layerInfo.title,
        'class':layerTitleDivIdClass + ' div-content jimu-float-leading ' + grayedTitleClass
      }, layerTitleTdNode);

      //domStyle.set(divLabel, 'width', 263 - level*13 + 'px');

      layerTdNode = domConstruct.create('td', {
        'class': 'col col3'
      }, layerTrNode);

      var popupMenuDisplayStyle = this.hasContentMenu() ? "display: block" : "display: none";
      // add popupMenu
      popupMenuNode = domConstruct.create('div', {
        'class': 'layers-list-popupMenu-div',
        'style': popupMenuDisplayStyle
      }, layerTdNode);

      /*
      var handle = on(popupMenuNode,
                  'click',
                  lang.hitch(this, function() {
                    var popupMenu = new PopupMenu({
                      //items: layerInfo.popupMenuInfo.menuItems,
                      _layerInfo: layerInfo,
                    box: this.layerListWidget.domNode.parentNode,
                    popupMenuNode: popupMenuNode,
                    layerListWidget: this.layerListWidget,
                    _config: this.config
                    }).placeAt(popupMenuNode);
                    this.own(on(popupMenu,
                        'onMenuClick',
                        lang.hitch(this, this._onPopupMenuItemClick, layerInfo, popupMenu)));

                    handle.remove();
                  }));
      */
      /*
      popupMenu = new PopupMenu({
        //items: layerInfo.popupMenuInfo.menuItems,
        _layerInfo: layerInfo,
        box: this.layerListWidget.domNode.parentNode,
        popupMenuNode: popupMenuNode,
        layerListWidget: this.layerListWidget,
        _config: this.config
      }).placeAt(popupMenuNode);
      this.own(on(popupMenu,
        'onMenuClick',
        lang.hitch(this, this._onPopupMenuItemClick, layerInfo, popupMenu)));
      */

      //add a tr node to toTableNode.
      var trNode = domConstruct.create('tr', {
        'class': '',
        'layerContentTrNodeId': layerInfo.id
      });
      domConstruct.place(trNode, toTableNode, position);

      var tdNode = domConstruct.create('td', {
        'class': '',
        'colspan': '3'
      }, trNode);

      var tableNode = domConstruct.create('table', {
        'class': 'layer-sub-node',
        'subNodeId': layerInfo.id
      }, tdNode);

      //bind event
      handle = this.own(on(layerTitleTdNode,
        'click',
        lang.hitch(this,
          this._onRowTrClick,
          layerInfo,
          imageShowLegendDiv,
          layerTrNode,
          tableNode)));
      this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);

      handle = this.own(on(imageShowLegendDiv,
        'click',
        lang.hitch(this,
          this._onRowTrClick,
          layerInfo,
          imageShowLegendDiv,
          layerTrNode,
          tableNode)));
      this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);

      handle = this.own(on(layerTrNode,
        'mouseover',
        lang.hitch(this, this._onLayerNodeMouseover, layerTrNode, popupMenu)));
      this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);

      handle = this.own(on(layerTrNode,
        'mouseout',
        lang.hitch(this, this._onLayerNodeMouseout, layerTrNode, popupMenu)));
      this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);

      handle = this.own(on(ckSelect.domNode, 'click', lang.hitch(this,
        this._onCkSelectNodeClick,
        layerInfo,
        ckSelect)));
      this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);

      handle = this.own(on(popupMenuNode, 'click', lang.hitch(this,
        this._onPopupMenuClick,
        layerInfo,
        popupMenuNode,
        layerTrNode)));
      this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);

      return {
        currentNode: layerTrNode,
        subNode: tableNode
      };
    },

    hasContentMenu: function() {
      var hasContentMenu = false;
      var item;
      if(this.config.contextMenu) {
        for (item in this.config.contextMenu) {
          if(this.config.contextMenu.hasOwnProperty(item) &&
             (typeof this.config.contextMenu[item] !== 'function')) {
            hasContentMenu = hasContentMenu || this.config.contextMenu[item];
          }
        }
      } else {
        hasContentMenu = true;
      }
      return hasContentMenu;
    },

    destroyLayerTrNode: function(layerInfo) {
      var removedLayerNode = query("[class~='layer-tr-node-" + layerInfo.id + "']", this.domNode)[0];
      var removedLayerContentNode = query("[layercontenttrnodeid='" + layerInfo.id + "']", this.domNode)[0];
      if(removedLayerNode) {
        var rootLayerInfo = layerInfo.getRootLayerInfo();
        array.forEach(this._layerNodeHandles[rootLayerInfo.id], function(handle) {
          handle.remove();
        }, this);
        delete this._layerNodeHandles[rootLayerInfo.id];
        domConstruct.destroy(removedLayerNode);
        if(removedLayerContentNode) {
          domConstruct.destroy(removedLayerContentNode);
        }
      }
    },

    addLegendNode: function(layerInfo, level, toTableNode) {
      //var legendsDiv;
      var legendTrNode = domConstruct.create('tr', {
          'class': 'legend-node-tr'
        }, toTableNode),
        legendTdNode;

      legendTdNode = domConstruct.create('td', {
        'class': 'legend-node-td'
      }, legendTrNode);

      try {
        var legendsNode = layerInfo.createLegendsNode();
        //layerInfo.legendsNode = legendsNode;
        //domStyle.set(legendsNode, 'marginLeft', (level+1)*12 + 'px');
        domStyle.set(legendsNode, 'font-size', (level + 1) * 12 + 'px');
        domConstruct.place(legendsNode, legendTdNode);
      } catch (err) {
        console.error(err);
      }
    },

    // return current state:
    //   true:  fold,
    //   false: unfold
    _foldSwitch: function(layerInfo, imageShowLegendDiv, subNode) {
      /*jshint unused: false*/
      var state;
      if (domStyle.get(subNode, 'display') === 'none') {
        state = this._foldOrUnfoldLayer(layerInfo, false, imageShowLegendDiv, subNode);
      } else {
        state = this._foldOrUnfoldLayer(layerInfo, true, imageShowLegendDiv, subNode);
      }
      return state;
    },

    _foldOrUnfoldLayer: function(layerInfo, isFold, imageShowLegendDivParam, subNodeParam) {
      var imageShowLegendDiv =
        imageShowLegendDiv ?
        imageShowLegendDivParam :
        query("div[imageShowLegendDivId='" + layerInfo.id + "']", this.layerListTable)[0];
      var subNode =
        subNode ?
        subNodeParam :
        query("table[subNodeId='" + layerInfo.id + "']", this.layerListTable)[0];

      var state = null;
      if(imageShowLegendDiv && subNode) {
        if (isFold) {
          //fold
          domStyle.set(subNode, 'display', 'none');
          domClass.remove(imageShowLegendDiv, 'unfold');
          state = true;
        } else {
          //unfold
          domStyle.set(subNode, 'display', 'table');
          domClass.add(imageShowLegendDiv, 'unfold');
          state = false;
          if (layerInfo.isLeaf()) {
            var legendsNode = query(".legends-div", subNode)[0];
            var loadingImg = query(".legends-loading-img", legendsNode)[0];
            if (legendsNode && loadingImg) {
              layerInfo.drawLegends(legendsNode, this.layerListWidget.appConfig.portalUrl);
            }
          }
        }
      }
      return state;
    },

    redrawLegends: function(layerInfo) {
      var legendsNode = query("div[legendsDivId='" + layerInfo.id + "']", this.layerListTable)[0];
      if(legendsNode) {
        if(legendsNode._legendDijit && legendsNode._legendDijit.destroy) {
          legendsNode._legendDijit.destroy();
        }
        layerInfo.drawLegends(legendsNode, this.layerListWidget.appConfig.portalUrl);
      }
    },

    _foldOrUnfoldLayers: function(layerInfos, isFold) {
      array.forEach(layerInfos, function(layerInfo) {
        this._foldOrUnfoldLayer(layerInfo, isFold);
      }, this);
    },

    _onCkSelectNodeClick: function(layerInfo, ckSelect, evt) {
      if(evt.ctrlKey || evt.metaKey) {
        if(layerInfo.isRootLayer()) {
          this.turnAllRootLayers(ckSelect.checked);
        } else {
          this.turnAllSameLevelLayers(layerInfo, ckSelect.checked);
        }
      } else {
        this.layerListWidget._denyLayerInfosIsVisibleChangedResponseOneTime = true;
        layerInfo.setTopLayerVisible(ckSelect.checked);
      }
      evt.stopPropagation();
    },

    _onPopupMenuClick: function(layerInfo, popupMenuNode, layerTrNode, evt) {
      var rootLayerInfo = layerInfo.getRootLayerInfo();
      var popupMenu = popupMenuNode.popupMenu;
      if(!popupMenu) {
        popupMenu = new PopupMenu({
          //items: layerInfo.popupMenuInfo.menuItems,
          _layerInfo: layerInfo,
          box: this.layerListWidget.domNode.parentNode,
          popupMenuNode: popupMenuNode,
          layerListWidget: this.layerListWidget,
          _config: this.config
        }).placeAt(popupMenuNode);
        popupMenuNode.popupMenu = popupMenu;
        var handle = this.own(on(popupMenu,
              'onMenuClick',
              lang.hitch(this, this._onPopupMenuItemClick, layerInfo, popupMenu)));
        this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);
      }

      /*jshint unused: false*/
      this._changeSelectedLayerRow(layerTrNode);
      if (popupMenu && popupMenu.state === 'opened') {
        popupMenu.closeDropMenu();
      } else {
        this._hideCurrentPopupMenu();
        if (popupMenu) {
          this.currentPopupMenu = popupMenu;
          popupMenu.openDropMenu();
        }
      }

      //hidden operation mene if that is opened.
      if (this.operationsDropMenu && this.operationsDropMenu.state === 'opened') {
        this.operationsDropMenu.closeDropMenu();
      }
      evt.stopPropagation();
    },

    _hideCurrentPopupMenu: function() {
      if (this.currentPopupMenu && this.currentPopupMenu.state === 'opened') {
        this.currentPopupMenu.closeDropMenu();
      }
    },

    _onLayerNodeMouseover: function(layerTrNode) {
      domClass.add(layerTrNode, "layer-row-mouseover");
      /*
      if (popupMenu) {
        //domClass.add(popupMenuNode, "layers-list-popupMenu-div-selected");
        domClass.add(popupMenu.btnNode, "jimu-icon-btn-selected");
      }
      */
    },

    _onLayerNodeMouseout: function(layerTrNode) {
      domClass.remove(layerTrNode, "layer-row-mouseover");
      /*
      if (popupMenu) {
        //domClass.remove(popupMenuNode, "layers-list-popupMenu-div-selected");
        domClass.remove(popupMenu.btnNode, "jimu-icon-btn-selected");
      }
      */
    },

    _onLayerListWidgetPaneClick: function() {
      if (this.operationsDropMenu) {
        this.operationsDropMenu.closeDropMenu();
      }
    },

    _onRowTrClick: function(layerInfo, imageShowLegendDiv, layerTrNode, subNode, evt) {
      this._changeSelectedLayerRow(layerTrNode);
      var fold = this._foldSwitch(layerInfo, imageShowLegendDiv, subNode);
      if(evt.ctrlKey || evt.metaKey) {
        if(layerInfo.isRootLayer()) {
          this.foldOrUnfoldAllRootLayers(fold);
        } else {
          this.foldOrUnfoldSameLevelLayers(layerInfo, fold);
        }
      }
    },

    _changeSelectedLayerRow: function(layerTrNode) {
      if (this._currentSelectedLayerRowNode && this._currentSelectedLayerRowNode === layerTrNode) {
        return;
      }
      if (this._currentSelectedLayerRowNode) {
        domClass.remove(this._currentSelectedLayerRowNode, 'jimu-widget-row-selected');
      }
      domClass.add(layerTrNode, 'jimu-widget-row-selected');
      this._currentSelectedLayerRowNode = layerTrNode;
    },

    _onPopupMenuItemClick: function(layerInfo, popupMenu, item, data) {
      var evt = {
          itemKey: item.key,
          extraData: data,
          layerListWidget: this.layerListWidget,
          layerListView: this
        },
        result;

      // window.jimuNls.layerInfosMenu.itemTransparency NlsStrings.value.itemTransparency
      if (item.key === 'transparency') {
        if (domStyle.get(popupMenu.transparencyDiv, 'display') === 'none') {
          popupMenu.showTransNode(layerInfo.getOpacity());
        } else {
          popupMenu.hideTransNode();
        }
      } else {
        result = popupMenu.popupMenuInfo.onPopupMenuClick(evt);
        if (result.closeMenu) {
          popupMenu.closeDropMenu();
        }
      }
    },

    // befor exchange:  id1 -> id2
    // after exchanged: id2 -> id1
    _exchangeLayerTrNode: function(layerInfo1, layerInfo2) {
      var layer1TrNode = query("tr[layerTrNodeId='" + layerInfo1.id + "']", this.layerListTable)[0];
      //var layer1ContentTrNode = query("tr[layerContentTrNodeId='" + layerInfo1.id + "']",
      //                                this.layerListTable)[0];
      var layer2TrNode = query("tr[layerTrNodeId='" + layerInfo2.id + "']", this.layerListTable)[0];
      var layer2ContentTrNode = query("tr[layerContentTrNodeId='" + layerInfo2.id + "']",
        this.layerListTable)[0];
      if(layer1TrNode && layer2TrNode && layer2ContentTrNode) {
        // change layerTr
        this.layerListTable.removeChild(layer2TrNode);
        this.layerListTable.insertBefore(layer2TrNode, layer1TrNode);
        // change LayerContentTr
        this.layerListTable.removeChild(layer2ContentTrNode);
        this.layerListTable.insertBefore(layer2ContentTrNode, layer1TrNode);
      }
    },


    _getMovedSteps: function(layerInfo, upOrDown) {
      // summary:
      //   according to hidden layers to get moved steps.
      var steps = 1;
      var layerInfoIndex;
      var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
      array.forEach(layerInfoArray, function(currentLayerInfo, index) {
        if(layerInfo.id === currentLayerInfo.id) {
          layerInfoIndex = index;
        }
      }, this);
      if(upOrDown === "moveup") {
        while(!layerInfoArray[layerInfoIndex].isFirst) {
          layerInfoIndex--;
          if(this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex]) &&
              !layerInfoArray[layerInfoIndex].isFirst) {
            steps++;
          } else {
            break;
          }
        }
      } else {
        while(!layerInfoArray[layerInfoIndex].isLast) {
          layerInfoIndex++;
          if(this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex]) &&
              !layerInfoArray[layerInfoIndex].isLast) {
            steps++;
          } else {
            break;
          }
        }
      }
      return steps;
    },

    _initOperations: function() {
      this.operationsDropMenu = new DropMenu({
        items:[{
          key: "turnAllLayersOn",
          label: this.nls.turnAllLayersOn
        }, {
          key: "turnAllLayersOff",
          label: this.nls.turnAllLayersOff
        }, {
          key: "separator"
        }, {
          key: "expandAllLayers",
          label: this.nls.expandAllLayers
        }, {
          key: "collapseAlllayers",
          label: this.nls.collapseAlllayers
        }],
        box: this.layerListWidget.domNode.parentNode
      }).placeAt(this.layerListOperations);

      var operationIconBtnNode = query('div.jimu-dropmenu > div:first-child',
          this.layerListOperations)[0];

      if(operationIconBtnNode) {
        domClass.remove(operationIconBtnNode, ['jimu-icon-btn', 'popup-menu-button']);
        domClass.add(operationIconBtnNode, ['feature-action', 'icon-operation']);
      }

      if(this.operationsDropMenu.btnNode) {
        this.own(on(this.operationsDropMenu.btnNode,
          'click',
          lang.hitch(this, this._onLayerListOperationsClick)));
      }

      this.own(on(this.operationsDropMenu ,
        'onMenuClick',
        lang.hitch(this, this._onOperationsMenuItemClick)));
    },

    _onLayerListOperationsClick: function() {
      this._hideCurrentPopupMenu();
    },

    _onOperationsMenuItemClick: function(item) {
      switch (item.key) {
      case 'turnAllLayersOn':
        this.turnAllRootLayers(true);
        return;
      case 'turnAllLayersOff':
        this.turnAllRootLayers(false);
        return;
      case 'expandAllLayers':
        this.foldOrUnfoldAllRootLayers(false);
        return;
      case 'collapseAlllayers':
        this.foldOrUnfoldAllRootLayers(true);
        return;
      default:
        return;
      }
    },

    isFirstDisplayedLayerInfo: function(layerInfo) {
      var isFirst;
      var steps;
      var layerInfoIndex;
      var layerInfoArray;
      if(layerInfo.isFirst || !layerInfo.isRootLayer()) {
        isFirst = true;
      } else {
        steps = this._getMovedSteps(layerInfo, "moveup");
        layerInfoArray = this.operLayerInfos.getLayerInfoArray();
        layerInfoIndex = this.operLayerInfos._getTopLayerInfoIndexById(layerInfo.id);
        if(this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex - steps])) {
          isFirst = true;
        } else {
          isFirst = false;
        }
      }
      return isFirst;
    },

    isLastDisplayedLayerInfo: function(layerInfo) {
      var isLast;
      var steps;
      var layerInfoIndex;
      var layerInfoArray;
      if(layerInfo.isLast || !layerInfo.isRootLayer()) {
        isLast = true;
      } else {
        steps = this._getMovedSteps(layerInfo, "movedown");
        layerInfoArray = this.operLayerInfos.getLayerInfoArray();
        layerInfoIndex = this.operLayerInfos._getTopLayerInfoIndexById(layerInfo.id);
        if(this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex + steps])) {
          isLast = true;
        } else {
          isLast = false;
        }
      }
      return isLast;
    },

    moveUpLayer: function(layerInfo) {
      // summary:
      //    move up layer in layer list.
      // description:
      //    call the moveUpLayer method of LayerInfos to change the layer order in map,
      //    and update the data in LayerInfos
      //    then, change layerNodeTr and layerContentTr domNode
      var steps = this._getMovedSteps(layerInfo, 'moveup');
      this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
      var beChangedLayerInfo = this.operLayerInfos.moveUpLayer(layerInfo, steps);
      if (beChangedLayerInfo) {
        this._exchangeLayerTrNode(beChangedLayerInfo, layerInfo);
      }
    },

    moveDownLayer: function(layerInfo) {
      // summary:
      //    move down layer in layer list.
      // description:
      //    call the moveDownLayer method of LayerInfos to change the layer order in map,
      //    and update the data in LayerInfos
      //    then, change layerNodeTr and layerContentTr domNode
      var steps = this._getMovedSteps(layerInfo, 'movedown');
      this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
      var beChangedLayerInfo = this.operLayerInfos.moveDownLayer(layerInfo, steps);
      if (beChangedLayerInfo) {
        this._exchangeLayerTrNode(layerInfo, beChangedLayerInfo);
      }
    },

    isLayerHiddenInWidget: function(layerInfo) {
      var isHidden = false;
      var currentLayerInfo = layerInfo;
      if(layerInfo &&
         this.config.layerOptions &&
         this.config.layerOptions[layerInfo.id] !== undefined) {
        while(currentLayerInfo) {
          isHidden = isHidden ||  !this.config.layerOptions[currentLayerInfo.id].display;
          if(isHidden) {
            break;
          }
          currentLayerInfo = currentLayerInfo.parentLayerInfo;
        }
      } else {
        // if config has not been configured, default value is 'true'.
        // if config has been configured, but new layer of webmap is ont in config file,
        //   default value is 'true'.
        isHidden = false;
      }
      return isHidden;
    },

    turnAllRootLayers: function(isOnOrOff) {
      var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
      array.forEach(layerInfoArray, function(layerInfo) {
        if (!this.isLayerHiddenInWidget(layerInfo)) {
          layerInfo.setTopLayerVisible(isOnOrOff);
        }
      }, this);
    },

    turnAllSameLevelLayers: function(layerInfo, isOnOrOff) {
      var layerOptions = {};
      var rootLayerInfo = layerInfo.getRootLayerInfo();
      rootLayerInfo.traversal(lang.hitch(this, function(subLayerInfo) {
        if(subLayerInfo.parentLayerInfo &&
           subLayerInfo.parentLayerInfo.id === layerInfo.parentLayerInfo.id &&
           !this.isLayerHiddenInWidget(subLayerInfo)) {
          layerOptions[subLayerInfo.id] = {visible: isOnOrOff};
        } else {
          layerOptions[subLayerInfo.id] = {visible: subLayerInfo.isVisible()};
        }
      }));
      rootLayerInfo.resetLayerObjectVisibility(layerOptions);
    },

    foldOrUnfoldAllRootLayers: function(isFold) {
      var layerInfoArray = array.filter(this.operLayerInfos.getLayerInfoArray(),
                                        function(layerInfo) {
        return !this.isLayerHiddenInWidget(layerInfo);
      }, this);
      this._foldOrUnfoldLayers(layerInfoArray, isFold);
    },

    foldOrUnfoldSameLevelLayers: function(layerInfo, isFold) {
      var layerInfoArray;
      if(layerInfo.parentLayerInfo) {
        layerInfoArray = array.filter(layerInfo.parentLayerInfo.getSubLayers(),
                                          function(layerInfo) {
          return !this.isLayerHiddenInWidget(layerInfo);
        }, this);
        this._foldOrUnfoldLayers(layerInfoArray, isFold);
      }
    }

  });
});
