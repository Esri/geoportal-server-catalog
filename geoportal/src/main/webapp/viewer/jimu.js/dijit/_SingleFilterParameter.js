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
  'dojo/on',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/_SingleFilterParameter.html',
  'dojo/_base/lang'
],
  function(on, Evented, Deferred, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
    lang) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-single-filter-parameter',
      templateString: template,
      valueProvider: null,

      //options
      nls:null,
      url: null,
      layerDefinition: null,
      fieldInfo:null,
      part: null,
      valueProviderFactory: null,

      //public methods:
      //getValueObject

      //events:
      //change

      postCreate: function(){
        this.inherited(arguments);
        this.valueProvider = this.valueProviderFactory.getValueProvider(this.part, true);
        this.valueProvider.placeAt(this.valueProviderTd);
        this.own(on(this.valueProvider, 'change', lang.hitch(this, this._onValueProviderChanged)));
        this.valueProvider.bindChangeEvents();
      },

      getValueObject: function(){
        return this.valueProvider.getValueObject();
      },

      //return a deferred object
      init: function(){
        return this.build(this.fieldInfo, this.part);
      },

      build:function(fieldInfo, part){
        var resultDef = null;
        this.fieldInfo = fieldInfo;
        this.part = part;
        var interactiveObj = part.interactiveObj;

        if(interactiveObj){
          this.promptNode.innerHTML = interactiveObj.prompt || '';
          this.hintNode.innerHTML = interactiveObj.hint || '';
        }

        var def = this.valueProvider.setValueObject(this.part.valueObj);
        if(def && typeof def.then === 'function'){
          resultDef = def;
        }else{
          resultDef = new Deferred();
          resultDef.resolve();
        }

        return resultDef;
      },

      disable: function(){
        this.valueProvider.disable();
      },

      enable: function(){
        this.valueProvider.enable();
      },

      isEnabled: function(){
        return this.valueProvider.isEnabled();
      },

      getStatus: function(){
        return this.valueProvider.getStatus();
      },

      _showValidationErrorTip:function(_dijit){
        if(!_dijit.validate() && _dijit.domNode){
          if(_dijit.focusNode){
            _dijit.focusNode.focus();
            _dijit.focusNode.blur();
          }
        }
      },

      _onValueProviderChanged: function(){
        this.emit('change');
        /*var valueObj = this.valueProvider.getValueObject();
        if(valueObj){
          this.emit("valid-change");
        }*/
      }

    });
  });