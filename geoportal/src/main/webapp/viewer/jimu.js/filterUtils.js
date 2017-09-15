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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/date/locale',
  'esri/lang',
  'dojo/data/ItemFileWriteStore',
  'jimu/utils'
],
function(declare, lang, array, locale, esriLang, ItemFileWriteStore, jimuUtils) {

  //refer arcgisonline/sharing/dijit/dialog/FilterDlg.js
  var clazz = declare([], {
    _stringFieldType: 'esriFieldTypeString',
    _dateFieldType: 'esriFieldTypeDate',
    _numberFieldTypes: ['esriFieldTypeOID',
                        'esriFieldTypeSmallInteger',
                        'esriFieldTypeInteger',
                        'esriFieldTypeSingle',
                        'esriFieldTypeDouble'],
    _supportFieldTypes: [],
    dayInMS : (24 * 60 * 60 * 1000) - 1000,// 1 sec less than 1 day
    fieldsStore: null,
    isHosted: false,

    //methods renamed:
    //parseDefinitionExpression->getFilterObjByExpr
    //builtCompleteFilter->getExprByFilterObj

    //public methods:
    //prepare
    //getFilterObjByExpr: expr->partsObj
    //getExprByFilterObj: partsObj->expr

    //modify methods(with hint 'code for wab'):
    //builtSingleFilterString


    //Description:
    //builtSingleFilterString is the core method used to convert single partObj to expr
    //parseSingleExpr is the core method used to parse single expr to partObj

    constructor: function(){
      String.prototype.startsWith = function(str) {
        return (this.indexOf(str) === 0);
      };

      String.prototype.endsWith = function(str) {
        return (this.substring(this.length - (str.length)) === str);
      };

      String.prototype.count = function (c) {
        return this.split(c).length - 1;
      };

      if(!String.prototype.trim){
        String.prototype.trim = lang.trim;
      }

      this._supportFieldTypes = [];
      this._supportFieldTypes.push(this._stringFieldType);
      this._supportFieldTypes.push(this._dateFieldType);
      this._supportFieldTypes = this._supportFieldTypes.concat(this._numberFieldTypes);
    },

    OPERATORS:{
      //string operators
      stringOperatorIs:'stringOperatorIs',
      stringOperatorIsNot:'stringOperatorIsNot',
      stringOperatorStartsWith:'stringOperatorStartsWith',
      stringOperatorEndsWith:'stringOperatorEndsWith',
      stringOperatorContains:'stringOperatorContains',
      stringOperatorDoesNotContain:'stringOperatorDoesNotContain',
      stringOperatorIsBlank:'stringOperatorIsBlank',
      stringOperatorIsNotBlank:'stringOperatorIsNotBlank',

      //new added
      //stringOperatorContainsCaseInSensitive:'stringOperatorContainsCaseInSensitive',

      //number operators
      numberOperatorIs:'numberOperatorIs',
      numberOperatorIsNot:'numberOperatorIsNot',
      numberOperatorIsAtLeast:'numberOperatorIsAtLeast',
      numberOperatorIsLessThan:'numberOperatorIsLessThan',
      numberOperatorIsAtMost:'numberOperatorIsAtMost',
      numberOperatorIsGreaterThan:'numberOperatorIsGreaterThan',
      numberOperatorIsBetween:'numberOperatorIsBetween',
      numberOperatorIsNotBetween:'numberOperatorIsNotBetween',
      numberOperatorIsBlank:'numberOperatorIsBlank',
      numberOperatorIsNotBlank:'numberOperatorIsNotBlank',

      //date operators
      dateOperatorIsOn:'dateOperatorIsOn',
      dateOperatorIsNotOn:'dateOperatorIsNotOn',
      dateOperatorIsBefore:'dateOperatorIsBefore',
      dateOperatorIsAfter:'dateOperatorIsAfter',
      dateOperatorIsOnOrBefore:'dateOperatorIsOnOrBefore',
      dateOperatorIsOnOrAfter:'dateOperatorIsOnOrAfter',
      dateOperatorIsBetween:'dateOperatorIsBetween',
      dateOperatorIsNotBetween:'dateOperatorIsNotBetween',
      dateOperatorIsBlank:'dateOperatorIsBlank',
      dateOperatorIsNotBlank:'dateOperatorIsNotBlank',
      dateOperatorInTheLast:'dateOperatorInTheLast',
      dateOperatorNotInTheLast:'dateOperatorNotInTheLast',

      //not operators, date types used for dateOperatorInTheLast and dateOperatorNotInTheLast
      dateOperatorMinutes:'dateOperatorMinutes',
      dateOperatorHours:'dateOperatorHours',
      dateOperatorDays:'dateOperatorDays',
      dateOperatorWeeks:'dateOperatorWeeks',
      dateOperatorMonths:'dateOperatorMonths',
      dateOperatorYears:'dateOperatorYears'
    },

    prepare: function(url, allFieldsInfos){
      this.isHosted = jimuUtils.isHostedService(url);
      this.setFieldsStoreByFieldInfos(allFieldsInfos);
    },

    isPartsObjHasError: function(partsObj){
      var isValidPartsObj = false;
      if(partsObj){
        if(partsObj.parts && partsObj.parts.length >= 0){
          isValidPartsObj = array.every(partsObj.parts, lang.hitch(this, function(part){
            if(part.parts){
              if(part.parts.length > 0){
                return array.every(part.parts, lang.hitch(this, function(singlePart){
                  return !singlePart.error;
                }));
              }else{
                return false;
              }
            }else{
              return !part.error;
            }
          }));
        }else{
          isValidPartsObj = false;
        }
      }
      return !isValidPartsObj;
    },

    isAskForValues: function(partsObj){
      var result = false;
      var parts = partsObj.parts;
      result = array.some(parts, lang.hitch(this, function(item) {
        if (item.parts) {
          return array.some(item.parts, lang.hitch(this, function(part) {
            return !!part.interactiveObj;
          }));
        } else {
          return !!item.interactiveObj;
        }
      }));
      return result;
    },

    setFieldsStoreByFieldInfos: function(allFieldsInfos){
      var fieldsInfos = array.filter(allFieldsInfos, lang.hitch(this, function(fieldInfo){
        return this._supportFieldTypes.indexOf(fieldInfo.type) >= 0;
      }));
      var items = array.map(fieldsInfos, function(fieldInfo, idx){
        var shortType;
        switch (fieldInfo.type) {
        case "esriFieldTypeString":
          shortType = "string";
          break;
        case "esriFieldTypeDate":
          shortType = "date";
          break;
        default: // numbers
          shortType = "number";
          break;
        }

        return {
          id: idx,
          label: fieldInfo.name, //fieldInfo.label, //(fieldInfo.alias || fieldInfo.name),
          shortType: shortType,
          alias: fieldInfo.alias,
          editable: fieldInfo.editable,
          name: fieldInfo.name,
          nullable: fieldInfo.nullable,
          type: fieldInfo.type
        };
      }, this);

      this.fieldsStore = new ItemFileWriteStore({
        data: {
          identifier: 'id',
          label: 'label',
          items: items
        }
      });

      return items.length;
    },

    _validatePartsObj:function(partsObj){
      return partsObj && typeof partsObj === 'object';
    },

    _isObject: function(o){
      return o && typeof o === 'object';
    },

    _isString: function(s){
      return s && typeof s === 'string';
    },

    containsNonLatinCharacter: function(string) {
      /*
      console.log(string);
      for (var k = 0; k < string.length; k++) {
        console.log(string.charCodeAt(k));
      }
      */
      for (var i = 0; i < string.length; i++) {
        if (string.charCodeAt(i) > 255) {
          return true;
        }
      }
      return false;

    },

    /**************************************************/
    /****  stringify                               ****/
    /**************************************************/
    //builtCompleteFilter
    //1. If return null or empty string, it means we can't get a valid sql expresion
    //2. If return a non-empty string, it means we can get a valid sql expression
    getExprByFilterObj: function(partsObj) {
      //check part if valid or not, if part is null, it is invalid
      var isValidParts = array.every(partsObj.parts, function(part){
        return !!part;
      });
      if(!isValidParts){
        return null;
      }

      //before build filter string, we need to check it is ready or not to build
      //because user maybe check 'Ask for values' option and place empty value(s)
      if(!this.isPartsObjReadyToBuild(partsObj)){
        partsObj.expr = "";
        return partsObj.expr;
      }

      //real code to build filter string
      var filterString = "";
      if(partsObj.parts.length === 0){
        filterString = "1=1";
      }else if(partsObj.parts.length === 1) {
        filterString = this.builtFilterString(partsObj.parts[0]);
      } else {
        var join = "";
        //dojo.forEach(allFilters, function(node){
        for (var i = 0; i < partsObj.parts.length; i++) {
          var str = this.builtFilterString(partsObj.parts[i]);
          if (!esriLang.isDefined(str)) {
            // we're missing input
            return null;
          }
          filterString += join + "(" + str + ")";
          join = join || (" " + partsObj.logicalOperator + " ");
        }
      }
      partsObj.expr = filterString;
      return filterString;
    },

    //check it is ready or not to build filter string by askForValues opiton
    isPartsObjReadyToBuild: function(partsObj){
      var isReady = array.every(partsObj.parts, lang.hitch(this, function(part){
        var result;
        if(part.parts){
          result = array.every(part.parts, lang.hitch(this, function(subPart){
            return this._isPartReadyToBuild(subPart);
          }));
        }else{
          result = this._isPartReadyToBuild(part);
        }
        return result;
      }));
      return isReady;
    },

    _isPartReadyToBuild: function(part){
      var shortType = part.fieldObj.shortType;
      var operator = part.operator;
      var valueObj = part.valueObj;
      //if value type is missing, we use 'value' as default
      //it is useful when parse a sql into partsObj because it doesn't have value type
      var valueType = valueObj.type || 'value';
      var value = valueObj.value;
      var value1 = valueObj.value1;
      var value2 = valueObj.value2;

      if (valueType === 'value') {
        if (shortType === 'string') {
          if (operator === this.OPERATORS.stringOperatorIsBlank ||
            operator === this.OPERATORS.stringOperatorIsNotBlank) {
            return true;
          } else {
            return jimuUtils.isNotEmptyString(value);
          }
        } else if (shortType === 'number') {
          if(operator === this.OPERATORS.numberOperatorIsBlank ||
             operator === this.OPERATORS.numberOperatorIsNotBlank){
            return true;
          }else if(operator === this.OPERATORS.numberOperatorIsBetween ||
                  operator === this.OPERATORS.numberOperatorIsNotBetween){
            return jimuUtils.isValidNumber(value1) && jimuUtils.isValidNumber(value2);
          }else{
            return jimuUtils.isValidNumber(value);
          }
        } else if (shortType === 'date') {
          if(operator === this.OPERATORS.dateOperatorIsBlank ||
             operator === this.OPERATORS.dateOperatorIsNotBlank){
            return true;
          }
          else if(operator === this.OPERATORS.dateOperatorIsBetween ||
                  operator === this.OPERATORS.dateOperatorIsNotBetween){
            return jimuUtils.isNotEmptyString(value1) && jimuUtils.isNotEmptyString(value2);
          }
          else if(operator === this.OPERATORS.dateOperatorInTheLast ||
                  operator === this.OPERATORS.dateOperatorNotInTheLast){
            return value !== undefined && value !== null;
          }else{
            return jimuUtils.isNotEmptyString(value);
          }
        }
      }else if(valueType === 'field'){
        return jimuUtils.isNotEmptyString(value);
      }else if(valueType === 'unique'){
        if(shortType === 'string'){
          return jimuUtils.isNotEmptyString(value);
        }else if(shortType === 'number'){
          return jimuUtils.isValidNumber(value);
        }
      }

      return false;
    },

    builtFilterString: function(partsObj) {
      var filterString = "";
      if (partsObj.parts) {
        // set
        var join = "";
        for (var i = 0; i < partsObj.parts.length; i++) {
          var part = partsObj.parts[i];
          var obj = this.builtSingleFilterString(part);
          part.expr = obj.whereClause;
          if (!esriLang.isDefined(obj.whereClause)) {
            // we're missing input
            return null;
          }
          filterString += join + obj.whereClause;
          join = " " + partsObj.logicalOperator + " ";
        }
      } else {
        // single expression
        filterString = this.builtSingleFilterString(partsObj).whereClause;
      }
      partsObj.expr = filterString;
      return filterString;
    },

    _preBuiltSingleFilterString: function(part){
      if(part.fieldObj.shortType === 'string' && part.valueObj.value === "<Null>"){
        if(part.operator === this.OPERATORS.stringOperatorIs){
          return {
            whereClause: part.fieldObj.name + " IS NULL"
          };
        }else if(part.operator === this.OPERATORS.stringOperatorIsNot){
          return {
            whereClause: part.fieldObj.name + " IS NOT NULL"
          };
        }
      }

      if(part.fieldObj.shortType === 'number' && part.valueObj.value === "<Null>"){
        if(part.operator === this.OPERATORS.numberOperatorIs){
          return {
            whereClause: part.fieldObj.name + " IS NULL"
          };
        }else if(part.operator === this.OPERATORS.numberOperatorIsNot){
          return {
            whereClause: part.fieldObj.name + " IS NOT NULL"
          };
        }
      }
      return null;
    },

    builtSingleFilterString: function(part, parameterizeCount) {

      if(this.isHosted){
        part.caseSensitive = false;
      }
      // TODO check that expression value has a value ...
      if (esriLang.isDefined(part.valueObj.isValid) && !part.valueObj.isValid) {
        return {
          whereClause: null
        };
      }

      var preBuildResult = this._preBuiltSingleFilterString(part);
      if(preBuildResult){
        return preBuildResult;
      }

      var value = part.valueObj.value;
      var value1 = part.valueObj.value1;
      var value2 = part.valueObj.value2;

      var parameterizeValues = false;
      if (part.interactiveObj) {
        /*if (!part.interactiveObj.prompt || !part.interactiveObj.hint) {
          return {
            whereClause: null
          };
        }*/
        if (esriLang.isDefined(parameterizeCount)) {
          parameterizeValues = true;
          if (esriLang.isDefined(part.valueObj.value)) {
            value = "{" + parameterizeCount + "}";
          }
          if (esriLang.isDefined(part.valueObj.value1)) {
            value1 = "{" + parameterizeCount + "}";
          }
          if (esriLang.isDefined(part.valueObj.value2)) {
            value2 = "{" + (parameterizeCount + 1) + "}";
          }
        }
      }

      var whereClause = "";

      if (part.fieldObj.shortType === "string") {

        var prefix = "";
        if(parameterizeValues && this.isHosted){
          // just in case the user input value has non-Latin characters
          prefix = 'N';
        }else if (value && part.valueObj.type !== 'field' && this.isHosted) {
          if (this.containsNonLatinCharacter(value)) {
            prefix = 'N';
          }
        }
        switch (part.operator) {
        case this.OPERATORS.stringOperatorIs:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " = " + value;
          } else {
            whereClause = part.fieldObj.name + " = " +
             prefix + "'" + value.replace(/\'/g, "''") + "'";
          }
          break;
        case this.OPERATORS.stringOperatorIsNot:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " <> " + value;
          } else {
            whereClause = part.fieldObj.name + " <> " + prefix +
             "'" + value.replace(/\'/g, "''") + "'";
          }
          break;
        case this.OPERATORS.stringOperatorStartsWith:
          if(part.caseSensitive){
            whereClause = part.fieldObj.name + " LIKE " + prefix +
             "'" + value.replace(/\'/g, "''") + "%'";
          }
          else{
            //UPPER(County) LIKE UPPER(N'石景山区%')
            whereClause = "UPPER(" + part.fieldObj.name + ") LIKE " +
             "UPPER(" + prefix + "'" + value.replace(/\'/g, "''") + "%')";
          }
          break;
        case this.OPERATORS.stringOperatorEndsWith:
          if(part.caseSensitive){
            whereClause = part.fieldObj.name + " LIKE " + prefix +
           "'%" + value.replace(/\'/g, "''") + "'";
          }
          else{
            //UPPER(County) LIKE UPPER(N'%石景山区')
            whereClause = "UPPER(" + part.fieldObj.name + ") LIKE " +
           "UPPER(" + prefix + "'%" + value.replace(/\'/g, "''") + "')";
          }
          break;
        case this.OPERATORS.stringOperatorContains:
          if(part.caseSensitive){
            whereClause = part.fieldObj.name + " LIKE " + prefix +
           "'%" + value.replace(/\'/g, "''") + "%'";
          }
          else{
            //UPPER(County) LIKE UPPER(N'%石景山区%')
            whereClause = "UPPER(" + part.fieldObj.name + ") LIKE " +
           "UPPER(" + prefix + "'%" + value.replace(/\'/g, "''") + "%')";
          }
          break;
        case this.OPERATORS.stringOperatorDoesNotContain:
          if(part.caseSensitive){
            whereClause = part.fieldObj.name + " NOT LIKE " + prefix +
           "'%" + value.replace(/\'/g, "''") + "%'";
          }
          else{
            //UPPER(County) NOT LIKE UPPER(N'%石景山区%')
            whereClause = "UPPER(" + part.fieldObj.name + ") NOT LIKE " +
           "UPPER(" +  prefix + "'%" + value.replace(/\'/g, "''") + "%')";
          }
          break;
        case this.OPERATORS.stringOperatorIsBlank:
          whereClause = part.fieldObj.name + " IS NULL";
          break;
        case this.OPERATORS.stringOperatorIsNotBlank:
          whereClause = part.fieldObj.name + " IS NOT NULL";
          break;
        }

      } else if (part.fieldObj.shortType === "number") {

        switch (part.operator) {
        case this.OPERATORS.numberOperatorIs:
          whereClause = part.fieldObj.name + " = " + value;
          break;
        case this.OPERATORS.numberOperatorIsNot:
          whereClause = part.fieldObj.name + " <> " + value;
          break;
        case this.OPERATORS.numberOperatorIsAtLeast:
          whereClause = part.fieldObj.name + " >= " + value;
          break;
        case this.OPERATORS.numberOperatorIsLessThan:
          whereClause = part.fieldObj.name + " < " + value;
          break;
        case this.OPERATORS.numberOperatorIsAtMost:
          whereClause = part.fieldObj.name + " <= " + value;
          break;
        case this.OPERATORS.numberOperatorIsGreaterThan:
          whereClause = part.fieldObj.name + " > " + value;
          break;
        case this.OPERATORS.numberOperatorIsBetween:
          whereClause = part.fieldObj.name + " BETWEEN " + value1 + " AND " + value2;
          break;
        case this.OPERATORS.numberOperatorIsNotBetween:
          whereClause = part.fieldObj.name + " NOT BETWEEN " + value1 + " AND " + value2;
          break;
        case this.OPERATORS.numberOperatorIsBlank:
          whereClause = part.fieldObj.name + " IS NULL";
          break;
        case this.OPERATORS.numberOperatorIsNotBlank:
          whereClause = part.fieldObj.name + " IS NOT NULL";
          break;
        }

      } else { // date
        // value is Date object when we had a DateTextBox
        // value is String when we had unique values list
        if (esriLang.isDefined(value) && part.valueObj.type !== 'field' &&
         (typeof value === "string")) {
          // e.g. "7/7/2010 12:00:00 AM" returned by generateRenderer
          value = new Date(value);
        }

        //code for wab
        //start
        if(part.valueObj.type !== 'field'){
          if(value){
            value = new Date(value);
          }
          if(value1){
            value1 = new Date(value1);
          }
          if(value2){
            value2 = new Date(value2);
          }
        }
        //end

        switch (part.operator) {
        case this.OPERATORS.dateOperatorIsOn:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " = " + value;
          } else {
            if (parameterizeValues) {
              whereClause = part.fieldObj.name + " BETWEEN " + (this.isHosted ? "" : "timestamp ") +
               "'{" + parameterizeCount + "}' AND " + (this.isHosted ? "" : "timestamp ") +
                "'{" + (parameterizeCount + 1) + "}'";
            } else {
              whereClause = part.fieldObj.name + " BETWEEN " + (this.isHosted ? "" : "timestamp ") +
               "'" + this.formatDate(value) + "' AND " + (this.isHosted ? "" : "timestamp ") +
                "'" + this.formatDate(this.addDay(value)) + "'";
            }
          }
          break;
        case this.OPERATORS.dateOperatorIsNotOn:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " <> " + value;
          } else {
            if (parameterizeValues) {
              whereClause = part.fieldObj.name +
               " NOT BETWEEN " + (this.isHosted ? "" : "timestamp ") +
               "'{" + parameterizeCount + "}' AND " + (this.isHosted ? "" : "timestamp ") +
                "'{" + (parameterizeCount + 1) + "}'";
            } else {
              whereClause = part.fieldObj.name +
               " NOT BETWEEN " + (this.isHosted ? "" : "timestamp ") +
               "'" + this.formatDate(value) + "' AND " + (this.isHosted ? "" : "timestamp ") +
                "'" + this.formatDate(this.addDay(value)) + "'";
            }
          }
          break;
        case this.OPERATORS.dateOperatorIsBefore:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " < " + value;
          } else {
            whereClause = part.fieldObj.name + " < " +
             (this.isHosted ? "" : "timestamp ") + "'" + this.formatDate(value) + "'";
          }
          break;
        case this.OPERATORS.dateOperatorIsAfter:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " > " + value;
          } else {
            whereClause = part.fieldObj.name + " > " +
             (this.isHosted ? "" : "timestamp ") + "'" + this.formatDate(this.addDay(value)) + "'";
          }
          break;
        case this.OPERATORS.dateOperatorIsOnOrBefore:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " <= " + value;
          } else {
            whereClause = part.fieldObj.name + " <= " +
             (this.isHosted ? "" : "timestamp ") + "'" + this.formatDate(this.addDay(value)) + "'";
          }
          break;
        case this.OPERATORS.dateOperatorIsOnOrAfter:
          if (part.valueObj.type === 'field') {
            whereClause = part.fieldObj.name + " >= " + value;
          } else {
            whereClause = part.fieldObj.name + " >= " +
             (this.isHosted ? "" : "timestamp ") + "'" + this.formatDate(value) + "'";
          }
          break;
        case this.OPERATORS.dateOperatorInTheLast:
          whereClause = part.fieldObj.name + " BETWEEN CURRENT_TIMESTAMP - " +
            this._convertRangeToDays(part.valueObj.value, part.valueObj.range) +
            " AND CURRENT_TIMESTAMP";
          break;
        case this.OPERATORS.dateOperatorNotInTheLast:
          whereClause = part.fieldObj.name + " NOT BETWEEN CURRENT_TIMESTAMP - " +
            this._convertRangeToDays(part.valueObj.value, part.valueObj.range) +
            " AND CURRENT_TIMESTAMP";
          break;
        case this.OPERATORS.dateOperatorIsBetween:
          if (parameterizeValues) {
            whereClause = part.fieldObj.name + " BETWEEN '" + value1 + "' AND '" + value2 + "'";
          } else {
            whereClause = part.fieldObj.name + " BETWEEN " +
             (this.isHosted ? "" : "timestamp ") +
              "'" + this.formatDate(value1) + "' AND " + (this.isHosted ? "" : "timestamp ") +
               "'" + this.formatDate(this.addDay(value2)) + "'";
          }
          break;
        case this.OPERATORS.dateOperatorIsNotBetween:
          if (parameterizeValues) {
            whereClause = part.fieldObj.name + " NOT BETWEEN '" + value1 + "' AND '" + value2 + "'";
          } else {
            whereClause = part.fieldObj.name + " NOT BETWEEN " +
             (this.isHosted ? "" : "timestamp ") + "'" + this.formatDate(value1) +
              "' AND " + (this.isHosted ? "" : "timestamp ") +
               "'" + this.formatDate(this.addDay(value2)) + "'";
          }
          break;
        case this.OPERATORS.dateOperatorIsBlank:
          whereClause = part.fieldObj.name + " IS NULL";
          break;
        case this.OPERATORS.dateOperatorIsNotBlank:
          whereClause = part.fieldObj.name + " IS NOT NULL";
          break;
        }
      }
      return {
        whereClause: whereClause
      };
    },

    _convertRangeToDays: function(rangeCount, rangeType) {
      var days = rangeCount;  // this.OPERATORS.dateOperatorDays

      if (rangeType === this.OPERATORS.dateOperatorYears) {
        // not accurate; same as AGOL approach
        days = rangeCount * 365;
      } else if (rangeType === this.OPERATORS.dateOperatorMonths) {
        // not accurate; same as AGOL approach
        days = rangeCount * 30;
      } else if (rangeType === this.OPERATORS.dateOperatorWeeks) {
        days = rangeCount * 7;
      } else if (rangeType === this.OPERATORS.dateOperatorHours) {
        days = rangeCount / 24;
      } else if (rangeType === this.OPERATORS.dateOperatorMinutes) {
        days = rangeCount / (24 * 60);
      }

      // Round days to 6 decimal places--enough for one minute (0.000694 days)
      days = Math.round(days * 1000000) / 1000000;

      return days;
    },

    formatDate: function(value){
      // see also parseDate()
      // to bypass the locale dependent connector character format date and time separately
      var s1 = locale.format(value, {
        datePattern: "yyyy-MM-dd",
        selector: "date"
      });
      var s2 = locale.format(value, {
        selector: "time",
        timePattern: "HH:mm:ss"
      });
      return s1 + " " + s2;
      /* contains comma '2013-03-01, 00:00:00' for locale 'en'
      return dojo.date.locale.format(value, {
        datePattern: "yyyy-MM-dd",
        timePattern: "HH:mm:ss"
      });
      */
    },

    addDay: function(date){
      return new Date(date.getTime() + this.dayInMS);
    },

    /**************************************************/
    /****  parse                                   ****/
    /**************************************************/
    //expr->partsObj
    //if we can parse the expr successfully, the function returns a object
    //otherwise, null or undefined is returned
    getFilterObjByExpr: function(defExpr){
      if (!defExpr || !this.fieldsStore) {
        return;
      }

      var obj = this.replaceStrings(defExpr);
      defExpr = obj.defExpr;

      var partsObj = this.findParts(defExpr, "AND");
      if (partsObj.parts.length === 1) {
        partsObj = this.findParts(defExpr, "OR");
        if (partsObj.parts.length === 1) {
          // just a simple expression
          partsObj.logicalOperator = "AND";
        }
      }

      // only 2 levels
      array.forEach(partsObj.parts, function(part){
        part.expr = part.expr.trim();
        if (part.expr.startsWith('(') && (part.expr.search(/\)$/) > -1)) {
          // part.expr.endsWith(')') -> Invalid regular expression: /)$/: Unmatched ')'
          // (field = 1 AND field = 2)
          // (field = 1) AND (field = 2)
          var str = part.expr.substring(1, part.expr.length - 1);
          var pos1 = str.indexOf('(');
          var pos2 = str.indexOf(')');
          if ((pos1 === -1 && pos2 === -1) || pos1 < pos2) {
            part.expr = str;
          }
        }

        var subPartsObj = this.findParts(part.expr, "AND");
        if (subPartsObj.parts.length === 1) {
          subPartsObj = this.findParts(part.expr, "OR");
        }
        if (subPartsObj.parts.length > 1) {
          part.parts = subPartsObj.parts;
          part.logicalOperator = subPartsObj.logicalOperator;
        }
      }, this);

      this.parseExpr(partsObj);

      //Portal code
      this.reReplaceStrings(obj, partsObj, lang.hitch(this, function(){
        //WAB Code
        if(partsObj && partsObj.parts){
          array.forEach(partsObj.parts, lang.hitch(this, function(partOrParts) {
            if (partOrParts) {
              if (partOrParts.parts) {
                //handle expression set
                array.forEach(partOrParts.parts, lang.hitch(this, function(singlePart) {
                  //parse numbers
                  this._handleParsedValuesForSinglePart(singlePart);
                  //add 'value' type if value type is missing
                  this._addDefalutValueTypeForSinglePart(singlePart);
                }));
              } else {
                //handle single expression
                //parse numbers
                this._handleParsedValuesForSinglePart(partOrParts);
                //add 'value' type if value type is missing
                this._addDefalutValueTypeForSinglePart(partOrParts);
              }
            }
          }));
        }
      }));

      //WAB Code
      //We need to check if the partsObj has error info or not.
      if(this.isPartsObjHasError(partsObj)){
        //invalid partsObj
        partsObj = null;
      }

      return partsObj;
    },

    //handle number values
    _handleParsedValuesForSinglePart: function(singlePart){
      if(singlePart){
        if(singlePart.fieldObj && singlePart.fieldObj.shortType === 'number'){
          if(singlePart.valueObj){
            if(singlePart.valueObj.hasOwnProperty('value')){
              singlePart.valueObj.value = parseFloat(singlePart.valueObj.value);
            }
            if(singlePart.valueObj.hasOwnProperty('value1')){
              singlePart.valueObj.value1 = parseFloat(singlePart.valueObj.value1);
            }
            if(singlePart.valueObj.hasOwnProperty('value2')){
              singlePart.valueObj.value2 = parseFloat(singlePart.valueObj.value2);
            }
          }
        }
      }
    },

    //add defalut 'type' property for valueObj if it is missing.
    _addDefalutValueTypeForSinglePart: function(singlePart){
      if(singlePart && singlePart.valueObj){
        if(!singlePart.valueObj.type){
          singlePart.valueObj.type = 'value';
        }
      }
    },

    replaceStrings: function(defExpr){
      var origDefExpr = defExpr;

      // remove all strings from defExpr so parsing is easier
      // 'Bob' / '''Bob' / 'Bob''' / 'Bob''Fred' / ''
      var getEnd = function(defExpr, start, pos){
        var end = -1;
        var pos2;
        if (pos === start + 1) {
          pos2 = defExpr.indexOf("'", pos + 1);
          if (pos2 === pos + 1) {
            // single quotes inside string
            end = defExpr.indexOf("'", pos2 + 1);
            return getEnd(defExpr, start, end);
          } else {
            // end of string
            end = pos;
          }
        } else {
          pos2 = defExpr.indexOf("'", pos + 1);
          if (pos2 === pos + 1) {
            // single quotes inside string
            end = defExpr.indexOf("'", pos2 + 1);
            return getEnd(defExpr, start, end);
          } else {
            // end of string
            end = pos;
          }
        }
        return end;
      };

      var savedStrings = [];
      var pos = defExpr.indexOf("'");
      while (pos > -1) {
        var start = pos;
        var end = defExpr.indexOf("'", pos + 1);
        var endAdd = 0;
        end = getEnd(defExpr, start, end);
        if (defExpr[start + 1] === '%') {
          start++;
        }
        if (defExpr[end - 1] === '%') {
          end = end - 1;
          endAdd++;
        }
        var string = defExpr.substring(start + 1, end);

        // non-latin strings have to start with N; supported only on hosted FS
        if (defExpr[start - 1] === 'N') {
          defExpr = defExpr.substring(0, start - 1) + defExpr.substring(start);
          start = start - 1;
          end = end - 1;
        }

        if (!this.isDateString(string) && string.indexOf("{") === -1) {
          // no dates and no parameterized values
          savedStrings.push(string);
          defExpr = defExpr.substring(0, start + 1) + "#" +
           (savedStrings.length - 1) + "#" + defExpr.substring(end);
          pos = defExpr.indexOf("'", (defExpr.lastIndexOf('#') + 2 + endAdd));
        } else {
          pos = defExpr.indexOf("'", end + 1 + endAdd);
        }
      }

      return {
        origDefExpr: origDefExpr,
        defExpr: defExpr,
        savedStrings: savedStrings
      };
    },

    reReplaceStrings: function(obj, partsObj, /*optional*/ callback){
      var savedStrings = obj.savedStrings;
      if (!savedStrings.length) {
        //WAB Code
        if(callback && typeof callback === 'function'){
          callback();
        }
        return;
      }

      if (savedStrings.length) {
        // put the strings back in
        var replace = function (part, savedStrings) {
          if (part.valueObj === undefined ||
            part.valueObj === null) {
            return false;
          }
          if (part.valueObj.value === undefined ||
            part.valueObj.value === null) {
            return false;
          }
          if (part.fieldObj.shortType !== "string") {
            return false;
          }
          var start = part.valueObj.value.indexOf("#");
          var end = part.valueObj.value.lastIndexOf("#");
          if (esriLang.isDefined(part.valueObj.value) && start > -1) {
            part.valueObj.value =
              savedStrings[parseInt(part.valueObj.value.substring(start + 1, end), 10)]
              .replace(/\'\'/g, "'");
            this.builtSingleFilterString(part);
            return true;
          }
          return false;
        };
        replace = lang.hitch(this, replace);

        var replaced = false;
        array.forEach(partsObj.parts, function(part){
          if (part.parts) {
            // set
            var setReplaced = false;
            array.forEach(part.parts, function(subPart){
              // expr
              setReplaced = replace(subPart, savedStrings) || setReplaced;
            });
            if (setReplaced) {
              replaced = setReplaced;
              part.expr = this.builtFilterString(part);
            }
          } else {
            // expr
            replaced = replace(part, savedStrings) || replaced;
            if (replaced) {
              this.builtFilterString(part);
            }
          }
        }, this);

        //WAB Code
        if(callback && typeof callback === 'function'){
          callback();
        }

        //Portal Code
        if (replaced) {
          partsObj.expr = null;
          this.getExprByFilterObj(partsObj);
        }
      }
    },

    isDateString: function(string){
      // 2012-12-21 00:00:00
      if (string.length === 19 &&
      string.charAt(4) === '-' &&
      string.charAt(7) === '-' &&
      string.charAt(10) === ' ' &&
      string.charAt(13) === ':' &&
      string.charAt(16) === ':') {
        return true;
      }
      return false;
    },

    findParts: function(defExpr, logicalOperator){
      var lowerDefExpr = defExpr.toLowerCase();
      var conStr = " " + logicalOperator.toLowerCase() + " ";
      var parts = [];
      var lastPos = 0;
      var pos = lowerDefExpr.indexOf(conStr);
      while (pos > 0) {
        var str = defExpr.substring(lastPos, pos);
        var lowerStr = str.toLowerCase();
        // TODO don't count parenthesis within a string ....
        // TODO don't check between within a string ....
        var oB = str.count('(');
        var cB = str.count(')');
        // single quotes within a string are used as 2 single quotes
        var sQ = str.count('\'');
        if (oB !== cB || sQ % 2 === 1) {
          // we don't have the full part
          pos = lowerDefExpr.indexOf(conStr, pos + 1);
        } else if (lowerStr.indexOf(" between ") > -1 && lowerStr.indexOf(" and ") === -1) {
          pos = lowerDefExpr.indexOf(conStr, pos + 1);
        } else {
          parts.push({
            expr: str
          });
          lastPos = pos + conStr.length;
          pos = lowerDefExpr.indexOf(conStr, lastPos);
        }
      }
      parts.push({
        expr: defExpr.substring(lastPos)
      });

      // make sure all parts have operators; if not add the part to the previous part
      var len = parts.length;
      for (var i = len - 1; i >= 0; i--) {
        if (!this.hasOperator(parts[i].expr) && i > 0) {
          parts[i - 1].expr += " " + logicalOperator + " " + parts[i].expr;
          parts.splice(i, 1);
        }
      }

      return {
        expr: defExpr,
        parts: parts,
        logicalOperator: logicalOperator
      };
    },

    hasOperator: function(str){
      str = str.toLowerCase();

      if (str.indexOf("{") > -1 && str.indexOf("}") > -1) {
        // parameterized def Expr
        return true;
      } else if (str.indexOf(" = ") > -1 ||
      str.indexOf(" < ") > -1 ||
      str.indexOf(" > ") > -1 ||
      str.indexOf(" <> ") > -1 ||
      str.indexOf(" <= ") > -1 ||
      str.indexOf(" >= ") > -1 ||
      str.indexOf(" like ") > -1 ||
      //str.indexOf(" not like ") > -1 ||
      str.indexOf(" between ") > -1 ||
      str.indexOf(" date") > -1 ||
      //str.indexOf(" not between ") > -1 ||
      str.indexOf(" is null") > -1 ||
      str.indexOf(" is not null") > -1) {
        return true;
      }
      return false;
    },

    parseExpr: function(partsObj){
      array.forEach(partsObj.parts, function(part){
        if (part.parts) {
          this.parseExpr(part);
        } else {
          this.parseSingleExpr(part);
        }
      }, this);
    },

    //code for wab
    _preParseSingleExpr: function(_part) {
      // part: {expr: "<str>"}
      // {expr: "UPPER(CITY_NAME) LIKE UPPER('%#0#%')"}
      //expr:
      //for not hosted service
      // UPPER(County) LIKE UPPER('shijingshan%')
      // UPPER(County) LIKE UPPER('%shijingshan')
      // UPPER(County) LIKE UPPER('%shijingshan%')
      // UPPER(County) NOT LIKE UPPER('%shijingshan%')
      //for hosted service(maybe doesn't has prefix N)
      // UPPER(County) LIKE UPPER(N'石景山区%')
      // UPPER(County) LIKE UPPER(N'%石景山区')
      // UPPER(County) LIKE UPPER(N'%石景山区%')
      // UPPER(County) NOT LIKE UPPER(N'%石景山区%')
      var part = null;
      try {
        part = lang.clone(_part);
        part.expr = part.expr.trim();

        //str: CITY_NAME LIKE '%#0#%'
        var regIgnoreCaseLike = /^UPPER\((.*)\)(\s+|\s+NOT\s+)LIKE\s+UPPER\(N?'(.*)'\)$/i;
        //UPPER(CITY_NAME) LIKE UPPER('%BEIJING%') or UPPER(CITY_NAME) LIKE UPPER(N'%北京%')
        if (regIgnoreCaseLike.test(part.expr)) {
          var fieldName = '';
          var value = '';
          var reg1 = /^UPPER\((.*)\)\s+/i;
          var match1 = part.expr.match(reg1);

          if (match1 && match1.length >= 2) {
            fieldName = match1[1]; //CITY_NAME
          } else {
            return null;
          }

          var reg2 = /UPPER\(N?'(.*)'\)$/i;
          var match2 = part.expr.match(reg2);

          if (match2 && match2.length >= 2) {
            value = "'" + match2[1] + "'"; //'%#0#%'
          } else {
            return null;
          }

          part.expr = part.expr.replace(/^UPPER\((.*)\)\s+/i, fieldName + ' ');
          part.expr = part.expr.replace(/UPPER\(N?'(.*)'\)$/i, value);
          part.caseSensitive = false;
          //return part;
        }
        else{
          var regCaseSensitive = /^(.+)(\s+|\s+NOT\s+)LIKE\s+N?'(.*)'$/i;
          if(regCaseSensitive.test(part.expr)){
            part.caseSensitive = true;
            //return part;
          }
        }
      } catch (e) {
        console.log(e);
        return null;
      }

      if(part){
        if(this.isHosted){
          part.caseSensitive = false;
        }
      }

      return part;
    },

    _removeOperator: function(shortType, str, operatorSize) {
      //PR 8530
      var timestamp = "timestamp ";
      str = str.substring(operatorSize).trim();  // remove operator

      // Remove "timestamp" flag for non-hosted sources
      if (shortType === "date" && !this.isHosted && str.toLowerCase().startsWith(timestamp)) {
        // timestamp '2014-01-01'
        str = str.substring(timestamp.length).trim();
      }

      return str;
    },

    parseSingleExpr: function(part){
      //code for wab, try handle with case sensitive
      //samples: {expr: "UPPER(CITY_NAME) LIKE UPPER('%#0#%')"}
      //start
      var parsedPart = this._preParseSingleExpr(part);
      if(parsedPart){
        part = lang.mixin(part, parsedPart);
      }
      //end

      // part: {expr: "<str>"}
      // {"expr":"CITY_NAME = '#0#'"}
      // {"expr": "CITY_NAME LIKE '%#0#%'"}
      var str = part.expr.trim();
      var pos = str.indexOf(" ");
      var fieldName = str.substring(0, pos);
      part.fieldObj = {
        name: fieldName
      };
      part.valueObj = {};// value, value1, value2, type, period
      this.getFieldItemByName({
        name: fieldName
      }, function(item){
        part.fieldObj.shortType = item.shortType[0];
        part.fieldObj.label = item.label[0];
      }, function(){
        part.error = {
          msg: "unknown field name (" + fieldName + ")",
          code: 1
        };
      });
      str = str.substring(pos + 1).trim();
      var lStr = str.toLowerCase();

      if (lStr.startsWith("= ")) {
        str = this._removeOperator(part.fieldObj.shortType, str, "= ".length);

        this.storeValue(str, part);//this.storeValue(str.substring(2).trim(), part);
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsOn;
        } else if (part.fieldObj.shortType === "string") {
          part.operator = this.OPERATORS.stringOperatorIs;
        } else { // number
          part.operator = this.OPERATORS.numberOperatorIs;
        }

      } else if (lStr.startsWith("< ")) {
        str = this._removeOperator(part.fieldObj.shortType, str, "< ".length);

        this.storeValue(str, part);//this.storeValue(str.substring(2).trim(), part);
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsBefore;
        } else if (part.fieldObj.shortType === "number") {
          part.operator = this.OPERATORS.numberOperatorIsLessThan;
        } else {
          part.error = {
            msg: "operator (" + lStr + ") not supported for string",
            code: 3
          };
        }

      } else if (lStr.startsWith("> ")) {
        str = this._removeOperator(part.fieldObj.shortType, str, "> ".length);

        this.storeValue(str, part);//this.storeValue(str.substring(2).trim(), part);
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsAfter;
        } else if (part.fieldObj.shortType === "number") {
          part.operator = this.OPERATORS.numberOperatorIsGreaterThan;
        } else {
          part.error = {
            msg: "operator (" + lStr + ") not supported for string",
            code: 3
          };
        }

      } else if (lStr.startsWith("<> ")) {
        str = this._removeOperator(part.fieldObj.shortType, str, "<> ".length);

        this.storeValue(str, part);//this.storeValue(str.substring(3).trim(), part);
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsNotOn;
        } else if (part.fieldObj.shortType === "string") {
          part.operator = this.OPERATORS.stringOperatorIsNot;
        } else { // number
          part.operator = this.OPERATORS.numberOperatorIsNot;
        }

      } else if (lStr.startsWith("<= ")) {
        str = this._removeOperator(part.fieldObj.shortType, str, "<= ".length);

        this.storeValue(str, part);
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsOnOrBefore;
        } else if (part.fieldObj.shortType === "number") {
          part.operator = this.OPERATORS.numberOperatorIsAtMost;
        } else {
          part.error = {
            msg: "operator (" + lStr + ") not supported for string",
            code: 3
          };
        }

      } else if (lStr.startsWith(">= ")) {
        str = this._removeOperator(part.fieldObj.shortType, str, ">= ".length);

        this.storeValue(str, part);
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsOnOrAfter;
        } else if (part.fieldObj.shortType === "number") {
          part.operator = this.OPERATORS.numberOperatorIsAtLeast;
        } else {
          part.error = {
            msg: "operator (" + lStr + ") not supported for string",
            code: 3
          };
        }

      } else if (lStr.startsWith("like ")) {

        // only string fields
        str = str.substring(5).trim();
        if (str.startsWith('N\'')) {
          str = str.substring(1, str.length);
        }
        if (str.startsWith('\'%') && str.endsWith('%\'')) {
          this.storeValue(str.substring(2, str.length - 2), part);
          part.operator = this.OPERATORS.stringOperatorContains;
        } else if (str.startsWith('\'%') && str.endsWith('\'')) {
          this.storeValue(str.substring(2, str.length - 1), part);
          part.operator = this.OPERATORS.stringOperatorEndsWith;
        } else if (str.startsWith('\'') && str.endsWith('%\'')) {
          this.storeValue(str.substring(1, str.length - 2), part);
          part.operator = this.OPERATORS.stringOperatorStartsWith;
        } else {
          part.error = {
            msg: "value (" + lStr + ") not supported for LIKE",
            code: 3
          };
        }

      } else if (lStr.startsWith("not like ")) {

        // only string fields
        str = str.substring(9).trim();
        if (str.startsWith('N\'')) {
          str = str.substring(1, str.length);
        }
        if (str.startsWith('\'%') && str.endsWith('%\'')) {
          //this.storeValue(str.substring(1, str.length - 2), part);
          this.storeValue(str.substring(2, str.length - 2), part);
          part.operator = this.OPERATORS.stringOperatorDoesNotContain;
        } else {
          part.error = {
            msg: "value (" + lStr + ") not supported for NOT LIKE",
            code: 3
          };
        }

      } else if (lStr.startsWith("between ")) {
        this._updatePartForBetween(str, true, part);

      } else if (lStr.startsWith("not between ")) {
        this._updatePartForBetween(str, false, part);

      } else if (lStr === "is null") {

        part.valueObj.value = null;
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsBlank;
        } else if (part.fieldObj.shortType === "string") {
          part.operator = this.OPERATORS.stringOperatorIsBlank;
        } else { // number
          part.operator = this.OPERATORS.numberOperatorIsBlank;
        }

      } else if (lStr === "is not null") {

        part.valueObj.value = null;
        if (part.fieldObj.shortType === "date") {
          part.operator = this.OPERATORS.dateOperatorIsNotBlank;
        } else if (part.fieldObj.shortType === "string") {
          part.operator = this.OPERATORS.stringOperatorIsNotBlank;
        } else { // number
          part.operator = this.OPERATORS.numberOperatorIsNotBlank;
        }

      } else {
        part.error = {
          msg: "unknown operator (" + lStr + ")",
          code: 2
        };
      }

      if ((esriLang.isDefined(part.valueObj.value) && (typeof part.valueObj.value === "string") &&
        part.valueObj.value.startsWith("{") && part.valueObj.value.endsWith("}")) ||
      (esriLang.isDefined(part.valueObj.value1) && (typeof part.valueObj.value1 === "string") &&
        part.valueObj.value1.startsWith("{") && part.valueObj.value1.endsWith("}"))) {
        // value2 is same as value1, we don't need to check
        part.isInteractive = true;
      }

      // {
      //   "expr": "CITY_NAME LIKE '#0#%'",
      //   "fieldObj": {
      //     "name": "CITY_NAME",
      //     "shortType": "string",
      //     "label": "CITY_NAME"
      //   },
      //   "valueObj": {
      //     "value": "#0#"
      //   },
      //   "operator": "stringOperatorStartsWith"
      // }
    },

    getFieldItemByName: function(query, handler, errorHandler){
      this.fieldsStore.fetch({
        query: query,
        onComplete: lang.hitch(this, function(items){
          if (items && items.length) {
            handler(items[0]);
          } else {
            errorHandler();
          }
        })
      });
    },

    subtractDay: function(date){
      return new Date(date.getTime() - this.dayInMS);
    },

    /**
     * Parses a single BETWEEN or NOT BETWEEN expression.
     * @param {string} str Expression to parse
     * @param {boolean} isBetween Indicates if expression to be handled as BETWEEN (true) or NOT BETWEEN (false)
     * @param {object} part Parsed expression; input uses part.fieldObj.shortType; output produces part.operator,
     * part.valueObj, part.error
     */
    _updatePartForBetween: function (str, isBetween, part) {
      // Supported cases:
      // ["NOT "] "BETWEEN <number> AND <number>"
      // ["NOT "] "BETWEEN <param> AND <param>"  parameterized
      // ["NOT "] "BETWEEN <datestring> AND <datestring>"  not hosted
      // ["NOT "] "BETWEEN timestamp <datestring> AND timestamp <datestring>"  hosted
      // ["NOT "] "BETWEEN CURRENT_TIMESTAMP - <number> AND CURRENT_TIMESTAMP"
      var pos, left, right, rangeType, testRangeCount, rangeCount, epsilon = 0.0001,
        betweenPrefix = isBetween ? "between " : "not between ";

      // Remove "between " (isBetween true) or "not between" (otherwise) and, if present, "timestamp " from beginning
      str = this._removeOperator(part.fieldObj.shortType, str, betweenPrefix.length);

      // "AND" separator is required
      pos = str.toLowerCase().indexOf(" and ");
      if (pos > -1) {
        left = str.substring(0, pos).trim();

        // Pull out "in the last..." operator
        if (left.startsWith("CURRENT_TIMESTAMP ")) {
          left = left.substring("CURRENT_TIMESTAMP ".length).trim();
          if (left.startsWith("-")) {
            part.operator = isBetween ? this.OPERATORS.dateOperatorInTheLast : this.OPERATORS.dateOperatorNotInTheLast;
            try {
              // Guess rangeType by finding integer number of range units. Can't tell difference between 1 month and
              // 30 days, however, or 1 year and 365 days.
              rangeCount = parseFloat(left.substring(1).trim());

              if (rangeCount >= 1) {
                // days, weeks, months, years
                rangeType = this.OPERATORS.dateOperatorDays;
                testRangeCount = rangeCount / 365;
                if (Math.abs(testRangeCount - Math.round(testRangeCount)) < epsilon) {
                  rangeCount = Math.round(testRangeCount);
                  rangeType = this.OPERATORS.dateOperatorYears;
                } else {
                  testRangeCount = rangeCount / 30;
                  if (Math.abs(testRangeCount - Math.round(testRangeCount)) < epsilon) {
                    rangeCount = Math.round(testRangeCount);
                    rangeType = this.OPERATORS.dateOperatorMonths;
                  } else {
                    testRangeCount = rangeCount / 7;
                    if (Math.abs(testRangeCount - Math.round(testRangeCount)) < epsilon) {
                      rangeCount = Math.round(testRangeCount);
                      rangeType = this.OPERATORS.dateOperatorWeeks;
                    }
                  }
                }
              } else {
                // hours, minutes
                rangeType = this.OPERATORS.dateOperatorMinutes;
                rangeCount *= 24;
                if (Math.abs(rangeCount - Math.round(rangeCount)) < epsilon) {
                  rangeType = this.OPERATORS.dateOperatorHours;
                } else {
                  rangeCount *= 60;
                }
              }

              part.valueObj.value = rangeCount;
              part.valueObj.range = rangeType;
            } catch (ignore) {
              part.error = {
                msg: "missing count for '" + (isBetween ? "" : "not ") + "in the last'",
                code: 3
              };
            }
          } else {
            part.error = {
              msg: "'" + (isBetween ? "" : "not ") + "in the next' not supported",
              code: 3
            };
          }

        } else {
          // Remove " and " and, if present, "timestamp " from beginning of part after AND
          right = this._removeOperator(part.fieldObj.shortType, str.substring(pos), " and ".length);

          this.storeValue1(left, part);
          this.storeValue2(right, part);

          if (part.fieldObj.shortType === "date") {
            part.operator = isBetween ? this.OPERATORS.dateOperatorIsBetween : this.OPERATORS.dateOperatorIsNotBetween;

            // Check for case where values are Dates 24 hours apart--they're used as a range for "on"
            if (typeof part.valueObj.value1 === "object" && typeof part.valueObj.value2 === "object") {
              try {
                if (Math.abs(this.subtractDay(part.valueObj.value2).getTime() -
                                              part.valueObj.value1.getTime()) < 1000) {
                  part.valueObj.value = part.valueObj.value1;
                  delete part.valueObj.value1;
                  delete part.valueObj.value2;
                  part.operator = isBetween ? this.OPERATORS.dateOperatorIsOn : this.OPERATORS.dateOperatorIsNotOn;
                }
              } catch (ignore) {
              }
            }
          } else if (part.fieldObj.shortType === "number" || part.fieldObj.shortType === "oid") {
            part.operator =
              isBetween ? this.OPERATORS.numberOperatorIsBetween : this.OPERATORS.numberOperatorIsNotBetween;
          } else {
            part.error = {
              msg: part.fieldObj.shortType + " field not supported for " + (isBetween ? "" : "NOT ") + "BETWEEN",
              code: 3
            };
          }
        }

      } else {
        part.error = {
          msg: "missing AND operator for " + (isBetween ? "" : "NOT ") + "BETWEEN",
          code: 3
        };
      }
    },

    storeValue: function(str, part){

      if (str.startsWith('{') && str.endsWith('}')) {
        // interactive placeholder
        part.valueObj.value = str;
      } else if (str.startsWith('\'{') && str.endsWith('}\'')) {
        // interactive placeholder
        part.valueObj.value = str.substring(1, str.length - 1);
      } else if (part.fieldObj.shortType === "date") {
        if (str.startsWith('\'') && str.endsWith('\'')) {
          var dateStr = str.substring(1, str.length - 1);
          part.valueObj.value = this.parseDate(dateStr);
          //console.log("dateStr "+dateStr+" to Date "+part.valueObj.value.toString());
        } else {
          part.valueObj.value = str;
          part.valueObj.type = 'field';
        }
      } else if (part.fieldObj.shortType === "string") {
        if ((str.startsWith('#') || str.startsWith('%#')) &&
            (str.endsWith('#') || str.endsWith('#%'))) {
          part.valueObj.value = str;
        } else if (str.startsWith('\'') && str.endsWith('\'')) {
          part.valueObj.value = str.substring(1, str.length - 1).replace(/\'\'/g, "'");
        } else {
          part.valueObj.value = str;
          part.valueObj.type = 'field';
          this.getFieldItemByName({
            name: str
          }, function(item){
            part.valueObj.label = item.label[0];
          }, function(){
            part.error = {
              msg: "unknown field name (" + str + ")",
              code: 1
            };
          });
        }
      } else { // number
        part.valueObj.value = str;
        if (isNaN(str)) {
          part.valueObj.type = 'field';
          this.getFieldItemByName({
            name: str
          }, function(item){
            part.valueObj.label = item.label[0];
          }, function(){
            part.error = {
              msg: "unknown field name (" + str + ")",
              code: 1
            };
          });
        }
      }
    },

    storeValue1: function(str, part){
      // not for string fields

      if (str.startsWith('{') && str.endsWith('}')) {
        // interactive placeholder
        part.valueObj.value1 = str;
      } else if (str.startsWith('\'{') && str.endsWith('}\'')) {
        // interactive placeholder
        part.valueObj.value1 = str.substring(1, str.length - 1);
      } else if (part.fieldObj.shortType === "date") {
        if (str.startsWith('\'') && str.endsWith('\'')) {
          var dateStr = str.substring(1, str.length - 1);
          part.valueObj.value1 = this.parseDate(dateStr);
          //console.log("dateStr "+dateStr+" to Date "+part.valueObj.value.toString());
        } else {
          part.valueObj.value1 = str;
          part.valueObj.type = 'field';
        }
      } else { // number
        part.valueObj.value1 = str;
        if (isNaN(str)) {
          part.valueObj.type = 'field';
        }
      }
    },

    storeValue2: function(str, part){
      // not for string fields

      if (str.startsWith('{') && str.endsWith('}')) {
        // interactive placeholder
        part.valueObj.value2 = str;
      } else if (str.startsWith('\'{') && str.endsWith('}\'')) {
        // interactive placeholder
        part.valueObj.value2 = str.substring(1, str.length - 1);
      } else if (part.fieldObj.shortType === "date") {
        if (str.startsWith('\'') && str.endsWith('\'')) {
          var dateStr = str.substring(1, str.length - 1);
          part.valueObj.value2 = this.parseDate(dateStr);
          //console.log("dateStr "+dateStr+" to Date "+part.valueObj.value.toString());
        } else {
          part.valueObj.value2 = str;
          part.valueObj.type = 'field';
        }
      } else { // number
        part.valueObj.value2 = str;
        if (isNaN(str)) {
          part.valueObj.type = 'field';
        }
      }
    },

    parseDate: function(strValue){
      // we know strValue looks like this 'yyyy-MM-dd HH:mm:ss' (e.g. '2013-03-01 00:00:00')
      // some locals (e.g. en) expect a comma after the date like this '2013-03-01, 00:00:00'
      // de, e.g., does not use a comma like this '2013-03-01 00:00:00'
      // el, e.g., uses a dash like this '2013-03-01 - 00:00:00'
      // looked up in dojo/cldr/nls/<locale>/gregorian.js
      var date = locale.parse(strValue, {
        datePattern: "yyyy-MM-dd",
        timePattern: "HH:mm:ss"
      });
      if (!date) {
        date = locale.parse(strValue.replace(" ", ", "), {
          datePattern: "yyyy-MM-dd",
          timePattern: "HH:mm:ss"
        });
        if (!date) {
          date = locale.parse(strValue.replace(" ", " - "), {
            datePattern: "yyyy-MM-dd",
            timePattern: "HH:mm:ss"
          });
        }
      }
      return date;
    }
  });

  return clazz;
});