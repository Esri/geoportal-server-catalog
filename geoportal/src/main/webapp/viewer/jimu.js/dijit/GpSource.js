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
  'dojo/text!./templates/GpSource.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/Evented',
  'jimu/dijit/GpChooserFromPortal',
  'jimu/dijit/_GpServiceChooserContent',
  'jimu/portalUrlUtils'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
  template, lang, html, on, Evented, GpChooserFromPortal,
  _GpServiceChooserContent, portalUrlUtils) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString: template,
    baseClass: 'jimu-gp-source',
    declaredClass: 'jimu.dijit.GpSource',
    nls: null,

    //common options:
    multiple: false,

    //GpChooserFromPortal options
    portalUrl: null,

    //public methods:
    //getSelectedItems return[{name,url}]

    //events:
    //ok
    //cancel

    postMixInProperties: function(){
      this.nls = window.jimuNls.gpSource;
      this.portalUrl = portalUrlUtils.getStandardPortalUrl(this.portalUrl);
    },

    postCreate: function(){
      this.inherited(arguments);
      this._initSelf();
    },

    getSelectedItems: function(){
      var items = [];
      if(this.portalRadio.checked){
        items = this.gpcPortal.getSelectedItems();
      }
      else if(this.urlRadio.checked){
        items = this.gpcUrl.getSelectedItems();
      }
      return items;
    },

    startup: function(){
      if(!this._started){
        this.inherited(arguments);
        this.gpcPortal.startup();
        this.gpcUrl.startup();
      }
      this._started = true;
    },

    _initSelf: function(){
      this._initRadios();

      //create GpChooserFromPortal
      this._createGpChooserFromPortal();

      //create _GpServiceChooserContent
      this._createGpServiceChooserContent();

      this._onRadioClicked();
    },

    _createGpChooserFromPortal: function(){
      var args2 = {
        multiple: this.multiple,
        portalUrl: this.portalUrl,
        style: {
          width: '100%',
          height: '100%'
        }
      };
      this.gpcPortal = new GpChooserFromPortal(args2);
      this.gpcPortal.operationTip = this.nls.chooseItem;
      this.gpcPortal.placeAt(this.hflcContainer);

      this.own(on(this.gpcPortal, 'next', lang.hitch(this, function(){
        this.gpcPortal.operationTip = this.nls.chooseItem + " -> " + this.nls.chooseTask;
        this._updateOperationTip();
      })));

      this.own(on(this.gpcPortal, 'back', lang.hitch(this, function(){
        this.gpcPortal.operationTip = this.nls.chooseItem;
        this._updateOperationTip();
      })));

      this.own(on(this.gpcPortal, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.gpcPortal, 'cancel', lang.hitch(this, function(){
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

    _createGpServiceChooserContent: function(){
      var args3 = {
        multiple: this.multiple,
        style: {
          width: '100%',
          height: '100%'
        }
      };
      this.gpcUrl = new _GpServiceChooserContent(args3);
      this.gpcUrl.operationTip = this.nls.setServiceUrl;
      this.gpcUrl.placeAt(this.flscContainer);

      this.own(on(this.gpcUrl, 'ok', lang.hitch(this, function(items){
        if(items && items.length > 0){
          this.emit('ok', items);
        }
      })));

      this.own(on(this.gpcUrl, 'cancel', lang.hitch(this, function(){
        this.emit('cancel');
      })));
    },

    _initRadios: function(){
      var name = "gpSourceRadios_" + this._getRandomString();
      this.portalRadio.name = name;
      html.setAttr(this.portalRadio, 'id', "portalRadio_" + this._getRandomString());
      html.setAttr(this.portalLabel, 'for', this.portalRadio.id);

      this.urlRadio.name = name;
      html.setAttr(this.urlRadio, 'id', "urlRadio_" + this._getRandomString());
      html.setAttr(this.urlLabel, 'for', this.urlRadio.id);
    },

    _getRandomString: function(){
      var str = Math.random().toString();
      str = str.slice(2, str.length);
      return str;
    },

    _onRadioClicked: function(){
      html.setStyle(this.hflcContainer, 'display', 'none');
      html.setStyle(this.flscContainer, 'display', 'none');

      if(this.portalRadio.checked){
        html.setStyle(this.hflcContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.chooseItem;
      }
      else if(this.urlRadio.checked){
        html.setStyle(this.flscContainer, 'display', 'block');
        this.operationTip.innerHTML = this.nls.setServiceUrl;
        setTimeout(lang.hitch(this, function() {
          this.gpcUrl.focusInput();
        }), 50);
      }

      this._updateOperationTip();
    },

    _updateOperationTip: function(){
      if(this.portalRadio.checked){
        this.operationTip.innerHTML = this.gpcPortal.operationTip;
        //update style
        var browserContainer = this.gpcPortal.browserContainer;
        browserContainer.style.top = 0;
        var operationTipHeight = this.operationTip.clientHeight;
        if(operationTipHeight >= 19){
          browserContainer.style.top = (operationTipHeight - 19) + 'px';
        }
      }
      else if(this.urlRadio.checked){
        this.operationTip.innerHTML = this.gpcUrl.operationTip;
      }
    }

  });
});