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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/declare',
  './BlankValueProvider',
  './SimpleValueProvider',
  './TwoNumbersValueProvider',
  './TwoDatesValueProvider',
  './ListValueProvider',
  // './ListMutipleValueProvider',
  './ListMultipleSelectProvider',
  './IndexButtonProvider',
  './NumberListValueProvider',
  './DateIsInValueProvider',
  'jimu/utils',
  'jimu/LayerInfos/LayerInfos'
],
  function(lang, array, declare, BlankValueProvider, SimpleValueProvider, TwoNumbersValueProvider,
    TwoDatesValueProvider,
    ListValueProvider,
    // ListMultipleValueProvider,
    ListMultipleSelectProvider,
    IndexButtonProvider,
    NumberListValueProvider, DateIsInValueProvider, jimuUtils, LayerInfos) {

    var BLANK_VALUE_PROVIDER = "BLANK_VALUE_PROVIDER";
    var SIMPLE_VALUE_PROVIDER = "SIMPLE_VALUE_PROVIDER";
    var TWO_NUMBERS_VALUE_PROVIDER = "TWO_NUMBERS_VALUE_PROVIDER";
    var TWO_DATES_VALUE_PROVIDER = "TWO_DATES_VALUE_PROVIDER";
    var LIST_VALUE_PROVIDER = "LIST_VALUE_PROVIDER";
    var NUMBER_LIST_VALUE_PROVIDER = "NUMBER_LIST_VALUE_PROVIDER";
    var DATE_IS_IN_VALUE_PROVIDER = "DATE_IS_IN_VALUE_PROVIDER";

    var ListMultiple_VALUE_PROVIDER = "ListMultiple_VALUE_PROVIDER";

    var UNIQUE_PREDEFINED_VALUE_PROVIDER = "UNIQUE_PREDEFINED_VALUE_PROVIDER";
    var MULTIPLE_PREDEFINED_VALUE_PROVIDER = "MULTIPLE_PREDEFINED_VALUE_PROVIDER";

    //operator + type => value provider
    var relationship = {
      //string
      stringOperatorIs: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          codedValueProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorIsNot: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          codedValueProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorStartsWith: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorEndsWith: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorContains: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorDoesNotContain: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorIsAnyOf: {
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        multiple:{
          normalProviderType: ListMultiple_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      stringOperatorIsNoneOf: {
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        multiple:{
          normalProviderType: ListMultiple_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      stringOperatorIsBlank: {
        value: {
          normalProviderType: BLANK_VALUE_PROVIDER
        }
      },
      stringOperatorIsNotBlank: {
        value: {
          normalProviderType: BLANK_VALUE_PROVIDER
        }
      },

      //number
      numberOperatorIs: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          codedValueProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsNot: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          codedValueProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsAtLeast: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsLessThan: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsAtMost: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsGreaterThan: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        },
        unique: {
          normalProviderType: LIST_VALUE_PROVIDER,
          supportAskForValue: true,
          filterCodedValueIfPossible: true
        },
        uniquePredefined:{
          normalProviderType: UNIQUE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsAnyOf: {
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        multiple:{
          normalProviderType: ListMultiple_VALUE_PROVIDER,
          supportAskForValue: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsNoneOf: {
        values:{
          normalProviderType: SIMPLE_VALUE_PROVIDER
        },
        multiple:{
          normalProviderType: ListMultiple_VALUE_PROVIDER,
          supportAskForValue: true
        },
        multiplePredefined:{
          normalProviderType: MULTIPLE_PREDEFINED_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsBetween: {
        value: {
          normalProviderType: TWO_NUMBERS_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsNotBetween: {
        value: {
          normalProviderType: TWO_NUMBERS_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      numberOperatorIsBlank: {
        value: {
          normalProviderType: BLANK_VALUE_PROVIDER
        }
      },
      numberOperatorIsNotBlank: {
        value: {
          normalProviderType: BLANK_VALUE_PROVIDER
        }
      },

      //date
      dateOperatorIsOn: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        }
        // Unique type can work already but we set it hidden in UI just right now.
        // ,
        // unique: {
        //   normalProviderType: LIST_VALUE_PROVIDER,
        //   supportAskForValue: true,
        //   filterCodedValueIfPossible: true
        // }
      },
      dateOperatorIsNotOn: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        }
        // Unique type can work already but we set it hidden in UI just right now.
        // ,
        // unique: {
        //   normalProviderType: LIST_VALUE_PROVIDER,
        //   supportAskForValue: true,
        //   filterCodedValueIfPossible: true
        // }
      },
      dateOperatorIsIn: {
        value: {
          normalProviderType: DATE_IS_IN_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      dateOperatorIsNotIn: {
        value: {
          normalProviderType: DATE_IS_IN_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      dateOperatorIsBefore: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        }
      },
      dateOperatorIsAfter: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        }
      },
      dateOperatorIsOnOrBefore: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        }
      },
      dateOperatorIsOnOrAfter: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
        }
      },
      dateOperatorInTheLast: {
        value: {
          normalProviderType: NUMBER_LIST_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      dateOperatorNotInTheLast: {
        value: {
          normalProviderType: NUMBER_LIST_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      dateOperatorIsBetween: {
        value: {
          normalProviderType: TWO_DATES_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      dateOperatorIsNotBetween: {
        value: {
          normalProviderType: TWO_DATES_VALUE_PROVIDER,
          supportAskForValue: true
        }
      },
      dateOperatorIsBlank: {
        value: {
          normalProviderType: BLANK_VALUE_PROVIDER
        }
      },
      dateOperatorIsNotBlank: {
        value: {
          normalProviderType: BLANK_VALUE_PROVIDER
        }
      }
    };

    var clazz = declare([], {
      nls: null,
      layerInfo: null,//jimu/LayerInfos/LayerInfo, maybe null
      popupInfo: null,//webmap popupInfo, maybe null

      //options:
      url: null,//required
      layerDefinition: null,//required
      featureLayerId: null,//required

      constructor: function(options){
        //{url,layerDefinition}
        lang.mixin(this, options);
        this.nls = window.jimuNls.filterBuilder;
        var layerInfosObj = LayerInfos.getInstanceSync();
        if(this.featureLayerId){
          this.layerInfo = layerInfosObj.getLayerOrTableInfoById(this.featureLayerId);
          if(this.layerInfo){
            this.popupInfo = this.layerInfo.getPopupInfo();
          }
        }
      },

      getSupportedValueTypes: function(fieldName, operator){
        var valueTypes = [];//["value","field","unique"]

        var operatorInfo = relationship[operator];
        if(operatorInfo){
          // var version = parseFloat(this.layerDefinition.currentVersion);
          if(operatorInfo.value){
            valueTypes.push("value");
          }
          if(operatorInfo.field){
            var fieldNames = this._getSameShortTypeFieldNames(fieldName);
            if(fieldNames.length > 0){
              valueTypes.push("field");
            }
          }
          if(operatorInfo.unique){
            if(this.url){
              if(!this._isStreamServer(this.url)){
                // if(version >= 10.1){
                valueTypes.push("unique");
                // }
              }
            }
          }
          if(operatorInfo.multiple){
            if(this.url){
              if(!this._isStreamServer(this.url)){
                // if(version >= 10.1){  //version, for query params
                valueTypes.push("multiple");
                // }
              }
            }
          }
          // if(operatorInfo.values){   //hide values in UI
          //   valueTypes.push("values");
          // }
          if(operatorInfo.uniquePredefined){
            if(this.url){
              if(!this._isStreamServer(this.url)){
                // if(version >= 10.1){
                valueTypes.push("uniquePredefined");
                // }
              }
            }
          }
          if(operatorInfo.multiplePredefined){
            if(this.url){
              if(!this._isStreamServer(this.url)){
                // if(version >= 10.1){
                valueTypes.push("multiplePredefined");
                // }
              }
            }
          }
        }

        return valueTypes;
      },

      _isStreamServer: function(url){
        url = url || "";
        url = url.replace(/\/*$/g, '');
        var reg = /\/StreamServer$/gi;
        return reg.test(url);
      },

      _getSameShortTypeFieldNames: function(fieldName){
        var fieldNames = [];
        var info = this._getFieldInfo(this.layerDefinition, fieldName);
        var shortType = clazz.getShortTypeByEsriType(info.type);
        array.forEach(this.layerDefinition.fields, lang.hitch(this, function(fieldInfo){
          if(fieldInfo.name !== fieldName){
            if(clazz.getShortTypeByEsriType(fieldInfo.type) === shortType){
              fieldNames.push(fieldInfo.name);
            }
          }
        }));
        return fieldNames;
      },

      getValueProvider: function(partObj, runtime){
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
        //partObj.valueObj.type must be set
        //partObj.valueObj.value, partObj.valueObj.value1 and partObj.valueObj.value2 are optional
        var valueProvider = null;
        var operator = partObj.operator;
        var operatorInfo = lang.clone(relationship[operator]);

        if(operatorInfo){
          var valueType = partObj.valueObj.type;
          var fieldName = partObj.fieldObj.name;
          var fieldInfo = this._getFieldInfo(this.layerDefinition, fieldName);
          var valueTypeInfo = operatorInfo[valueType];
          var valueProviderType = valueTypeInfo.normalProviderType;
          var staticValues = null;

          //for codedValues
          var codedValues = jimuUtils.getCodedValueListForCodedValueOrSubTypes(this.layerDefinition, fieldName);

          if(valueType === 'field'){
            var otherFieldNames = this._getSameShortTypeFieldNames(fieldName);
            if(otherFieldNames.length > 0){
              staticValues = array.map(otherFieldNames, lang.hitch(this, function(fieldName){
                return {
                  value: fieldName,
                  label: fieldName
                };
              }));
            }
          }else{
            if(codedValues && codedValues.length > 0 && valueTypeInfo.codedValueProviderType){
              valueProviderType = valueTypeInfo.codedValueProviderType;
            }
          }

          var filterCodedValueIfPossible = !!valueTypeInfo.filterCodedValueIfPossible;

          var args = {
            nls: this.nls,
            url: this.url,
            layerDefinition: this.layerDefinition,
            partObj: partObj,
            fieldInfo: fieldInfo,
            codedValues: codedValues,
            staticValues: staticValues,
            layerInfo: this.layerInfo,
            popupInfo: this.popupInfo,
            operatorInfo: operatorInfo,
            filterCodedValueIfPossible: filterCodedValueIfPossible,
            runtime: runtime
          };
          if(valueProviderType === BLANK_VALUE_PROVIDER){
            valueProvider = new BlankValueProvider(args);
          } else if(valueProviderType === SIMPLE_VALUE_PROVIDER){
            valueProvider = new SimpleValueProvider(args);
          }else if(valueProviderType === TWO_NUMBERS_VALUE_PROVIDER){
            valueProvider = new TwoNumbersValueProvider(args);
          }else if(valueProviderType === TWO_DATES_VALUE_PROVIDER){
            valueProvider = new TwoDatesValueProvider(args);
          }else if(valueProviderType === LIST_VALUE_PROVIDER){
            // if(operator === "stringOperatorIs" ||
            //    operator === "stringOperatorIsNot" ||
            //    operator === "numberOperatorIs" ||
            //    operator === "numberOperatorIsNot"){
            //   args.showNullValues = true;
            // }else{
            //   args.showNullValues = false;
            // }
            args.showNullValues = false;
            if(valueType === 'value' || valueType === 'field'){
              valueProvider = new ListValueProvider(args);//origin unique provider
            }else{
              args.providerType = valueProviderType;
              args.selectUI = 'dropdown';
              // if(valueType === 'field'){
              //   args.isNumberField = false; //field's name is a string
              // }
              valueProvider = new ListMultipleSelectProvider(args);
            }

          }else if(valueProviderType === NUMBER_LIST_VALUE_PROVIDER){
            valueProvider = new NumberListValueProvider(args);
          }else if(valueProviderType === DATE_IS_IN_VALUE_PROVIDER){
            valueProvider = new DateIsInValueProvider(args);
          }
          else if(valueProviderType === ListMultiple_VALUE_PROVIDER){ //mutiple---setting&runtime
            // valueProvider = new ListMultipleValueProvider(args);
            args.providerType = valueProviderType;
            args.selectUI = 'dropdown';
            valueProvider = new ListMultipleSelectProvider(args);
          }
          else if(valueProviderType === UNIQUE_PREDEFINED_VALUE_PROVIDER ||
            valueProviderType === MULTIPLE_PREDEFINED_VALUE_PROVIDER){
            args.providerType = valueProviderType;
            args.selectUI = args.partObj.valueObj ? args.partObj.valueObj.selectUI : null;
            if(runtime){
              valueProvider = new ListMultipleSelectProvider(args);
            }else{
              valueProvider = new IndexButtonProvider(args);
            }
          }
        }

        return valueProvider;
      },

      _getFieldInfo: function(layerDefinition, fieldName){
        var fieldInfos = layerDefinition.fields;
        for(var i = 0;i < fieldInfos.length; i++){
          var fieldInfo = fieldInfos[i];
          if(fieldName === fieldInfo.name){
            return fieldInfo;
          }
        }
        return null;
      }
    });

    clazz.getOperatorInfo = function(operator) {
      var operatorInfo = lang.clone(relationship[operator]);
      return operatorInfo;
    };

    clazz.getOperatorsByShortType = function(shortType, isHosted){
      var operators = [];
      if(shortType === 'string'){
        operators = [
          "stringOperatorIs",
          "stringOperatorIsNot",
          "stringOperatorStartsWith",
          "stringOperatorEndsWith",
          "stringOperatorContains",
          "stringOperatorDoesNotContain",
          "stringOperatorIsAnyOf",
          "stringOperatorIsNoneOf",
          "stringOperatorIsBlank",
          "stringOperatorIsNotBlank"
        ];
      }else if(shortType === 'number'){
        operators = [
          "numberOperatorIs",
          "numberOperatorIsNot",
          "numberOperatorIsAtLeast",
          "numberOperatorIsAtMost",
          "numberOperatorIsLessThan",
          "numberOperatorIsGreaterThan",
          "numberOperatorIsAnyOf",
          "numberOperatorIsNoneOf",
          "numberOperatorIsBetween",
          "numberOperatorIsNotBetween",
          "numberOperatorIsBlank",
          "numberOperatorIsNotBlank"
        ];
      }else if(shortType === 'date'){
        operators = [
          "dateOperatorIsOn",
          "dateOperatorIsNotOn",
          "dateOperatorIsIn",
          "dateOperatorIsNotIn",
          "dateOperatorIsBefore",
          "dateOperatorIsAfter",
          "dateOperatorIsOnOrBefore",
          "dateOperatorIsOnOrAfter",
          "dateOperatorIsBetween",
          "dateOperatorIsNotBetween",
          "dateOperatorIsBlank",
          "dateOperatorIsNotBlank"
        ];
        if(isHosted){
          operators.splice(8,0,"dateOperatorInTheLast","dateOperatorNotInTheLast");
        }
      }
      return operators;
    };

    clazz.getShortTypeByEsriType = function(esriFieldType){
      var shortType = null;
      if(esriFieldType === 'esriFieldTypeString'){
        shortType = 'string';
      }else if(esriFieldType === 'esriFieldTypeDate'){
        shortType = 'date';
      }else{
        var numberTypes = ['esriFieldTypeOID',
                           'esriFieldTypeSmallInteger',
                           'esriFieldTypeInteger',
                           'esriFieldTypeSingle',
                           'esriFieldTypeDouble'];
        if(numberTypes.indexOf(esriFieldType) >= 0){
          shortType = 'number';
        }
      }
      return shortType;
    };

    return clazz;
  });