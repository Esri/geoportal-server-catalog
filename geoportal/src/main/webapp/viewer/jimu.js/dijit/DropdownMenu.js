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
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/on',
  'dojo/query',
  'dojo/Evented'
],
function(declare, _WidgetBase, _TemplatedMixin, lang, array, html, on, query, Evented) {

  return declare([_WidgetBase, _TemplatedMixin, Evented], {
    'baseClass': 'jimu-dijit-dropdownmenu',
    declaredClass: 'jimu.dijit.DropdownMenu',
    templateString: '<div></div>',
    itemHeight: 24,
    iconSize: 16,
    offsetY: 5,
    shelter: null,
    paddingOffsetY: 8,
    dropdownMenuItemClass: 'dropdown-menu-item',

    //options:
    items: null,//[{value,label}]
    highlightValue: "",
    highlightSelectedItemAfterClick: true,
    menuLeadingIcon: true,
    maxDisplayItems: 10,

    //events:
    //click-item

    postCreate: function(){
      this.inherited(arguments);
      if(!this.items){
        this.items = [];
      }
      this.shelter = html.toDom('<div class="jimu-dijit-dropdownmenu-shelter"></div>');
      this.itemsContainer = html.toDom('<div class="jimu-dijit-dropdownmenu-items-container"></div>');
      if(this.maxDisplayItems <= 0){
        this.maxDisplayItems = 20;
      }
      this.itemsContainer.style.maxHeight = this.itemHeight * this.maxDisplayItems + this.paddingOffsetY * 2 + "px";
      array.forEach(this.items, lang.hitch(this, function(item){
        var str = '<div class="' + this.dropdownMenuItemClass + ' jimu-ellipsis">' + item.label + '</div>';
        var itemDom = html.toDom(str);
        itemDom.itemInfo = item;
        itemDom.title = item.label;
        html.place(itemDom, this.itemsContainer);
      }));
      this.own(on(this.domNode, 'click', lang.hitch(this, this._onIconClick)));
      this.own(on(this.shelter, 'click', lang.hitch(this, this._onShelterClick)));
      this.own(on(this.itemsContainer, 'click', lang.hitch(this, this._onItemsContainerClick)));
      if(this.highlightValue){
        this.setHighlightValue(this.highlightValue);
      }
    },

    _onIconClick: function(evt){
      evt.stopPropagation();
      if(this.isShowing()){
        this.hideMenu();
      }else{
        var position = html.position(evt.target || evt.srcElement);
        this.showMenu(position);
      }
    },

    _onShelterClick: function(){
      this.hideMenu();
    },

    _onItemsContainerClick: function(evt){
      evt.stopPropagation();
      var target = evt.target || evt.srcElement;
      if(html.hasClass(target, this.dropdownMenuItemClass)){
        var value = target.itemInfo.value;
        if(this.highlightSelectedItemAfterClick){
          this.setHighlightValue(value);
        }
        this.emit("click-item", value);
      }
      this.hideMenu();
    },

    clearHighlightValue: function(){
      query("." + this.dropdownMenuItemClass, this.itemsContainer).removeClass("selected");
    },

    setHighlightValue: function(value){
      this.clearHighlightValue();
      query("." + this.dropdownMenuItemClass, this.itemsContainer).some(
        lang.hitch(this, function(itemDom){
        var itemInfo = itemDom.itemInfo;
        if(itemInfo.value === value){
          html.addClass(itemDom, "selected");
          return true;
        }
        return false;
      }));
    },

    getHighlightValue: function(){
      var itemDom = query("." + this.dropdownMenuItemClass + ".selected", this.itemsContainer)[0];
      if(itemDom){
        return itemDom.itemInfo.value;
      }
      return null;
    },

    isShowing: function(){
      return html.hasClass(this.domNode, "showing");
    },

    showMenu: function(position){
      this.itemsContainer.style.top = position.y + this.iconSize + this.offsetY + "px";
      var isNormalPosition = this.menuLeadingIcon === window.isRTL;
      if(isNormalPosition){
        this.itemsContainer.style.left = position.x + "px";
        this.itemsContainer.style.right = "auto";
      }else{
        this.itemsContainer.style.right = window.innerWidth - (position.x + this.iconSize) + "px";
        this.itemsContainer.style.left = "auto";
      }
      html.place(this.shelter, document.body);
      html.place(this.itemsContainer, document.body);
      html.addClass(this.domNode, "showing");
    },

    hideMenu: function(){
      if(this.itemsContainer.parentNode){
        this.itemsContainer.parentNode.removeChild(this.itemsContainer);
      }
      if(this.shelter.parentNode){
        this.shelter.parentNode.removeChild(this.shelter);
      }
      html.removeClass(this.domNode, "showing");
    },

    destroy: function(){
      this.hideMenu();
      html.destroy(this.itemsContainer);
      html.destroy(this.shelter);
      this.inherited(arguments);
    }

  });
});
