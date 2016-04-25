///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
  'dojo/text!./templates/_SingleFilterParameter.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/store/Memory',
  'jimu/utils',
  'dijit/form/FilteringSelect',
  'dijit/form/ValidationTextBox',
  'dijit/form/DateTextBox',
  'dijit/form/NumberTextBox'
],
  function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template,
    lang, html, array, Memory, jimuUtils) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-single-filter-parameter',
      templateString: template,
      fieldInfo:null,
      part:null,
      nls:null,
      OPERATORS: null,
      url: null,

      _type:-1,

      //public methods:
      //getValueObj

      postCreate:function(){
        this.inherited(arguments);

        var strStore = new Memory({idProperty:'id', data:[]});
        this.stringUniqueValuesSelect.set('store', strStore);

        var numberStore = new Memory({idProperty:'id', data:[]});
        this.numberUniqueValuesSelect.set('store', numberStore);

        if(this.fieldInfo && this.part){
          this.build(this.fieldInfo, this.part);
        }
      },

      getValueObj:function(){
        var newValueObj = null;
        var shortType = this.part.fieldObj.shortType;

        if(shortType === 'string'){
          newValueObj = this._getStirngValueObj();
        }
        else if(shortType === 'number'){
          newValueObj = this._getNumberValueObj();
        }
        else if(shortType === 'date'){
          newValueObj = this._getDateValueObj();
        }

        if(newValueObj){
          newValueObj.type = this.part.valueObj.type;
          newValueObj.isValid = true;
        }

        return newValueObj;
      },

      _getStirngValueObj:function(){
        var valueObj = null;
        if(this._type === 1){
          if(!this.stringTextBox.validate()){
            this._showValidationErrorTip(this.stringTextBox);
            return null;
          }
          valueObj = {};
          valueObj.value = this.stringTextBox.get('value');
        }
        else if(this._type === 2){
          if (!this.stringCodedValuesFS.validate()) {
            this._showValidationErrorTip(this.stringCodedValuesFS);
            return null;
          }
          valueObj = {};
          var stirngCodedItem = this._getSelectedFilteringItem(this.stringCodedValuesFS);
          valueObj.value = stirngCodedItem.code;
        }
        else if(this._type === 3){
          if(!this.stringUniqueValuesSelect.validate()){
            this._showValidationErrorTip(this.stringUniqueValuesSelect);
            return null;
          }
          valueObj = {};
          var uniqueItem = this._getSelectedFilteringItem(this.stringUniqueValuesSelect);
          valueObj.value = uniqueItem.value;
        }
        return valueObj;
      },

      _getNumberValueObj:function(){
        var valueObj = null;
        if(this._type === 1){
          if(!this.numberTextBox.validate()){
            this._showValidationErrorTip(this.numberTextBox);
            return null;
          }
          valueObj = {};
          valueObj.value = parseFloat(this.numberTextBox.get('value'));
        }
        else if(this._type === 2){
          if (!this.numberCodedValuesFS.validate()) {
            this._showValidationErrorTip(this.numberCodedValuesFS);
            return null;
          }
          valueObj = {};
          var numberCodedItem = this._getSelectedFilteringItem(this.numberCodedValuesFS);
          valueObj.value = parseFloat(numberCodedItem.code);
        }
        else if(this._type === 3){
          if(!this.numberTextBox1.validate()){
            this._showValidationErrorTip(this.numberTextBox1);
            return null;
          }
          if(!this.numberTextBox2.validate()){
            this._showValidationErrorTip(this.numberTextBox2);
            return null;
          }
          valueObj = {};
          valueObj.value1 = parseFloat(this.numberTextBox1.get('value'));
          valueObj.value2 = parseFloat(this.numberTextBox2.get('value'));
        }
        else if(this._type === 4){
          if(!this.numberUniqueValuesSelect.validate()){
            this._showValidationErrorTip(this.numberUniqueValuesSelect);
            return null;
          }
          valueObj = {};
          var uniqueItem = this.numberUniqueValuesSelect.get('item');
          valueObj.value = parseFloat(uniqueItem.value);
        }
        return valueObj;
      },

      _getDateValueObj:function(){
        var valueObj = null;
        if(this._type === 1){
          if (!this.dateTextBox.validate()) {
            this._showValidationErrorTip(this.dateTextBox);
            return null;
          }
          valueObj = {};
          valueObj.value = this.dateTextBox.get('value').toDateString();
        }
        else if(this._type === 2){
          if (!this.dateTextBox1.validate()) {
            this._showValidationErrorTip(this.dateTextBox1);
            return null;
          }
          if (!this.dateTextBox2.validate()) {
            this._showValidationErrorTip(this.dateTextBox2);
            return null;
          }
          valueObj = {};
          valueObj.value1 = this.dateTextBox1.get('value').toDateString();
          valueObj.value2 = this.dateTextBox2.get('value').toDateString();
        }
        return valueObj;
      },

      build:function(fieldInfo, part){
        this.fieldInfo = fieldInfo;
        this.part = part;
        var interactiveObj = part.interactiveObj;

        if(interactiveObj){
          this.promptNode.innerHTML = interactiveObj.prompt || '';
          this.hintNode.innerHTML = interactiveObj.hint || '';
        }

        var shortType = this.part.fieldObj.shortType;

        if(shortType === 'string'){
          this._buildString(fieldInfo, this.part);
        }
        else if(shortType === 'number'){
          this._buildNumber(fieldInfo, this.part);
        }
        else if(shortType === 'date'){
          this._buildDate(fieldInfo, this.part);
        }
      },

      _getCodedValues:function(fieldInfo){
        var codedValues = null;
        var domain = fieldInfo.domain;
        if(domain && domain.type === 'codedValue'){
          if(domain.codedValues && domain.codedValues.length > 0){
            codedValues = domain.codedValues;
          }
        }
        return codedValues;
      },

      _buildString: function(fieldInfo, part) {
        /*jshint unused: false*/
        html.setStyle(this.stringTextBoxContainer, 'display', 'block');
        html.setStyle(this.numberTextBoxContainer, 'display', 'none');
        html.setStyle(this.dateTextBoxContainer, 'display', 'none');

        this._hideDijit(this.stringTextBox);
        this._hideDijit(this.stringCodedValuesFS);
        this._hideDijit(this.stringUniqueValuesSelect);

        var fieldObj = part.fieldObj;//name,shortType
        var valueObj = part.valueObj;//value,value1,value2
        var radioType = valueObj.type;//'value' or 'unique',not 'field'
        var codedValues = this._getCodedValues(fieldInfo);

        if (codedValues) {
          this._type = 2;
          this._showDijit(this.stringCodedValuesFS);

          var stringCodedData = array.map(codedValues, lang.hitch(this, function(item, index) {
            //item:{name,code},name is the code description and code is code value.
            var dataItem = lang.mixin({}, item);
            dataItem.id = index;
            return dataItem;
          }));
          var stringCodedStore = new Memory({
            data: stringCodedData
          });
          this.stringCodedValuesFS.set('store', stringCodedStore);
          if (valueObj) {
            var stringSelectedItems = array.filter(stringCodedData, lang.hitch(this, function(item){
              return item.code === valueObj.value;
            }));
            if (stringSelectedItems.length > 0) {
              this.stringCodedValuesFS.set('value', stringSelectedItems[0].id);
            } else {
              this.stringCodedValuesFS.set('value', stringCodedData[0].id);
            }
          }
        } else {
          if(radioType === 'unique'){
            this._type = 3;
            this._showDijit(this.stringUniqueValuesSelect);
            jimuUtils.getUniqueValues(this.url, fieldObj.name).then(
              lang.hitch(this, function(values){
              var selectedId = -1;
              //don't select the first value by default, issue #2477
              /*if(values.length > 0){
                selectedId = 0;
              }*/

              var data = array.map(values, lang.hitch(this, function(value, index){
                var label = value;
                if(fieldObj.shortType === 'number'){
                  value = parseFloat(value);
                  label = this._tryLocaleNumber(value);
                }
                var dataItem = {
                  id: index,
                  value: value,
                  label: label
                };

                if(valueObj && valueObj.value === value){
                  selectedId = index;
                }

                return dataItem;
              }));

              this.stringUniqueValuesSelect.store.setData(data);

              if(selectedId >= 0){
                var selectedItem = this.stringUniqueValuesSelect.store.get(selectedId);

                if(selectedItem){
                  this.stringUniqueValuesSelect.set('item', selectedItem);
                }
              }
            }), lang.hitch(this, function(err){
              console.error(err);
            }));
          }
          else{
            this._type = 1;
            this._showDijit(this.stringTextBox);
            this.stringTextBox.set('value', valueObj.value || '');
          }
        }
      },

      _tryLocaleNumber: function(value) {
        var result = jimuUtils.localizeNumber(value);
        if (result === null || result === undefined) {
          result = value;
        }
        return result;
      },

      _buildNumber: function(fieldInfo, part){
        /*jshint unused: false*/
        html.setStyle(this.stringTextBoxContainer, 'display', 'none');
        html.setStyle(this.numberTextBoxContainer, 'display', 'block');
        html.setStyle(this.dateTextBoxContainer, 'display', 'none');

        this._hideDijit(this.numberTextBox);
        this._hideDijit(this.numberCodedValuesFS);
        html.setStyle(this.numberRangeTable, 'display', 'none');
        this._hideDijit(this.numberUniqueValuesSelect);

        var fieldObj = part.fieldObj;//name,shortType
        var valueObj = part.valueObj;//value,value1,value2
        var radioType = valueObj.type;//'value' or 'unique',not 'field'
        var operator = part.operator;
        var isNumBetween = operator === this.OPERATORS.numberOperatorIsBetween;
        var isNumNotBetween = operator === this.OPERATORS.numberOperatorIsNotBetween;

        var isRange = isNumBetween || isNumNotBetween;
        if(isRange){
          this._type = 3;
          html.setStyle(this.numberRangeTable, 'display', 'table');
          if(jimuUtils.isValidNumber(valueObj.value1)){
            this.numberTextBox1.set('value', valueObj.value1);
          }
          if(jimuUtils.isValidNumber(valueObj.value2)){
            this.numberTextBox2.set('value', valueObj.value2);
          }
        }
        else{
          html.setStyle(this.numberRangeTable, 'display', 'none');
          var codedValues = this._getCodedValues(fieldInfo);
          if(codedValues){
            this._type = 2;
            this._showDijit(this.numberCodedValuesFS);
            var numberCodedData = array.map(codedValues, lang.hitch(this, function(item, index){
              //item:{name,code},name is the code description and code is code value.
              var dataItem = lang.clone(item);
              dataItem.id = index;
              return dataItem;
            }));
            var numberCodedStore = new Memory({data:numberCodedData});
            this.numberCodedValuesFS.set('store', numberCodedStore);
            if(valueObj && jimuUtils.isValidNumber(valueObj.value)){
              var number = parseFloat(valueObj.value);
              var numberSelectedItems = array.filter(numberCodedData,
                lang.hitch(this, function(item){
                return parseFloat(item.code) === number;
              }));
              if(numberSelectedItems.length > 0){
                this.numberCodedValuesFS.set('value', numberSelectedItems[0].id);
              }
              else{
                this.numberCodedValuesFS.set('value', numberCodedData[0].id);
              }
            }
            else{
              this.numberCodedValuesFS.set('value', numberCodedData[0].id);
            }
          }
          else{
            if(radioType === 'unique'){
              this._type = 4;
              this._showDijit(this.numberUniqueValuesSelect);
              jimuUtils.getUniqueValues(this.url, fieldObj.name).then(
                lang.hitch(this, function(values){
                var selectedId = -1;
                //don't select the first value by default, issue #2477
                /*if(values.length > 0){
                  selectedId = 0;
                }*/

                var data = array.map(values, lang.hitch(this, function(value, index){
                  var label = value;

                  if(fieldObj.shortType === 'number'){
                    value = parseFloat(value);
                    label = this._tryLocaleNumber(value);
                  }

                  var dataItem = {
                    id: index,
                    value: value,
                    label: label
                  };

                  if(valueObj && valueObj.value === value){
                    selectedId = index;
                  }

                  return dataItem;
                }));

                this.numberUniqueValuesSelect.store.setData(data);

                if(selectedId >= 0){
                  var selectedItem = this.numberUniqueValuesSelect.store.get(selectedId);

                  if(selectedItem){
                    this.numberUniqueValuesSelect.set('item', selectedItem);
                  }
                }
              }), lang.hitch(this, function(err){
                console.error(err);
              }));
            }
            else{
              this._type = 1;
              this._showDijit(this.numberTextBox);
              if(valueObj && jimuUtils.isValidNumber(valueObj.value)){
                this.numberTextBox.set('value', valueObj.value);
              }
            }
          }
        }
      },

      _buildDate: function(fieldInfo, part){
        /*jshint unused: false*/
        html.setStyle(this.stringTextBoxContainer, 'display', 'none');
        html.setStyle(this.numberTextBoxContainer, 'display', 'none');
        html.setStyle(this.dateTextBoxContainer, 'display', 'block');

        var fieldObj = part.fieldObj;//name,shortType
        var valueObj = part.valueObj;//value,value1,value2
        var operator = part.operator;
        var isDateBetween = operator === this.OPERATORS.dateOperatorIsBetween;
        var isDateNotBetween = operator === this.OPERATORS.dateOperatorIsNotBetween;
        var isRange = isDateBetween || isDateNotBetween;
        if(isRange){
          this._type = 2;
          html.setStyle(this.dateRangeTable, 'display', 'table');
          this._hideDijit(this.dateTextBox);
          this.dateTextBox1.set('value', new Date(valueObj.value1));
          this.dateTextBox2.set('value', new Date(valueObj.value2));
        }
        else{
          this._type = 1;
          html.setStyle(this.dateRangeTable, 'display', 'none');
          this._showDijit(this.dateTextBox);
          this.dateTextBox.set('value', new Date(valueObj.value));
        }
      },

      _getSelectedFilteringItem:function(_select){
        if(_select.validate()){
          var item = _select.get('item');
          if(item){
            return item;
          }
          else{
            this._showValidationErrorTip(_select);
          }
        }
        else{
          this._showValidationErrorTip(_select);
        }
        return null;
      },

      _showValidationErrorTip:function(_dijit){
        if(!_dijit.validate() && _dijit.domNode){
          if(_dijit.focusNode){
            _dijit.focusNode.focus();
            _dijit.focusNode.blur();
          }
        }
      },

      _showDijit:function(_dijit){
        if(_dijit && _dijit.domNode){
          html.setStyle(_dijit.domNode, 'display', 'inline-block');
        }
      },

      _hideDijit:function(_dijit){
        if(_dijit && _dijit.domNode){
          html.setStyle(_dijit.domNode, 'display', 'none');
        }
      },

      _onRangeNumberBlur:function(){
        if(this.numberTextBox1.validate() && this.numberTextBox2.validate()){
          var value1 = parseFloat(this.numberTextBox1.get('value'));
          var value2 = parseFloat(this.numberTextBox2.get('value'));
          if(value1 > value2){
            this.numberTextBox1.set('value', value2);
            this.numberTextBox2.set('value', value1);
          }
        }
      },

      _onRangeDateBlur:function(){
        if(this.dateTextBox1.validate() && this.dateTextBox2.validate()){
          var date1 = this.dateTextBox1.get('value');
          var time1 = date1.getTime();
          var date2 = this.dateTextBox2.get('value');
          var time2 = date2.getTime();
          if(time1 > time2){
            this.dateTextBox1.set('value', date2);
            this.dateTextBox2.set('value', date1);
          }
        }
      }

    });
  });