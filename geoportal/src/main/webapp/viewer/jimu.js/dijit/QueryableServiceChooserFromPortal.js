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
  'dojo/text!./templates/QueryableServiceChooserFromPortal.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/query',
  'dojo/Deferred',
  'dojo/Evented',
  'dojo/promise/all',
  'jimu/dijit/ItemSelector',
  'jimu/dijit/QueryableServiceBrowser',
  'jimu/portalUrlUtils',
  'esri/request'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
  lang, html, array, on, query, Deferred, Evented, promiseAll, ItemSelector,
  ServiceBrowser, portalUrlUtils, esriRequest) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    /*jshint unused: false*/
    templateString: template,
    declaredClass: 'jimu.dijit.QueryableServiceChooserFromPortal',
    baseClass: 'jimu-service-chooser-from-portal jimu-queryable-service-chooser-from-portal',

    _serviceBrowserDef:null,

    //options:
    portalUrl: null,
    multiple: false,

    //events:
    //ok
    //cancel

    //public methods:
    //getSelectedItems return [{name,url,definition}]

    postMixInProperties: function(){
      this.nls = lang.mixin({}, window.jimuNls.common);
      this.nls = lang.mixin(this.nls, window.jimuNls.featureLayerChooserFromPortal);
      this.portalUrl = portalUrlUtils.getStandardPortalUrl(this.portalUrl);
      this.multiple = this.multiple === true ? true : false;
    },

    postCreate: function(){
      this.inherited(arguments);
      this._initSelf();
    },

    getSelectedItems: function(){
      //[{name,url,definition}]
      var items = this.serviceBrowser.getSelectedItems();
      return items;
    },

    _initSelf: function(){
      //init selector
      this.selector = new ItemSelector({
        portalUrl: this.portalUrl,
        itemTypes: ['Feature Service', 'Map Service', 'Image Service'],
        onlyShowOnlineFeaturedItems: false
      });
      this.own(on(this.selector, 'item-selected', lang.hitch(this, this._onItemSelected)));
      this.own(on(this.selector, 'none-item-selected', lang.hitch(this, this._onNoneItemSelected)));
      this.selector.placeAt(this.selectorContainer);
      this.selector.startup();

      //init service browser
      this.serviceBrowser = new ServiceBrowser({
        multiple: this.multiple
      });
      this.own(on(this.serviceBrowser,
                  'tree-click',
                  lang.hitch(this, this._onServiceBrowserClicked)));
      this.serviceBrowser.placeAt(this.serviceBrowserContainer);
      this.serviceBrowser.startup();
    },

    _onItemSelected: function(){
      html.removeClass(this.btnNext, 'jimu-state-disabled');
    },

    _onNoneItemSelected: function(){
      html.addClass(this.btnNext, 'jimu-state-disabled');
    },

    _onBtnBackClicked: function(){
      if(this._serviceBrowserDef && !this._serviceBrowserDef.isFulfilled()){
        this._serviceBrowserDef.cancel();
      }
      html.setStyle(this.btnOk, 'display', 'none');
      html.setStyle(this.btnNext, 'display', 'block');
      html.setStyle(this.btnBack, 'display', 'none');
      html.addClass(this.btnOk, 'jimu-state-disabled');
      html.setStyle(this.selectorContainer, 'display', 'block');
      html.setStyle(this.serviceBrowserContainer, 'display', 'none');
      this.serviceBrowser.reset();
      this.emit('back');
    },

    _onBtnOkClicked: function(){
      var items = this.getSelectedItems();
      if(items.length > 0){
        this.emit('ok', items);
      }
    },

    _onBtnNextClicked: function(){
      var item = this.selector.getSelectedItem();
      if(!item){
        return;
      }
      html.setStyle(this.btnNext, 'display', 'none');
      html.setStyle(this.btnBack, 'display', 'block');
      html.setStyle(this.btnOk, 'display', 'block');
      html.addClass(this.btnOk, 'jimu-state-disabled');
      html.setStyle(this.selectorContainer, 'display', 'none');
      html.setStyle(this.serviceBrowserContainer, 'display', 'block');
      this.serviceBrowser.reset();
      var url = item.url || item.item;
      this._serviceBrowserDef = this.serviceBrowser.setUrl(url);
      this._serviceBrowserDef.then(lang.hitch(this, function(){
        this._serviceBrowserDef = null;
        this._setOkStateBySelectedItems();
      }), lang.hitch(this, function(){
        this._serviceBrowserDef = null;
      }));
      this.emit('next');
    },

    _setOkStateBySelectedItems: function(){
      var items = this.serviceBrowser.getSelectedItems();
      if(items.length > 0){
        html.removeClass(this.btnOk, 'jimu-state-disabled');
      }
      else{
        html.addClass(this.btnOk, 'jimu-state-disabled');
      }
    },

    _onServiceBrowserClicked: function(){
      this._setOkStateBySelectedItems();
    },

    _onBtnCancelClicked: function(){
      this.emit('cancel');
    }

  });
});