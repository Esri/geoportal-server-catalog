/*
Copyright ©2014 Esri. All rights reserved.

TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
Unpublished material - all rights reserved under the
Copyright Laws of the United States and applicable international
laws, treaties, and conventions.

For additional information, contact:
Attn: Contracts and Legal Department
Environmental Systems Research Institute, Inc.
380 New York Street
Redlands, California, 92373
USA

email: contracts@esri.com
*/

define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/_ItemTable.html',
  'dojo/Evented',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/_base/Deferred',
  'dojo/query',
  'dojo/on',
  'jimu/utils',
  'jimu/portalUtils',
  'jimu/portalUrlUtils',
  'jimu/dijit/LoadingIndicator'
], function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, Evented,
  lang, array, html, Deferred, query, on, jimuUtils, portalUtils, portalUrlUtils, LoadingIndicator){
  /*jshint unused: false*/
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString: template,
    declaredClass: "jimu.dijit.ItemTable",
    baseClass: "jimu-item-table",
    query: null,
    filteredQuery: null,
    portalUrl: null,
    hidden: false,
    nls: null,
    types: '',//required,array, filter search results,such as ["Feature Service","Map Service"]
    typeKeywords: '',//optional, array, filter search results,such as ["Web AppBuilder","Web Map"]

    //public methods:
    //getSelectedItem
    //show
    //hide
    //searchAllItems
    //searchFilteredItems
    //clear
    //clearAllItemsSection
    //clearFilteredItemsSection
    //showAllItemsSection
    //showFilterItemsSection

    //callback methods
    //onCreateItemContent(item, itemInfoDom)

    //css classes:
    //item
    //item-border
    //item-thumbnail
    //item-info
    //item-name
    //item-type-owner
    //item-date
    //item-details
    //search-none-icon
    //search-none-tip

    _defaultThumbnail:{
      "Web Mapping Application": "webapp.png",
      "Mobile Application": "mobileapp.png"
    },

    postMixInProperties:function(){
      this.nls = window.jimuNls.itemSelector;
    },

    postCreate: function() {
      this.inherited(arguments);
      this._initSelf();
    },

    _initSelf: function(){
      if(!(this.types && this.types.length > 0)){
        this.types = [];
      }

      this.hidden = this.hidden === true;
      if(this.hidden){
        this.hide();
      }
      if(this.portalUrl){
        this.portalUrl = portalUrlUtils.getStandardPortalUrl(this.portalUrl);
      }

      this.showAllItemsSection();
      this.searchAllItems();
    },

    show:function(){
      html.setStyle(this.domNode, 'display', 'block');
    },

    hide:function(){
      html.setStyle(this.domNode, 'display', 'none');
    },

    searchAllItems:function(newQuery){
      this.showAllItemsSection();
      if(newQuery){
        this.query = lang.mixin({}, newQuery);
        this.query.start = 1;
        this.clearAllItemsSection();
      }
      if(!this.portalUrl || !this.query){
        return;
      }
      if(this.query.start > 0){
        this.allItemsShelter.show();
        var portal = portalUtils.getPortal(this.portalUrl);
        var def = portal.queryItems(this.query);

        def.then(lang.hitch(this, function(response) {
          if(!this.domNode){
            return;
          }
          this.allItemsShelter.hide();
          this.query.start = response.nextStart;
          this._createItems(response, this.allItemTbody);
        }), lang.hitch(this, function(err) {
          console.error(err);
          if(!this.domNode){
            return;
          }
          this.allItemsShelter.hide();
        }));
      }
    },

    searchFilteredItems:function(/*optional*/ newFilteredQuery){
      //if newFilteredQuery is not null or undefined, it means the dijit will search a new query
      //otherwise it means this method is called when scroll to bottom of this.filteredItemsTableDiv
      this.showFilterItemsSection();

      if(newFilteredQuery){
        this.filteredQuery = lang.clone(newFilteredQuery);
        this.filteredQuery.start = 1;
        this.clearFilteredItemsSection();
      }

      if(!this.portalUrl || !this.filteredQuery){
        return;
      }

      if(this.filteredQuery.start > 0){
        this.filteredItemShelter.show();
        var portal = portalUtils.getPortal(this.portalUrl);
        var def = portal.queryItems(this.filteredQuery);

        def.then(lang.hitch(this, function(response){
          if(!this.domNode){
            return;
          }
          this.showFilterItemsSection();
          if(newFilteredQuery){
            this.clearFilteredItemsSection();
          }
          this.filteredQuery.start = response.nextStart;
          this._createItems(response, this.filteredItemsTbody);
          this._filterItemCallback();
        }), lang.hitch(this, function(err){
          console.error(err);
          if(!this.domNode){
            return;
          }
          this._filterItemCallback();
        }));
      }
    },

    _filterItemCallback: function(){
      this.filteredItemShelter.hide();
      var count = this._getItemCount(this.filteredItemsTbody);
      if(count > 0){
        html.setStyle(this.filteredItemsTableDiv, 'display', 'block');
        html.setStyle(this.searchNoneTipSection, 'display', 'none');
      }else{
        html.setStyle(this.filteredItemsTableDiv, 'display', 'none');
        html.setStyle(this.searchNoneTipSection, 'display', 'block');
      }
    },

    clear:function(){
      this.clearAllItemsSection();
      this.clearFilteredItemsSection();
    },

    clearAllItemsSection:function(){
      html.empty(this.allItemTbody);
    },

    clearFilteredItemsSection:function(){
      html.empty(this.filteredItemsTbody);
    },

    showAllItemsSection:function(){
      html.setStyle(this.allItemsSection, 'display', 'block');
      html.setStyle(this.filteredItemsSection, 'display', 'none');
    },

    showFilterItemsSection:function(){
      html.setStyle(this.allItemsSection, 'display', 'none');
      html.setStyle(this.filteredItemsSection, 'display', 'block');
      html.setStyle(this.filteredItemsTableDiv, 'display', 'block');
      html.setStyle(this.searchNoneTipSection, 'display', 'none');
    },

    _onAllItemsSectionScroll:function(){
      if(this._isScrollToBottom(this.allItemsTableDiv)){
        this.searchAllItems();
      }
    },

    _onFilteredItemsSectionScroll:function(){
      if(this._isScrollToBottom(this.filteredItemsTableDiv)){
        this.searchFilteredItems();
      }
    },

    _isScrollToBottom:function(div){
      return jimuUtils.isScrollToBottom(div);
    },

    _createItems: function(response, tbody) {
      var results = response.results;
      var typesLowerCase = array.map(this.types, lang.hitch(this, function(type){
        return type.toLowerCase();
      }));
      var items = array.filter(results, lang.hitch(this, function(item) {
        var type = (item.type && item.type.toLowerCase()) || '';
        return array.indexOf(typesLowerCase, type) >= 0;
      }));
      var countPerRow = 2;
      if (items.length === 0) {
        return;
      }
      var itemsHash = {}, itemDiv;
      var emptyTds = query('td.empty', tbody);
      var i;
      if(emptyTds.length > 0){
        var usedEmptyTdCount = Math.min(items.length, emptyTds.length);
        var ws = items.splice(0, usedEmptyTdCount);
        for(i = 0; i < usedEmptyTdCount; i++){
          var emptyTd = emptyTds[i];
          itemDiv = this._createItem(ws[i]);
          itemsHash[itemDiv.item.id] = itemDiv;
          html.place(itemDiv, emptyTd);
          html.removeClass(emptyTd, 'empty');
        }
      }

      if(items.length === 0){
        return;
      }

      var trCount = Math.ceil(items.length / countPerRow);
      for (i = 0; i < trCount; i++) {
        var trStr = "<tr><td></td><td></td></tr>";
        var trDom = html.toDom(trStr);
        html.place(trDom, tbody);
        var tds = query('td', trDom);
        for (var j = 0; j < tds.length; j++) {
          var td = tds[j];
          var item = items[countPerRow * i + j];
          if(item){
            itemDiv = this._createItem(item);
            itemsHash[itemDiv.item.id] = itemDiv;
            html.place(itemDiv, td);
          }
          else{
            html.addClass(td, 'empty');
          }
        }
      }
      this.emit("update");
    },

    _getItemCount:function(tbody){
      return query('.item', tbody).length;
    },

    _createItem: function(item){
      var str = '<div class="item">' +
        '<div class="item-border"></div>' +
        '<div class="item-thumbnail jimu-auto-vertical">' +
          '<div class="none-thumbnail-tip jimu-auto-vertical-content"></div>' +
        '</div>' +
        '<div class="item-info">' +
          '<div class="item-name"></div>' +
          '<div class="item-type-owner"></div>' +
          '<div class="item-date"></div>' +
          '<a class="item-details" target="_blank"></a>' +
        '</div>' +
      '</div>';
      var itemDiv = html.toDom(str);
      itemDiv.item = item;
      var itemThumbnail = query('.item-thumbnail', itemDiv)[0];
      var itemName = query('.item-name', itemDiv)[0];
      var itemTypeOwner = query('.item-type-owner', itemDiv)[0];
      var itemDate = query('.item-date', itemDiv)[0];
      var itemDetails = query('.item-details', itemDiv)[0];
      var noneThumbnailTip = query('.none-thumbnail-tip', itemDiv)[0];
      if(!item.thumbnailUrl){
        var defaultThumbnail = this._defaultThumbnail[item.type];
        if(defaultThumbnail){
          item.thumbnailUrl = require.toUrl('jimu') + '/images/' + defaultThumbnail;
        }
      }
      if(item.thumbnailUrl){
        html.setStyle(itemThumbnail, 'backgroundImage', "url(" + item.thumbnailUrl + ")");
      }
      else{
        noneThumbnailTip.innerHTML = this.nls.noneThumbnail;
      }

      if(typeof this.onCreateItemContent === 'function'){
        var itemInfoDom = query('.item-info', itemDiv)[0];
        this.onCreateItemContent(item, itemInfoDom);
      }else{
        itemName.innerHTML = item.title;
        itemName.title = itemName.innerHTML;
        itemTypeOwner.innerHTML = item.type + ' by ' + item.owner;
        itemTypeOwner.title = itemTypeOwner.innerHTML;
        var d = new Date();
        d.setTime(item.modified);
        itemDate.innerHTML = d.toLocaleString();
        itemDate.title = itemDate.innerHTML;
        itemDetails.innerHTML = this.nls.moreDetails;
        itemDetails.href = item.detailsPageUrl || "#";
      }

      return itemDiv;
    },

    _onItemsTableClicked: function(event){
      var target = event.target || event.srcElement;
      var itemDiv = null;
      if(html.hasClass(target, 'item-thumbnail')){
        itemDiv = target.parentNode;
      }
      else if(html.hasClass(target, 'none-thumbnail-tip')){
        itemDiv = target.parentNode.parentNode;
      }

      if(!itemDiv){
        return;
      }

      var isSelected = html.hasClass(itemDiv, 'jimu-state-active');
      query('.item.jimu-state-active', this.domNode).removeClass('jimu-state-active');
      if (isSelected) {
        html.removeClass(itemDiv, 'jimu-state-active');
      } else {
        html.addClass(itemDiv, 'jimu-state-active');
      }
      this.emit('item-dom-clicked', itemDiv);
    },

    getSelectedItem: function(){
      var item = null;
      var itemDivs = query('.item.jimu-state-active', this.domNode);
      if(itemDivs.length > 0){
        var itemDiv = itemDivs[0];
        item = lang.mixin({}, itemDiv.item);
      }
      return item;
    }
  });
});