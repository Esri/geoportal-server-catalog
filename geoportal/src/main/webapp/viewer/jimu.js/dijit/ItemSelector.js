/*
// Copyright © 2014 - 2018 Esri. All rights reserved.

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
  'dojo/topic',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/ItemSelector.html',
  'dojo/Evented',
  'dojo/_base/lang',
  'dojo/_base/config',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/_base/Deferred',
  'dojo/promise/all',
  'dojo/query',
  'dojo/on',
  'jimu/utils',
  'jimu/portalUtils',
  'jimu/tokenUtils',
  'jimu/portalUrlUtils',
  'jimu/dijit/ViewStack',
  'jimu/dijit/Search',
  'jimu/dijit/TabContainer3',
  'jimu/dijit/_ItemTable'
], function(declare, topic, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
  Evented, lang, dojoConfig, array, html, Deferred, all, query, on, jimuUtils, portalUtils,
  tokenUtils, portalUrlUtils, ViewStack, Search, TabContainer3,  _ItemTable) {
  /*jshint unused: false*/
  /* jshint maxlen: 200 */
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString: template,
    declaredClass: 'jimu.dijit.ItemSelector',
    baseClass: "jimu-item-selector",
    tab: null,

    _user: null,
    _group: null,
    //public portal
    _allPublicPortalQuery: null,
    _filterPublicPortalQuery: null,
    //public ArcGIS.com
    _allPublicOnlineQuery: null,
    _filterPublicOnlineQuery: null,
    //organization
    _allOrganizationQuery: null,
    _filterOrganizationQuery: null,
    //my content
    _allMyContentQuery: null,
    _filterMyContentQuery: null,
    //group
    _allGroupQuery: null,
    _filterGroupQuery: null,

    _isPublicTabShow: false,
    _signIn:false,
    _itemTypeQueryString: '',
    _typeKeywordQueryString: '',

    //options:
    portalUrl: null,
    itemTypes: '',//array, such as ['Web Map'], ['Feature Service','Map Service']...
    typeKeywords: '',//array, such as ['Web AppBuilder'] or ['Web AppBuilder','Web Map']...
    showOnlineItems: true,
    onlyShowOnlineFeaturedItems: false,

    //public methods:
    //getSelectedItem

    //events:
    //item-selected
    //none-item-selected
    //update

    //css classes:
    //signin-tip
    //search-none-icon
    //search-none-tip

    postMixInProperties: function(){
      this.portalUrl = portalUrlUtils.getStandardPortalUrl(this.portalUrl);
      this.showOnlineItems = this.showOnlineItems === false ? false : true;

      //handle itemTypes
      if(!(this.itemTypes && this.itemTypes.length > 0)){
        this.itemTypes = [];
      }
      this._itemTypes = '';
      array.forEach(this.itemTypes, lang.hitch(this, function(type, index){
        this._itemTypes += '"' +  type + '"';
        if(index !== this.itemTypes.length - 1){
          this._itemTypes += ',';
        }
      }));
      this._itemTypes = '[' + this._itemTypes + ']';

      //handle typeKeywords
      if(!(this.typeKeywords && this.typeKeywords.length > 0)){
        this.typeKeywords = [];
      }
      this._typeKeywords = '';
      array.forEach(this.typeKeywords, lang.hitch(this, function(keyword, index){
        this._typeKeywords += '"' + keyword + '"';
        if(index !== this.typeKeywords.length - 1){
          this._typeKeywords += ',';
        }
      }));
      this._typeKeywords = '[' + this._typeKeywords + ']';

      this.nls = window.jimuNls.itemSelector;
    },

    postCreate: function() {
      this.inherited(arguments);
      var portalUrl = this._getPortalUrl();
      this.portal = portalUtils.getPortal(portalUrl);
      this._initOptions();
      this._initSearchQuery();
      this._initTabs();
      this._initPortalRadio();
      this._initItemTables();
      this._initPublic();
      this._initPrivate();
      this._updateUIbySignIn();
    },

    _initOptions: function(){
      this._itemTypeQueryString = jimuUtils.getItemQueryStringByTypes(this.itemTypes);
      this._typeKeywordQueryString = jimuUtils.getItemQueryStringByTypeKeywords(this.typeKeywords);
    },

    _initTabs: function(){
      var tabMyContent = {
        title: this.nls.myContent,
        content: this.mycontentTabNode
      };

      var tabOrganization = {
        title: this.nls.myOrganization,
        content: this.organizationTabNode
      };

      var tabGroup = {
        title: this.nls.myGroup,
        content: this.groupTabNode
      };

      var tabPublic = {
        title: this.nls.publicMap,
        content: this.publicTabNode
      };

      var tabs = [tabMyContent, tabOrganization, tabGroup, tabPublic];

      this.tab = new TabContainer3({
        tabs: tabs
      }, this.tabNode);

      this.own(on(this.tab, "tabChanged", lang.hitch(this, function(title) {
        html.setStyle(this.signinSection, 'display', 'none');
        if (title !== this.nls.publicMap) {
          this._isPublicTabShow = false;
          this._updateUIbySignIn();
        } else {
          this._isPublicTabShow = true;
        }
      })));
    },

    _updateUIbySignIn: function(){
      html.setStyle(this.signinSection, 'display', 'none');
      var selector = '.organization-tab-content-main,' +
                     '.group-tab-content-main,' +
                     '.mycontent-tab-content-main';
      var contentMains = query(selector, this.domNode);
      var signIn = tokenUtils.userHaveSignInPortal(this._getPortalUrl());
      if (signIn) {
        contentMains.style('display', 'block');
      } else {
        contentMains.style('display', 'none');
        if(!this._isPublicTabShow){
          html.setStyle(this.signinSection, 'display', 'block');
        }
      }
    },

    _initPortalRadio: function(){
      jimuUtils.combineRadioCheckBoxWithLabel(this.portalPublicRaido, this.portalPublicLabel);
      jimuUtils.combineRadioCheckBoxWithLabel(this.onlinePublicRaido, this.onlinePublicLabel);
      var portalUrl = this._getPortalUrl();
      var portalServer = portalUrlUtils.getServerByUrl(portalUrl);

      this.portalPublicRaido.disabled = false;
      this.onlinePublicRaido.disabled = false;
      this.portalPublicRaido.checked = true;
      var shouldHidePublicArcGIScom = false;
      if(portalUrlUtils.isArcGIScom(portalServer)){
        shouldHidePublicArcGIScom = true;
        this.portalPublicLabel.innerHTML = 'ArcGIS.com';
      }
      else{
        this.portalPublicLabel.innerHTML = portalServer;
        if(this.showOnlineItems){
          shouldHidePublicArcGIScom = false;
        }
        else{
          shouldHidePublicArcGIScom = true;
        }
      }
      if(shouldHidePublicArcGIScom){
        this.onlinePublicRaido.disabled = true;
        html.setStyle(this.onlinePublicRaido, 'display', 'none');
        html.setStyle(this.onlinePublicLabel, 'display', 'none');
      }
    },

    _initSearchQuery: function(){
      var culture = dojoConfig.locale && dojoConfig.locale.slice(0, 2) || 'en';
      var currentLocaleOwner = 'esri_' + culture.toLowerCase();

      var allLocaleOwners = ["esri_he", "esri_fr", "esri_ja", "esri_nl",
                             "esri_th", "esri_tr", "esri_nb", "esri_ro",
                             "esri_it", "esri_pl", "esri_po", "esri_ru",
                             "esri_pt", "esri_en", "esri_ar", "esri_et",
                             "esri_es", "esri_ko", "esri_cs", "esri_da",
                             "esri_zh", "esri_sv", "esri_lt", "esri_fi",
                             "esri_lv", "esri_de", "esri_vi"];
      var removedOwners = array.filter(allLocaleOwners, lang.hitch(this, function(item){
        return item !== currentLocaleOwner;
      }));

      var ownerStr = '';
      array.forEach(removedOwners, lang.hitch(this, function(owner){
        ownerStr += ' -owner:' + owner + ' ';
      }));

      var orgStr = " ";
      if(this.portal && this.portal.user && this.portal.user.orgId){
        orgStr = " orgid:" + this.portal.user.orgId + " ";
      }

      var strPublicPortalQuery = orgStr + this._itemTypeQueryString + ' AND access:public ' +
      ownerStr + ' ' + this._typeKeywordQueryString;

      //portal public
      this._allPublicPortalQuery = this._getQuery({
        sortField:'numViews',
        sortOrder:'desc',
        q: strPublicPortalQuery
      });

      this._filterPublicPortalQuery = this._getQuery({
        q: strPublicPortalQuery,
        basicQ: strPublicPortalQuery
      });

      //ArcGIS.com public
      var groupIds = ' (group:"c755678be14e4a0984af36a15f5b643e" ' +
        ' OR group:"b8787a74b4d74f7fb9b8fac918735153") ';
      var strGroup = this.onlyShowOnlineFeaturedItems ? groupIds : ' ';
      this._allPublicOnlineQuery = this._getQuery({
        sortField:'numViews',
        sortOrder:'desc',
        q: strGroup + this._itemTypeQueryString +
        ' AND access:public ' + this._typeKeywordQueryString
      });

      this._filterPublicOnlineQuery = this._getQuery({
        q:this._itemTypeQueryString + ' AND access:public ' + this._typeKeywordQueryString
      });

      //organization
      this._allOrganizationQuery = this._getQuery();
      this._filterOrganizationQuery = this._getQuery();

      //my content
      this._allMyContentQuery = this._getQuery();
      this._filterMyContentQuery = this._getQuery();

      //group
      this._allGroupQuery = this._getQuery();
      this._filterGroupQuery = this._getQuery();
    },

    _getQuery: function(other){
      var other2 = other || {};
      var query = lang.mixin({
        start:1,
        num:16,
        f:'json'
      }, other2);
      return query;
    },

    _getPortalUrl: function(){
      return portalUrlUtils.getStandardPortalUrl(this.portalUrl);
    },

    _initItemTables: function(){
      //pass onCreateItemContent callback
      if(typeof this.onCreateItemContent === 'function'){
        this.mycontentItemTable.onCreateItemContent = this.onCreateItemContent;
        this.organizationItemTable.onCreateItemContent = this.onCreateItemContent;
        this.groupItemTable.onCreateItemContent = this.onCreateItemContent;
        this.publicPortalItemTable.onCreateItemContent = this.onCreateItemContent;
        this.publicOnlineItemTable.onCreateItemContent = this.onCreateItemContent;
      }

      //bind events
      this.own(
        on(this.publicPortalItemTable, 'item-dom-clicked', lang.hitch(this, this._onItemDomClicked))
      );
      this.own(
        on(this.publicOnlineItemTable, 'item-dom-clicked', lang.hitch(this, this._onItemDomClicked))
      );
      this.own(
        on(this.organizationItemTable, 'item-dom-clicked', lang.hitch(this, this._onItemDomClicked))
      );
      this.own(
        on(this.groupItemTable, 'item-dom-clicked', lang.hitch(this, this._onItemDomClicked))
      );
      this.own(
        on(this.mycontentItemTable, 'item-dom-clicked', lang.hitch(this, this._onItemDomClicked))
      );

      this.own(
        on(this.publicPortalItemTable, 'update', lang.hitch(this, this._onItemTableUpdate))
      );
      this.own(
        on(this.publicOnlineItemTable, 'update', lang.hitch(this, this._onItemTableUpdate))
      );
      this.own(
        on(this.organizationItemTable, 'update', lang.hitch(this, this._onItemTableUpdate))
      );
      this.own(
        on(this.groupItemTable, 'update', lang.hitch(this, this._onItemTableUpdate))
      );
      this.own(
        on(this.mycontentItemTable, 'update', lang.hitch(this, this._onItemTableUpdate))
      );

      var portalUrl = this._getPortalUrl();
      //portal public
      if(!this.portalPublicRaido.disabled){
        this.publicPortalItemTable.set('portalUrl', portalUrl);
        this.publicPortalItemTable.searchAllItems(this._allPublicPortalQuery);
        this.publicPortalItemTable.set('filteredQuery', this._filterPublicPortalQuery);
      }

      //ArcGIS.com public
      if(!this.onlinePublicRaido.disabled){
        this.publicOnlineItemTable.set('portalUrl', window.location.protocol + '//www.arcgis.com');
        this.publicOnlineItemTable.searchAllItems(this._allPublicOnlineQuery);
        this.publicOnlineItemTable.set('filteredQuery', this._filterPublicOnlineQuery);
      }
    },

    _initPublic: function(){
      this.own(on(this.portalPublicRaido, 'click', lang.hitch(this, this._onPublicRaidoClicked)));
      this.own(on(this.onlinePublicRaido, 'click', lang.hitch(this, this._onPublicRaidoClicked)));
      this._onPublicRaidoClicked();
    },

    _onPublicRaidoClicked: function(){
      if(this.portalPublicRaido.checked){
        this.publicPortalItemTable.show();
        this.publicOnlineItemTable.hide();
      }
      else if(this.onlinePublicRaido.checked){
        this.publicPortalItemTable.hide();
        this.publicOnlineItemTable.show();
      }
    },

    _onPublicSearch: function(text){
      text = text && lang.trim(text);
      if(text){
        //show filtered section
        this.publicPortalItemTable.showFilterItemsSection();
        this.publicOnlineItemTable.showFilterItemsSection();

        if (this.portalPublicRaido.checked) {
          //text + this._itemTypeQueryString + ' AND access:public ' + this._typeKeywordQueryString
          this._filterPublicPortalQuery.q = text + ' ' + this._filterPublicPortalQuery.basicQ;
          this._filterPublicPortalQuery.start = 1;
          this.publicPortalItemTable.searchFilteredItems(this._filterPublicPortalQuery);
        } else if (this.onlinePublicRaido.checked) {
          this._filterPublicOnlineQuery.q = text + ' ' + this._itemTypeQueryString +
          ' AND access:public ' + this._typeKeywordQueryString;
          this._filterPublicOnlineQuery.start = 1;
          this.publicOnlineItemTable.searchFilteredItems(this._filterPublicOnlineQuery);
        }
      }
      else{
        //show all section
        this.publicPortalItemTable.showAllItemsSection();
        this.publicOnlineItemTable.showAllItemsSection();
      }
    },

    _initPrivate: function(){
      this._resetPortalMaps();
      this.own(on(this.groupsSelect, 'change', lang.hitch(this, this._onGroupsSelectChange)));
      var portalServer = portalUrlUtils.getServerByUrl(this._getPortalUrl());
      if(portalUrlUtils.isArcGIScom(portalServer)){
        portalServer = 'ArcGIS.com';
      }
      var signIn = tokenUtils.userHaveSignInPortal(this._getPortalUrl());
      if(signIn){
        this._onSignIn();
      }
    },

    _onOrganizationSearch: function(text){
      text = text && lang.trim(text);
      if(text){
        //show filtered section
        if(this._allOrganizationQuery){
          var q = this._allOrganizationQuery.q;
          if(q){
            this._filterOrganizationQuery.q = text + ' ' + q;
            this._filterOrganizationQuery.start = 1;
            this.organizationItemTable.searchFilteredItems(this._filterOrganizationQuery);
          }
        }
      }
      else{
        //show all section
        this.organizationItemTable.showAllItemsSection();
      }
    },

    _onMyContentSearch: function(text){
      text = text && lang.trim(text);
      if(text){
        //show filtered section
        if(this._allMyContentQuery){
          var q = this._allMyContentQuery.q;
          if(q){
            this._filterMyContentQuery.q = text + ' ' + q;
            this._filterMyContentQuery.start = 1;
            this.mycontentItemTable.searchFilteredItems(this._filterMyContentQuery);
          }
        }
      }
      else{
        //show all section
        this.mycontentItemTable.showAllItemsSection();
      }
    },

    _onGroupSearch: function(text){
      text = text && lang.trim(text);
      if(text){
        //show filtered section
        if(this._allGroupQuery){
          var q = this._allGroupQuery.q;
          if(q){
            this._filterGroupQuery.q = text + ' ' + q;
            this._filterGroupQuery.start = 1;
            this.groupItemTable.searchFilteredItems(this._filterGroupQuery);
          }
        }
      }
      else{
        this.groupItemTable.showAllItemsSection();
      }
    },

    _onSignIn: function(){
      this._updateUIbySignIn();
      if(this._signIn){
        return;
      }
      this._signIn = true;
      var portalUrl = this._getPortalUrl();
      var portal = portalUtils.getPortal(portalUrl);
      portal.getUser().then(lang.hitch(this, function(user){
        if(!this.domNode){
          return;
        }
        this._resetPortalMaps();
        this._searchOrganization(user);
        this._searchMyContent(user);
        this._searchGroups(user);
      }));
    },

    _onSignOut: function(){
      this._signIn = false;
      this._resetPortalMaps();
      this._updateUIbySignIn();
    },

    _resetPortalMaps: function(){
      this.organizationItemTable.clear();
      this.mycontentItemTable.clear();
      this._resetGroupsSection();
    },

    _searchOrganization: function(user) {
      this.organizationItemTable.clear();
      var strPublicOrg = " AND (access:org OR access:public) ";
      var q = " orgid:" + user.orgId + " AND " + this._itemTypeQueryString +
      strPublicOrg + this._typeKeywordQueryString;
      var portalUrl = this._getPortalUrl();
      this._allOrganizationQuery = this._getQuery({q:q});
      this._filterOrganizationQuery = this._getQuery({q:q});
      this.organizationItemTable.set('portalUrl', portalUrl);
      this.organizationItemTable.searchAllItems(this._allOrganizationQuery);
    },

    _searchMyContent: function(user) {
      this.mycontentItemTable.clear();
      var portalUrl = this._getPortalUrl();
      var q = "owner:" + user.username + " AND " + this._itemTypeQueryString + ' ' +
      this._typeKeywordQueryString;
      this._allMyContentQuery = this._getQuery({q:q});
      this._filterMyContentQuery = this._getQuery({q:q});
      this.mycontentItemTable.set('portalUrl', portalUrl);
      this.mycontentItemTable.searchAllItems(this._allMyContentQuery);
    },

    _searchGroups: function(user){
      this._resetGroupsSection();
      html.setStyle(this.groupsSection, "display", "block");
      var groups = user.getGroups();
      if (groups.length > 0) {
        html.setStyle(this.groupSearch.domNode, 'display', 'block');
        this.groupItemTable.show();
        html.empty(this.groupsSelect);
        for (var i = 0; i < groups.length; i++) {
          var group = groups[i];
          html.create("option", {
            value: group.id,
            innerHTML: group.title
          }, this.groupsSelect);
        }
        this._onGroupsSelectChange();
      }
      this._updateUIbyGroups(groups.length);
    },

    _resetGroupsSection: function(){
      html.setStyle(this.groupsSection, "display", "none");
      html.empty(this.groupsSelect);
      html.create("option", {
        value: 'nodata',
        innerHTML: this.nls.noneGroups
      }, this.groupsSelect);
      this.groupItemTable.clear();
      html.setStyle(this.groupSearch.domNode, 'display', 'none');
      this.groupItemTable.hide();
      this._updateUIbyGroups(0);
    },

    _updateUIbyGroups: function(groupIdsCount){
      if(groupIdsCount === 0){
        html.setStyle(this.groupsSection, 'top', '15px');
      }
      else{
        html.setStyle(this.groupsSection, 'top', '50px');
      }
    },

    _onGroupsSelectChange: function(){
      var groupId = this.groupsSelect.value;
      this.groupItemTable.clear();
      if (groupId === 'nodata') {
        html.setStyle(this.groupSearch, 'display', 'none');
        this.groupItemTable.hide();
      }
      else{
        html.setStyle(this.groupSearch, 'display', 'block');
        this.groupItemTable.show();
        var portalUrl = this._getPortalUrl();
        var q = "group:" + groupId + " AND " + this._itemTypeQueryString + ' ' +
        this._typeKeywordQueryString;
        this._allGroupQuery = this._getQuery({q:q});
        this._filterGroupQuery = this._getQuery({q:q});
        this.groupItemTable.set('portalUrl', portalUrl);
        this.groupItemTable.searchAllItems(this._allGroupQuery);
      }
    },

    _onItemTableUpdate: function(){
      this.emit("update");
    },

    _onItemDomClicked: function(itemDiv){
      var isSelected = html.hasClass(itemDiv, 'jimu-state-active');
      query('.item.jimu-state-active', this.domNode).removeClass('jimu-state-active');
      if(isSelected){
        html.addClass(itemDiv, 'jimu-state-active');
      }
      var item = this.getSelectedItem();
      if(item){
        this.emit('item-selected', item);
      }
      else{
        this.emit('none-item-selected');
      }
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