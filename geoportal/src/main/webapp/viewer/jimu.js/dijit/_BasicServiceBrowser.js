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
  'dijit/_WidgetsInTemplateMixin',
  'dojo/Evented',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/store/Memory',
  'dojo/store/Observable',
  'dijit/tree/ObjectStoreModel',
  'jimu/utils',
  'jimu/dijit/_Tree',
  'jimu/dijit/LoadingShelter'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, lang, html,
 array, Deferred, all, Memory, Observable, ObjectStoreModel, jimuUtils, Tree) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString:'<div style="width:100%;"><div data-dojo-attach-point="shelter" ' +
    ' data-dojo-type="jimu/dijit/LoadingShelter" data-dojo-props="hidden:true"></div></div>',
    _store: null,
    _id: 0,
    _currentUrl: '',
    _treeClass: 'service-browser-tree',
    _def: null,

    //options:
    url:'',
    multiple: false,
    rule: null,//create rule by serviceBrowserRuleUtils

    //test urls
    //https://gis.lmi.is/arcgis/rest/services
    //https://gis.lmi.is/arcgis/rest/services/GP_service
    //https://gis.lmi.is/arcgis/rest/services/GP_service/geocode_thjonusta_single/GeocodeServer
    //http://sampleserver1.arcgisonline.com/ArcGIS/rest/services

    //public methods:
    //setUrl
    //getSelectedItems
    //reset

    //events:
    //tree-click
    //tree-open


    //item consist of {name,type,url,parent,isLeaf}

    postMixInProperties:function(){
      this.nls = window.jimuNls.basicServiceBrowser;
    },

    postCreate: function(){
      this.inherited(arguments);
      html.addClass(this.domNode, 'jimu-basic-service-browser');
      this.multiple = !!this.multiple;
      this._createTree();
      if(this.url && typeof this.url === 'string'){
        this.setUrl(this.url);
      }
    },

    reset: function(){
      this.url = '';
      this._clear();
    },

    getSelectedItems: function(){
      var items = this.tree.getSelectedItems();
      return items;//lang.clone(items);
    },

    setUrl:function(url){
      if(this._def){
        if(!this._def.isFulfilled()){
          this._def.cancel();
        }
        this._def = null;
      }
      this._def = new Deferred();

      var validUrl = url && typeof url === 'string' && url.replace(/\/*$/g, '');
      if(!validUrl){
        this._def.reject();
      }
      url = url.replace(/\/*$/g, '');

      var theUrl = lang.trim(url);
      var pattern1 = /^http(s?):\/\//gi;
      var matchResult = theUrl.match(pattern1);
      if(!(matchResult && matchResult.length > 0)){
        theUrl = 'http://' + theUrl;
      }

      var pattern2 = /\/rest\/services/i;
      if(theUrl.search(pattern2) <= 0){
        this._def.reject();
        return;
      }

      /*if(this._currentUrl === theUrl){
        return;
      }*/

      this._clear();
      this._currentUrl = theUrl;
      if(!this._currentUrl){
        this._def.reject();
        return;
      }
      var root = this._getRootItem();
      var requestDef;
      if(jimuUtils.isStringEndWith(this._currentUrl, 'rest/services')){
        //rest/services
        var baseUrl = this._currentUrl;
        requestDef = this._searchBaseServiceUrl(baseUrl, root);
      }
      else if(!this._isUrlContainsServiceType(this._currentUrl)){
        //folder
        var folderUrl = this._currentUrl;
        requestDef = this._searchFolderServiceUrl(folderUrl, root);
      }
      else{
        //service url contains ServiceType, such as 'MapServer','FeatureServer'...
        var serviceUrl = this._currentUrl;
        requestDef = this._searchServiceUrl(serviceUrl, root);
      }

      this.shelter.show();

      requestDef.then(lang.hitch(this, function(response){
        if(this.domNode){
          this.shelter.hide();
        }
        var tns = this.tree.getAllLeafTreeNodeWidgets();
        if(tns.length === 1){
          var tn = tns[0];
          tn.select();
        }
        this._def.resolve(response);
      }), lang.hitch(this, function(err){
        // var netErr = err && err.errorCode && err.errorCode === 'NETWORK_ERROR';
        // if(netErr){
        //   this._showRequestError();
        // }
        if(this.domNode){
          this.shelter.hide();
        }
        this._showRequestError();
        this._def.reject(err);
      }));

      return this._def;
    },

    _getItem: function(url){
      return this.rule.getItem(url);
    },

    _getSubItemUrls: function(url){
      return this.rule.getSubItemUrls(url);
    },

    //resolve [{name,type,url}]
    _getSubItems: function(parentUrl){
      var def = new Deferred();
      this._getSubItemUrls(parentUrl).then(lang.hitch(this, function(urls){
        var defs = array.map(urls, lang.hitch(this, function(url){
          return this._getItem(url);
        }));
        all(defs).then(lang.hitch(this, function(items){
          var result = array.filter(items, lang.hitch(this, function(item){
            //item maybe null because the url doesn't meet needs
            return item && typeof item === 'object';
          }));
          def.resolve(result);
        }), lang.hitch(this, function(err){
          def.reject(err);
        }));
      }), lang.hitch(this, function(err){
        def.reject(err);
      }));
      return def;
    },

    _selectFirstLeafTreeNodeWidget: function(){
      var tns = this.tree.getAllLeafTreeNodeWidgets();
      if (tns.length === 1) {
        var tn = tns[0];
        tn.select();
      }
    },

    isLeafItem: function(item){
      return this.rule.leafTypes.indexOf(item.type) >= 0;
    },

    isServiceTypeSupported: function(type){
      return this.rule.isServiceTypeSupported(type);
    },

    _getStringEndWith:function(str, endStr){
      var result = '';
      var index = str.indexOf(endStr);
      if(index >= 0){
        var a = index + endStr.length;
        result = str.slice(0, a);
      }
      return result;
    },

    _isUrlContainsServiceType: function(url){
      return this.rule.isUrlContainsServiceType(url);
    },

    _getBaseServiceUrl:function(){
      return this._getStringEndWith(this._currentUrl, 'rest/services');
    },

    _getServiceName:function(serviceName){
      var result = '';
      var splits = serviceName.split('/');
      result = splits[splits.length - 1];
      return result;
    },

    _searchBaseServiceUrl:function(baseUrl, root){
      //url is end with 'rest/services'
      // this.shelter.show();
      var resultDef = new Deferred();
      this._getRestInfo(baseUrl).then(lang.hitch(this, function(response){
        if(!this.domNode){
          return;
        }
        var defs = [];

        //handle folders
        array.map(response.folders, lang.hitch(this, function(folderName){
          var folderItem = {
            name: folderName,
            type:'folder',
            url: baseUrl + "/" + folderName,
            parent: root.id
          };

          //add folder
          this._addItem(folderItem);

          //traverse services under the folder
          var def = new Deferred();
          this._doSearchFolderServiceUrl(folderItem.url, folderItem.id).then(lang.hitch(this,
            function(items){
            if(items.length > 0){
              //add service item under the folder
              array.forEach(items, lang.hitch(this, function(item){
                item.parent = folderItem.id;
                this._addItem(item);
              }));
            }else{
              //if there are no proper services under folder, remove the folder
              this._removeItem(folderItem.id);
            }
            def.resolve();
          }), lang.hitch(this, function(err){
            def.reject(err);
          }));
          defs.push(def);
          return def;
        }));

        //handle services
        array.forEach(response.services, lang.hitch(this, function(service){
          if(this.isServiceTypeSupported(service.type)){
            var serviceUrl = baseUrl + '/' + service.name + '/' + service.type;
            var def = new Deferred();
            this.rule.getItem(serviceUrl).then(lang.hitch(this, function(item){
              if(item){
                item.parent = root.id;
                this._addItem(item);
              }
              def.resolve();
            }), lang.hitch(this, function(err){
              console.error(err);
              def.reject(err);
            }));
            defs.push(def);
          }
        }));

        all(defs).then(lang.hitch(this, function(){
          if(!this.domNode){
            return;
          }
          // this.shelter.hide();
          resultDef.resolve();
        }), lang.hitch(this, function(err){
          console.error(err);
          if(!this.domNode){
            return;
          }
          // this.shelter.hide();
          resultDef.reject(err);
        }));
      }), lang.hitch(this, function(err){
        console.error(err);
        if(!this.domNode){
          return;
        }
        // this.shelter.hide();
        var errObj = {
          errorCode: 'NETWORK_ERROR',
          error: err
        };
        resultDef.reject(errObj);
      }));
      return resultDef;
    },

    _searchFolderServiceUrl:function(folderUrl, parent){
      //url is end with folder name
      //http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics
      //http://pslgis.cityofpsl.com/arcgis/rest/services/aerials/
      var resultDef = new Deferred();
      // this.shelter.show();
      this._doSearchFolderServiceUrl(folderUrl, parent).then(lang.hitch(this, function(items){
        if(!this.domNode){
          return;
        }
        array.forEach(items, lang.hitch(this, function(item){
          item.parent = parent.id;
          this._addItem(item);
        }));
        // this.shelter.hide();
        resultDef.resolve();
      }), lang.hitch(this, function(err){
        console.error(err);
        if(!this.domNode){
          return;
        }
        // this.shelter.hide();
        var errObj = {
          errorCode: 'NETWORK_ERROR',
          error: err
        };
        resultDef.reject(errObj);
      }));
      return resultDef;
    },

    //resolve items
    _doSearchFolderServiceUrl: function(folderUrl){
      //url is end with folder name
      var resultDef = new Deferred();
      var baseUrl = this._getBaseServiceUrl();
      this._getRestInfo(folderUrl).then(lang.hitch(this, function(folderResponse){
        var services = folderResponse.services;
        var defs = [];
        if(services && services.length > 0){
          array.forEach(services, lang.hitch(this, function(service){
            if(this.isServiceTypeSupported(service.type)){
              //service.name:Demographics/ESRI_Census_USA
              var serviceUrl = baseUrl + '/' + service.name + '/' + service.type;
              var defItem = this.rule.getItem(serviceUrl);
              defs.push(defItem);
            }
          }));
        }
        all(defs).then(lang.hitch(this, function(items){
          var resultItems = array.filter(items, lang.hitch(this, function(item){
            return item;
          }));
          resultDef.resolve(resultItems);
        }), lang.hitch(this, function(err){
          console.error(err);
          resultDef.reject(err);
        }));
      }), lang.hitch(this, function(err){
        console.error(err);
        resultDef.reject(err);
      }));
      return resultDef;
    },

    _searchServiceUrl:function(serviceUrl, parent){
      //serviceUrl contains 'MapServer' or 'FeatureServer' ...
      //http://servername/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer
      //http://servername/ArcGIS/rest/services/Demographics/ESRI_Census_USA/MapServer/0
      var resultDef = new Deferred();
      this._getSubItems(serviceUrl).then(lang.hitch(this, function(items) {
        if (items && items.length > 0) {
          array.forEach(items, lang.hitch(this, function(item) {
            item.parent = parent.id;
            this._addItem(item);
          }));
          resultDef.resolve();
        } else {
          this._getItem(serviceUrl).then(lang.hitch(this, function(item) {
            //if serviceUrl doesn't pass rule, item will be null
            if(item){
              item.parent = parent.id;
              this._addItem(item);
            }
            resultDef.resolve();
          }), lang.hitch(this, function(err) {
            resultDef.reject(err);
          }));
        }
      }), lang.hitch(this, function(err) {
        resultDef.reject(err);
      }));

      return resultDef;
    },

    _getRestInfo:function(url){
      var def = new Deferred();
      this.rule.getRestInfo(url).then(lang.hitch(this, function(response){
        if(!this.domNode){
          return;
        }
        def.resolve(response);
      }), lang.hitch(this, function(err){
        if(!this.domNode){
          return;
        }
        def.reject(err);
      }));
      return def;
    },

    _clear:function(){
      var items = this._store.query({parent:'root'});
      array.forEach(items, lang.hitch(this, function(item){
        if(item && item.id !== 'root'){
          this._store.remove(item.id);
        }
      }));
    },

    _showRequestError:function(){
      //this.nls.unableConnectTo + " " + this._currentUrl
      // new Message({
      //   message: this.nls.invalidUrlTip
      // });
      this.emit('error', this.nls.invalidUrlTip);
    },

    //item:{name,type,url,parent}
    //type:root,folder,[MapServer,FeatureServer,...]
    _addItem:function(item){
      this._id++;
      item.id = this._id.toString();
      this._store.add(item);
      return item;
    },

    _removeItem: function(itemId){
      this._store.remove(itemId);
    },

    _getRootItem:function(){
      return { id: 'root', name:'Services Root', type:'root'};
    },

    _createTree:function(){
      var rootItem = this._getRootItem();
      var myMemory = new Memory({
        data: [rootItem],
        getChildren: function(object){
          return this.query({parent: object.id});
        }
      });

      // Wrap the store in Observable so that updates to the store are reflected to the Tree
      this._store = new Observable(myMemory);

      var myModel = new ObjectStoreModel({
        store: this._store,
        query: { id: "root" },
        mayHaveChildren: lang.hitch(this, this._mayHaveChildren)
      });

      this.tree = new Tree({
        multiple: this.multiple,
        model: myModel,
        showRoot: false,
        style:{
          width:"100%"
        },

        isLeafItem: lang.hitch(this, this.isLeafItem),

        onOpen: lang.hitch(this, function(item, node){
          this._onTreeOpen(item, node);
          this.emit('tree-open', item, node);
        }),

        onClick: lang.hitch(this, function(item, node, evt){
          this._onTreeClick(item, node, evt);
          this.emit('tree-click', item, node, evt);
        }),

        getIconStyle:lang.hitch(this, function(item, opened){
          var icon = null;
          if (!item) {
            return null;
          }
          var a = {
            width: "20px",
            height: "20px",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundImage: ''
          };
          var baseUrl = window.location.protocol + "//" + window.location.host +
          require.toUrl("jimu");
          var imageName = this._getIconImageName(item, opened);

          if(!imageName){
            if (item.type === 'folder') {
              if (opened) {
                imageName = 'folder_open_default.png';
              } else {
                imageName = 'folder_close_default.png';
              }
            }
            else if(this.isServiceTypeSupported(item.type)){
              if (opened) {
                imageName = 'folder_open_default.png';
              } else {
                imageName = 'folder_close_default.png';
              }
            }
          }

          if(imageName){
            a.backgroundImage = "url(" + baseUrl + "/css/images/" + imageName + ")";
            icon = a;
          }
          return icon;
        })
      });
      html.addClass(this.tree.domNode, this._treeClass);
      // this.own(on(this.tree,'item-select', lang.hitch(this, function(args){
      //   //{item,treeNode}
      //   this.emit('item-select', args);
      // })));
      // this.own(on(this.tree,'item-unselect', lang.hitch(this, function(args){
      //   //{item,treeNode}
      //   this.emit('item-unselect', args);
      // })));
      this.tree.placeAt(this.domNode);
    },

    _getIconImageName: function(item, opened){
      var imageName = "";
      if(typeof this.rule.getIconImageName === 'function'){
        imageName = this.rule.getIconImageName(item, opened);
      }
      return imageName;
    },

    _mayHaveChildren:function(item){
      if(item.type === 'root'){
        return true;
      }else{
        return !this.isLeafItem(item);
      }
    },

    _onTreeOpen:function(item, node){
      /*jshint unused: false*/
      if(item.id === 'root'){
        return;
      }
      var children = this._store.query({parent:item.id});
      if(children.length > 0){
        return;
      }
      if(item.checking || item.checked){
        return;
      }

      item.checking = true;
      this._getSubItems(item.url).then(lang.hitch(this, function(childrenItems){
        array.forEach(childrenItems, lang.hitch(this, function(childItem){
          childItem.parent = item.id;
          this._addItem(childItem);
        }));
        item.checking = false;
        item.checked = true;
      }), lang.hitch(this, function(err){
        console.error(err);
        item.checking = false;
        item.checked = true;
      }));
    },

    _onTreeClick:function(item, node, evt){/*jshint unused: false*/},

    destroy:function(){
      if(this.shelter){
        this.shelter.destroy();
        this.shelter = null;
      }
      this.inherited(arguments);
    }

  });
});