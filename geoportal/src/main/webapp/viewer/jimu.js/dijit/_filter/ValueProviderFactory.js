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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/declare',
  './BlankValueProvider',
  './SimpleValueProvider',
  './TwoNumbersValueProvider',
  './TwoDatesValueProvider',
  './ListValueProvider',
  './NumberListValueProvider',
  'jimu/LayerInfos/LayerInfos'
],
  function(lang, array, declare, BlankValueProvider, SimpleValueProvider, TwoNumbersValueProvider,
    TwoDatesValueProvider, ListValueProvider, NumberListValueProvider, LayerInfos) {

    var BLANK_VALUE_PROVIDER = "BLANK_VALUE_PROVIDER";
    var SIMPLE_VALUE_PROVIDER = "SIMPLE_VALUE_PROVIDER";
    var TWO_NUMBERS_VALUE_PROVIDER = "TWO_NUMBERS_VALUE_PROVIDER";
    var TWO_DATES_VALUE_PROVIDER = "TWO_DATES_VALUE_PROVIDER";
    var LIST_VALUE_PROVIDER = "LIST_VALUE_PROVIDER";
    var NUMBER_LIST_VALUE_PROVIDER = "NUMBER_LIST_VALUE_PROVIDER";

    //operator + type => value provider
    var relationship = {
      //string
      stringOperatorIs: {
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
        }
      },
      stringOperatorIsNot: {
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
        }
      },
      stringOperatorStartsWith: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorEndsWith: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorContains: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
        }
      },
      stringOperatorDoesNotContain: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true,
          supportCaseSensitive: true
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
        }
      },
      numberOperatorIsNot: {
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
      },
      dateOperatorIsNotOn: {
        value: {
          normalProviderType: SIMPLE_VALUE_PROVIDER,
          supportAskForValue: true
        },
        field: {
          normalProviderType: LIST_VALUE_PROVIDER
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
      url: null,
      layerDefinition: null,
      layerInfo: null,//jimu/LayerInfos/LayerInfo
      featureLayerId: null,//optional

      constructor: function(options){
        //{url,layerDefinition}
        lang.mixin(this, options);
        this.nls = window.jimuNls.filterBuilder;
        var layerInfosObj = LayerInfos.getInstanceSync();
        if(this.featureLayerId){
          this.layerInfo = layerInfosObj.getLayerOrTableInfoById(this.featureLayerId);
        }
      },

      getSupportedValueTypes: function(fieldName, operator){
        var valueTypes = [];//["value","field","unique"]

        var operatorInfo = relationship[operator];
        if(operatorInfo){
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
                var version = parseFloat(this.layerDefinition.currentVersion);
                if(version >= 10.1){
                  valueTypes.push("unique");
                }
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
          var codedValues = this._getCodedValues(fieldInfo);

          if(!codedValues){
            if(this.layerDefinition.typeIdField){
              //typeIdField maybe doesn't match the real subtype field exactly
              if(this.layerDefinition.typeIdField.toUpperCase() === fieldName.toUpperCase()){
                codedValues = this._getSubTypes(this.layerDefinition);
              }
            }
          }

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
            valueProvider = new ListValueProvider(args);
          }else if(valueProviderType === NUMBER_LIST_VALUE_PROVIDER){
            valueProvider = new NumberListValueProvider(args);
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
      },

      //return [{value,label}]
      _getCodedValues:function(fieldInfo){
        var codedValues = null;
        var domain = fieldInfo.domain;
        if(domain && domain.type === 'codedValue'){
          if(domain.codedValues && domain.codedValues.length > 0){
            codedValues = domain.codedValues;
            //{code,name}=>{value,label}
            //code is value and name is description
            codedValues = array.map(codedValues, lang.hitch(this, function(item){
              return {
                value: item.code,
                label: item.name
              };
            }));
          }
        }
        return codedValues;
      },

      //return [{value,label}]
      _getSubTypes: function(layerDefinition){
        var subTypes = null;
        if(layerDefinition.typeIdField && layerDefinition.types && layerDefinition.types.length > 0){
          //{id,name}=>{value,label}
          subTypes = array.map(layerDefinition.types, lang.hitch(this, function(item){
            return {
              value: item.id,
              label: item.name
            };
          }));
        }
        return subTypes;
      }
    });

    clazz.getOperatorInfo = function(operator) {
      var operatorInfo = lang.clone(relationship[operator]);
      return operatorInfo;
    };

    clazz.getOperatorsByShortType = function(shortType){
      var operators = [];
      if(shortType === 'string'){
        operators = [
          "stringOperatorIs",
          "stringOperatorIsNot",
          "stringOperatorStartsWith",
          "stringOperatorEndsWith",
          "stringOperatorContains",
          "stringOperatorDoesNotContain",
          "stringOperatorIsBlank",
          "stringOperatorIsNotBlank"
        ];
      }else if(shortType === 'number'){
        operators = [
          "numberOperatorIs",
          "numberOperatorIsNot",
          "numberOperatorIsAtLeast",
          "numberOperatorIsLessThan",
          "numberOperatorIsAtMost",
          "numberOperatorIsGreaterThan",
          "numberOperatorIsBetween",
          "numberOperatorIsNotBetween",
          "numberOperatorIsBlank",
          "numberOperatorIsNotBlank"
        ];
      }else if(shortType === 'date'){
        operators = [
          "dateOperatorIsOn",
          "dateOperatorIsNotOn",
          "dateOperatorIsBefore",
          "dateOperatorIsAfter",
          "dateOperatorIsOnOrBefore",
          "dateOperatorIsOnOrAfter",
          "dateOperatorInTheLast",
          "dateOperatorNotInTheLast",
          "dateOperatorIsBetween",
          "dateOperatorIsNotBetween",
          "dateOperatorIsBlank",
          "dateOperatorIsNotBlank"
        ];
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