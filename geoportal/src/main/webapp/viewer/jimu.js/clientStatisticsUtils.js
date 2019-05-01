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
  'moment/moment',
  './_chartHelpUtils',
  'jimu/utils'
], function(lang, moment, ChartHelpUtils, jimuUtils) {

  if (window.makeTwix) {
    window.makeTwix(moment);
  }

  //punlic method
  //getClietStatisticsData
  //  getFeatureModeStatisticsData
  //  getCategoryModeStatisticsData
  //  getCountModeStatisticsData
  //  getFieldModeStatisticsData

  //getCluseringObj
  //sortClientStatisticsData
  //getDataForMaxLabels

  //convertingNullOrUndefinedAsPlaceholders
  //separateFeaturesWhetherFieldValueNull
  //keepFieldValueType
  //calcValuesByFeaturesForCatetoryMode
  //calcValuesByFeaturesForCountMode
  //getValuesByValueFieldForFieldMode
  //calcValueByOperation

  // Deprecated, Only used for Chart Widget StatisticsChart.js
  // getFeatureModeStatisticsInfo
  // getCategoryModeStatisticsInfo
  // getCountModeStatisticsInfo
  // getFieldModeStatisticsInfo

  var mo = {
    // return {label:'', values:[2000], unit /*optional*/}
    getClietStatisticsData: function(options) {
      var mode = options.mode;
      if (mode === 'feature') {
        return this.getFeatureModeStatisticsData(options);
      } else if (mode === 'category') {
        return this.getCategoryModeStatisticsData(options);
      } else if (mode === 'count') {
        return this.getCountModeStatisticsData(options);
      } else if (mode === 'field') {
        return this.getFieldModeStatisticsData(options);
      }
    },

    //sort order client statistics data
    sortClientStatisticsData: function(data, options) {
      var mode = options.mode;
      var sortOrder = options.sortOrder; //{isAsc:boolean,field:''}
      var valueFields = options.valueFields;
      var clusterField = options.clusterField;
      return this.sortStatisticsData(data, mode, sortOrder, clusterField, valueFields);
    },

    //Slice data by input number
    getDataForMaxLabels: function(data, maxLabels) {
      if (data && data.length && typeof maxLabels === 'number' &&
        maxLabels > 0 && maxLabels < data.length) {
        return data.slice(0, maxLabels);
      } else {
        return data;
      }
    },

    //options: {features, clusterField, valueFields}
    //return [{label:'a',values:[10,100,2],features:[f1]}]
    getFeatureModeStatisticsData: function(options) {
      var features = options.features;
      var clusterField = options.clusterField;
      var valueFields = options.valueFields;
      var showNullLabelData = options.showNullLabelData !== undefined ? options.showNullLabelData : true;

      var separationFeatures = this.separateFeaturesWhetherFieldValueNull(clusterField, features);
      var notNullLabelFeatures = separationFeatures.notNullLabelFeatures;
      var nullLabelFeatures = separationFeatures.nullLabelFeatures;

      features = showNullLabelData ? notNullLabelFeatures.concat(nullLabelFeatures) : notNullLabelFeatures;

      var data = [];

      data = features.map(function(feature) {
        var attributes = feature.attributes;
        var fieldValue = attributes && attributes[clusterField];
        fieldValue = this.convertingNullOrUndefinedAsPlaceholders(fieldValue);
        var option = {
          label: fieldValue,
          values: [],
          features: [feature]
        };

        option.values = valueFields.map(function(fieldName) {
          return attributes[fieldName];
        });
        return option;
      }.bind(this));

      return data;
    },

    //options:{features, clusterField, valueFields, operation,
    //dateConfig, /*optional, Only date time type is valid*/
    //nullValue:boolean /*optional, for 'null' value, calcute as 0 or ignore it*/
    //showNullLabelData:boolean /* Whether to display the data item whitch cluster field is null */ }

    //return [{label:'a',values:[10,100,2]},
    //unit/*optional, Only available if the cluster field is a datetime type*/]
    getCategoryModeStatisticsData: function(options) {
      //For example: valueFields[0] = hasStatisticsed ? valueFields[0] + operation:valueFields[0]
      var hasStatisticsed = options.hasStatisticsed;

      var features = options.features;
      var clusterField = options.clusterField;
      var valueFields = options.valueFields;
      var operation = options.operation;

      //dateConfig:{isNeedFilled:boolean,dateFormatter:''//automatic, year, month, day, hour, minute, second}
      var dateConfig = options.dateConfig;

      var showNullLabelData = options.showNullLabelData !== undefined ? options.showNullLabelData : true;
      var useNullValueAsZero = options.nullValue; //boolean

      var data = []; //[{label:'a',value:[10,100,2],...]

      var cluseringObj = this.getCluseringObj(clusterField, features, dateConfig);
      //{label:{count:number, features:[f1,f2...], type},...}
      var notNullLabelClusteringObj = cluseringObj.notNullLabel;
      var nullLabelClusteringObj = cluseringObj.nullLabel;

      var notNullLabelClusteredData = clusterByLbabel.call(this, notNullLabelClusteringObj);
      var nullLabelClusteredData = clusterByLbabel.call(this, nullLabelClusteringObj);

      data = showNullLabelData ? notNullLabelClusteredData.concat(nullLabelClusteredData) : notNullLabelClusteredData;
      //return [{category:'a',valueFields:[10,100,2],features:[f1,f2...]},...]
      /*jshint -W083 */
      function clusterByLbabel(clusteringObj) {
        var data = [];
        var categoryObj = null;
        for (var clusterFieldValue in clusteringObj) {
          categoryObj = clusteringObj[clusterFieldValue];
          clusterFieldValue = this.keepFieldValueType(clusterFieldValue, categoryObj.type, dateConfig);

          var values = this.calcValuesByFeaturesForCatetoryMode(valueFields, categoryObj,
            hasStatisticsed, operation, useNullValueAsZero);

          data.push({
            label: clusterFieldValue,
            values: values,
            features: categoryObj.features,
            unit: categoryObj.unit
          });
        }
        return data;
      }

      return data;
    },
    //options:{features, clusterField,
    //dateConfig, /*optional, Only date time type is valid*/
    //showNullLabelData:boolean /* Whether to display the data item whitch cluster field is null */ }

    //return [{label:'',values:count1,features:[f1,f2...]},
    //unit/*optional, Only available if the cluster field is a datetime type*/]
    getCountModeStatisticsData: function(options) {
      var hasStatisticsed = options.hasStatisticsed;
      var features = options.features;
      var clusterField = options.clusterField;
      //dateConfig:{isNeedFilled:boolean,dateFormatter:''//automatic, year, month, day, hour, minute, second}
      var dateConfig = options.dateConfig;
      var showNullLabelData = options.showNullLabelData !== undefined ? options.showNullLabelData : true;
      var data = []; //[{fieldValue:value1,count:count1,features:[f1,f2...]}]
      var isStatisticsed = hasStatisticsed && !dateConfig;

      //{fieldValue1:{count:count1,features:[f1,f2...]},...}
      var cluseringObj = this.getCluseringObj(clusterField, features, dateConfig);
      var notNullLabelClusteringObj = cluseringObj.notNullLabel;
      var nullLabelClusteringObj = cluseringObj.nullLabel;

      var notNullLabelClusteredData = clusterByLbabel.call(this, notNullLabelClusteringObj);
      var nullLabelClusteredData = clusterByLbabel.call(this, nullLabelClusteringObj);
      data = showNullLabelData ? notNullLabelClusteredData.concat(nullLabelClusteredData) : notNullLabelClusteredData;
      //return [{label:'a',values:[10,100,2],unit},...]
      function clusterByLbabel(clusteringObj) {
        var data = [];
        var categoryObj = null;
        for (var clusterFieldValue in clusteringObj) {
          categoryObj = clusteringObj[clusterFieldValue]; //{count:count1,features:[f1,f2...]}
          var values = this.calcValuesByFeaturesForCountMode(categoryObj, isStatisticsed); //STAT_COUNT
          clusterFieldValue = this.keepFieldValueType(clusterFieldValue, categoryObj.type, dateConfig);

          data.push({
            label: clusterFieldValue,
            values: values,
            features: categoryObj.features,
            unit: categoryObj.unit
          });
        }
        return data;
      }
      return data;
    },

    calcValuesByFeaturesForCountMode: function(categoryObj, hasStatisticsed) {

      var values;
      if (hasStatisticsed) {
        var upperValueField = 'STAT_COUNT';
        var lowerValueField = 'stat_count';
        var features = categoryObj.features;
        values = features.map(function(feature) {
          var attributes = feature.attributes;
          var v = attributes && attributes[upperValueField];
          if (typeof v === 'undefined') {
            v = attributes[lowerValueField];
          }
          return v;
        }.bind(this));
      } else {
        values = [categoryObj.count];
      }
      return values;
    },

    //options:{features, valueFields, operation}
    //nullValue:boolean /*optional, for 'null' value, calcute as 0 or ignore it*/
    //return {label:'',values: [1,2]}
    getFieldModeStatisticsData: function(options) {
      //For example: valueFields[0] = hasStatisticsed ? valueFields[0] + operation:valueFields[0]
      var hasStatisticsed = options.hasStatisticsed;

      var features = options.features;
      var valueFields = options.valueFields;
      var operation = options.operation;
      var useNullValueAsZero = options.nullValue; //boolean

      var data = [];

      data = valueFields.map(lang.hitch(this, function(fieldName) {
        var vs = this.getValuesByValueFieldForFieldMode(fieldName, features, hasStatisticsed, operation);
        var summarizeValue = this.calcValueByOperation(vs, operation, useNullValueAsZero);
        return {
          label: fieldName,
          values: [summarizeValue]
        };
      }));

      return data;
    },

    getValuesByValueFieldForFieldMode: function(fieldName, features, hasStatisticsed, operation) {
      var cloneOperator = operation === 'average' ? 'avg' : operation;
      if (hasStatisticsed) {
        var upperFieldName = jimuUtils.upperCaseString(fieldName + '_' + cloneOperator);
        var lowerFieldName = jimuUtils.lowerCaseString(fieldName + '_' + cloneOperator);
      }
      var values = features.map(lang.hitch(this, function(feature) {
        var attributes = feature.attributes;
        if (!attributes) {
          return;
        }
        var v;
        if (hasStatisticsed) {
          v = attributes[upperFieldName];
          if (typeof v === 'undefined') {
            v = attributes[lowerFieldName];
          }
        } else {
          v = attributes[fieldName];
        }
        return v;
      }));
      return values;
    },

    /*------------ Tool method -------------*/
    //return sorted data
    sortStatisticsData: function(data, mode, sortOrder, labelField, valueFields) {
      //sortOrder
      //  isLabelAxis:boolean
      //  isAsc:boolean
      //  field:''

      if (!sortOrder) {
        return data;
      }

      var isAsc = sortOrder.isAsc;

      function getVaildValue(obj, mode, sortOrder) {
        var value;
        if (mode === 'category') {
          if (!sortOrder.isLabelAxis) {
            if (!sortOrder.field && obj.values.length === 1) {
              value = obj.values[0];
            } else {
              var index = valueFields.indexOf(sortOrder.field);
              value = obj.values[index];
            }
          } else if (sortOrder.isLabelAxis) {
            value = obj.label;
          }
        } else if (mode === 'count') {
          var xValue = obj.label;
          value = sortOrder.isLabelAxis ? xValue : obj.values[0];
        } else if (mode === 'field') {
          value = sortOrder.isLabelAxis ? obj.label : obj.values[0];
        } else if (mode === 'feature') {
          var attributes;
          if (obj && obj.features && obj.features[0]) {
            attributes = obj.features[0].attributes;
            if (attributes) {
              if (sortOrder.isLabelAxis) {
                value = attributes[labelField];
              } else {
                value = attributes[sortOrder.field];
              }
            }
          }
        }
        return value;
      }

      if (!Array.isArray(data)) {
        return data;
      }

      data.sort(function(a, b) {
        var aValue = getVaildValue(a, mode, sortOrder);
        var bValue = getVaildValue(b, mode, sortOrder);

        if (aValue === '_NULL&UNDEFINED_') {
          aValue = Infinity;
        }
        if (bValue === '_NULL&UNDEFINED_') {
          bValue = Infinity;
        }
        if (jimuUtils.isNumberOrNumberString(aValue)) {
          aValue = Number(aValue);
        }
        if (jimuUtils.isNumberOrNumberString(bValue)) {
          bValue = Number(bValue);
        }

        var sortBoolean = aValue > bValue ? isAsc : !isAsc;

        if (aValue === Infinity) {
          sortBoolean = isAsc;
        } else if (bValue === Infinity) {
          sortBoolean = !isAsc;
        }

        var sortvalue = 0;
        if (aValue !== bValue) {
          sortvalue = sortBoolean ? 1 : -1;
        }

        return sortvalue;
      }.bind(this));

      return data;
    },

    convertingNullOrUndefinedAsPlaceholders: function(value) {
      if (value === null || value === undefined) {
        return '_NULL&UNDEFINED_';
      }
      return value;
    },

    keepFieldValueType: function(clusterFieldValue, type, dateConfig) {
      if (type === 'number') {
        clusterFieldValue = Number(clusterFieldValue);
      }
      if (dateConfig && clusterFieldValue !== '_NULL&UNDEFINED_') {
        clusterFieldValue = Number(clusterFieldValue);
      }
      return clusterFieldValue;
    },

    calcValuesByFeaturesForCatetoryMode: function(valueFields, categoryObj, hasStatisticsed, operation, nullValue) {
      var values = valueFields.map(function(fieldName) {
        var vs = this.getValuesByValueFieldForCategoryMode(fieldName, categoryObj.features,
          hasStatisticsed, operation);
        return this.calcValueByOperation(vs, operation, nullValue);
      }.bind(this));
      return values;
    },

    getValuesByValueFieldForCategoryMode: function(fieldName, features, hasStatisticsed, operation) {

      var cloneOperator = operation === 'average' ? 'avg' : operation;
      if (hasStatisticsed) {
        var upperFieldName = jimuUtils.upperCaseString(fieldName + '_' + cloneOperator);
        var lowerFieldName = jimuUtils.lowerCaseString(fieldName + '_' + cloneOperator);
      }
      var values = features.map(lang.hitch(this, function(feature) {
        var attributes = feature.attributes;
        if (!attributes) {
          return;
        }
        var v;
        if (hasStatisticsed) {
          v = attributes[upperFieldName];
          if (typeof v === 'undefined') {
            v = attributes[lowerFieldName];
          }
        } else {
          v = attributes[fieldName];
        }
        return v;
      }));
      return values;
    },

    _isNumber: function(value) {
      var valueType = Object.prototype.toString.call(value).toLowerCase();
      return valueType === "[object number]";
    },

    //return year...second
    _getDateUnit: function(range, dateFormatter) {
      var dateUnit = dateFormatter;
      if (dateFormatter === 'automatic') {
        var start = moment(range[0]).local();
        var end = moment(range[1]).local();
        var minutes = Math.round(end.diff(start, 'minute', true));
        if (minutes >= 0 && minutes <= 1) {
          dateUnit = 'second';
        } else if (minutes > 1 && minutes <= 60) {
          dateUnit = 'minute';
        } else if (minutes > 60 && minutes <= 60 * 24) {
          dateUnit = 'hour';
        } else if (minutes > 60 * 24 && minutes <= 60 * 24 * 30) {
          dateUnit = 'day';
        } else if (minutes > 60 * 24 * 30 && minutes <= 60 * 24 * 30 * 12) {
          dateUnit = 'month';
        } else if (minutes > 60 * 24 * 30 * 12) {
          dateUnit = 'year';
        }
      }
      return dateUnit;
    },

    //return [minTime, maxTime]
    _getTimeRange: function(features, fieldName) {

      var times = features.map(lang.hitch(this, function(feature) {
        var attributes = feature.attributes;
        return attributes && attributes[fieldName];
      }));
      times = times.filter(function(e) {
        return !!e;
      });

      var minTime = Math.min.apply(Math, times);
      var maxTime = Math.max.apply(Math, times);
      return [minTime, maxTime];
    },
    //return {twixs:[], dateUnit:'year...second'}
    _getTimeTwixs: function(features, fieldName, dateFormatter) {
      var formats = ['year', 'month', 'day', 'hour', 'minute', 'second', 'automatic'];
      if (formats.indexOf(dateFormatter) < 0) {
        console.log('Invaild data formatter: ' + dateFormatter);
        return false;
      }
      var range = this._getTimeRange(features, fieldName);
      //all time is same
      if (range[0] === range[1]) {
        return false;
      }
      var dateUnit = this._getDateUnit(range, dateFormatter);
      //example: dateUnit = month, range[0] = 2/8/2000 08:20:20,
      //return startTime = 1/8/2000 00:00:00,
      var startTime = this.getStartTimeByUnit(range[0], dateUnit);

      var start = moment(startTime).local();
      var end = moment(range[1]).local();

      var tw = start.twix(end);
      var twixs = tw.split(1, dateUnit);
      var twixEndValue = twixs[twixs.length - 1].end().valueOf();
      var lastTwix = {
        startValue: twixEndValue,
        endValue: Infinity
      };
      twixs.push(lastTwix);
      return {
        twixs: twixs,
        dateUnit: dateUnit
      };
    },

    //get the categories by features(for category and count mode)
    //hashObj:{[hashlabel]:{count:0, features:[f1,f2...]}}
    //return {notNullLabelHashObj:hashObj,nullLabelHashObj:hashObj}
    getCluseringObj: function(clusterField, features, dateConfig) {

      var notNullLabelClusteringObj = {};
      var nullLabelClusteringObj = {};

      if (dateConfig) {
        var clusterObj = this.getClusteringObjForDateType(clusterField, features, dateConfig);
        notNullLabelClusteringObj = clusterObj.notNullLabel;
        nullLabelClusteringObj = clusterObj.nullLabel;
      } else {
        var separationFeatures = this.separateFeaturesWhetherFieldValueNull(clusterField, features);
        var notNullLabelFeatures = separationFeatures.notNullLabelFeatures;
        var nullLabelFeatures = separationFeatures.nullLabelFeatures;
        notNullLabelClusteringObj = this.getClusteringObjByField(notNullLabelFeatures, clusterField);
        nullLabelClusteringObj = this.getClusteringObjByField(nullLabelFeatures, clusterField);
      }

      return {
        notNullLabel: notNullLabelClusteringObj,
        nullLabel: nullLabelClusteringObj
      };
    },

    calcValueByOperation: function(values, operation, useNullValueAsZero) {

      if (values && values.length === 1) {
        if (!useNullValueAsZero) {
          return values[0];
        } else if (!this._isNumber(values[0])) {
          return 0;
        }
      }

      var summarizeValue;
      if (values.length !== 0) {
        summarizeValue = 0;
        if (operation === 'max') {
          summarizeValue = -Infinity;
        } else if (operation === 'min') {
          summarizeValue = Infinity;
        }
        //handle null value
        if (useNullValueAsZero) {
          values = values.map(function(val) {
            if (!this._isNumber(val)) {
              val = 0;
            }
            return val;
          }.bind(this));
        } else {
          values = values.filter(function(val) {
            return this._isNumber(val);
          }.bind(this));
        }
        //use nonNullValueCount to record how many feature values are not null for the fieldName
        var count = 0;
        values.forEach(lang.hitch(this, function(value) {
          count++;
          if (operation === 'average' || operation === 'sum') {
            summarizeValue += value;
          } else if (operation === 'max') {
            summarizeValue = Math.max(summarizeValue, value);
          } else if (operation === 'min') {
            summarizeValue = Math.min(summarizeValue, value);
          }
        }));

        if (count > 0) {
          if (operation === 'average') {
            //summarizeValue = summarizeValue / values.length;
            summarizeValue = summarizeValue / count;
          }
        } else {
          //if all values for the fieldName are null, we set summarizeValue to null, no matter
          //what's the value of operation
          summarizeValue = null;
        }
      } else {
        summarizeValue = null;
      }
      return summarizeValue;
    },

    getClusteringObjByField: function(features, clusterField) {
      var clusteringObj = {};
      features.forEach(lang.hitch(this, function(feature) {
        var attributes = feature.attributes;
        var clusterFieldValue = attributes && attributes[clusterField];
        var type = typeof clusterFieldValue;
        clusterFieldValue = this.convertingNullOrUndefinedAsPlaceholders(clusterFieldValue);
        var hashValue = null;

        if (clusteringObj.hasOwnProperty(clusterFieldValue)) {
          hashValue = clusteringObj[clusterFieldValue];
          hashValue.features.push(feature);
          hashValue.count++;
        } else {
          hashValue = {
            count: 1,
            features: [feature],
            type: type
          };
          clusteringObj[clusterFieldValue] = hashValue;
        }
      }));
      return clusteringObj;
    },

    _removeNaNDataItem: function(data) {
      return data.filter(function(item) {
        var isNaNValue = false;
        var category = item.category;
        if (typeof category === 'number') {
          isNaNValue = isNaN(category);
        }
        return !isNaNValue;
      });
    },

    separateFeaturesWhetherFieldValueNull: function(field, features) {
      var nullLabelFeatures = [],
        notNullLabelFeatures = [];
      if (Array.isArray(features)) {
        notNullLabelFeatures = features.filter(function(feature) {
          var attributes = feature.attributes;
          var fieldValue = attributes && attributes[field];
          if (fieldValue === null || fieldValue === undefined) {
            nullLabelFeatures.push(feature);
          } else {
            return true;
          }
        });
      }
      return {
        nullLabelFeatures: nullLabelFeatures,
        notNullLabelFeatures: notNullLabelFeatures
      };
    },

    getStartTimeByUnit: function(timestamp, unit) {
      return moment(timestamp).startOf(unit).utc().valueOf();
    },

    _mosaicFieldNameWithOperatorAndUpper: function(fieldname, operator) {
      return jimuUtils.upperCaseString(fieldname + '_' + operator);
    },

    _mosaicFieldNameWithOperatorAndLower: function(fieldname, operator) {
      return jimuUtils.lowerCaseString(fieldname + '_' + operator);
    },

    getClusteringObjForDateType: function(clusterField, features, dateConfig) {
      var separationFeatures = this.separateFeaturesWhetherFieldValueNull(clusterField, features);
      var notNullLabelFeatures = separationFeatures.notNullLabelFeatures;

      var nullLabelFeatures = separationFeatures.nullLabelFeatures;
      var nullLabelClusteringObj = {};
      nullLabelClusteringObj = this.getClusteringObjByField(nullLabelFeatures, clusterField);
      var notNullLabelClusteringObj = {};

      function updateHashValue(notNullLabelHashObj, clusterFieldValue, hashValue) {

        if (notNullLabelHashObj[clusterFieldValue]) {
          var oriHashValue = notNullLabelHashObj[clusterFieldValue];
          oriHashValue.count += hashValue.count;
          oriHashValue.features = oriHashValue.features.concat(hashValue.features);
        } else {
          notNullLabelHashObj[clusterFieldValue] = hashValue;
        }
      }

      function clusterByTimestampUnit(clusterObj, clusterFieldValue, valueObj, unit) {
        clusterFieldValue = Number(clusterFieldValue);
        var startTime = this.getStartTimeByUnit(clusterFieldValue, unit);

        if (clusterObj[startTime]) {
          var oriHashValue = clusterObj[startTime];
          oriHashValue.count += valueObj.count;
          oriHashValue.features = oriHashValue.features.concat(valueObj.features);
        } else {
          valueObj.originTime = clusterFieldValue;
          clusterObj[startTime] = valueObj;
        }
      }

      function getHashObjForOneLabelOfDateType(features, clusterField, notNullLabelHashObj /*dateConfig*/ ) {
        var attributes = features[0].attributes;
        var clusterFieldValue = attributes[clusterField];
        var value = {
          count: 1,
          features: features
        };
        notNullLabelHashObj[clusterFieldValue] = value;

        return notNullLabelHashObj;
      }

      if (notNullLabelFeatures.length === 1) {
        notNullLabelClusteringObj = getHashObjForOneLabelOfDateType.call(this, notNullLabelFeatures, clusterField,
          notNullLabelClusteringObj, dateConfig);
      } else if (notNullLabelFeatures.length !== 0) {
        //{twixs:[], dateUnit:'year...second'}
        var twixInfo = this._getTimeTwixs(notNullLabelFeatures, clusterField, dateConfig.minPeriod);
        if (!twixInfo) {
          notNullLabelClusteringObj = getHashObjForOneLabelOfDateType.call(this, notNullLabelFeatures, clusterField,
            notNullLabelClusteringObj, dateConfig);
        } else {
          var dateClusterObj = {};
          var twixs = twixInfo.twixs;
          var dateUnit = twixInfo.dateUnit;
          twixs.forEach(function(twix) {

            var start = typeof twix.startValue !== 'undefined' ? twix.startValue : twix.start().valueOf(),
              end = typeof twix.endValue !== 'undefined' ? twix.endValue : twix.end().valueOf();
            //Get a formatted localized label for chart x axis
            // var hashLabel = this._getDateCategory(start, dateUnit);
            var hashValue = {
              unit: dateUnit,
              count: 0,
              features: []
            };
            notNullLabelFeatures.forEach(lang.hitch(this, function(feature) {
              var attributes = feature.attributes;
              var fieldValue = attributes && attributes[clusterField];
              if (fieldValue >= start && fieldValue < end) {
                hashValue.features.push(feature);
                hashValue.count++;
              }
            }));
            if (dateConfig.isNeedFilled) {
              updateHashValue.call(this, dateClusterObj, start, hashValue);
            } else {
              if (hashValue.count > 0) {
                updateHashValue.call(this, dateClusterObj, start, hashValue);
              }
            }
          }.bind(this));
          var cacheObj = {};
          var label, value;
          //Cluster again by time stamp's start time
          for (label in dateClusterObj) {
            if (dateClusterObj.hasOwnProperty(label)) {
              value = dateClusterObj[label];
              clusterByTimestampUnit.call(this, cacheObj, label, value, dateUnit);
            }
          }
          //re origin time stamp
          for (label in cacheObj) {
            if (cacheObj.hasOwnProperty(label)) {
              value = cacheObj[label];
              var originTime = value.originTime;
              delete value.originTime;
              notNullLabelClusteringObj[originTime] = value;
            }
          }

        }
      }
      return {
        notNullLabel: notNullLabelClusteringObj,
        nullLabel: nullLabelClusteringObj
      };
    },
    /* -------- Deprecated, Only used for Chart Widget StatisticsChart.js --------*/

    //In order to be compatible statistiscChart, do this map
    _mapOptions: function(options, mode) {
      var labelField, categoryField;
      if (mode === 'feature') {
        labelField = options.labelField;
        delete options.labelField;
        options.clusterField = labelField;
        options.showNullLabelData = true;
      } else if (mode === 'category') {
        categoryField = options.categoryField;
        delete options.categoryField;
        options.clusterField = categoryField;
        options.showNullLabelData = true;
      } else if (mode === 'count') {
        categoryField = options.categoryField;
        delete options.categoryField;
        options.clusterField = categoryField;
      } else if (mode === 'field') {
        options.showNullLabelData = true;
      }
      return options;
    },

    //In order to be compatible statistiscChart, do this map
    _mapDataItemForStatisticsChart: function(data, mode) {
      var label, values, features;
      return data.map(function(dataItem) {
        label = dataItem.label;
        delete dataItem.label;

        values = dataItem.values;
        delete dataItem.values;

        features = dataItem.features;
        delete dataItem.features;

        if (mode === 'feature') {
          dataItem.category = label; //label -> category
          dataItem.valueFields = values; //values -> valueFields
          dataItem.dataFeatures = features; //features -> dataFeatures
        } else if (mode === 'category') {
          dataItem.category = label; //label -> category
          dataItem.valueFields = values; //values -> valueFields
          dataItem.dataFeatures = features; //features -> dataFeatures
        } else if (mode === 'count') {
          dataItem.fieldValue = label; //label -> fieldValue
          dataItem.count = values[0]; //values -> count
          dataItem.dataFeatures = features; //features -> dataFeatures
        } else if (mode === 'field') {
          dataItem.label = label; //label -> label
          dataItem.value = values[0]; //values -> value
        }
        return dataItem;
      });
    },

    //---feature mode---
    //options: {layerDefinition, features, labelField, valueFields, sortOrder}
    //return [{category:'a',valueFields:[10,100,2],dataFeatures:[f1]}]
    getFeatureModeStatisticsInfo: function(options) {
      var chartHelpUtils = new ChartHelpUtils({
        featureLayer: options.layerDefinition,
        popupFieldInfosObj: options.popupFieldInfosObj
      });
      options = this._mapOptions(options, 'feature');
      var clusterField = options.clusterField;
      // get statistics data
      var data = this.getFeatureModeStatisticsData(options);
      //sort order
      var sortOrder = options.sortOrder; //{isAsc:boolean,field:''}
      data = this.sortStatisticsData(data, 'feature', sortOrder, clusterField);
      //slice data for max labels number
      var maxLabels = options.maxLabels; //number or undefined
      data = this.getDataForMaxLabels(data, maxLabels);
      //Make category value's display more friendly //-- x-Axia display --
      data = chartHelpUtils.getBestLabelDisplay(data, clusterField, 'feature');
      // keep best decimal places //-- y-Axia display --
      data = chartHelpUtils.keepStatisticsDataBestDecimalPlace(options, data, 'feature');
      return this._mapDataItemForStatisticsChart(data, 'feature');
    },

    //---category mode---
    //options: {layerDefinition, features, categoryField, valueFields, operation, sortOrder}
    //return [{category:'a',valueFields:[10,100,2],dataFeatures:[f1,f2...]}]
    getCategoryModeStatisticsInfo: function(options) {
      var chartHelpUtils = new ChartHelpUtils({
        featureLayer: options.layerDefinition,
        popupFieldInfosObj: options.popupFieldInfosObj
      });
      options = this._mapOptions(options, 'category');
      var clusterField = options.clusterField;
      //get statistics data for category mode
      var data = this.getCategoryModeStatisticsData(options);
      //sort order
      var valueFields = options.valueFields;
      var sortOrder = options.sortOrder;
      data = this.sortStatisticsData(data, 'category', sortOrder, null, valueFields);
      //remove NaN data item
      data = this._removeNaNDataItem(data);
      //slice data
      var maxLabels = options.maxLabels; //number or undefined
      data = this.getDataForMaxLabels(data, maxLabels);
      //Make category value's display more friendly //-- x-Axia display --
      data = chartHelpUtils.getBestLabelDisplay(data, clusterField, 'category');
      // keep best decimal places //-- y-Axia display --
      data = chartHelpUtils.keepStatisticsDataBestDecimalPlace(options, data, 'category');
      return this._mapDataItemForStatisticsChart(data, 'category');
    },
    //---count mode---
    //options: {layerDefinition, features, categoryField, sortOrder, maxLabels ...}
    //return [{fieldValue:'',count:count1,dataFeatures:[f1,f2...]}]
    getCountModeStatisticsInfo: function(options) {
      var chartHelpUtils = new ChartHelpUtils({
        featureLayer: options.layerDefinition,
        popupFieldInfosObj: options.popupFieldInfosObj
      });
      options = this._mapOptions(options, 'count');
      var clusterField = options.clusterField;
      var data = this.getCountModeStatisticsData(options);
      //sort order
      var sortOrder = options.sortOrder;
      data = this.sortStatisticsData(data, 'count', sortOrder);
      //slice data
      var maxLabels = options.maxLabels; //number or undefined
      data = this.getDataForMaxLabels(data, maxLabels);
      //Make category value's display more friendly //-- x-Axia display --
      data = chartHelpUtils.getBestLabelDisplay(data, clusterField, 'count');
      //Convert data[i],category to 'fieldValue'
      return this._mapDataItemForStatisticsChart(data, 'count');
    },

    //---field mode---
    //options: {layerDefinition, features, valueFields, operation}
    //return {label:'',value:value2}
    getFieldModeStatisticsInfo: function(options) {
      var chartHelpUtils = new ChartHelpUtils({
        featureLayer: options.layerDefinition,
        popupFieldInfosObj: options.popupFieldInfosObj
      });
      options = this._mapOptions(options, 'category');
      var data = this.getFieldModeStatisticsData(options);
      //sort order
      var sortOrder = options.sortOrder;
      data = this.sortStatisticsData(data, 'field', sortOrder);
      //slice data
      var maxLabels = options.maxLabels; //number or undefined
      data = this.getDataForMaxLabels(data, maxLabels);
      //Make category value's display more friendly //-- x-Axia display --
      data = chartHelpUtils.getBestLabelDisplay(data, null, 'field');
      // keep best decimal places //-- y-Axia display --
      data = chartHelpUtils.keepStatisticsDataBestDecimalPlace(options, data, 'field');
      //Convert data[i],category to 'label'
      return this._mapDataItemForStatisticsChart(data, 'field');
    }

  };

  return mo;
});