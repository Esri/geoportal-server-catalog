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
  'dojo/aspect',
  'dojo/Evented',
  'dojo/on',
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./DateValueSelector.html',
  'jimu/filterUtils',
  'jimu/utils',
  'dijit/form/Select',
  'dijit/form/DateTextBox'
],
  function(aspect, Evented, on, html, lang, array, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    template, filterUtils, jimuUtils) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

      templateString: template,

      //options:
      virtualDates: null,//['today', 'yesterday', 'tomorrow']

      //events:
      //change

      postMixInProperties: function(){
        this.inherited(arguments);
        this.nls = window.jimuNls.filterBuilder;
      },

      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-date-value-selector');
        if(!(this.virtualDates && this.virtualDates.length > 0)){
          this.virtualDates =
            [filterUtils.VIRTUAL_DATE_TODAY, filterUtils.VIRTUAL_DATE_YESTERDAY, filterUtils.VIRTUAL_DATE_TOMORROW];
        }
        this.dateTypeSelect.addOption({
          value: '',
          label: '&nbsp;'
        });
        this.dateTypeSelect.addOption({
          value: 'custom',
          label: this.nls.custom
        });
        array.map(this.virtualDates, lang.hitch(this, function(virtualDate){
          var option = {
            value: virtualDate,
            label: virtualDate
          };
          switch(virtualDate){
            case filterUtils.VIRTUAL_DATE_TODAY:
              option.label = this.nls.today;
              break;
            case filterUtils.VIRTUAL_DATE_YESTERDAY:
              option.label = this.nls.yesterday;
              break;
            case filterUtils.VIRTUAL_DATE_TOMORROW:
              option.label = this.nls.tomorrow;
              break;
            default:
              break;
          }
          this.dateTypeSelect.addOption(option);
        }));

        this._showDateTypeSelect();

        this.own(on(html.byId('main-page'), 'click', lang.hitch(this, function(){
          if(this.dateTextBox){
            this.dateTextBox.closeDropDown();
          }
        })));

        this.own(aspect.before(this.dateTypeSelect, 'openDropDown', lang.hitch(this, function(){
          if(this.dateTypeSelect.getValue() === 'custom' && this.dateTextBox.getValue()){
            this.dateTypeSelect.textDirNode.innerText = this._formatDate(this.dateTextBox.getValue());
          }
        })));

        this.own(aspect.after(this.dateTypeSelect, 'closeDropDown', lang.hitch(this, function(){
          if(this.dateTypeSelect.getValue() === 'custom' && this.dateTextBox.getValue()){
            this.dateTypeSelect.textDirNode.innerText = this._formatDate(this.dateTextBox.getValue());
          }
        })));

        this.own(aspect.after(this.dateTypeSelect.dropDown, 'onItemClick', lang.hitch(this, function(item, evt){
          if(item && item.option.value === 'custom'){
            this._showDateTextBox();
          }
        }), true));

        if(this.popupInfo && this.popupInfo.fieldInfos){
          this.fieldInfo = this.popupInfo.fieldInfos.filter(lang.hitch(this, function(f){
            return f.fieldName === this._fieldInfo.name;
          }))[0];
        }
      },

      getDijits: function(){
        // return [this._dijit1, this._dijit2];
        return [];
      },

      //valueObj: {value,virtualDate}
      setValueObject: function(valueObj){
        //valueObj.value: string
        //virtualDate: today,yesterday,...

        if(!valueObj.virtualDate || valueObj.virtualDate === 'custom'){
          //custom date
          this.dateTypeSelect.set('value', 'custom', false);
          if(valueObj.value){
            this.dateTextBox.set('value', new Date(valueObj.value), false);

            this.dateTypeSelect.textDirNode.innerText = this._formatDate(new Date(valueObj.value));
          }
        }else{
          //virtual date
          this.dateTypeSelect.set('value', valueObj.virtualDate, false);
        }
      },

      //return {value,virtualDate}
      getValueObject: function(){
        if(!this.isValidValue()){
          return null;
        }

        return this.tryGetValueObject();
      },

      //return {value,virtualDate}
      tryGetValueObject: function(){
        if(this.isInvalidValue()){
          return null;
        }

        var result = {
          "value": null,//date.toDateString()
          "virtualDate": ''//today,yesterday,...
        };

        var virtualDate = this.dateTypeSelect.get('value');
        var date = null;

        if(virtualDate === 'custom'){
          date = this.dateTextBox.get('value');
          if(date){
            result.value = date.toDateString();
          }else{
            result.value = null;
          }
          result.virtualDate = '';
        }else{
          date = filterUtils.getRealDateByVirtualDate(virtualDate);
          result.virtualDate = virtualDate;
          if(date){
            result.value = date.toDateString();
          }else{
            result = null;
          }
        }

        return result;
      },

      setRequired: function(required){
        this.dateTextBox.set("required", required);
      },

      //-1 means invalid value type
      //0 means empty value, this ValueProvider should be ignored
      //1 means valid value
      getStatus: function(){
        if(this.dateTypeSelect.get('value') === 'custom'){
          return this._getStatusForDijit(this.dateTextBox);
        }else if(this.dateTypeSelect.get('value') === ''){
          return 0;
        }else{
          return 1;
        }
      },

      //return -1 means input a wrong value
      //return 0 means empty value
      //return 1 means valid value
      _getStatusForDijit: function(dijit){
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

      _showDateTypeSelect: function(){
        this.dateTextBox.closeDropDown();
      },

      _showDateTextBox: function(){
        this.dateTextBox.openDropDown();
        this.dateTextBoxClickBinded = true;
      },

      _onDateTypeSelectChanged: function(){
        var value = this.dateTypeSelect.get('value');
        if(value === 'custom'){
          this._showDateTextBox();
        }
        this.emit('change');
      },

      _onDateTextBoxChanged: function(val){
        // this.dateTypeSelect.removeOption('custom');
        // this.dateTypeSelect.addOption({
        //   value: 'custom',
        //   label: val.toDateString()
        // });
        // this.dateTypeSelect.set('value', 'custom', false);
        this.dateTypeSelect.textDirNode.innerText = this._formatDate(val);
        this.emit('change');
      },

      _formatDate: function(val){
        if(!this.fieldInfo){
          return val.toDateString();
        }
        return jimuUtils.localizeDateByFieldInfo(val, this.fieldInfo);
      }

    });
  });