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
  'dojo/Evented',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/_SingleFilter.html',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/query',
  'dojo/store/Memory',
  'jimu/utils',
  'jimu/dijit/_filter/ValueProviderFactory',
  'jimu/dijit/CheckBox',
  'dijit/form/Select',
  'dijit/form/FilteringSelect',
  'dijit/form/ValidationTextBox'//,
  // 'dijit/popup',
  // 'dijit/TooltipDialog'
],
function(Evented, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang,
  // html, array, on, query, Memory, jimuUtils, ValueProviderFactory, dojoPopup, TooltipDialog) {
  html, array, on, query, Memory, jimuUtils, ValueProviderFactory) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString:template,
    baseClass: 'jimu-single-filter',
    declaredClass: 'jimu.dijit._SingleFilter',
    nls: null,
    url: null,
    layerInfo: null,
    popupFieldsInfo:[],
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

    //optional, false: setting data logic, true: runtime data logic #12627
    runtime: false,

    //public methods:
    //toJson: UI->partsObj
    //

    //events:
    //change

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
      // this.own(on(document, 'click', lang.hitch(this, function(){
      //   html.setStyle(this.valueTypePopupNode, 'display', 'none');
      // })));
      this._documentClickHandler = lang.hitch(this, this._documentClickEvent);
      document.addEventListener('click', this._documentClickHandler , {capture: true});
    },

    _documentClickEvent: function(){
      if(this.valueTypePopupNode){
        html.setStyle(this.valueTypePopupNode, 'display', 'none');
      }
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

      var valueType = this._getValueTypeByUI();
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
        // if(this.uniqueRadio && this.uniqueRadio.checked){
        if(valueType === "unique" || valueType === "multiple"){
          part.interactiveObj.cascade = this.cascadeSelect.get("value");
        }
      }

      //valueObj
      part.valueObj = {
        isValid:true,
        type: ''
      };
      // var valueObj;
      //multiple and unique(new) need interactiveObj to valid config
      //it works when no selected & askForValues is true
      // if(valueType === 'multiple' || valueType === 'unique'){
      //   valueObj = isUseAskForvalues ? this.valueProvider.tryGetValueObject(part) :
      //   this.valueProvider.getValueObject(part);
      // }else{
      //tryGetValueObject() let empty value pass
      var valueObj = isUseAskForvalues ? this.valueProvider.tryGetValueObject() : this.valueProvider.getValueObject();
      // }
      if(!valueObj){
        return null;
      }
      valueObj.type = valueType;
      part.valueObj = valueObj;

      return part;
    },

    _getFieldObjByUI: function(){
      var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
      if(!fieldInfo){
        return null;
      }
      var fieldDateFormat = '';
      if(this.popupFieldsInfo.length !== 0){
        fieldDateFormat = jimuUtils.getDateFieldFormatByFieldName(this.popupFieldsInfo, fieldInfo.name);
      }

      return {
        name:fieldInfo.name,
        label:fieldInfo.name,
        dateFormat:fieldDateFormat,
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

    _showCaseSensitive: function(){
      html.setStyle(this.cbxCaseSensitive.domNode, 'display', 'inline-block');
    },

    _hideCaseSensitive: function(){
      html.setStyle(this.cbxCaseSensitive.domNode, 'display', 'none');
    },

    _showAndEnableCaseSensitive: function(){
      this.cbxCaseSensitive.setStatus(true);
      this._showCaseSensitive();
    },

    _hideAndDisableCaseSensitive: function(){
      this.cbxCaseSensitive.setStatus(false);
      this._hideCaseSensitive();
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

      //field select
      var fields = this.layerInfo.fields;
      if (fields && fields.length > 0) {
        fields = array.filter(fields, lang.hitch(this, function(fieldInfo) {
          return this.supportFieldTypes.indexOf(fieldInfo.type) >= 0;
        }));

        if(fields.length > 0){
          this._enableAllValueTypeOptions();

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

    //part -> UI
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
        if (this.part.valueObj.type === 'unique' || this.part.valueObj.type === 'multiple') {
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
        var operators = ValueProviderFactory.getOperatorsByShortType(fieldInfo.shortType, this.isHosted);
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

    _updateValueTypeClass: function(){
      html.removeClass(this.domNode, 'value-type');
      html.removeClass(this.domNode, 'field-type');
      html.removeClass(this.domNode, 'unique-type');
      // html.removeClass(this.domNode, 'multiple-type');
      html.removeClass(this.domNode, 'support-cascade');

      var valueType = this._getValueTypeByUI();

      if(valueType === 'value'){
        html.addClass(this.domNode, 'value-type');
        this.cascadeSelect.set("value", "none");
      }else if(valueType === 'field'){
        html.addClass(this.domNode, 'field-type');
        this.cascadeSelect.set("value", "none");
      }else{
        html.addClass(this.domNode, 'unique-type');
        this.cascadeSelect.set("value", "previous");

        var supportCascade = true;

        var fieldInfo = this._getSelectedFilteringItem(this.fieldsSelect);
        var codedValeusOrTypesCount = jimuUtils.getCodedValuesOrTypesCount(fieldInfo, this.layerInfo);

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

    _enableValueTypeSelectOption: function(valueType, enabled){
      var node = query('li[data-type=' + valueType + ']', this.valueTypePopupNode)[0];
      if(enabled){
        html.removeClass(node, 'disabled');
      }else{
        html.addClass(node, 'disabled');
      }
    },

    _setVisibleValueTypeSelectOption: function(valueType, isDisplay){
      var node = query('li[data-type=' + valueType + ']', this.valueTypePopupNode)[0];
      if(isDisplay){
        html.setStyle(node, 'display', 'block');
      }else{
        html.setStyle(node, 'display', 'none');
      }
    },

    _onValueTypeSetClick: function(evt){
      var position = html.position(evt.target);
      var rNode;
      if(this.isInFilterSet){
        rNode = this.domNode.parentNode.parentNode.parentNode;
      }else{
        rNode = this.domNode.parentNode;
      }
      var rPosition = html.position(rNode);

      if(html.getStyle(this.valueTypePopupNode, 'display') !== 'none'){
        html.setStyle(this.valueTypePopupNode, 'display', 'none');
        return;
      }
      array.forEach(query('.value-type-popup', rNode), function(node){
        html.setStyle(node, 'display', 'none');
      }, this);
      html.place(this.valueTypePopupNode, rNode);

      var topMargin;
      if(html.hasClass(query('.desktop-add-section', rNode.parentNode)[0], 'hidden')){
        topMargin = 55 - 60;
      }else{
        topMargin = 90 - 60;
      }
      var top = position.y - rPosition.y - rNode.parentNode.scrollTop + topMargin;
      if(top + 170 > rNode.parentNode.scrollHeight){
        top = rNode.parentNode.scrollHeight - 170 - 40;
      }

      var left;
      if(window.isRTL){
        left = position.x - rPosition.x + 20;
      }else{
        left = position.x - rPosition.x - 100 - 90;
        if(left + 150 > rNode.clientWidth){
          left = rNode.clientWidth - 150;
        }
      }
      html.setStyle(this.valueTypePopupNode, {
        display: 'block',
        left: left + 'px',
        top: top + 'px'
      });
      evt.stopPropagation();
    },

    _onValueTypeClick: function(evt){
      var type = html.getAttr(evt.currentTarget, 'data-type');
      if(html.hasClass(evt.currentTarget, 'disabled')){
        evt.stopPropagation();
        return;
      }
      query('li', this.valueTypePopupNode).forEach(function(node){
        html.removeClass(node, 'selected');
      });

      html.addClass(evt.currentTarget, 'selected');

      this._resetByFieldAndOperator(null, type);
    },

    _enableValueTypeOption: function(enabled){
      this._enableValueTypeSelectOption("value", enabled);
    },

    _enableFieldTypeOption: function(enabled){
      this._enableValueTypeSelectOption("field", enabled);
    },

    _enableUniqueTypeOption: function(enabled){
      this._enableValueTypeSelectOption("unique", enabled);
    },

    _enableUniquePredefinedTypeOption: function(enabled){
      if(this.runtime){
        this._setVisibleValueTypeSelectOption("uniquePredefined", false);
      }else{
        this._enableValueTypeSelectOption("uniquePredefined", enabled);
      }
    },

    _enableValuesTypeOption: function(enabled){
      this._enableValueTypeSelectOption("values", enabled);
    },

    _enableMultipleTypeOption: function(enabled){
      this._enableValueTypeSelectOption("multiple", enabled);
    },

    _enableMultiplePredefinedTypeOption: function(enabled){
      if(this.runtime){
        this._setVisibleValueTypeSelectOption("multiplePredefined", false);
      }else{
        this._enableValueTypeSelectOption("multiplePredefined", enabled);
      }
    },

    _enableAllValueTypeOptions:function(){
      this._enableValueTypeOption(true);
      this._enableFieldTypeOption(true);
      this._enableUniqueTypeOption(true);
      this._enableUniquePredefinedTypeOption(true);
      this._enableMultipleTypeOption(true);
      // this._enableValuesTypeOption(true); //hide this
      this._enableMultiplePredefinedTypeOption(true);
    },

    _disableAllValueTypeOptions:function(){
      this._enableValueTypeOption(false);
      this._enableFieldTypeOption(false);
      this._enableUniqueTypeOption(false);
      this._enableUniquePredefinedTypeOption(false);
      this._enableMultipleTypeOption(false);
      // this._enableValuesTypeOption(false);  //hide this
      this._enableMultiplePredefinedTypeOption(false);
    },

    _resetByFieldAndOperator: function(/*optional*/ partObj, /*optional*/ _valueType){
      this._updateOperatorsSelectTitle();

      if(this.valueProvider){
        this.valueProvider.destroy();
      }
      this._hideCaseSensitive();
      this._disableAllValueTypeOptions();

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

        // this._enableTypeOptionsBySoupport(valueTypes);
        if (valueTypes.indexOf('value') >= 0) {
          this._enableValueTypeOption(true);
        }
        if (valueTypes.indexOf('field') >= 0) {
          this._enableFieldTypeOption(true);
        }
        if (valueTypes.indexOf('unique') >= 0) {
          this._enableUniqueTypeOption(true);
        }
        if (valueTypes.indexOf('values') >= 0) {
          this._enableValuesTypeOption(true);
        }
        //unique & multiple predefined only appears on the setting page
        if (valueTypes.indexOf('uniquePredefined') >= 0) {
          this._enableUniquePredefinedTypeOption(true);
        }
        if (valueTypes.indexOf('multiple') >= 0) {
          this._enableMultipleTypeOption(true);
        }
        if (valueTypes.indexOf('multiplePredefined') >= 0) {
          this._enableMultiplePredefinedTypeOption(true);
        }

        if(valueType === 'value'){
          this._enableValueTypeOption(true);
        }else if(valueType === 'field'){
          this._enableFieldTypeOption(true);
        }else if(valueType === 'unique'){
          this._enableUniqueTypeOption(true);
        }else if (valueType === 'values') {
          this._enableValuesTypeOption(true);
        }else if (valueType === 'uniquePredefined') {
          this._enableUniquePredefinedTypeOption(true);
        }else if (valueType === 'multiple') {
          this._enableMultipleTypeOption(true);
        }else if (valueType === 'multiplePredefined') {
          this._enableMultiplePredefinedTypeOption(true);
        }

        this._updateValueTypeUI(valueType);
      }

      if (valueTypes.length > 0) {
        this.valueProvider = this.valueProviderFactory.getValueProvider(partObj, this.runtime);
        this.valueProvider.placeAt(this.valueProviderContainer);
        this.valueProvider.setValueObject(partObj.valueObj);
        this.own(on(this.valueProvider, 'change', lang.hitch(this, function(){
          this.emit('change');
        })));
        this.valueProvider.bindChangeEvents();

        if(this.valueProvider.isBlankValueProvider()){
          html.addClass(this.valueProvider.domNode, 'hidden');
          html.addClass(this.attributeValueContainer, 'hidden');
        } else{
          html.removeClass(this.attributeValueContainer, 'hidden');
        }

        var operatorInfo = ValueProviderFactory.getOperatorInfo(partObj.operator);
        if (operatorInfo && valueType) {
          if(operatorInfo[valueType] && operatorInfo[valueType].supportCaseSensitive){
            this._showCaseSensitive();
          }
          if (partObj) {
            this.cbxCaseSensitive.setValue(partObj.caseSensitive);
          }
        }
      } else {
        html.addClass(this.attributeValueContainer, 'hidden');
      }

      this._updateWhenValueRadioChanged();

      this.emit('change');
    },

    // allValueTypes:['value', 'field', 'unique', 'multiple', 'values', 'uniquePredefined', 'multipleDynmic', 'multiplePredefined'],
    // _enableTypeOptionsBySoupport:function(valueTypes){
    //   var types = allValueTypes;
    //   array.forEach(types,function(type){
    //     if (valueTypes.indexOf(type) >= 0) {
    //       this._enableValueTypeOption(true);
    //     }
    //   });
    // },

    _updateWhenValueRadioChanged: function(){
      this._updatePrompt(false, true);
      this._updateValueTypeClass();
    },

    _onCbxAskValuesClicked:function(){
      this._updateRequiredProperty();
      this._updatePrompt(true);
    },

    _onCbxAskValuesStatusChanged: function(){
      this._updateRequiredProperty();
    },

    _isUseAskForValues: function(){
      var valueType = this._getValueTypeByUI();
      if(valueType === 'uniquePredefined' || valueType === 'multiplePredefined'){
        return true;
      }else{
        return this.cbxAskValues.status && this.cbxAskValues.checked;
      }
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
      var node = query('li.selected', this.valueTypePopupNode)[0];
      if(node){
        return html.getAttr(node, 'data-type');
      }else{
        return null;
      }
    },

    _updateValueTypeUI: function(type){
      query('li', this.valueTypePopupNode).forEach(function(node){
        html.removeClass(node, 'selected');
      });

      var node = query('li[data-type=' + type + ']', this.valueTypePopupNode)[0];
      if(node){
        return html.addClass(node, 'selected');
      }
    },

    _updatePrompt: function(ifClick, ifTypeChange){ //call three times when setting's initing
      this.promptTB.set('value', '');
      this.hintTB.set('value', '');
      this.cbxAskValues.setStatus(true);
      if(!ifClick && ifTypeChange){
        this.cbxAskValues.uncheck(true);//check works after setting status true
      }
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
        this.cbxAskValues.uncheck(true);
        this.cbxAskValues.setStatus(false);
      }

      var cbxValue = this.cbxAskValues.getValue();
      var predefinedTypes = ['uniquePredefined', 'multiplePredefined'];
      var ifPredefined = predefinedTypes.indexOf(valueType) >= 0 ? true: false;
      if(ifPredefined){
        this.cbxAskValues.check(true);
      }
      else if(ifClick){
        if(cbxValue){
          this.cbxAskValues.check(true);
        }else{
          this.cbxAskValues.uncheck(true);
        }
      }else if(supportAskForValue){
        if(!this.cbxAskValues.status){
          this.cbxAskValues.check(true);
        }
      }else{
        this.cbxAskValues.uncheck(true);
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

      if(ifPredefined){
        this.cbxAskValues.setStatus(false);
      }
    },

    _destroySelf:function(){
      this.destroy();
    },

    destroy: function(){
      this._removeFieldsSelectChangeAndOperatorChangeEvents();
      if(this._documentClickHandler){
        document.removeEventListener('click', this._documentClickHandler, {capture: true});
      }
      this.inherited(arguments);
    }
  });
});