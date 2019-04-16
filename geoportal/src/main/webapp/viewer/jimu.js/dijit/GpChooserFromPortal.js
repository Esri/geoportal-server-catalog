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
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/GpChooserFromPortal.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/query',
  'dojo/Deferred',
  'dojo/Evented',
  'dojo/promise/all',
  'jimu/dijit/ItemSelector',
  'jimu/dijit/GpServiceBrowser',
  'jimu/portalUrlUtils',
  'esri/request'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
  lang, html, array, on, query, Deferred, Evented, promiseAll, ItemSelector,
  GpServiceBrowser, portalUrlUtils, esriRequest) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    /*jshint unused: false*/
    templateString: template,
    declaredClass: 'jimu.dijit.GpChooserFromPortal',
    baseClass: 'jimu-gp-chooser-from-portal',

    _serviceDef: null,

    //options:
    portalUrl: null,
    multiple: false,

    //events:
    //ok
    //cancel

    //public methods:
    //getSelectedItems return [{name,url}]

    postMixInProperties: function(){
      this.nls = lang.mixin({}, window.jimuNls.common);
      this.portalUrl = portalUrlUtils.getStandardPortalUrl(this.portalUrl);
    },

    postCreate: function(){
      this.inherited(arguments);
      this._initSelf();
    },

    getSelectedItems: function(){
      var items = this.gpServiceBrowser.getSelectedItems();
      return items;
    },

    _initSelf: function(){
      //init selector
      this.selector = new ItemSelector({
        portalUrl: this.portalUrl,
        itemTypes: ['Geoprocessing Service'],
        onlyShowOnlineFeaturedItems: false
      });
      this.own(on(this.selector, 'item-selected', lang.hitch(this, this._onItemSelected)));
      this.own(on(this.selector, 'none-item-selected', lang.hitch(this, this._onNoneItemSelected)));
      this.selector.placeAt(this.selectorContainer);
      this.selector.startup();
      this.gpServiceBrowser._onTreeClick = lang.hitch(this, this._onBrowserClicked);
    },

    _onItemSelected: function(){
      html.removeClass(this.btnNext, 'jimu-state-disabled');
    },

    _onNoneItemSelected: function(){
      html.addClass(this.btnNext, 'jimu-state-disabled');
    },

    _onBtnBackClicked: function(){
      if(this._serviceDef && !this._serviceDef.isFulfilled()){
        this._serviceDef.cancel();
      }
      html.setStyle(this.btnOk, 'display', 'none');
      html.setStyle(this.btnNext, 'display', 'block');
      html.setStyle(this.btnBack, 'display', 'none');
      html.addClass(this.btnOk, 'jimu-state-disabled');
      html.setStyle(this.selectorContainer, 'display', 'block');
      html.setStyle(this.browserContainer, 'display', 'none');
      this._reset();
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
      this._reset();
      html.setStyle(this.btnNext, 'display', 'none');
      html.setStyle(this.btnBack, 'display', 'block');
      html.setStyle(this.btnOk, 'display', 'block');
      html.addClass(this.btnOk, 'jimu-state-disabled');
      html.setStyle(this.selectorContainer, 'display', 'none');
      html.setStyle(this.browserContainer, 'display', 'block');
      var url = item.url || item.item;
      this.gpServiceBrowser.setUrl(url).then(lang.hitch(this, function(){
        var items = this.getSelectedItems();
        if(items.length > 0){
          html.removeClass(this.btnOk, 'jimu-state-disabled');
        }
      }));
      this.emit('next');
    },

    _reset: function(){
      this.gpServiceBrowser.reset();
    },

    _onBrowserClicked: function(){
      var items = this.gpServiceBrowser.getSelectedItems();
      if(items.length > 0){
        html.removeClass(this.btnOk, 'jimu-state-disabled');
      }
      else{
        html.addClass(this.btnOk, 'jimu-state-disabled');
      }
    },

    _onBtnCancelClicked: function(){
      this.emit('cancel');
    }

  });
});