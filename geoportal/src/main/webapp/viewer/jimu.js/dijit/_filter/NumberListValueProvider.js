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
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/_base/declare',
  './ValueProvider',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./NumberListValueProvider.html',
  'dijit/form/NumberTextBox',
  'dijit/form/Select'
],
  function(lang, html, array, declare, ValueProvider, _TemplatedMixin, _WidgetsInTemplateMixin, template) {

    return declare([ValueProvider, _TemplatedMixin, _WidgetsInTemplateMixin], {

      templateString: template,

      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-number-list-filter-value-provider');

        var ranges = [
          "dateOperatorMinutes",
          "dateOperatorHours",
          "dateOperatorDays",
          "dateOperatorWeeks",
          "dateOperatorMonths",
          "dateOperatorYears"
        ];

        this.rangeSelect.removeOption(this.rangeSelect.getOptions());
        array.forEach(ranges, lang.hitch(this, function(range) {
          var label = this.nls[range];
          this.rangeSelect.addOption({value: range, label: label});
        }));
        this.rangeSelect.set('value', 'dateOperatorDays');
      },

      getDijits: function(){
        return [this._dijit1, this.rangeSelect];
      },

      setValueObject: function(valueObj){
        if(this.isDefined(valueObj.value)){
          this._dijit1.set('value', valueObj.value);
        }
        if(this.isDefined(valueObj.range)){
          this.rangeSelect.set('value', valueObj.range);
        }
      },

      getValueObject: function(){
        if(this.isValidValue()){
          return {
            "isValid": true,
            "type": this.partObj.valueObj.type,
            "value": parseFloat(this._dijit1.get('value')),
            "range": this._getRangeByUI()
          };
        }
        return null;
      },

      _getRangeByUI: function(){
        var range = this.rangeSelect.get('value');
        if(range === 'none'){
          range = null;
        }
        return range;
      },

      tryGetValueObject: function(){
        if(this.isValidValue()){
          return this.getValueObject();
        }else if(this.isEmptyValue()){
          var result = {
            "isValid": true,
            "type": this.partObj.valueObj.type,
            "value": parseFloat(this._dijit1.get('value')),
            "range": this._getRangeByUI()
          };
          if(isNaN(result.value)){
            result.value = null;
          }
          return result;
        }
        return null;
      },

      setRequired: function(required){
        this._dijit1.set("required", required);
        this.rangeSelect.set("required", required);
      }

    });
  }
);
