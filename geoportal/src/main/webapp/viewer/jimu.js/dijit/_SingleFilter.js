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
  'dojo/text!./templates/_SingleFilter.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/store/Memory',
  'jimu/utils',
  'jimu/dijit/_filter/ValueProviderFactory',
  'jimu/dijit/CheckBox',
  'dijit/form/Select',
  'dijit/form/FilteringSelect',
  'dijit/form/ValidationTextBox'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang,
  html, array, on, Memory, jimuUtils, ValueProviderFactory) {

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
    valueProviderFactory: null,
    valueProvider: null,

    postMixInProperties:function(){
      this.supportFieldTypes = [];
      this.supportFieldTypes.push(this.stringFieldType);
      this.supportFieldTypes.push(this.dateFieldType);
      this.supportFieldTypes = this.supportFieldTypes.concat(this.numberFieldTypes);
      this.nls = window.jimuNls.filterBuilder;
    },

    postCreate:function(){
      this.inherited(arguments);
      this._initSelf();
    },

    toJson:function(){
      var part = {
        fieldObj:'',
        operator:'',
        valueObj:'',
        interactiveObj:'',
        caseSensitive: false
      };

      //fieldObj
      var fieldObj = this._getFieldObjByUI();
      if(!fieldObj){
        return null;
      }
      part.fieldObj = fieldObj;

      //operator
      var operator = this._getOperatorByUI();
      if(!operator){
        return null;
      }
      part.operator = operator;

      //caseSensitive
      part.caseSensitive = this.cbxCaseSensitive.getStatus() && this.cbxCaseSensitive.getValue();

      //interactiveObj
      var isUseAskForvalues = this._isUseAskForValues();
      if(isUseAskForvalues){
        //prompt is required and hint is optional
        if(!this.promptTB.validate()){
          this._showValidationErrorTip(this.promptTB);
          return null;
        }
        part.interactiveObj = {
          prompt: this.promptTB.get('value'),
          hint: this.hintTB.get('value'),
          cascade: "none"
        };
        if(this.uniqueRadio && this.uniqueRadio.checked){
          part.interactiveObj.cascade = this.cascadeSelect.get("value");
        }
      }

      //valueObj
      part.valueObj = {
        isValid:true,
        type: ''
      };
      //tryGetValueObject() let empty value pass
      var valueObj = isUseAskForvalues ? this.valueProvider.tryGetValueObject() : this.valueProvider.getValueObject();
      if(!valueObj){
        return null;
      }
      if(this.valueRadio.checked){
        valueObj.type = 'value';
      }else if(this.fieldRadio.checked){
        valueObj.type = 'field';
      }else if(this.uniqueRadio.checked){
        valueObj.type = 'unique';
      }
      part.valueObj = valueObj;

      return part;
    },

    _getFieldObjByUI: function(){
      var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
      if(!fieldInfo){
        return null;
      }
      return {
        name:fieldInfo.name,
        label:fieldInfo.name,
        shortType:fieldInfo.shortType,
        type:fieldInfo.type
      };
    },

    _getOperatorByUI: function(){
      var operator = this.operatorsSelect.get('value');
      if(operator === 'none'){
        operator = null;
      }
      return operator;
    },

    showDelteIcon:function(){
      html.setStyle(this.btnDelete, 'display', 'inline-block');
    },

    hideDeleteIcon:function(){
      html.setStyle(this.btnDelete, 'display', 'none');
    },

    _showAndEnableCaseSensitive: function(){
      this.cbxCaseSensitive.setStatus(true);
      html.setStyle(this.cbxCaseSensitive.domNode, 'display', 'inline-block');
    },

    _hideAndDisableCaseSensitive: function(){
      this.cbxCaseSensitive.setStatus(false);
      html.setStyle(this.cbxCaseSensitive.domNode, 'display', 'none');
    },

    _initSelf:function(){
      this.layerInfo = lang.mixin({}, this.layerInfo);

      //case sensitive
      if(this.isHosted){
        this.cbxCaseSensitive.setValue(false);
        this.cbxCaseSensitive.setStatus(false);
        this.cbxCaseSensitive.domNode.title = this.nls.notSupportCaseSensitiveTip;
      }

      //update title for dijits when mouse enter
      this.own(on(this.fieldsSelect, 'MouseEnter', lang.hitch(this, this._updateFieldsSelectTitle)));
      this.own(on(this.operatorsSelect, 'MouseEnter', lang.hitch(this, this._updateOperatorsSelectTitle)));

      //ask for value
      if(this.enableAskForValues){
        html.setStyle(this.cbxAskValues.domNode, 'display', 'inline-block');
        html.setStyle(this.promptSection, 'display', 'block');
        this.own(on(this.cbxAskValues, 'status-change', lang.hitch(this, this._onCbxAskValuesStatusChanged)));
        this.cbxAskValues.onChange = lang.hitch(this, this._onCbxAskValuesClicked);
      }else{
        html.setStyle(this.cbxAskValues.domNode, 'display', 'none');
        html.setStyle(this.promptSection, 'display', 'none');
      }

      //value type raidos
      this._initValueTypeRadios();

      //field select
      var fields = this.layerInfo.fields;
      if (fields && fields.length > 0) {
        fields = array.filter(fields, lang.hitch(this, function(fieldInfo) {
          return this.supportFieldTypes.indexOf(fieldInfo.type) >= 0;
        }));

        if(fields.length > 0){
          this._enableRadios();

          this._initFieldsSelect(fields);

          if(this.part){
            this._showPart(this.part);
          }else{
            this._resetByFieldAndOperator();
          }

          setTimeout(lang.hitch(this, function(){
            //must setTimeout to bind events
            this._bindFieldsSelectChangeAndOperatorChangeEvents();
          }), 10);
        }
      }
    },

    _bindFieldsSelectChangeAndOperatorChangeEvents: function(){
      this._removeFieldsSelectChangeAndOperatorChangeEvents();
      this._handle1 = on(this.fieldsSelect, 'change', lang.hitch(this, this._onFieldsSelectChange));
      this._handle2 = on(this.operatorsSelect, 'change', lang.hitch(this, this._onOperatorsSelectChange));
    },

    _removeFieldsSelectChangeAndOperatorChangeEvents: function(){
      if(this._handle1){
        this._handle1.remove();
      }
      if(this._handle2){
        this._handle2.remove();
      }
      this._handle1 = null;
      this._handle2 = null;
    },

    _isServiceSupportDistinctValues: function(url, layerDefinition){
      //StreamServer doesn't provide API interface to get unique values
      if(this._isStreamServer(url)){
        return false;
      }
      // if(this._isImageServer(url)){
      // return layerDefinition.advancedQueryCapabilities && layerDefinition.advancedQueryCapabilities.supportsDistinct;
      // }
      //MapServer or FeatureServer
      var version = parseFloat(layerDefinition.currentVersion);
      return version >= 10.1;
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
        this.fieldsSelect.domNode.title = fieldInfo.displayName || fieldInfo.alias || fieldInfo.name;
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

    _showValidationErrorTip:function(_dijit){
      try{
        if(!_dijit.validate() && _dijit.domNode){
          if(_dijit.focusNode){
            //sometimes throw exception here in IE8
            _dijit.focusNode.focus();
            _dijit.focusNode.blur();
          }
        }
      }catch(e){
        console.error(e);
      }
    },

    _getSelectedFilteringItem: function(_select){
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

    _getShortTypeByFieldType: function(fieldType){
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

    _initFieldsSelect: function(fieldInfos){
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

      // this.fieldsSelect.focusNode.focus();
      // this.fieldsSelect.focusNode.blur();
      this._updateOperatorsByFieldsSelect();
    },

    _showPart: function(_part){
      this.part = _part;
      var validPart = this.part && this.part.fieldObj && this.part.operator && this.part.valueObj;
      if(!validPart){
        return;
      }

      this._removeFieldsSelectChangeAndOperatorChangeEvents();

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

      this._updateOperatorsByFieldsSelect();

      this.operatorsSelect.set('value', operator);

      this._resetByFieldAndOperator(this.part);

      var interactiveObj = this.part.interactiveObj;
      if (interactiveObj) {
        this.cbxAskValues.check();
        this._updatePrompt();
        this.promptTB.set('value', interactiveObj.prompt || '');
        this.hintTB.set('value', interactiveObj.hint || '');
        if (this.part.valueObj.type === 'unique') {
          this.cascadeSelect.set("value", interactiveObj.cascade);
        } else {
          this.cascadeSelect.set("value", "none");
        }
      }
    },

    _onFieldsSelectChange:function(){
      this._updateOperatorsByFieldsSelect();
      this._resetByFieldAndOperator();
    },

    _updateOperatorsByFieldsSelect: function(){
      this._updateFieldsSelectTitle();
      this.operatorsSelect.removeOption(this.operatorsSelect.getOptions());
      this.operatorsSelect.addOption({value:'none', label:this.nls.none});
      var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
      if (fieldInfo) {
        this.operatorsSelect.shortType = fieldInfo.shortType;
        var operators = ValueProviderFactory.getOperatorsByShortType(fieldInfo.shortType);
        this.operatorsSelect.removeOption(this.operatorsSelect.getOptions());
        array.forEach(operators, lang.hitch(this, function(operator) {
          var label = this.nls[operator];
          this.operatorsSelect.addOption({value: operator, label: label});
        }));
      }
    },

    _onOperatorsSelectChange:function(){
      this._resetByFieldAndOperator();
    },

    _initValueTypeRadios: function(){
      var group = "radio_" + jimuUtils.getRandomString();
      this.valueRadio.name = group;
      this.fieldRadio.name = group;
      this.uniqueRadio.name = group;

      this.valueRadio.valueType = "value";
      this.fieldRadio.valueType = "field";
      this.uniqueRadio.valueType = "unique";

      jimuUtils.combineRadioCheckBoxWithLabel(this.valueRadio, this.valueLabel);
      jimuUtils.combineRadioCheckBoxWithLabel(this.fieldRadio, this.fieldLabel);
      jimuUtils.combineRadioCheckBoxWithLabel(this.uniqueRadio, this.uniqueLabel);

      this.own(on(this.valueRadio, 'click', lang.hitch(this, function(){
        this._resetByFieldAndOperator(null, 'value');
      })));

      this.own(on(this.fieldRadio, 'click', lang.hitch(this, function(){
        this._resetByFieldAndOperator(null, 'field');
      })));

      this.own(on(this.uniqueRadio, 'click', lang.hitch(this, function() {
        this._resetByFieldAndOperator(null, 'unique');
      })));

      if(!this._isServiceSupportDistinctValues(this.url, this.layerInfo)){
        this.uniqueTd.style.display = "none";
      }
    },

    _updateValueTypeClass: function(){
      html.removeClass(this.domNode, 'value-type');
      html.removeClass(this.domNode, 'field-type');
      html.removeClass(this.domNode, 'unique-type');
      html.removeClass(this.domNode, 'support-cascade');

      if(this.valueRadio.checked){
        html.addClass(this.domNode, 'value-type');
        this.cascadeSelect.set("value", "none");
      }else if(this.fieldRadio.checked){
        html.addClass(this.domNode, 'field-type');
        this.cascadeSelect.set("value", "none");
      }else{
        html.addClass(this.domNode, 'unique-type');
        this.cascadeSelect.set("value", "previous");

        var supportCascade = true;

        var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
        var codedValeusOrTypesCount = this._getCodedValuesOrTypesCount(fieldInfo);

        if(codedValeusOrTypesCount > 0){
          //codedValeusOrTypesCount > 0 means the field is coded value field or typeIdField
          supportCascade = jimuUtils.isCodedValuesSupportFilter(this.layerInfo, codedValeusOrTypesCount);
        }else{
          supportCascade = true;
        }

        if(supportCascade){
          this.cascadeSelect.set("value", "previous");
          html.addClass(this.domNode, 'support-cascade');
        }else{
          this.cascadeSelect.set("value", "none");
        }
      }
    },

    _getCodedValuesOrTypesCount: function(fieldInfo){
      if(fieldInfo){
        if(fieldInfo.domain && fieldInfo.domain.type === 'codedValue' && fieldInfo.domain.codedValues){
          return fieldInfo.domain.codedValues.length;
        }
        if(this.layerInfo.typeIdField === fieldInfo.name && this.layerInfo.types){
          return this.layerInfo.types.length;
        }
      }
      return 0;
    },

    _enableRadios:function(){
      this.valueRadio.disabled = false;
      this.fieldRadio.disabled = false;
      this.uniqueRadio.disabled = false;
    },

    _disableAndUncheckRadios:function(){
      this._enableRadios();

      this.valueRadio.checked = false;
      this.fieldRadio.checked = false;
      this.uniqueRadio.checked = false;

      this.valueRadio.disabled = true;
      this.fieldRadio.disabled = true;
      this.uniqueRadio.disabled = true;
    },

    _resetByFieldAndOperator: function(/*optional*/ partObj, /*optional*/ _valueType){
      this._updateOperatorsSelectTitle();

      if(this.valueProvider){
        this.valueProvider.destroy();
      }
      this._hideAndDisableCaseSensitive();
      this._disableAndUncheckRadios();

      if(!partObj){
        //if partObj is not undefined, it means this function is invoked in postCreate
        partObj = {
          fieldObj:'',
          operator:'',
          valueObj:'',
          interactiveObj:'',
          caseSensitive: false
        };

        //fieldObj
        partObj.fieldObj = this._getFieldObjByUI();//maybe null

        //operator
        partObj.operator = this._getOperatorByUI();//maybe null
      }

      var valueTypes = [];
      var valueType = null;

      if (partObj.fieldObj && partObj.operator) {
        valueTypes = this.valueProviderFactory.getSupportedValueTypes(partObj.fieldObj.name, partObj.operator);

        var valueTypeRadio = null;

        if(partObj.valueObj){
          valueType = partObj.valueObj.type;
        } else{
          if(_valueType && valueTypes.indexOf(_valueType) >= 0){
            valueType = _valueType;
          }else{
            valueType = valueTypes[0];
          }
          partObj.valueObj = {
            type: valueType
          };
        }

        if (valueTypes.indexOf('value') >= 0) {
          this.valueRadio.disabled = false;
        }
        if (valueTypes.indexOf('field') >= 0) {
          this.fieldRadio.disabled = false;
        }
        if (valueTypes.indexOf('unique') >= 0) {
          this.uniqueRadio.disabled = false;
        }

        if(valueType === 'value'){
          valueTypeRadio = this.valueRadio;
        }else if(valueType === 'field'){
          valueTypeRadio = this.fieldRadio;
        }else if(valueType === 'unique'){
          valueTypeRadio = this.uniqueRadio;
        }

        if(valueTypeRadio){
          valueTypeRadio.disabled = false;
          valueTypeRadio.checked = true;
        }
      }

      if (valueTypes.length > 0) {
        this.valueProvider = this.valueProviderFactory.getValueProvider(partObj, false);
        this.valueProvider.placeAt(this.attributeValueContainer, "first");
        this.valueProvider.setValueObject(partObj.valueObj);

        if(this.valueProvider.isBlankValueProvider()){
          html.addClass(this.valueProvider.domNode, 'hidden');
          html.addClass(this.attributeValueContainer, 'hidden');
        } else{
          html.removeClass(this.attributeValueContainer, 'hidden');
        }

        var operatorInfo = ValueProviderFactory.getOperatorInfo(partObj.operator);
        if (operatorInfo && valueType) {
          if (operatorInfo[valueType] && operatorInfo[valueType].supportCaseSensitive) {
            this._showAndEnableCaseSensitive();
          }
          if (partObj) {
            this.cbxCaseSensitive.setValue(partObj.caseSensitive);
          }
        }
      } else {
        html.addClass(this.attributeValueContainer, 'hidden');
      }

      this._updateWhenValueRadioChanged();
    },

    _updateWhenValueRadioChanged: function(){
      this._updatePrompt();
      this._updateValueTypeClass();
    },

    _getRadioByValueType: function(valueType){
      if(valueType === 'value'){
        return this.valueRadio;
      }else if(valueType === 'field'){
        return this.fieldRadio;
      }else if(valueType === 'unique'){
        return this.uniqueRadio;
      }
      return null;
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
      this.valueProvider.setRequired(isRequired);
    },

    _getValueTypeByUI: function(){
      if(!this.valueRadio.disabled && this.valueRadio.checked){
        return "value";
      }
      if(!this.fieldRadio.disabled && this.fieldRadio.checked){
        return "field";
      }
      if(!this.uniqueRadio.disabled && this.uniqueRadio.checked){
        return "unique";
      }
      return null;
    },

    _updatePrompt: function(){
      this.promptTB.set('value', '');
      this.hintTB.set('value', '');
      this.cbxAskValues.setStatus(true);
      html.setStyle(this.promptTable, 'display', 'table');

      var operator = this.operatorsSelect.get('value');
      var label = this.nls[operator];
      var supportAskForValue = false;
      var valueType = this._getValueTypeByUI();
      var operatorInfo = ValueProviderFactory.getOperatorInfo(operator);
      if(operatorInfo && valueType){
        var valueTypeInfo = operatorInfo[valueType];
        if(valueTypeInfo && valueTypeInfo.supportAskForValue){
          supportAskForValue = true;
        }
      }
      if(!supportAskForValue){
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
      }else{
        html.setStyle(this.promptTable, 'display', 'none');
      }
    },

    _destroySelf:function(){
      this.destroy();
    },

    destroy: function(){
      this._removeFieldsSelectChangeAndOperatorChangeEvents();
      this.inherited(arguments);
    }
  });
});