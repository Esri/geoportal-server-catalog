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
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./DateIsInValueProvider.html',
  './ValueProvider',
  'jimu/filterUtils',
  'dijit/form/Select',
  'dijit/form/DateTextBox'
],
  function(Evented, html, lang, declare, _WidgetsInTemplateMixin,
    template, ValueProvider, filterUtils) {

    return declare([ValueProvider, _WidgetsInTemplateMixin, Evented], {

      templateString: template,

      postMixInProperties: function(){
        this.inherited(arguments);
        this.nls = window.jimuNls.filterBuilder;
      },

      //options:
      virtualDates: null,//['today', 'yesterday', 'tomorrow']

      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-date-is-in-value-provider');

        this.dateTypeSelect.addOption({
          value: '',
          label: '&nbsp;'
        });

        var values = ['thisWeek', 'thisMonth', 'thisQuarter', 'thisYear'];
        // var values = ['theseDays', 'thisWeek', 'thisMonth', 'thisQuarter', 'thisYear'];
        return values.forEach(lang.hitch(this, function(v){
          this.dateTypeSelect.addOption({
            value: v,
            label: this.nls[v]
          });
        }));
      },

      getDijits: function(){
        return [this.dateTypeSelect];
      },

      _setValueObject: function(dateValueSelector, valueObj, valueName, virtualDateName){
        //valueName is 'value1' or 'value2'
        if(this.isDefined(valueObj[valueName])){
          var dateValueObject = {
            value: null,
            virtualDate: ''
          };
          dateValueObject.value = valueObj[valueName];
          dateValueObject.virtualDate = valueObj[virtualDateName];
          dateValueSelector.setValueObject(dateValueObject);
        }
      },

      //valueObj: {value,virtualDate}
      setValueObject: function(valueObj){
        this.dateTypeSelect.set('value', valueObj.virtualDate);
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
          "isValid": true,
          "type": this.partObj.valueObj.type,
          "value": null,//date.toDateString()
          "virtualDate": this.dateTypeSelect.get('value')
        };

        var virtualDate = this.dateTypeSelect.get('value');
        var date = filterUtils.getRealDateByVirtualDate(virtualDate);
        result.virtualDate = virtualDate;
        if(date){
          result.value1 = date[0].toDateString();
          result.value2 = date[1].toDateString();
        }

        return result;
      },

      setRequired: function(required){
        this.dateTypeSelect.set("required", required);
      },

      //-1 means invalid value type
      //0 means empty value, this ValueProvider should be ignored
      //1 means valid value
      getStatus: function(){
        if(this.dateTypeSelect.get('value')){
          return 1;
        }else{
          return 0;
        }
      },

      _onDateTypeSelectChanged: function(){
        this.emit('change');
      }

    });
  });