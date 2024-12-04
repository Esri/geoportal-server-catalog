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
  'dojo/text!./templates/FeaturelayerSource.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/Evented',
  'jimu/dijit/RadioBtn',
  'jimu/dijit/_FeaturelayerChooserWithButtons',
  'jimu/dijit/FeaturelayerChooserFromPortal',
  'jimu/dijit/_FeaturelayerServiceChooserContent',
  'jimu/portalUrlUtils'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang, html, on, Evented,
  RadioBtn, FeaturelayerChooserWithButtons, FeaturelayerChooserFromPortal, _FeaturelayerServiceChooserContent,
  portalUrlUtils) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString: template,
    baseClass: 'jimu-layer-source jimu-featurelayer-source',
    declaredClass: 'jimu.dijit.FeaturelayerSource',
    nls: null,

    //common options:
    multiple: false,

    //FeaturelayerChooserFromMap options
    createMapResponse: null,

    //FeaturelayerChooserFromPortal options
    portalUrl: null,

    //public methods:
    //getSelectedItems
    //getSelectedRadioType

    //events:
    //ok
    //cancel

    postMixInProperties: function(){
      this.nls = window.jimuNls.featureLayerSource;
      this.portalUrl = portalUrlUtils.getStandardPortalUrl(this.portalUrl);
    },

    postCreate: function(){
      this.inherited(arguments);
      this._initSelf();
    },

    getSelectedRadioType: function(){
      if(this.mapRadio.checked){
        return "map";
      }else if(this.portalRadio.checked){
        return "portal";
      }else if(this.urlRadio.checked){
        return "url";
      }
    },

    getSelectedItems: function(){
      var items = [];
      if(this.mapRadio.checked){
        items = this.flcMap.getSelectedItems();
      }
      else if(this.portalRadio.checked){
        items = this.flcPortal.getSelectedItems();
      }
      else if(this.urlRadio.checked){
        items = this.flcUrl.getSelectedItems();
      }
      return items;
    },

    startup: function(){
      this.inherited(arguments);
      this.flcMap.startup();
      this.flcPortal.startup();
      this.flcUrl.startup();
    },

    _initSelf: function(){
      this._initRadios();

      //create FeaturelayerChooserWithButtons
      this._createFeaturelayerChooserWithButtons();

      //create FeaturelayerChooserFromPortal
      this._createFeaturelayerChooserFromPortal();

      //create _FeaturelayerServiceChooserContent
      this._createFeaturelayerServiceChooserContent();

      this._onRadioClicked();
    },

    _createFeaturelayerChooserWithButtons: function(){
      var args1 = {
        style: {
          width: '100%',
          height: '100%'
        },
        multiple: this.multiple,
        createMapResponse: this.createMapResponse,
        onlyShowWebMapLayers: true
      };
      this.flcMap = new FeaturelayerChooserWithButtons(args1);
      this.flcMap.operationTip = this.nls.selectLayer;
      this.flcMap.placeAt(this.flcContainer);

      this.own(on(this.flcMap, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.flcMap, 'cancel', lang.hitch(this, function(){
        this.emit('cancel');
      })));
    },

    _createFeaturelayerChooserFromPortal: function(){
      var args2 = {
        multiple: this.multiple,
        portalUrl: this.portalUrl,
        style: {
          width: '100%',
          height: '100%'
        }
      };
      this.flcPortal = new FeaturelayerChooserFromPortal(args2);
      this.flcPortal.operationTip = this.nls.chooseItem;
      this.flcPortal.placeAt(this.hflcContainer);

      this.own(on(this.flcPortal, 'next', lang.hitch(this, function(){
        this.flcPortal.operationTip = this.nls.chooseItem + " -> " + this.nls.chooseLayer;
        this._updateOperationTip();
      })));

      this.own(on(this.flcPortal, 'back', lang.hitch(this, function(){
        this.flcPortal.operationTip = this.nls.chooseItem;
        this._updateOperationTip();
      })));

      this.own(on(this.flcPortal, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.flcPortal, 'cancel', lang.hitch(this, function(){
        this.emit('cancel');
      })));

      var portalUrl = this.portalUrl || '';
      if(portalUrl.toLowerCase().indexOf('.arcgis.com') >= 0){
        this.portalLabel.innerHTML = this.nls.selectFromOnline;
      }
      else{
        this.portalLabel.innerHTML = this.nls.selectFromPortal;
      }
    },

    _createFeaturelayerServiceChooserContent: function(){
      var args3 = {
        multiple: this.multiple,
        style: {
          width: '100%',
          height: '100%'
        }
      };
      this.flcUrl = new _FeaturelayerServiceChooserContent(args3);
      this.flcUrl.operationTip = this.nls.setServiceUrl;
      this.flcUrl.placeAt(this.flscContainer);

      this.own(on(this.flcUrl, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.flcUrl, 'cancel', lang.hitch(this, function(){
        this.emit('cancel');
      })));
    },

    _initRadios: function(){
      var group = "featureLayerSourceRadios_" + this._getRandomString();
      var radioChangeHandler = lang.hitch(this, this._onRadioClicked);

      this.mapRadio = new RadioBtn({
        group: group,
        onStateChange: radioChangeHandler,
        checked: true
      });
      this.mapRadio.placeAt(this.mapTd, 'first');

      this.portalRadio = new RadioBtn({
        group: group,
        onStateChange: radioChangeHandler,
        checked: false
      });
      this.portalRadio.placeAt(this.portalTd, 'first');

      this.urlRadio = new RadioBtn({
        group: group,
        onStateChange: radioChangeHandler,
        checked: false
      });
      this.urlRadio.placeAt(this.urlTd, 'first');

      this.own(on(this.mapLabel, 'click', lang.hitch(this, function(){
        this.mapRadio.check();
      })));

      this.own(on(this.portalLabel, 'click', lang.hitch(this, function(){
        this.portalRadio.check();
      })));

      this.own(on(this.urlLabel, 'click', lang.hitch(this, function(){
        this.urlRadio.check();
      })));
    },

    _getRandomString: function(){
      var str = Math.random().toString();
      str = str.slice(2, str.length);
      return str;
    },

    _onRadioClicked: function(){
      html.setStyle(this.flcContainer, 'display', 'none');
      html.setStyle(this.hflcContainer, 'display', 'none');
      html.setStyle(this.flscContainer, 'display', 'none');

      if(this.mapRadio.checked){
        html.setStyle(this.flcContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.selectLayer;
      }
      else if(this.portalRadio.checked){
        html.setStyle(this.hflcContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.chooseItem;
      }
      else if(this.urlRadio.checked){
        html.setStyle(this.flscContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.setServiceUrl;
      }

      this._updateOperationTip();
    },

    _updateOperationTip: function(){
      if(this.mapRadio.checked){
        this.operationTip.innerHTML = this.flcMap.operationTip;
      }
      else if(this.portalRadio.checked){
        this.operationTip.innerHTML = this.flcPortal.operationTip;
      }
      else if(this.urlRadio.checked){
        this.operationTip.innerHTML = this.flcUrl.operationTip;
      }
    }

  });
});