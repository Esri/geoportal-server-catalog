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
  'dijit/_WidgetBase',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-construct',
  'dojo/on',
  'dojo/query',
  'jimu/dijit/CheckBox',
  './PopupMenu',
  'dijit/_TemplatedMixin',
  'dojo/text!./LayerListView.html',
  'dojo/dom-attr',
  'dojo/dom-class',
  'dojo/dom-style',
  './NlsStrings'
], function(_WidgetBase, declare, lang, array, domConstruct, on, query,
  CheckBox, PopupMenu, _TemplatedMixin, template,
  domAttr, domClass, domStyle, NlsStrings) {

  return declare([_WidgetBase, _TemplatedMixin], {
    templateString: template,
    _currentSelectedLayerRowNode: null,

    postMixInProperties: function() {
      this.inherited(arguments);
      this.nls = NlsStrings.value;
    },

    postCreate: function() {
      array.forEach(this.operLayerInfos.getLayerInfoArray(), function(layerInfo) {
        this.drawListNode(layerInfo, 0, this.layerListTable, true);
      }, this);

      array.forEach(this.operLayerInfos.getTableInfoArray(), function(layerInfo) {
        this.drawListNode(layerInfo, 0, this.tableListTable, true);
      }, this);
    },

    drawListNode: function(layerInfo, level, toTableNode) {
      // layerInfo.getLayerType().then(function(type){
      //   console.log(type + "-------------------------------");
      // });
      var nodeAndSubNode;
      if (layerInfo.newSubLayers.length === 0) {
        //addLayerNode
        nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode);
        //add legend node
        if (this.config.showLegend) {
          this.addLegendNode(layerInfo, level, nodeAndSubNode.subNode);
        } else {
          domStyle.set(query(".showLegend-image",
              nodeAndSubNode.currentNode)[0],
            'display',
            'none');
        }
        return;
      }
      //addLayerNode
      nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode);
      array.forEach(layerInfo.newSubLayers, lang.hitch(this, function(level, subLayerInfo) {
        this.drawListNode(subLayerInfo, level + 1, nodeAndSubNode.subNode);
      }, level));
    },

    addLayerNode: function(layerInfo, level, toTableNode) {
      var layerTrNode = domConstruct.create('tr', {
          'class': 'jimu-widget-row layer-row ' +
            ( /*visible*/ false ? 'jimu-widget-row-selected' : ''),
          'layerTrNodeId': layerInfo.id
        }, toTableNode),
        layerTdNode, ckSelectDiv, ckSelect, imageShowLegendNode, imageNoLegendDiv,
        imageNoLegendNode, popupMenuNode, i, imageShowLegendDiv, popupMenu, divLabel;

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
        'class': 'showLegend-div jimu-float-leading'
      }, layerTdNode);
      var showLegendImageSrc;
      if (isRTL) {
        showLegendImageSrc = this.layerListWidget.folderUrl + 'images/v_left.png';
      } else {
        showLegendImageSrc = this.layerListWidget.folderUrl + 'images/v_right.png';
      }

      imageShowLegendNode = domConstruct.create('img', {
        'class': 'showLegend-image',
        'src': showLegendImageSrc,
        'alt': 'l'
      }, imageShowLegendDiv);

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
      domStyle.set(layerTdNode, 'width', level * 12 + 35 + 'px');

      var layerTitleTdNode = domConstruct.create('td', {
        'class': 'col col2'
      }, layerTrNode);
      divLabel = domConstruct.create('div', {
        'innerHTML': layerInfo.title,
        'class': 'div-content jimu-float-leading'
      }, layerTitleTdNode);

      //domStyle.set(divLabel, 'width', 263 - level*13 + 'px');

      layerTdNode = domConstruct.create('td', {
        'class': 'col col3'
      }, layerTrNode);

      // add popupMenu
      popupMenuNode = domConstruct.create('div', {
        'class': 'layers-list-popupMenu-div'
      }, layerTdNode);

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

      //add a tr node to toTableNode.
      var trNode = domConstruct.create('tr', {
        'class': '',
        'layerContentTrNodeId': layerInfo.id
      }, toTableNode);

      var tdNode = domConstruct.create('td', {
        'class': '',
        'colspan': '3'
      }, trNode);

      var tableNode = domConstruct.create('table', {
        'class': 'layer-sub-node'
      }, tdNode);

      //bind event
      this.own(on(layerTitleTdNode,
        'click',
        lang.hitch(this,
          this._onRowTrClick,
          layerInfo,
          imageShowLegendNode,
          layerTrNode,
          tableNode)));

      this.own(on(imageShowLegendDiv,
        'click',
        lang.hitch(this,
          this._onRowTrClick,
          layerInfo,
          imageShowLegendNode,
          layerTrNode,
          tableNode)));

      this.own(on(layerTrNode,
        'mouseover',
        lang.hitch(this, this._onLayerNodeMouseover, layerTrNode, popupMenu)));
      this.own(on(layerTrNode,
        'mouseout',
        lang.hitch(this, this._onLayerNodeMouseout, layerTrNode, popupMenu)));
      this.own(on(ckSelect.domNode, 'click', lang.hitch(this,
        this._onCkSelectNodeClick,
        layerInfo,
        ckSelect)));

      this.own(on(popupMenuNode, 'click', lang.hitch(this,
        this._onPopupMenuClick,
        layerInfo,
        popupMenu,
        layerTrNode)));

      return {
        currentNode: layerTrNode,
        subNode: tableNode
      };
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

      /*
            array.forEach(layerInfo.legendInfos, function(legendInfo){
              var i;
              for (i = 0; i < level+1; i++) {
                domConstruct.create('div', {
                  'class': 'begin-blank-div'
                }, legendTdNode);
              }
              domConstruct.place(legendInfo.legendDiv, legendTdNode);
            }, this);
      */
      //legendsDiv = layerInfo.obtainLegendsNode();



      // layerInfo.legendsNode = domConstruct.create("div", {
      //   "class": "legends-div"
      // });
      // domConstruct.create("img", {
      //   "class": "legends-loading-img",
      //   "src": this.layerListWidget.folderUrl + 'images/loading.gif'
      // }, layerInfo.legendsNode);
      // layerInfo.initLegendsNode(layerInfo.legendsNode);
      // //domStyle.set(layerInfo.legendsNode, 'background-image',
      // //             'url(' + this.layerListWidget.folderUrl + 'images/loading.gif)')
      // domStyle.set(layerInfo.legendsNode, 'margin-left', (level+1)*12 + 'px');
      // domConstruct.place(layerInfo.legendsNode, legendTdNode);


      // layerInfo.legendsNode = domConstruct.create("div", {
      //   "class": "legends-div"
      // });
      // domConstruct.create("img", {
      //   "class": "legends-loading-img",
      //   "src": this.layerListWidget.folderUrl + 'images/loading.gif'
      // }, layerInfo.legendsNode);
      // layerInfo.initLegendsNode(layerInfo.legendsNode);
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
    _fold: function(layerInfo, imageShowLegendNode, subNode) {
      /*jshint unused: false*/
      /* global isRTL*/
      var state;
      if (domStyle.get(subNode, 'display') === 'none') {
        //unfold
        domStyle.set(subNode, 'display', 'table');
        //domClass.add(imageShowLegendNode, "layers-list-imageShowLegend-down");
        domAttr.set(imageShowLegendNode, 'src', this.layerListWidget.folderUrl + 'images/v.png');
        state = false; //unfold
      } else {
        //fold
        domStyle.set(subNode, 'display', 'none');
        //domClass.remove(imageShowLegendNode, "layers-list-imageShowLegend-down");
        var src;
        if (isRTL) {
          src = this.layerListWidget.folderUrl + 'images/v_left.png';
        } else {
          src = this.layerListWidget.folderUrl + 'images/v_right.png';
        }
        domAttr.set(imageShowLegendNode, 'src', src);
        state = true; // fold
      }
      return state;
    },

    _onCkSelectNodeClick: function(layerInfo, ckSelect, evt) {
      if (ckSelect.checked) {
        layerInfo.setTopLayerVisible(true);
      } else {
        layerInfo.setTopLayerVisible(false);
      }
      evt.stopPropagation();
    },

    _onPopupMenuClick: function(layerInfo, popupMenu, layerTrNode, evt) {
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
      evt.stopPropagation();
    },

    _hideCurrentPopupMenu: function() {
      if (this.currentPopupMenu && this.currentPopupMenu.state === 'opened') {
        this.currentPopupMenu.closeDropMenu();
      }
    },

    _onLayerNodeMouseover: function(layerTrNode, popupMenu) {
      domClass.add(layerTrNode, "layer-row-mouseover");
      if (popupMenu) {
        //domClass.add(popupMenuNode, "layers-list-popupMenu-div-selected");
        domClass.add(popupMenu.btnNode, "jimu-icon-btn-selected");
      }
    },

    _onLayerNodeMouseout: function(layerTrNode, popupMenu) {
      domClass.remove(layerTrNode, "layer-row-mouseover");
      if (popupMenu) {
        //domClass.remove(popupMenuNode, "layers-list-popupMenu-div-selected");
        domClass.remove(popupMenu.btnNode, "jimu-icon-btn-selected");
      }
    },

    _onLayerListWidgetPaneClick: function(popupMenu) {
      if (popupMenu) {
        //popupMenu.hide();
        popupMenu.closeDropMenu();
      }
    },

    _onRowTrClick: function(layerInfo, imageShowLegendNode, layerTrNode, subNode) {
      this._changeSelectedLayerRow(layerTrNode);
      var fold = this._fold(layerInfo, imageShowLegendNode, subNode);
      if (layerInfo.isLeaf() && !fold) {
        var legendsNode = query(".legends-div", subNode)[0];
        var loadingImg = query(".legends-loading-img", legendsNode)[0];
        if (legendsNode && loadingImg) {
          layerInfo.drawLegends(legendsNode, this.layerListWidget.appConfig.portalUrl);
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
    _exchangeLayerTrNode: function(id1, id2) {
      var layer1TrNode = query("tr[layerTrNodeId='" + id1 + "']", this.layerListTable)[0];
      //var layer1ContentTrNode = query("tr[layerContentTrNodeId='" + id1 + "']",
      //                                this.layerListTable)[0];
      var layer2TrNode = query("tr[layerTrNodeId='" + id2 + "']", this.layerListTable)[0];
      var layer2ContentTrNode = query("tr[layerContentTrNodeId='" + id2 + "']",
        this.layerListTable)[0];
      // change layerTr
      this.layerListTable.removeChild(layer2TrNode);
      this.layerListTable.insertBefore(layer2TrNode, layer1TrNode);
      // change LayerContentTr
      this.layerListTable.removeChild(layer2ContentTrNode);
      this.layerListTable.insertBefore(layer2ContentTrNode, layer1TrNode);
    },

    moveUpLayer: function(id) {
      // summary:
      //    move up layer in layer list.
      // description:
      //    call the moveUpLayer method of LayerInfos to change the layer order in map,
      //    and update the data in LayerInfos
      //    then, change layerNodeTr and layerContentTr domNode
      var beChangedId = this.operLayerInfos.moveUpLayer(id);
      if (beChangedId) {
        this._exchangeLayerTrNode(beChangedId, id);
      }
    },

    moveDownLayer: function(id) {
      // summary:
      //    move down layer in layer list.
      // description:
      //    call the moveDownLayer method of LayerInfos to change the layer order in map,
      //    and update the data in LayerInfos
      //    then, change layerNodeTr and layerContentTr domNode
      var beChangedId = this.operLayerInfos.moveDownLayer(id);

      if (beChangedId) {
        this._exchangeLayerTrNode(id, beChangedId);
      }
    }

  });
});