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
  'dojo/_base/array',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'jimu/utils',
  'esri/lang'
],
  function(on, Evented, lang, html, array, declare, _WidgetBase, _TemplatedMixin, jimuUtils, esriLang) {

    return declare([_WidgetBase, _TemplatedMixin, Evented], {
      baseClass: 'jimu-filter-value-provider',
      fieldName: null,
      shortType: null,
      _enabled: false,
      cascade: "none",//none,previous,all
      filterCodedValue: false,
      fieldPopupInfo: null,//maybe null

      //options
      nls: null,
      url: null,
      layerDefinition: null,
      fieldInfo: null,
      partObj: null,
      runtime: true,//If true, means used at widget runtime. If false, means used in widget setting page.
      //partObj.valueObj.type must be set
      //partObj.valueObj.value, partObj.valueObj.value1 and partObj.valueObj.value2 are optional
      staticValues: null,//[{value,label}]
      codedValues: null,//[{value,label}] for coded values and sub types
      layerInfo: null,//optional, jimu/LayerInfos/LayerInfo
      popupInfo: null,//optional
      operatorInfo: null,
      filterCodedValueIfPossible: false,

      //partObj
      /*{
            "fieldObj": {
              "name": "OBJECTID",
              "label": "OBJECTID",
              "shortType": "number",
              "type": "esriFieldTypeOID"
            },
            "operator": "numberOperatorIs",
            "valueObj": {
              "isValid": true,
              "type": "value",
              "value": 123
            },
            "interactiveObj": "",
            "caseSensitive": false,
            "expr": "OBJECTID = 123"
          }*/
      //codedValues
      /*
      [{
        name: "Excellent",
        code: 0
      },{
        name: "Good",
        code: 1
      },{
        name: "Fair",
        code: 2
      },{
        name: "Poor",
        code: 3
      }]
      */

      //methods needs to override:
      //setValueObject
      //getValueObject

      postMixInProperties: function(){
        this.inherited(arguments);
        this.shortType = this.partObj.fieldObj.shortType;
        this.fieldName = this.partObj.fieldObj.name;
        this.cascade = this.partObj.interactiveObj && this.partObj.interactiveObj.cascade;
        if(this.runtime && this.codedValues && this.filterCodedValueIfPossible &&
          jimuUtils.isCodedValuesSupportFilter(this.layerDefinition, this.codedValues.length)){
          this.filterCodedValue = true;
        }else{
          this.filterCodedValue = false;
        }
        if(this.popupInfo){
          if(this.popupInfo.fieldInfos && this.popupInfo.fieldInfos.length > 0){
            array.some(this.popupInfo.fieldInfos, lang.hitch(this, function(fieldPopupInfo){
              if(fieldPopupInfo.fieldName === this.fieldName){
                this.fieldPopupInfo = fieldPopupInfo;
                return true;
              }else{
                return false;
              }
            }));
          }
        }
      },

      getDijits: function(){
        return [];
      },

      //bind change event
      bindChangeEvents: function() {
        //var classNames = ["dijit.form.FilteringSelect", "dijit.form.ValidationTextBox",
        //  "dijit.form.DateTextBox", "dijit.form.NumberTextBox"];
        var dijits = this.getDijits();

        array.forEach(dijits, lang.hitch(this, function(dijit) {
          if(dijit.declaredClass && dijit.declaredClass.indexOf("dijit.") === 0){
            //dijit.form.FilteringSelect -> dijit-form-FilteringSelect
            html.addClass(dijit.domNode, dijit.declaredClass.replace(/\./g, '-'));
          }
          this.own(on(dijit, 'change', lang.hitch(this, this._onChanged)));
          this.own(on(dijit, 'enter', lang.hitch(this, this._onEnter)));
        }));
      },

      _onChanged: function(){
        if(this._onEnterTriggered){
          return;
        }
        this.emit('change');
      },

      _onEnterTriggered: false,

      _onEnter: function(){
        this._onEnterTriggered = true;
        this.emit('change');
        setTimeout(lang.hitch(this, function(){
          this._onEnterTriggered = false;
        }), 100);
      },

      tryLocaleNumber: function(value) {
        var result = jimuUtils.localizeNumber(value);
        if (result === null || result === undefined) {
          result = value;
        }
        return result;
      },

      getPartObject: function(){
        var valueObj = this.getValueObject();
        if(!valueObj){
          return null;
        }
        var partObj = lang.clone(this.partObj);
        partObj.valueObj = valueObj;
        return partObj;
      },

      //maybe return a deferred object
      setValueObject: function(){},

      getValueObject: function(){},

      //used for _SingleFilter
      tryGetValueObject: function(){
        return this.getValueObject();
      },

      setRequired: function(){},

      //-1 means invalid value type
      //0 means empty value, this ValueProvider should be ignored
      //1 means valid value
      getStatus: function(){
        var status = 1;
        var dijits = this.getDijits();
        if(dijits.length > 0){
          var statusArr = array.map(dijits, lang.hitch(this, function(dijit){
            if(typeof dijit.getStatus === 'function'){
              return dijit.getStatus();
            }else{
              return this.getStatusForDijit(dijit);
            }
          }));
          status = Math.min.apply(statusArr, statusArr);
        }
        return status;
      },

      //return -1 means input a wrong value
      //return 0 means empty value
      //return 1 means valid value
      getStatusForDijit: function(dijit){
        if(dijit.validate()){
          if(dijit.get("DisplayedValue")){
            return 1;
          }else{
            return 0;
          }
        }else{
          return -1;
        }
      },

      isInvalidValue: function(){
        return this.getStatus() < 0;
      },

      isEmptyValue: function(){
        return this.getStatus() === 0;
      },

      isValidValue: function(){
        return this.getStatus() > 0;
      },

      isBlankValueProvider: function(){
        return false;
      },

      //Filter related dijits doesn't call this method. GroupFilter and some other widgets call it.
      getFilterExpr: function(){
        var expr = "1=1";
        var expr1 = this.getLayerFilterExpr();
        if(this.cascade === "all" || this.cascade === "previous"){
          var expr2 = this.getCascadeFilterExpr();
          expr = "(" + expr1 + ") AND (" + expr2 + ")";
        }else{
          expr = expr1;
        }
        return expr;
      },

      //This method id only called by getFilterExpr.
      getLayerFilterExpr: function(){
        var expr = "1=1";
        if(this.layerInfo){
          expr = this.layerInfo.getFilter();
        }
        if(!expr){
          expr = "1=1";
        }
        return expr;
      },

      _getWebMapFilterExpr: function(){
        var expr = "";
        if(this.layerInfo){
          expr = this.layerInfo.getFilterOfWebmap();
        }
        if(!expr){
          expr = "1=1";
        }
        return expr;
      },

      //used for ListValueProvider
      getDropdownFilterExpr: function(){
        var expr = "1=1";
        var expr1 = this._getWebMapFilterExpr();
        if(this.cascade === "all" || this.cascade === "previous"){
          var expr2 = this.getCascadeFilterExpr();
          expr = "(" + expr1 + ") AND (" + expr2 + ")";
        }else{
          expr = expr1;
        }
        return expr;
      },

      getCascadeFilterExpr: function(){
        return "1=1";
      },

      getDropdownFilterPartsObj: function(){
        var partsObj = {parts:[]};
        if(this.cascade === "all" || this.cascade === "previous"){
          partsObj = this.getCascadeFilterPartsObj();
        }
        return partsObj;
      },

      getCascadeFilterPartsObj: function(){
        return {};
      },

      //get codedvalue list by partsObj
      //partsObj: eg: {logicalOperator:"AND",parts:[]}
      getCodedValueListByPartsObj: function(layerDefinition, fieldName, partsObj, /*optional*/codedValues){
        var fieldInfo = jimuUtils.getFieldInfoByFieldName(layerDefinition.fields, fieldName);
        var typeIdField = layerDefinition.typeIdField;
        var valueLabels = null;
        var typeIdFieldValue;

        var parts = partsObj.parts;
        for(var key in parts){
          var part = parts[key];
          if(part.fieldObj.name === typeIdField){ //not considering the subtypeid exists twice or more
            typeIdFieldValue = part.valueObj.value;
            valueLabels = jimuUtils._getCodedValueBySubTypeId(layerDefinition, fieldName, typeIdFieldValue, fieldInfo);
            break;
          }
        }

        var selectedValue;
        if(!valueLabels){
          if(codedValues){
            valueLabels = codedValues;
          }else{
            valueLabels = jimuUtils._getAllCodedValue(layerDefinition, fieldInfo);
          }
        }
        if(valueLabels && valueLabels.length > 0){
          selectedValue = valueLabels[0].value;
        }
        return {
          selectedValue: selectedValue,
          valueLabels: valueLabels
        };
      },

      isDefined: function(value){
        return esriLang.isDefined(value);
      },

      disable: function(){
        this._enabled = false;
      },

      enable: function(){
        this._enabled = true;
      },

      isEnabled: function(){
        return this._enabled;
      },

      destroy: function(){
        this.inherited(arguments);
      }

    });
  });