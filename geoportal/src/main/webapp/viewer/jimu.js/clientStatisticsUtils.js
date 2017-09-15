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
  'dojo/_base/array',
  'dojo/_base/lang',
  'jimu/utils',
  'esri/lang'
], function(declare, array, lang, jimuUtils, esriLang) {

  var Core = declare(null, {
    popupFieldInfosObj: null,//{fieldName:{fieldName,label,isEditable,tooltip,visible,format...}}

    //option
    //layerDefinition
    //popupFieldInfosObj
    //floatNumberFieldDecimalPlace

    constructor: function(options) {
      if (options) {
        lang.mixin(this, options);
      }
      this.popupFieldInfosObj = {};
      this.floatNumberFieldDecimalPlace = {};
    },

    _isNumber: function(value) {
      var valueType = Object.prototype.toString.call(value).toLowerCase();
      return valueType === "[object number]";
    },

    _tryLocaleNumber: function(value, /*optional*/ fieldName) {
      var result = value;
      if (esriLang.isDefined(value) && isFinite(value)) {
        try {
          var a;
          //if pass "abc" into localizeNumber, it will return null
          if (fieldName && this._isNumberField(fieldName)) {
            var popupFieldInfo = this.popupFieldInfosObj[fieldName];
            if (popupFieldInfo && lang.exists('format.places', popupFieldInfo)) {
              a = jimuUtils.localizeNumberByFieldInfo(value, popupFieldInfo);
            } else {
              a = jimuUtils.localizeNumber(value);
            }
          } else {
            //#6117
            a = value; //jimuUtils.localizeNumber(value);
          }

          if (typeof a === "string") {
            result = a;
          }
        } catch (e) {
          console.error(e);
        }
      }
      //make sure the retun value is string
      result += "";
      return result;
    },

    _getBestDisplayValue: function(fieldName, value) {
      var displayValue = this._tryLocaleNumber(value, fieldName);

      //check subtype description
      //http://services1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/Parcels/FeatureServer/0
      if (this.layerDefinition.typeIdField === fieldName) {
        var types = this.layerDefinition.types;
        if (types && types.length > 0) {
          var typeObjs = array.filter(types, lang.hitch(this, function(item) {
            return item.id === value;
          }));
          if (typeObjs.length > 0) {
            displayValue = typeObjs[0].name;
            return displayValue;
          }
        }
      }

      //check codedValue
      //http://jonq/arcgis/rest/services/BugFolder/BUG_000087622_CodedValue/FeatureServer/0
      //http://services1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/Parcels/FeatureServer/0
      var fieldInfo = this._getFieldInfo(fieldName);
      if (fieldInfo) {
        if (fieldInfo.domain) {
          var codedValues = fieldInfo.domain.codedValues;
          if (codedValues && codedValues.length > 0) {
            array.some(codedValues, function(item) {
              if (item.code === value) {
                displayValue = item.name;
                return true;
              } else {
                return false;
              }
            });
          }
        }
      }
      return displayValue;
    },

    _getFieldAliasArray: function(fieldNames) {
      var results = array.map(fieldNames, lang.hitch(this, function(fieldName) {
        return this._getFieldAlias(fieldName);
      }));
      return results;
    },

    _getFieldAlias: function(fieldName) {
      var fieldAlias = fieldName;
      var fieldInfo = this._getFieldInfo(fieldName);
      if (fieldInfo) {
        fieldAlias = fieldInfo.alias || fieldAlias;
      }
      return fieldAlias;
    },

    _getFieldInfo: function(fieldName) {
      if (this.layerDefinition) {
        var fieldInfos = this.layerDefinition.fields;
        for (var i = 0; i < fieldInfos.length; i++) {
          if (fieldInfos[i].name === fieldName) {
            return fieldInfos[i];
          }
        }
      }
      return null;
    },

    _isNumberField: function(fieldName) {
      var numberTypes = ['esriFieldTypeSmallInteger',
        'esriFieldTypeInteger',
        'esriFieldTypeSingle',
        'esriFieldTypeDouble'
      ];
      var isNumber = array.some(this.layerDefinition.fields, lang.hitch(this, function(fieldInfo) {
        return fieldInfo.name === fieldName && numberTypes.indexOf(fieldInfo.type) >= 0;
      }));
      return isNumber;
    },

    _isFloatNumberField: function(fieldName) {
      var numberTypes = ['esriFieldTypeSingle', 'esriFieldTypeDouble'];
      var isNumber = array.some(this.layerDefinition.fields, lang.hitch(this, function(fieldInfo) {
        return fieldInfo.name === fieldName && numberTypes.indexOf(fieldInfo.type) >= 0;
      }));
      return isNumber;
    },

    _isDateField: function(fieldName) {
      var fieldInfo = this._getFieldInfo(fieldName);
      if (fieldInfo) {
        return fieldInfo.type === 'esriFieldTypeDate';
      }
      return false;
    },

    _getBestDecimalPlace: function(floatValues) {
      var decimalPlace = 0;
      //{decimal:count,...} like {2:123, 3:321, ...}
      var statisticsHash = {};
      array.forEach(floatValues, function(value) {
        var splits = value.toString().split(".");
        var key = null;
        if (splits.length === 1) {
          //value doesn't have fractional part
          key = 0;
        } else if (splits.length === 2) {
          //value has fractional part
          key = splits[1].length;
        }
        if (key !== null) {
          if (statisticsHash[key] === undefined) {
            statisticsHash[key] = 1;
          } else {
            statisticsHash[key] += 1;
          }
        }
      });
      var maxDecimalPlaceItem = null;
      for (var key in statisticsHash) {
        key = parseInt(key, 10);
        var value = statisticsHash[key];
        if (maxDecimalPlaceItem) {
          if (value > maxDecimalPlaceItem.value) {
            maxDecimalPlaceItem = {
              key: key,
              value: value
            };
          }
        } else {
          maxDecimalPlaceItem = {
            key: key,
            value: value
          };
        }
      }
      if (maxDecimalPlaceItem) {
        decimalPlace = parseInt(maxDecimalPlaceItem.key, 10);
      }
      return decimalPlace;
    },

    _getFloatNumberFieldDecimalPlace: function(floatNumberField) {
      var decimalPlace = 0;
      if (this.floatNumberFieldDecimalPlace) {
        var value = this.floatNumberFieldDecimalPlace[floatNumberField];
        if (typeof value === 'number') {
          decimalPlace = value;
        }
      }
      return decimalPlace;
    },

    _getBestValueForFloatNumberField: function(value, floatNumberField) {
      var decimalPlace = this._getFloatNumberFieldDecimalPlace(floatNumberField);
      var str = value.toFixed(decimalPlace);
      return parseFloat(str);
    },

    //---------------------------------------feature mode--------------------------------------------

    //options: {features, labelField, valueFields, sortOrder}
    //return [{category:'a',valueFields:[10,100,2],dataFeatures:[f1]}]
    getFeatureModeStatisticsInfo: function(options){
      var features = options.features;
      var labelField = options.labelField;
      var valueFields = options.valueFields;
      var isAsc = options.sortOrder !== 'des';

      //[{category:'a',valueFields:[10,100,2],dataFeatures:[f1]}]
      //only one data feature
      var data = [];

      data = array.map(features, lang.hitch(this, function(feature) {
        var attributes = feature.attributes;
        var option = {
          category: attributes[labelField],
          valueFields: [],
          dataFeatures: [feature]
        };
        option.valueFields = array.map(valueFields, lang.hitch(this, function(fieldName) {
          return attributes[fieldName];
        }));
        return option;
      }));

      if (isAsc) {
        data.sort(function(a, b) {
          if (a.category < b.category) {
            return -1;
          } else if (a.category > b.category) {
            return 1;
          } else {
            return 0;
          }
        });
      } else {
        data.sort(function(a, b) {
          if (a.category < b.category) {
            return 1;
          } else if (a.category > b.category) {
            return -1;
          } else {
            return 0;
          }
        });
      }

      if (this._isDateField(labelField)) {
        if (data.length > 0) {
          array.map(data, lang.hitch(this, function(item) {
            //such as 1452027353390
            var category = item.category;
            if (typeof category === 'number' && category > 0) {
              var date = new Date(category);
              item.category = jimuUtils.localizeDate(date);
            }
          }));
        }
      }
      return data;
    },

    //---------------------------------------category mode-------------------------------------------
    //options: {features, categoryField, valueFields, operation, sortOrder}
    //return [{category:'a',valueFields:[10,100,2],dataFeatures:[f1,f2...]}]
    getCategoryModeStatisticsInfo: function(options) {
      /*jshint -W083 */
      var features = options.features;
      var categoryField = options.categoryField;
      var valueFields = options.valueFields;
      var operation = options.operation;
      var isAsc = options.sortOrder !== 'des';

      var data = []; //[{category:'a',valueFields:[10,100,2],dataFeatures:[f1,f2...]}]
      var uniqueValuesHash = {}; //{a:{valueFields:[10,100,2], dataFeatures:[f1,f2...]}}

      array.forEach(features, lang.hitch(this, function(feature) {
        var attributes = feature.attributes;
        var category = attributes[categoryField];
        var categoryObj = null;

        if (uniqueValuesHash.hasOwnProperty(category)) {
          categoryObj = uniqueValuesHash[category];
          categoryObj.dataFeatures.push(feature);
        } else {
          categoryObj = {
            dataFeatures: [feature]
          };
          uniqueValuesHash[category] = categoryObj;
        }
      }));

      var categoryObj = null;
      for (var uniqueValue in uniqueValuesHash) {
        categoryObj = uniqueValuesHash[uniqueValue];

        if (this._isNumberField(categoryField)) {
          //uniqueValue maybe string or null, like "7", null
          //so we should not call this._isNumber(uniqueValue)
          if (esriLang.isDefined(uniqueValue)) {
            //convert number string to number
            uniqueValue = parseFloat(uniqueValue);
          }
        }

        //calculate summarize values for one category
        categoryObj.valueFields = array.map(valueFields, lang.hitch(this, function(fieldName) {
          //for one category and for one valueField
          var values = array.map(categoryObj.dataFeatures, lang.hitch(this, function(feature) {
            return feature.attributes[fieldName];
          }));

          var summarizeValue = 0;
          if (operation === 'max') {
            summarizeValue = -Infinity;
          } else if (operation === 'min') {
            summarizeValue = Infinity;
          }
          //use nonNullValueCount to record how many feature values are not null for the fieldName
          var nonNullValueCount = 0;
          array.forEach(values, lang.hitch(this, function(value) {
            if (this._isNumber(value)) {
              nonNullValueCount++;
              if (operation === 'average' || operation === 'sum') {
                summarizeValue += value;
              } else if (operation === 'max') {
                summarizeValue = Math.max(summarizeValue, value);
              } else if (operation === 'min') {
                summarizeValue = Math.min(summarizeValue, value);
              }
            }
          }));

          if (nonNullValueCount > 0) {
            if (operation === 'average') {
              //summarizeValue = summarizeValue / values.length;
              summarizeValue = summarizeValue / nonNullValueCount;
            }
          } else {
            //if all values for the fieldName are null, we set summarizeValue to null, no matter
            //what's the value of operation
            summarizeValue = 0;
          }

          return summarizeValue;
        }));

        data.push({
          category: uniqueValue,
          valueFields: categoryObj.valueFields,
          dataFeatures: categoryObj.dataFeatures
        });
      }

      if (isAsc) {
        data.sort(function(a, b) {
          if (a.category < b.category) {
            return -1;
          } else if (a.category > b.category) {
            return 1;
          } else {
            return 0;
          }
        });
      } else {
        data.sort(function(a, b) {
          if (a.category < b.category) {
            return 1;
          } else if (a.category > b.category) {
            return -1;
          } else {
            return 0;
          }
        });
      }

      if (this._isDateField(categoryField)) {
        if (data.length > 0) {
          array.map(data, lang.hitch(this, function(item) {
            //such as "1452027353390"
            var strCategory = item.category;
            if (strCategory) {
              var intCategory = parseInt(strCategory, 10);
              if (intCategory > 0) {
                var date = new Date();
                item.category = jimuUtils.localizeDate(date);
              }
            }
          }));
        }
      }

      //remove NaN item
      data = array.filter(data, lang.hitch(this, function(item) {
        var isNaNValue = false;
        var category = item.category;
        if (typeof category === 'number') {
          isNaNValue = isNaN(category);
        }
        return !isNaNValue;
      }));

      //keep best decimal places for statistics values
      if (operation === 'sum' || operation === 'average') {
        array.forEach(data, lang.hitch(this, function(item) {
          array.forEach(valueFields, lang.hitch(this, function(fieldName, index) {
            if (this._isFloatNumberField(fieldName)) {
              var value = item.valueFields[index];
              value = this._getBestValueForFloatNumberField(value, fieldName);
              item.valueFields[index] = value;
            }
          }));
        }));
      }

      return data;
    },

    //---------------------------------------count mode--------------------------------------------
    //options: {features, categoryField, sortOrder}
    //return [{fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}]
    getCountModeStatisticsInfo: function(options) {
      var features = options.features;
      var categoryField = options.categoryField;
      var isAsc = options.sortOrder !== 'des';

      //{fieldValue1:{count:count1,dataFeatures:[f1,f2...]},fieldValue2...}
      var statisticsHash = {};
      array.forEach(features, lang.hitch(this, function(feature) {
        var attributes = feature.attributes;
        var fieldValue = attributes[categoryField];
        var fieldValueObj = null;
        if (statisticsHash.hasOwnProperty(fieldValue)) {
          fieldValueObj = statisticsHash[fieldValue];
          fieldValueObj.count++;
          fieldValueObj.dataFeatures.push(feature);
        } else {
          fieldValueObj = {
            count: 1,
            dataFeatures: [feature]
          };
          statisticsHash[fieldValue] = fieldValueObj;
        }
      }));
      var data = []; //[{fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}]
      var fieldValueObj = null;
      for (var fieldValue in statisticsHash) {
        fieldValueObj = statisticsHash[fieldValue]; //{count:count1,dataFeatures:[f1,f2...]}
        if (this._isNumberField(categoryField)) {
          //fieldValue maybe string or null, like "7", "null"
          //convert number string to number
          //if fieldValue is "null", fieldValue will be set to NaN
          fieldValue = parseFloat(fieldValue);
        }
        data.push({
          fieldValue: fieldValue,
          count: fieldValueObj.count,
          dataFeatures: fieldValueObj.dataFeatures
        });
      }

      if (isAsc) {
        data.sort(function(a, b) {
          if (a.fieldValue < b.fieldValue) {
            return -1;
          } else if (a.fieldValue > b.fieldValue) {
            return 1;
          } else {
            return 0;
          }
        });
      } else {
        data.sort(function(a, b) {
          if (a.fieldValue < b.fieldValue) {
            return 1;
          } else if (a.fieldValue > b.fieldValue) {
            return -1;
          } else {
            return 0;
          }
        });
      }

      if (this._isDateField(categoryField)) {
        if (data.length > 0) {
          array.forEach(data, lang.hitch(this, function(item) {
            //such as "1452027353390"
            if (item.fieldValue) {
              var intCategory = parseInt(item.fieldValue, 10);
              if (intCategory > 0) {
                var date = new Date(intCategory);
                item.fieldValue = jimuUtils.localizeDate(date);
              }
            }
          }));
        }
      }

      return data;
    },

    //---------------------------------------field mode--------------------------------------------

    //options: {features, valueFields, operation}
    //return {fieldName1:value1,fieldName2:value2}
    getFieldModeStatisticsInfo: function(options) {
      var features = options.features;
      var valueFields = options.valueFields;
      var operation = options.operation;

      var attributesList = array.map(features, lang.hitch(this, function(feature) {
        return feature.attributes;
      }));

      var data = {}; //{fieldName1:value1,fieldName2:value2}

      array.forEach(valueFields, lang.hitch(this, function(fieldName) {
        //init default statistics value
        data[fieldName] = 0;
        if (operation === 'max') {
          data[fieldName] = -Infinity;
        } else if (operation === 'min') {
          data[fieldName] = Infinity;
        }

        //use nonNullValueCount to record how many feature values are not null for the fieldName
        var nonNullValueCount = 0;

        array.forEach(attributesList, lang.hitch(this, function(attributes) {
          var fieldValue = attributes[fieldName];
          if (this._isNumber(fieldValue)) {
            nonNullValueCount++;
            if (data.hasOwnProperty(fieldName)) {
              if (operation === 'average' || operation === 'sum') {
                data[fieldName] += fieldValue;
              } else if (operation === 'max') {
                data[fieldName] = Math.max(data[fieldName], fieldValue);
              } else if (operation === 'min') {
                data[fieldName] = Math.min(data[fieldName], fieldValue);
              }
            } else {
              data[fieldName] = fieldValue;
            }
          }
        }));

        if (nonNullValueCount > 0) {
          if (operation === 'average') {
            //data[fieldName] /= attributesList.length;
            data[fieldName] = data[fieldName] / nonNullValueCount;
          }
        } else {
          data[fieldName] = 0;
        }
      }));

      //keep best decimal places for statistics values
      if (operation === 'sum' || operation === 'average') {
        array.forEach(valueFields, lang.hitch(this, function(fieldName) {
          if (data.hasOwnProperty(fieldName) && this._isFloatNumberField(fieldName)) {
            var value = data[fieldName];
            data[fieldName] = this._getBestValueForFloatNumberField(value, fieldName);
          }
        }));
      }

      return data;
    }
  });

  var mo = {
    //options: {layerDefinition, features, labelField, valueFields, sortOrder}
    //return [{category:'a',valueFields:[10,100,2],dataFeatures:[f1]}]
    getFeatureModeStatisticsInfo: function(options){
      var core = new Core({
        layerDefinition: options.layerDefinition
      });
      return core.getFeatureModeStatisticsInfo(options);
    },

    //options: {layerDefinition, features, categoryField, valueFields, operation, sortOrder}
    //return [{category:'a',valueFields:[10,100,2],dataFeatures:[f1,f2...]}]
    getCategoryModeStatisticsInfo: function(options){
      var core = new Core({
        layerDefinition: options.layerDefinition
      });
      return core.getCategoryModeStatisticsInfo(options);
    },

    //options: {layerDefinition, features, categoryField, sortOrder}
    //return [{fieldValue:value1,count:count1,dataFeatures:[f1,f2...]}]
    getCountModeStatisticsInfo: function(options){
      var core = new Core({
        layerDefinition: options.layerDefinition
      });
      return core.getCountModeStatisticsInfo(options);
    },

    //options: {layerDefinition, features, valueFields, operation}
    //return {fieldName1:value1,fieldName2:value2}
    getFieldModeStatisticsInfo: function(options){
      var core = new Core({
        layerDefinition: options.layerDefinition
      });
      return core.getFieldModeStatisticsInfo(options);
    }

    // getCategoryModeChartOptionsByStatisticsInfo: function(options, data, chartType){
    //   var core = new Core({
    //     layerDefinition: options.layerDefinition
    //   });
    //   return core.getCategoryModeChartOptionsByStatisticsInfo(options, data, chartType);
    // },

    // getCountModeChartOptionsByStatisticsInfo: function(options, data, chartType){
    //   var core = new Core({
    //     layerDefinition: options.layerDefinition
    //   });
    //   return core.getCountModeChartOptionsByStatisticsInfo(options, data, chartType);
    // },

    // getFieldModeChartOptionByStatisticsInfo: function(options, data, chartType){
    //   var core = new Core({
    //     layerDefinition: options.layerDefinition
    //   });
    //   return core.getFieldModeChartOptionByStatisticsInfo(options, data, chartType);
    // }
  };

  return mo;
});