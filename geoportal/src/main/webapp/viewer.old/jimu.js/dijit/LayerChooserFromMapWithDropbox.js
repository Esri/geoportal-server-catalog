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
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/on',
    'dojo/Evented',
    'dojo/Deferred',
    'dijit/popup',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/LayerChooserFromMapWithDropbox.html',
    'jimu/LayerInfos/LayerInfos'
  ],
  function(declare, lang, html, on, Evented, Deferred, dojoPopup, _WidgetBase, _TemplatedMixin, template, LayerInfos) {

    return declare([_WidgetBase, _TemplatedMixin, Evented], {
      templateString: template,
      baseClass: 'jimu-layer-chooser-from-map-withdropbox',
      declaredClass: 'jimu.dijit.LayerChooserFromMapWithDropbox',
      _selectedItem: null,//{layerInfo,name,url}
      _isLayerChooserShow: false,
      layerInfosObj: null,

      //options:
      layerChooser: null,//instance of LayerChooserFromMap

      //public methods:
      //getLayerChooser
      //getSelectedItem
      //showLayerChooser
      //hideLayerChooser

      //events:
      //selection-change

      postCreate: function() {
        this.inherited(arguments);
        this.layerInfosObj = LayerInfos.getInstanceSync();
        this.layerChooser.domNode.style.zIndex = 1;
        this.layerChooser.tree.domNode.style.borderTop = "0";
        this.layerChooser.tree.domNode.style.maxHeight = "290px";
        this.own(on(this.layerChooser, 'tree-click', lang.hitch(this, this._onTreeClick)));
        this.own(on(this.layerChooser, 'update', lang.hitch(this, this._onLayerChooserUpdate)));
        this.own(on(document.body, 'click', lang.hitch(this, this._onBodyClicked)));
      },

      destroy: function(){
        this.hideLayerChooser();
        if(this.layerChooser){
          this.layerChooser.destroy();
        }
        this.layerChooser = null;
        this.inherited(arguments);
      },

      getLayerChooser: function(){
        return this.layerChooser;
      },

      //if resolves true, means we use the layer as the selected layer successfully
      setSelectedLayer: function(layer){
        var def = new Deferred();
        if (layer) {
          var layerInfo = this.layerInfosObj.getLayerInfoById(layer.id);
          if (layerInfo) {
            this.layerChooser.filter(layerInfo).then(lang.hitch(this, function(success){
              if(success){
                var item = {
                  layerInfo: layerInfo,
                  name: layerInfo.title,
                  url: layer.url
                };
                this._onSelectNewItem(item);
                def.resolve(true);
              }else{
                def.resolve(false);
              }
            }), lang.hitch(this, function(){
              def.resolve(false);
            }));
          } else {
            def.resolve(false);
          }
        }else{
          this._onSelectNewItem(null);
          def.resolve(true);
        }

        return def;
      },

      getSelectedItem: function(){
        return this._selectedItem;
      },

      getSelectedItems: function(){
        return [this._selectedItem];
      },

      _onBodyClicked: function(evt){
        var target = evt.target || evt.srcElement;
        if(target === this.domNode || html.isDescendant(target, this.domNode)){
          return;
        }
        if(target === this.layerChooser.domNode || html.isDescendant(target, this.layerChooser.domNode)){
          return;
        }
        this.hideLayerChooser();
      },

      _onDropDownClick: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        if(this._isLayerChooserShow){
          this.hideLayerChooser();
        }else{
          this.showLayerChooser();
        }
      },

      _getSelectedItems: function(){
        var items = this.layerChooser.getSelectedItems();
        return items;
      },

      showLayerChooser: function() {
        var width = this.domNode.clientWidth;
        // if (width < 200) {
        //   width = 200;
        // }
        this.layerChooser.domNode.style.minWidth = width + 2 + "px";

        dojoPopup.open({
          parent: this,
          popup: this.layerChooser,
          around: this.domNode
        });

        var popupDom = this.layerChooser.domNode.parentNode;
        if (popupDom) {
          html.addClass(popupDom, 'jimu-layer-chooser-from-map-withdropbox-popup');
        }
        this._isLayerChooserShow = true;
      },

      hideLayerChooser: function() {
        dojoPopup.close(this.layerChooser);
        this._isLayerChooserShow = false;
      },

      _onLayerChooserUpdate: function(){
        if(this._selectedItem && this.layerChooser.onlyShowVisible){
          var layerInfo = this._selectedItem.layerInfo;
          if(!layerInfo.isShowInMap()){
            this._selectedItem = null;
            this.emit('selection-change', []);
          }
        }
      },

      _onSelectNewItem: function(newSelectedItem){
        var oldSelectedItem = this._selectedItem;
        var oldSelectedItemId = lang.getObject("layerInfo.id", false, oldSelectedItem) || -1;
        var newSelectedItemId = lang.getObject("layerInfo.id", false, newSelectedItem) || -1;

        var isChanged = oldSelectedItemId !== newSelectedItemId;
        this._selectedItem = newSelectedItem;
        this.hideLayerChooser();
        var title = lang.getObject("layerInfo.title", false, this._selectedItem) || "";
        this.layerNameNode.innerHTML = title;
        html.setAttr(this.layerNameNode, 'title', title);
        var layer = lang.getObject("layerInfo.layerObject", false, this._selectedItem);

        if(isChanged){
          this.emit('selection-change', [layer]);
        }
      },

      _onTreeClick: function() {
        var selectedItems = this._getSelectedItems();
        var selectedItem = selectedItems.length > 0 ? selectedItems[0] : null;
        this._onSelectNewItem(selectedItem);
      }
    });
  });
