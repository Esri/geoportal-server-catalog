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
  'dojo/on',
  'dojo/Evented',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/QueryableLayerSource.html',
  'jimu/dijit/RadioBtn',
  'jimu/dijit/_QueryableLayerChooserWithButtons',
  'jimu/dijit/QueryableServiceChooserFromPortal',
  'jimu/dijit/_QueryableServiceChooserContent',
  'jimu/portalUrlUtils'
],
function(on, Evented, lang, html, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
  RadioBtn, QueryableLayerChooserWithButtons, QueryableServiceChooserFromPortal, _QueryableServiceChooserContent,
  portalUrlUtils) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString: template,
    baseClass: 'jimu-layer-source jimu-queryable-layer-source',
    declaredClass: 'jimu.dijit.QueryableLayerSource',
    nls: null,

    //common options:
    multiple: false,

    //QueryableLayerChooserFromMap options
    createMapResponse: null,
    mustSupportStatistics: false,

    //QueryableServiceChooserFromPortal options
    portalUrl: null,

    //public methods:
    //getSelectedItems: return items, [{name,url,definition, /*optional*/ portalUrl, /*optional*/ itemId}]
    //getSelectedRadioType

    //events:
    //ok
    //cancel

    postMixInProperties: function(){
      this.nls = window.jimuNls.queryableLayerSource;
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
        items = this.queryableLayerChooserFromMap.getSelectedItems();
      }
      else if(this.portalRadio.checked){
        items = this.queryableServiceChooserFromPortal.getSelectedItems();
      }
      else if(this.urlRadio.checked){
        items = this.queryableServiceChooserContent.getSelectedItems();
      }
      return items;
    },

    startup: function(){
      this.inherited(arguments);
      this.queryableLayerChooserFromMap.startup();
      this.queryableServiceChooserFromPortal.startup();
      this.queryableServiceChooserContent.startup();
    },

    _initSelf: function(){
      this._initRadios();

      //create QueryableLayerChooserWithButtons
      this._createQueryableLayerChooserWithButtons();

      //create QueryableServiceChooserFromPortal
      this._createQueryableServiceChooserFromPortal();

      //create _QueryableServiceChooserContent
      this._createQueryableServiceChooserContent();

      this._onRadioClicked();
    },

    _createQueryableLayerChooserWithButtons: function(){
      var args1 = {
        style: {
          width: '100%',
          height: '100%'
        },
        multiple: this.multiple,
        createMapResponse: this.createMapResponse,
        mustSupportStatistics: this.mustSupportStatistics,
        onlyShowWebMapLayers: true
      };
      this.queryableLayerChooserFromMap = new QueryableLayerChooserWithButtons(args1);
      this.queryableLayerChooserFromMap.operationTip = this.nls.selectLayer;
      this.queryableLayerChooserFromMap.placeAt(this.mapDijitContainer);

      this.own(on(this.queryableLayerChooserFromMap, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.queryableLayerChooserFromMap, 'cancel', lang.hitch(this, function(){
        this.emit('cancel');
      })));
    },

    _createQueryableServiceChooserFromPortal: function(){
      var args2 = {
        multiple: this.multiple,
        portalUrl: this.portalUrl,
        style: {
          width: '100%',
          height: '100%'
        }
      };
      this.queryableServiceChooserFromPortal = new QueryableServiceChooserFromPortal(args2);
      this.queryableServiceChooserFromPortal.operationTip = this.nls.chooseItem;
      this.queryableServiceChooserFromPortal.placeAt(this.portalDijitContainer);

      this.own(on(this.queryableServiceChooserFromPortal, 'next', lang.hitch(this, function(){
        this.queryableServiceChooserFromPortal.operationTip = this.nls.chooseItem +
         " -> " + this.nls.chooseLayer;
        this._updateOperationTip();
      })));

      this.own(on(this.queryableServiceChooserFromPortal, 'back', lang.hitch(this, function(){
        this.queryableServiceChooserFromPortal.operationTip = this.nls.chooseItem;
        this._updateOperationTip();
      })));

      this.own(on(this.queryableServiceChooserFromPortal, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.queryableServiceChooserFromPortal, 'cancel', lang.hitch(this, function(){
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

    _createQueryableServiceChooserContent: function(){
      var args3 = {
        multiple: this.multiple,
        style: {
          width: '100%',
          height: '100%'
        }
      };
      this.queryableServiceChooserContent = new _QueryableServiceChooserContent(args3);
      this.queryableServiceChooserContent.operationTip = this.nls.setServiceUrl;
      this.queryableServiceChooserContent.placeAt(this.urlDijitContainer);

      this.own(on(this.queryableServiceChooserContent, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.queryableServiceChooserContent, 'cancel', lang.hitch(this, function(){
        this.emit('cancel');
      })));
    },

    _initRadios: function(){
      var group = "queryableLayerSourceRadios_" + this._getRandomString();
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
      html.setStyle(this.mapDijitContainer, 'display', 'none');
      html.setStyle(this.portalDijitContainer, 'display', 'none');
      html.setStyle(this.urlDijitContainer, 'display', 'none');

      if(this.mapRadio.checked){
        html.setStyle(this.mapDijitContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.selectLayer;
      }
      else if(this.portalRadio.checked){
        html.setStyle(this.portalDijitContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.chooseItem;
      }
      else if(this.urlRadio.checked){
        html.setStyle(this.urlDijitContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.setServiceUrl;
      }

      this._updateOperationTip();
    },

    _updateOperationTip: function(){
      if(this.mapRadio.checked){
        this.operationTip.innerHTML = this.queryableLayerChooserFromMap.operationTip;
      }
      else if(this.portalRadio.checked){
        this.operationTip.innerHTML = this.queryableServiceChooserFromPortal.operationTip;
      }
      else if(this.urlRadio.checked){
        this.operationTip.innerHTML = this.queryableServiceChooserContent.operationTip;
      }
    }

  });
});