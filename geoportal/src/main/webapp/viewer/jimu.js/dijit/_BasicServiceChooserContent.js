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

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/_BasicServiceChooserContent.html',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/aspect',
  'dojo/promise/all',
  'jimu/dijit/URLInput',
  'jimu/dijit/LoadingIndicator'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, Evented,
  Deferred, html, array, lang, on, aspect, all, URLInput, LoadingIndicator) {
  /*jshint unused: false*/
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString: template,

    _examples:['http://myserver/arcgis/rest/services',
    'http://myserver/arcgis/rest/services/folder',
    'http://myserver/arcgis/rest/services/myservice/servicetype'],

    //options:
    multiple: false,
    url:'',

    //public methods:
    //setUrl

    //events:
    //ok
    //cancel

    //methods need to override:
    //_createServiceBrowser, return a service browser

    //public methods:
    //getSelectedItems return [{name,url, /*optional*/ definition}]

    getSelectedItems: function(){
      return this.serviceBrowser.getSelectedItems();
    },

    postMixInProperties:function(){
      this.nls = lang.mixin({}, window.jimuNls.common);
      this.nls = lang.mixin(this.nls, window.jimuNls.basicServiceChooser);
    },

    postCreate: function(){
      this.inherited(arguments);
      html.addClass(this.domNode, 'jimu-basic-service-chooser-content');
      this.multiple = !!this.multiple;
      this._initSelf();
      this.exampleTd.innerHTML = this.exampleTd.innerHTML;
    },

    setUrl: function(url){
      var def = new Deferred();

      this.url = url;
      if(this.url && typeof this.url === 'string'){
        this.urlInput.set('value', this.url);
        def = this._onBtnValidateClick();
      }
      else{
        def.reject();
      }

      return def;
    },

    focusInput: function(){
      this.urlInput.focus();
    },

    _initSelf: function(){
      //set examples
      if(this._examples && this._examples.length > 0){
        array.forEach(this._examples, lang.hitch(this, function(example){
          html.create('div', {
            innerHTML: example,
            'class': 'example-url'
          }, this.exampleTd);
        }));
      }
      else{
        html.setStyle(this.exampleTr, 'display', 'none');
      }

      //set service browser
      var args = {
        multiple: this.multiple,
        _onTreeClick: lang.hitch(this, this._onTreeClick)
      };
      this.serviceBrowser = this._createServiceBrowser(args);
      this.serviceBrowser.placeAt(this.serviceBrowserContainer);
      this.serviceBrowser.startup();

      this.own(aspect.after(this.urlInput, 'validator', lang.hitch(this, this._afterUrlValidate)));

      if(this.url && typeof this.url === 'string'){
        this.urlInput.set('value', this.url);
      }

      this.own(on(this.serviceBrowser, 'error', lang.hitch(this, this._onServiceBrowserError)));
    },

    //to be override,return a service browser
    _createServiceBrowser: function(args){/* jshint unused: false */},

    //to be override,return a bool value
    _validateUrl: function(url){
      url = url.replace(/\/*$/g, '');
      var matchResult = url.match(/\/rest\/services\/*(.*)/gi);
      if(matchResult && matchResult.length > 0){
        //"/rest/services/SampleWorldCities/MapServer/"
        var url2 = matchResult[0];
        //"SampleWorldCities/MapServer/"
        var url3 = url2.replace(/\/rest\/services\/*/, "");
        if(url3){
          var splits = url3.split("/");
          if(splits.length === 1){
            //url ends with folder name
            //url: http://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation
            return true;
          }else if(splits.length === 2){
            //url ends with service type
            //url: http://sampleserver6.arcgisonline.com/arcgis/rest/services/SF311/MapServer
            return this.serviceBrowser.isServiceTypeSupported(splits[1]);
          }else if(splits.length >= 3){
            //url ends with service type and has folder
            //url:http://sampleserver6/arcgis/rest/services/SampleWorldCities/MapServer/0
            //or
            //url:http://sampleserver6/arcgis/rest/services/Elevation/WorldElevations/MapServer
            var b1 = this.serviceBrowser.isServiceTypeSupported(splits[1]);
            var b2 = this.serviceBrowser.isServiceTypeSupported(splits[2]);
            return b1 || b2;
          }
        }else{
          //url ends with "rest/services"
          //url: "http://sampleserver6.arcgisonline.com/arcgis/rest/services"
          return true;
        }
      }else{
        return false;
      }
    },

    _afterUrlValidate: function(isValidate){
      var disabledClass = 'jimu-state-disabled';

      if(isValidate){
        var url = this.urlInput.get('value');
        isValidate = this._validateUrl(url);
      }

      if(isValidate){
        html.removeClass(this.btnValidate, disabledClass);
      }else{
        html.addClass(this.btnValidate, disabledClass);
      }

      return isValidate;
    },

    _onServiceBrowserError: function(msg){
      this._showErrorMessage(msg);
    },

    _showErrorMessage: function(msg){
      if(msg && typeof msg === 'string'){
        this.errorNode.innerHTML = msg;
        html.addClass(this.errorSection, 'visible');
      }else{
        html.removeClass(this.errorSection, 'visible');
      }
    },

    _clearErrorMessage: function(){
      this.errorNode.innerHTML = '';
      html.removeClass(this.errorSection, 'visible');
    },

    _onBtnValidateClick: function(){
      this._clearErrorMessage();

      var def = new Deferred();

      var isValidate = this.urlInput.validate();
      if(isValidate){
        var url = this.urlInput.get('value');
        this.serviceBrowser.setUrl(url).then(lang.hitch(this, function(){
          if(this.domNode){
            this._checkSelectedItemsNumber();
          }
          def.resolve();
        }), lang.hitch(this, function(){
          if(this.domNode){
            this._checkSelectedItemsNumber();
          }
          def.reject();
        }));
        this.emit('validate-click');
      }
      else{
        def.reject();
      }

      return def;
    },

    _checkSelectedItemsNumber: function(){
      var disabledClass = 'jimu-state-disabled';
      var items = this.getSelectedItems();
      if(items.length > 0){
        html.removeClass(this.btnOk, disabledClass);
      }
      else{
        html.addClass(this.btnOk, disabledClass);
      }
    },

    _onTreeClick: function(){
      this._checkSelectedItemsNumber();
    },

    _onBtnOkClick: function(){
      var items = this.getSelectedItems();
      if(items.length > 0){
        this.emit('ok', items);
      }
    },

    _onBtnCancelClick: function(){
      this.emit('cancel');
    }

  });
});