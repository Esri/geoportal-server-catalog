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
  'dojo/text!./templates/_SingleFilter.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/json',
  'dojo/on',
  'dojo/store/Memory',
  'esri/request',
  'jimu/utils',
  'jimu/dijit/CheckBox',
  'dijit/form/Select',
  'dijit/form/FilteringSelect',
  'dijit/form/ValidationTextBox',
  'dijit/form/DateTextBox',
  'dijit/form/NumberTextBox'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang,
  html, array, json, on, Memory, esriRequest, jimuUtils) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString:template,
    baseClass: 'jimu-single-filter',
    declaredClass: 'jimu.dijit._SingleFilter',
    nls: null,
    url: null,
    layerInfo: null,
    stringFieldType: '',
    dateFieldType: '',
    numberFieldTypes: [],
    supportFieldTypes: [],
    part: null,
    OPERATORS: null,
    enableAskForValues: false,
    isHosted: false,

    postMixInProperties:function(){
      this.supportFieldTypes = [];
      this.supportFieldTypes.push(this.stringFieldType);
      this.supportFieldTypes.push(this.dateFieldType);
      this.supportFieldTypes = this.supportFieldTypes.concat(this.numberFieldTypes);
      this.nls = window.jimuNls.filterBuilder;
      if(!this.nls.caseSensitive){
        this.nls.caseSensitive = "Case Sensitive";
      }
    },

    postCreate:function(){
      this.inherited(arguments);
      this._initSelf();
    },

    toJson:function(){
      var part = null;
      var isUseAskForvalues = this._isUseAskForValues();
      var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
      if(!fieldInfo){
        return null;
      }
      part = {
        fieldObj:'',
        operator:'',
        valueObj:'',
        interactiveObj:'',
        caseSensitive: false
      };
      if(isUseAskForvalues){
        //prompt is required and hint is optional
        if(!this.promptTB.validate()){
          this._showValidationErrorTip(this.promptTB);
          return null;
        }
        part.interactiveObj = {
          prompt: this.promptTB.get('value'),
          hint: this.hintTB.get('value')
        };
      }
      part.fieldObj = {
        name:fieldInfo.name,
        label:fieldInfo.name,
        shortType:fieldInfo.shortType,
        type:fieldInfo.type
      };
      if(this.operatorsSelect.get('value') === 'none'){
        return null;
      }
      part.operator = this.operatorsSelect.get('value');
      part.valueObj = {
        isValid:true,
        type: ''
      };
      var shortType = fieldInfo.shortType;
      if(this.valueRadio.checked){
        part.valueObj.type = 'value';
        if(shortType === 'string'){
          if(part.operator === this.OPERATORS.stringOperatorIsBlank ||
             part.operator === this.OPERATORS.stringOperatorIsNotBlank){
            part.valueObj.value = null;
          }
          else{
            if(this._isFieldCoded(fieldInfo) && part.operator === this.OPERATORS.stringOperatorIs){
              if(!this.stringCodedValuesFS.validate()){
                this._showValidationErrorTip(this.stringCodedValuesFS);
                return null;
              }
              //stirngCodedItem maybe null
              var stirngCodedItem = this._getSelectedFilteringItem(this.stringCodedValuesFS);
              if(stirngCodedItem){
                part.valueObj.value = stirngCodedItem.code;
              }else{
                part.valueObj.value = "";
              }
            }
            else{
              if(!this.stringTextBox.validate()){
                this._showValidationErrorTip(this.stringTextBox);
                return null;
              }
              part.valueObj.value = this.stringTextBox.get('value');
            }
          }
        }
        else if(shortType === 'number'){
          if(part.operator === this.OPERATORS.numberOperatorIsBlank ||
             part.operator === this.OPERATORS.numberOperatorIsNotBlank){
            part.valueObj.value = null;
          }
          else if(part.operator === this.OPERATORS.numberOperatorIsBetween ||
                  part.operator === this.OPERATORS.numberOperatorIsNotBetween){
            if(!this.numberTextBox1.validate()){
              this._showValidationErrorTip(this.numberTextBox1);
              return null;
            }
            if(!this.numberTextBox2.validate()){
              this._showValidationErrorTip(this.numberTextBox2);
              return null;
            }
            part.valueObj.value1 = this._getValueForNumberTextBox(this.numberTextBox1);
            part.valueObj.value2 = this._getValueForNumberTextBox(this.numberTextBox2);
            part.valueObj.isValid = jimuUtils.isValidNumber(part.valueObj.value1) &&
                                    jimuUtils.isValidNumber(part.valueObj.value2);
          }
          else{
            if(this._isFieldCoded(fieldInfo) && part.operator === this.OPERATORS.numberOperatorIs){
              if(!this.numberCodedValuesFS.validate()){
                this._showValidationErrorTip(this.numberCodedValuesFS);
                return null;
              }
              //numberCodedItem maybe null
              var numberCodedItem = this._getSelectedFilteringItem(this.numberCodedValuesFS);
              if(numberCodedItem){
                part.valueObj.value = parseFloat(numberCodedItem.code);
              }else{
                part.valueObj.value = null;
              }
            }
            else{
              if(!this.numberTextBox.validate()){
                this._showValidationErrorTip(this.numberTextBox);
                return null;
              }
              part.valueObj.value = this._getValueForNumberTextBox(this.numberTextBox);
            }
            part.valueObj.isValid = jimuUtils.isValidNumber(part.valueObj.value);
          }
        }
        else if(shortType === 'date'){
          if(part.operator === this.OPERATORS.dateOperatorIsBlank ||
             part.operator === this.OPERATORS.dateOperatorIsNotBlank){
            part.valueObj.value = null;
          }
          else if(part.operator === this.OPERATORS.dateOperatorIsBetween ||
                  part.operator === this.OPERATORS.dateOperatorIsNotBetween){
            if(!this.dateTextBox1.validate()){
              this._showValidationErrorTip(this.dateTextBox1);
              return null;
            }
            if(!this.dateTextBox2.validate()){
              this._showValidationErrorTip(this.dateTextBox2);
              return null;
            }
            part.valueObj.value1 = this.dateTextBox1.get('value').toDateString();
            part.valueObj.value2 = this.dateTextBox2.get('value').toDateString();
          }
          else{
            if(!this.dateTextBox.validate()){
              this._showValidationErrorTip(this.dateTextBox);
              return null;
            }
            part.valueObj.value = this.dateTextBox.get('value').toDateString();
          }
        }
      }
      else if(this.fieldRadio.checked){
        var fieldInfo2 = this._getSelectedFilteringItem(this.fieldsSelect2);
        if(!fieldInfo2){
          this._showValidationErrorTip(this.fieldsSelect2);
          return null;
        }
        part.valueObj.value = fieldInfo2.name;
        part.valueObj.label = fieldInfo2.name;
        part.valueObj.type = 'field';
      }
      else if(this.uniqueRadio && this.uniqueRadio.checked){
        part.valueObj.type = 'unique';
        var uniqueItem = this._getSelectedFilteringItem(this.uniqueValuesSelect);

        /*if(!uniqueItem){
          this._showValidationErrorTip(this.uniqueValuesSelect);
          return null;
        }*/

        if(uniqueItem){
          if(shortType === 'string'){
            part.valueObj.value = uniqueItem.value;
          }
          else if(shortType === 'number'){
            part.valueObj.value = parseFloat(uniqueItem.value);
          }
        }else{
          if(isUseAskForvalues){
            if(shortType === 'string'){
              part.valueObj.value = "";
            }else if(shortType === 'number'){
              part.valueObj.value = null;
              part.valueObj.isValid = false;
            }
          }else{
            this._showValidationErrorTip(this.uniqueValuesSelect);
            return null;
          }
        }
      }

      //handle with case sensitive
      if (shortType === 'string') {
        switch (part.operator) {
        case this.OPERATORS.stringOperatorStartsWith:
        case this.OPERATORS.stringOperatorEndsWith:
        case this.OPERATORS.stringOperatorContains:
        case this.OPERATORS.stringOperatorDoesNotContain:
          part.caseSensitive = this.cbxCaseSensitive.getValue();
          break;
        default:
          break;
        }
      }

      return part;
    },

    showDelteIcon:function(){
      html.setStyle(this.btnDelete, 'display', 'inline-block');
    },

    hideDeleteIcon:function(){
      html.setStyle(this.btnDelete, 'display', 'none');
    },

    _showCaseSensitive: function(){
      html.setStyle(this.cbxCaseSensitive.domNode, 'display', 'inline-block');
    },

    _hideCaseSensitive: function(){
      html.setStyle(this.cbxCaseSensitive.domNode, 'display', 'none');
    },

    _getProcessedString: function(str){
      if(jimuUtils.isNotEmptyString(str, true)){
        return str;
      }
      return "";
    },

    _getProcessedNumber: function(num){
      if(jimuUtils.isValidNumber(num)){
        return num;
      }
      return null;
    },

    _setValueForStringTextBox: function(stringTextBox, str){
      str = this._getProcessedString(str);
      stringTextBox.set('value', str);
    },

    _setValueForNumberTextBox: function(numberTextBox, num){
      if(jimuUtils.isValidNumber(num)){
        numberTextBox.set('value', num);
      }
    },

    _getValueForNumberTextBox: function(numberTextBox){
      var value = numberTextBox.get('value');
      return this._getProcessedNumber(value);
    },

    _initSelf:function(){
      if(this.isHosted){
        this.cbxCaseSensitive.setValue(false);
        this.cbxCaseSensitive.setStatus(false);
        this.cbxCaseSensitive.domNode.title = this.nls.notSupportCaseSensitiveTip;
      }

      this.own(on(this.cbxAskValues,
                  'status-change',
                  lang.hitch(this, this._onCbxAskValuesStatusChanged)));
      this.cbxAskValues.onChange = lang.hitch(this, this._onCbxAskValuesClicked);

      //update title for dijits when mouse enter
      this.own(on(this.fieldsSelect,
                  'MouseEnter',
                  lang.hitch(this, this._updateFieldsSelectTitle)));
      this.own(on(this.operatorsSelect,
                  'MouseEnter',
                  lang.hitch(this, this._updateOperatorsSelectTitle)));
      this.own(on(this.dateTextBox1,
                  'MouseEnter',
                  lang.hitch(this, this._updateDateTextBox1Title)));
      this.own(on(this.dateTextBox2,
                  'MouseEnter',
                  lang.hitch(this, this._updateDateTextBox2Title)));

      var store = new Memory({idProperty:'id', data:[]});
      this.uniqueValuesSelect.set('store', store);

      if(this.enableAskForValues){
        html.setStyle(this.cbxAskValues.domNode, 'display', 'inline-block');
        html.setStyle(this.promptSection, 'display', 'block');
      }
      else{
        html.setStyle(this.cbxAskValues.domNode, 'display', 'none');
        html.setStyle(this.promptSection, 'display', 'none');
      }

      this.layerInfo = lang.mixin({}, this.layerInfo);
      this._initRadios();
      var version = 0;
      if(this.layerInfo.currentVersion){
        version = parseFloat(this.layerInfo.currentVersion);
      }

      //StreamServer doesn't provide API interface to get unique values
      if (version < 10.1 || this._isStreamServer(this.url)) {
        html.destroy(this.uniqueTd);
        this.uniqueRadio = null;
      }
      var fields = this.layerInfo.fields;
      if (fields && fields.length > 0) {
        fields = array.filter(fields, lang.hitch(this, function(fieldInfo) {
          return this.supportFieldTypes.indexOf(fieldInfo.type) >= 0;
        }));
        this._enableRadios();
        this._initFieldsSelect(fields);
      }
    },

    _isStreamServer: function(url){
      url = url || "";
      url = url.replace(/\/*$/g, '');
      var reg = /\/StreamServer$/gi;
      return reg.test(url);
    },

    _updateFieldsSelectTitle: function(){
      this.fieldsSelect.domNode.title = "";
      var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
      if(fieldInfo){
        this.fieldsSelect.domNode.title = fieldInfo.displayName ||
                                          fieldInfo.alias ||
                                          fieldInfo.name;
      }
    },

    _updateOperatorsSelectTitle: function(){
      this.operatorsSelect.domNode.title = "";
      var value = this.operatorsSelect.get('value');
      if(value){
        var option = this.operatorsSelect.getOptions(value);
        this.operatorsSelect.domNode.title = option.label;
      }
    },

    _updateDateTextBox1Title: function(){
      var title = this.dateTextBox1.get('displayedValue') || "";
      this.dateTextBox1.domNode.title = title;
    },

    _updateDateTextBox2Title: function(){
      var title = this.dateTextBox2.get('displayedValue') || "";
      this.dateTextBox2.domNode.title = title;
    },

    _showValidationErrorTip:function(_dijit){
      try{
        if(!_dijit.validate() && _dijit.domNode){
          if(_dijit.focusNode){
            //sometimes throw exception here in IE8
            _dijit.focusNode.focus();
            _dijit.focusNode.blur();
          }
        }
      }
      catch(e){
        console.error(e);
      }
    },

    _focusValidationTextBox:function(_dijit){
      try{
        if(_dijit){
          if(_dijit.focusNode){
            _dijit.focusNode.focus();
          }
        }
      }
      catch(e){
        console.error(e);
      }
    },

    _isFieldCoded:function(fieldInfo){
      var domain = fieldInfo.domain;
      return domain && domain.type === "codedValue" &&
             domain.codedValues && domain.codedValues.length > 0;
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

    _getShortTypeByFieldType:function(fieldType){
      if(fieldType === this.stringFieldType){
        return 'string';
      }
      else if(fieldType === this.dateFieldType){
        return 'date';
      }
      else if(this.numberFieldTypes.indexOf(fieldType) >= 0){
        return 'number';
      }
      return null;
    },

    _getOperatorsByShortType:function(shortType){
      var operators = [];
      if(shortType === 'string'){
        operators = [this.OPERATORS.stringOperatorIs,
        this.OPERATORS.stringOperatorIsNot,
        this.OPERATORS.stringOperatorStartsWith,
        this.OPERATORS.stringOperatorEndsWith,
        this.OPERATORS.stringOperatorContains,
        this.OPERATORS.stringOperatorDoesNotContain,
        this.OPERATORS.stringOperatorIsBlank,
        this.OPERATORS.stringOperatorIsNotBlank];
      }
      else if(shortType === 'number'){
        operators = [this.OPERATORS.numberOperatorIs,
        this.OPERATORS.numberOperatorIsNot,
        this.OPERATORS.numberOperatorIsAtLeast,
        this.OPERATORS.numberOperatorIsLessThan,
        this.OPERATORS.numberOperatorIsAtMost,
        this.OPERATORS.numberOperatorIsGreaterThan,
        this.OPERATORS.numberOperatorIsBetween,
        this.OPERATORS.numberOperatorIsNotBetween,
        this.OPERATORS.numberOperatorIsBlank,
        this.OPERATORS.numberOperatorIsNotBlank];
      }
      else if(shortType === 'date'){
        operators = [this.OPERATORS.dateOperatorIsOn,
        this.OPERATORS.dateOperatorIsNotOn,
        this.OPERATORS.dateOperatorIsBefore,
        this.OPERATORS.dateOperatorIsAfter,
        this.OPERATORS.dateOperatorIsBetween,
        this.OPERATORS.dateOperatorIsNotBetween,
        this.OPERATORS.dateOperatorIsBlank,
        this.OPERATORS.dateOperatorIsNotBlank];
      }
      return operators;
    },

    _initFieldsSelect:function(fieldInfos){
      var data = array.map(fieldInfos, lang.hitch(this, function(fieldInfo, index){
        var item = lang.mixin({}, fieldInfo);
        item.id = index;
        item.shortType = this._getShortTypeByFieldType(fieldInfo.type);
        if(!item.alias){
          item.alias = item.name;
        }
        var a = '';
        if(item.shortType === 'string'){
          a = this.nls.string;
        }
        else if(item.shortType === 'number'){
          a = this.nls.number;
        }
        else if(item.shortType === 'date'){
          a = this.nls.date;
        }
        item.displayName = item.alias + " (" + a + ")";
        return item;
      }));

      if(data.length > 0){
        var store = new Memory({data:data});
        this.fieldsSelect.set('store', store);
        this.fieldsSelect.set('value', data[0].id);
      }
      this.fieldsSelect.focusNode.focus();
      this.fieldsSelect.focusNode.blur();
      this._onFieldsSelectChange();

      if(this.part){
        this._showPart(this.part);
      }
    },

    _showPart:function(_part){
      this.part = _part;
      var validPart = this.part && this.part.fieldObj && this.part.operator && this.part.valueObj;
      if(!validPart){
        return;
      }

      var fieldName = this.part.fieldObj.name;
      var operator = this.part.operator;
      //var valueObj = this.part.valueObj;
      this.part.caseSensitive = !!this.part.caseSensitive;
      var fieldItems = this.fieldsSelect.store.query({
        name: fieldName
      });
      if (fieldItems.length === 0) {
        return;
      }
      var fieldItem = fieldItems[0];
      if (!fieldItem) {
        return;
      }
      this.fieldsSelect.set('value', fieldItem.id);
      setTimeout(lang.hitch(this, function(){
        if(!this.domNode){
          return;
        }
        this._onFieldsSelectChange();
        this.operatorsSelect.set('value', operator);
        setTimeout(lang.hitch(this, function(){
          if (!this.domNode) {
            return;
          }
          this._resetByFieldAndOperation(this.part);
        }), 50);

        setTimeout(lang.hitch(this, function() {
          if (!this.domNode) {
            return;
          }
          var interactiveObj = this.part.interactiveObj;
          if (interactiveObj) {
            this.cbxAskValues.check();
            this._updatePrompt();
            this.promptTB.set('value', interactiveObj.prompt || '');
            this.hintTB.set('value', interactiveObj.hint || '');
          }
        }), 100);

      }), 0);
    },

    _onFieldsSelectChange:function(){
      this._updateFieldsSelectTitle();
      this.operatorsSelect.removeOption(this.operatorsSelect.getOptions());
      this.operatorsSelect.addOption({value:'none', label:this.nls.none});
      this.valueRadio.checked = true;
      var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
      if (fieldInfo) {
        this.operatorsSelect.shortType = fieldInfo.shortType;
        var operators = this._getOperatorsByShortType(fieldInfo.shortType);
        this.operatorsSelect.removeOption(this.operatorsSelect.getOptions());
        array.forEach(operators, lang.hitch(this, function(operator) {
          var label = this.nls[operator];
          this.operatorsSelect.addOption({value: operator, label: label});
        }));
      }
      this._onOperatorsSelectChange();
    },

    _onOperatorsSelectChange:function(){
      this._updateOperatorsSelectTitle();
      this.valueRadio.checked = true;
      this._resetByFieldAndOperation();
    },

    _onRangeNumberBlur:function(){
      if(this.numberTextBox1.validate() && this.numberTextBox2.validate()){
        var value1 = this._getValueForNumberTextBox(this.numberTextBox1);
        var value2 = this._getValueForNumberTextBox(this.numberTextBox2);
        if(jimuUtils.isValidNumber(value1) && jimuUtils.isValidNumber(value2)){
          if(value1 > value2){
            this._setValueForNumberTextBox(this.numberTextBox1, value2);
            this._setValueForNumberTextBox(this.numberTextBox2, value1);
          }
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
    },

    _initRadios:function(){
      var group = "radio_" + jimuUtils.getRandomString();
      this.valueRadio.name = group;
      this.fieldRadio.name = group;

      jimuUtils.combineRadioCheckBoxWithLabel(this.valueRadio, this.valueLabel);
      jimuUtils.combineRadioCheckBoxWithLabel(this.fieldRadio, this.fieldLabel);

      this.own(on(this.valueRadio, 'click', lang.hitch(this, function(){
        this._resetByFieldAndOperation();
      })));

      this.own(on(this.fieldRadio, 'click', lang.hitch(this, function(){
        this._resetByFieldAndOperation();
      })));

      if(this.uniqueRadio){
        this.uniqueRadio.name = group;
        jimuUtils.combineRadioCheckBoxWithLabel(this.uniqueRadio, this.uniqueLabel);
        this.own(on(this.uniqueRadio, 'click', lang.hitch(this, function(){
          this._resetByFieldAndOperation();
        })));
      }

      this._resetByFieldAndOperation();
    },

    _enableRadios:function(){
      this.valueRadio.disabled = false;
      this.fieldRadio.disabled = false;
      if(this.uniqueRadio){
        this.uniqueRadio.disabled = false;
      }
    },

    _disableRadios:function(){
      this.valueRadio.disabled = true;
      this.fieldRadio.disabled = true;
      if(this.uniqueRadio){
        this.uniqueRadio.disabled = true;
      }
    },

    _resetByFieldAndOperation:function(/* optional */ part){
      //if part is not undefined, it means this function is invoked in postCreate
      var valueObj = part && part.valueObj;
      html.setStyle(this.attributeValueContainer, 'display', 'block');
      this._enableRadios();
      this._hideCaseSensitive();

      if(valueObj){
        if(valueObj.type === 'value'){
          this.valueRadio.checked = true;
        }
        else if(valueObj.type === 'field'){
          this.fieldRadio.checked = true;
        }
        else if(valueObj.type === 'unique'){
          if(this.uniqueRadio){
            this.uniqueRadio.checked = true;
          }
        }
      }

      var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
      var shortType = fieldInfo && fieldInfo.shortType;
      var operator = this.operatorsSelect.get('value');

      if(fieldInfo){
        if(shortType === 'string'){
          switch(operator){
          case this.OPERATORS.stringOperatorStartsWith:
          case this.OPERATORS.stringOperatorEndsWith:
          case this.OPERATORS.stringOperatorContains:
          case this.OPERATORS.stringOperatorDoesNotContain:
            this.valueRadio.checked = true;
            this._disableRadios();
            this._showCaseSensitive();
            if(part){
              this.cbxCaseSensitive.setValue(part.caseSensitive);
            }
            break;
          default:
            break;
          }
        }
        else if(shortType === 'number'){
          switch(operator){
          case this.OPERATORS.numberOperatorIsBetween:
          case this.OPERATORS.numberOperatorIsNotBetween:
            this.valueRadio.checked = true;
            this._disableRadios();
            break;
          default:
            break;
          }
        }
        else if(shortType === 'date'){
          switch(operator){
          case this.OPERATORS.dateOperatorIsBetween:
          case this.OPERATORS.dateOperatorIsNotBetween:
            this.valueRadio.checked = true;
            this._disableRadios();
            break;
          default:
            break;
          }
          if(this.uniqueRadio){
            this.uniqueRadio.disabled = true;
            if(this.uniqueRadio.checked){
              this.valueRadio.checked = true;
            }
          }
        }
      }

      this._updateUIOfAttrValueContainer(fieldInfo, operator, valueObj);
    },

    _updateUIOfAttrValueContainer:function(fieldInfo, operator,/* optional */ valueObj){
      this._updatePrompt();
      //radio->shortType->operator
      //radio->interative
      var shortType = fieldInfo && fieldInfo.shortType;
      var isShortTypeValid = shortType === 'string' ||
                             shortType === 'number' ||
                             shortType === 'date';
      if(isShortTypeValid){
        html.setStyle(this.attributeValueContainer, 'display', 'block');
      }
      else{
        html.setStyle(this.attributeValueContainer, 'display', 'none');
        return;
      }

      if(this.valueRadio.checked){
        html.setStyle(this.fieldsSelect2.domNode, 'display', 'none');
        html.setStyle(this.uniqueValuesSelect.domNode, 'display', 'none');
        this._showAllValueBoxContainer();
        this._resetValueTextBox();
        if(shortType === 'string'){
          html.setStyle(this.stringTextBoxContainer, 'display', 'block');
          html.setStyle(this.numberTextBoxContainer, 'display', 'none');
          html.setStyle(this.dateTextBoxContainer, 'display', 'none');

          if(this._isFieldCoded(fieldInfo) && operator === this.OPERATORS.stringOperatorIs){
            html.setStyle(this.stringCodedValuesFS.domNode, 'display', 'inline-block');
            html.setStyle(this.stringTextBox.domNode, 'display', 'none');
            var stringDomain = fieldInfo.domain;
            var stringCodedData = array.map(stringDomain.codedValues,
              lang.hitch(this, function(item, i){
              //item:{name,code},name is the code description and code is code value.
              var dataItem = lang.mixin({}, item);
              dataItem.id = i;
              return dataItem;
            }));
            var stringCodedStore = new Memory({data:stringCodedData});
            this.stringCodedValuesFS.set('store', stringCodedStore);
            if(valueObj){
              var stringSelectedItems = array.filter(stringCodedData,
                lang.hitch(this, function(item){
                return item.code === valueObj.value;
              }));
              if(stringSelectedItems.length > 0){
                this.stringCodedValuesFS.set('value', stringSelectedItems[0].id);
              }
              else{
                this.stringCodedValuesFS.set('value', stringCodedData[0].id);
              }
            }
            else{
              this.stringCodedValuesFS.set('value', stringCodedData[0].id);
            }
          }
          else{
            html.setStyle(this.stringTextBox.domNode, 'display', 'inline-block');
            html.setStyle(this.stringCodedValuesFS.domNode, 'display', 'none');
            if(valueObj){
              this._setValueForStringTextBox(this.stringTextBox, valueObj.value);
            }
          }

          if(operator === this.OPERATORS.stringOperatorIsBlank ||
             operator === this.OPERATORS.stringOperatorIsNotBlank){
            html.setStyle(this.attributeValueContainer, 'display', 'none');
          }
        }
        else if(shortType === 'number'){
          html.setStyle(this.stringTextBoxContainer, 'display', 'none');
          html.setStyle(this.numberTextBoxContainer, 'display', 'block');
          html.setStyle(this.dateTextBoxContainer, 'display', 'none');
          if(operator === this.OPERATORS.numberOperatorIsBetween ||
             operator === this.OPERATORS.numberOperatorIsNotBetween){
            html.setStyle(this.numberTextBox.domNode, 'display', 'none');
            html.setStyle(this.numberRangeTable, 'display', 'table');
            html.setStyle(this.numberCodedValuesFS.domNode, 'display', 'none');
            if(valueObj){
              var num1, num2;
              var isValidValue1 = jimuUtils.isValidNumber(valueObj.value1);
              var isValidValue2 = jimuUtils.isValidNumber(valueObj.value2);

              if(isValidValue1 && isValidValue2){
                num1 = parseFloat(valueObj.value1);
                num2 = parseFloat(valueObj.value2);
                var min = Math.min(num1, num2);
                var max = Math.max(num1, num2);
                this.numberTextBox1.set('value', min);
                this.numberTextBox2.set('value', max);
              }else if(isValidValue1 && !isValidValue2){
                num1 = parseFloat(valueObj.value1);
                this.numberTextBox1.set('value', num1);
              }else if(!isValidValue1 && isValidValue2){
                num2 = parseFloat(valueObj.value2);
                this.numberTextBox2.set('value', num2);
              }
            }
          }
          else{
            html.setStyle(this.numberRangeTable, 'display', 'none');
            if(this._isFieldCoded(fieldInfo) && operator === this.OPERATORS.numberOperatorIs){
              html.setStyle(this.numberTextBox.domNode, 'display', 'none');
              html.setStyle(this.numberCodedValuesFS.domNode, 'display', 'inline-block');
              var numberDomain = fieldInfo.domain;
              var numberCodedData = array.map(numberDomain.codedValues,
                lang.hitch(this, function(item, index){
                //item:{name,code},name is the code description and code is code value.
                var dataItem = lang.mixin({}, item);
                dataItem.id = index;
                return dataItem;
              }));
              var numberCodedStore = new Memory({data:numberCodedData});
              this.numberCodedValuesFS.set('store', numberCodedStore);
              if(valueObj && !isNaN(valueObj.value)){
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
              html.setStyle(this.numberTextBox.domNode, 'display', 'inline-block');
              html.setStyle(this.numberCodedValuesFS.domNode, 'display', 'none');
              if(valueObj){
                /*if(!isNaN(valueObj.value)){
                  this.numberTextBox.set('value',parseFloat(valueObj.value));
                }*/
                this._setValueForNumberTextBox(this.numberTextBox, valueObj.value);
              }
            }
          }
          if(operator === this.OPERATORS.numberOperatorIsBlank ||
             operator === this.OPERATORS.numberOperatorIsNotBlank){
            html.setStyle(this.attributeValueContainer, 'display', 'none');
          }
        }
        else if(shortType === 'date'){
          html.setStyle(this.stringTextBoxContainer, 'display', 'none');
          html.setStyle(this.numberTextBoxContainer, 'display', 'none');
          html.setStyle(this.dateTextBoxContainer, 'display', 'block');

          if(operator === this.OPERATORS.dateOperatorIsBetween ||
             operator === this.OPERATORS.dateOperatorIsNotBetween){
            html.setStyle(this.dateTextBox.domNode, 'display', 'none');
            html.setStyle(this.dateRangeTable, 'display', 'table');
            if(valueObj && valueObj.value1 && valueObj.value2){
              this.dateTextBox1.set('value', new Date(valueObj.value1));
              this.dateTextBox2.set('value', new Date(valueObj.value2));
            }
          }
          else{
            html.setStyle(this.dateTextBox.domNode, 'display', 'inline-block');
            html.setStyle(this.dateRangeTable, 'display', 'none');
            if(valueObj && valueObj.value){
              this.dateTextBox.set('value', new Date(valueObj.value));
            }
          }

          if(operator === this.OPERATORS.dateOperatorIsBlank ||
             operator === this.OPERATORS.dateOperatorIsNotBlank){
            html.setStyle(this.attributeValueContainer, 'display', 'none');
          }
          // this._focusValidationTextBox(this.dateTextBox);
        }
      }
      else if(this.fieldRadio.checked){
        this._hideAllValueBoxContainer();
        html.setStyle(this.uniqueValuesSelect.domNode, 'display', 'none');
        html.setStyle(this.fieldsSelect2.domNode, 'display', 'inline-block');
        this._resetFieldsSelect2();

        if(valueObj && valueObj.value){
          var fieldItems2 = this.fieldsSelect2.store.query({name:valueObj.value});
          if(fieldItems2.length > 0){
            var fieldItem2 = fieldItems2[0];
            if(fieldItem2){
              var id = fieldItem2.id;
              this.fieldsSelect2.set('value', id);
            }
          }
        }
        // this._focusValidationTextBox(this.fieldsSelect2);
        //this._showValidationErrorTip(this.fieldsSelect2);
      }
      else if(this.uniqueRadio && this.uniqueRadio.checked){
        this._hideAllValueBoxContainer();
        html.setStyle(this.fieldsSelect2.domNode, 'display', 'none');
        html.setStyle(this.uniqueValuesSelect.domNode, 'display', 'inline-block');
        this._resetUniqueValuesSelect(valueObj);
        // this._focusValidationTextBox(this.uniqueValuesSelect);
        //this._showValidationErrorTip(this.uniqueValuesSelect);
      }
    },

    _showAllValueBoxContainer:function(){
      html.setStyle(this.allValueBoxContainer, 'display', 'block');
    },

    _hideAllValueBoxContainer:function(){
      html.setStyle(this.allValueBoxContainer, 'display', 'none');
    },

    _resetValueTextBox:function(){
      this.stringTextBox.set('value', '');
      this.numberTextBox.set('value', '');
      this.dateTextBox.set('value', new Date());
    },

    _resetFieldsSelect2:function(){
      this.fieldsSelect2.set('displayedValue', '');
      var store = new Memory({data:[]});
      this.fieldsSelect2.set('store', store);
      if(this.fieldsSelect.validate()){
        var selectedItem = this._getSelectedFilteringItem(this.fieldsSelect);
        if(selectedItem){
          var items = this.fieldsSelect.store.query({shortType:selectedItem.shortType});
          var data = array.filter(items, lang.hitch(this, function(item){
            return item.id !== selectedItem.id;
          }));
          store = new Memory({data:data});
          this.fieldsSelect2.set('store', store);
          if(data.length > 0){
            this.fieldsSelect2.set('value', data[0].id);
          }
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

    _resetUniqueValuesSelect:function(/*optional*/ valueObj){
      this.uniqueValuesSelect.reset();
      this.uniqueValuesSelect.store.setData([]);

      if(this.layerInfo){
        var version = parseFloat(this.layerInfo.currentVersion);
        if(version >= 10.1){
          var item = this._getSelectedFilteringItem(this.fieldsSelect);
          if(item){
            //http://jonq/arcgis/rest/services/BugFolder/BUG_000087622_CodedValue/FeatureServer/0
            var url = this.url + "/generateRenderer";
            var classificationDef = {
              "type": "uniqueValueDef",
              "uniqueValueFields": [item.name]
            };
            var str = json.stringify(classificationDef);
            esriRequest({
              url:url,
              content:{
                classificationDef:str,
                f:'json'
              },
              handleAs:'json',
              callbackParamName:'callback',
              timeout:15000
            }).then(lang.hitch(this, function(response){
              var uniqueValueInfos = response && response.uniqueValueInfos;
              var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
              if(uniqueValueInfos && fieldInfo && item.id === fieldInfo.id){
                this.uniqueValuesSelect.store.setData([]);
                var selectedId = -1;
                //don't select the first value by default, issue #2477
                /*if(uniqueValueInfos.length > 0){
                  selectedId = 0;
                }*/

                var hasCodedValues = this._hasCodedValues(fieldInfo);

                var data = array.map(uniqueValueInfos, lang.hitch(this, function(info, index){
                  var value = info.value;
                  var label = value;
                  if(fieldInfo.shortType === 'number'){
                    value = parseFloat(value);
                    label = this._tryLocaleNumber(value);
                  }
                  if(hasCodedValues){
                    label = this._getDisplayNameOfCodedValues(value, fieldInfo);
                  }
                  var dataItem = {
                    id: index,
                    value: value,
                    label: label
                  };

                  if(valueObj && valueObj.value === value){
                    selectedId = dataItem.id;
                  }

                  return dataItem;
                }));

                this.uniqueValuesSelect.store.setData(data);

                if(data.length > 0 && selectedId >= 0){
                  var selectedItem = this.uniqueValuesSelect.store.get(selectedId);
                  if(selectedItem){
                    this.uniqueValuesSelect.set('item', selectedItem);
                  }
                }
              }
            }), lang.hitch(this, function(error){
              console.error(error);
            }));
          }
        }
      }
    },

    _hasCodedValues: function(fieldInfo){
      var result = false;
      if(fieldInfo.domain){
        var codedValues = fieldInfo.domain.codedValues;
        if(codedValues && codedValues.length > 0){
          result = true;
        }
      }
      return result;
    },

    _getDisplayNameOfCodedValues: function(codedValue, fieldInfo){
      var result = codedValue;
      array.some(fieldInfo.domain.codedValues, function(item){
        if(item.code === codedValue){
          result = item.name;
          return true;
        }else{
          return false;
        }
      });
      return result;
    },

    _onCbxAskValuesClicked:function(){
      this._updateRequiredProperty();
      this._updatePrompt();
    },

    _onCbxAskValuesStatusChanged: function(){
      this._updateRequiredProperty();
    },

    _isUseAskForValues: function(){
      return this.cbxAskValues.status && this.cbxAskValues.checked;
    },

    _isValueRequired: function(){
      var isUseAskForvalues = this._isUseAskForValues();
      var isRequired = !isUseAskForvalues;
      return isRequired;
    },

    _updateRequiredProperty: function(){
      var isRequired = this._isValueRequired();
      //string
      this.stringTextBox.set('required', isRequired);
      this.stringCodedValuesFS.set('required', isRequired);
      //number
      this.numberTextBox.set('required', isRequired);
      this.numberTextBox1.set('required', isRequired);
      this.numberTextBox2.set('required', isRequired);
      this.numberCodedValuesFS.set('required', isRequired);
      //date
      /*this.dateTextBox.set('required', isRequired);
      this.dateTextBox1.set('required', isRequired);
      this.dateTextBox2.set('required', isRequired);*/
      //uniqueValuesSelect
      this.uniqueValuesSelect.set('required', isRequired);
    },

    _updatePrompt:function(){
      this.promptTB.set('value', '');
      this.hintTB.set('value', '');
      //this.cbxAskValues.disabled = false;
      this.cbxAskValues.setStatus(true);
      html.setStyle(this.promptTable, 'display', 'table');

      var operator = this.operatorsSelect.get('value');
      var label = this.nls[operator];
      if(this.fieldRadio.checked){
        // this.cbxAskValues.disabled = true;
        this.cbxAskValues.setStatus(false);
      }
      if(operator === this.OPERATORS.stringOperatorIsBlank){
        // this.cbxAskValues.disabled = true;
        this.cbxAskValues.setStatus(false);
      }
      if(operator === this.OPERATORS.stringOperatorIsNotBlank){
        // this.cbxAskValues.disabled = true;
        this.cbxAskValues.setStatus(false);
      }
      if(operator === this.OPERATORS.numberOperatorIsBlank){
        // this.cbxAskValues.disabled = true;
        this.cbxAskValues.setStatus(false);
      }
      if(operator === this.OPERATORS.numberOperatorIsNotBlank){
        // this.cbxAskValues.disabled = true;
        this.cbxAskValues.setStatus(false);
      }
      if(operator === this.OPERATORS.dateOperatorIsBlank){
        // this.cbxAskValues.disabled = true;
        this.cbxAskValues.setStatus(false);
      }
      if(operator === this.OPERATORS.dateOperatorIsNotBlank){
        // this.cbxAskValues.disabled = true;
        this.cbxAskValues.setStatus(false);
      }

      if(this.cbxAskValues.status && this.cbxAskValues.checked){
        html.setStyle(this.promptTable, 'display', 'table');
        var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
        if(fieldInfo){
          if(operator !== 'none'){
            var alias = fieldInfo.alias || fieldInfo.name;
            var prompt = alias + ' ' + label;
            this.promptTB.set('value', prompt);
          }
        }
      }
      else{
        html.setStyle(this.promptTable, 'display', 'none');
      }
    },

    _destroySelf:function(){
      this.destroy();
    }
  });
});