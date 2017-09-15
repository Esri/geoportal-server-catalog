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
  'dojo/_base/html',
  'dojo/_base/declare',
  './ValueProvider',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./TwoDatesValueProvider.html',
  'dijit/form/DateTextBox'
],
  function(html, declare, ValueProvider, _TemplatedMixin, _WidgetsInTemplateMixin, template) {

    return declare([ValueProvider, _TemplatedMixin, _WidgetsInTemplateMixin], {

      templateString: template,

      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-two-dates-filter-value-provider');
      },

      _onRangeDateBlur:function(){
        if(this._dijit1.validate() && this._dijit2.validate()){
          var date1 = this._dijit1.get('value');
          var time1 = date1.getTime();
          var date2 = this._dijit2.get('value');
          var time2 = date2.getTime();
          if(time1 > time2){
            this._dijit1.set('value', date2);
            this._dijit2.set('value', date1);
          }
        }
      },

      getDijits: function(){
        return [this._dijit1, this._dijit2];
      },

      setValueObject: function(valueObj){
        if(this.isDefined(valueObj.value1)){
          this._dijit1.set('value', new Date(valueObj.value1));
        }
        if(this.isDefined(valueObj.value2)){
          this._dijit2.set('value', new Date(valueObj.value2));
        }
      },

      getValueObject: function(){
        if(this.isValidValue()){
          return {
            "isValid": true,
            "type": this.partObj.valueObj.type,
            "value1": this._dijit1.get('value').toDateString(),
            "value2": this._dijit2.get('value').toDateString()
          };
        }
        return null;
      },

      setRequired: function(required){
        this._dijit1.set("required", required);
        this._dijit2.set("required", required);
      }

    });
  });