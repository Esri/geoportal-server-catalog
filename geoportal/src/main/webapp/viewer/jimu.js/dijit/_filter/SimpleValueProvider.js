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
  'dijit/form/ValidationTextBox',
  'dijit/form/DateTextBox',
  'dijit/form/NumberTextBox'
],
  function(html, declare, ValueProvider, ValidationTextBox, DateTextBox, NumberTextBox) {

    return declare([ValueProvider], {

      templateString: "<div></div>",

      _dijit: null,

      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-filter-simple-value-provider');

        if(this.shortType === 'string'){
          this._dijit = new ValidationTextBox({
            required: false,
            trim: true
          });
        }else if(this.shortType === 'number'){
          this._dijit = new NumberTextBox({
            required: false,
            intermediateChanges: true,
            constraints: {pattern: "#####0.##########"}
          });
        }else{
          this._dijit = new DateTextBox({
            required: false,
            trim: true,
            value: new Date()
          });
        }
        html.setStyle(this._dijit.domNode, 'width', '100%');
        this._dijit.placeAt(this.domNode);
      },

      getDijits: function(){
        return [this._dijit];
      },

      setValueObject: function(valueObj){
        if(this.isDefined(valueObj.value)){
          if(this.shortType === 'date'){
            this._dijit.set('value', new Date(valueObj.value));
          }else{
            this._dijit.set('value', valueObj.value);
          }
        }
      },

      getValueObject: function(){
        if(this.isValidValue()){
          var value = this._dijit.get('value');
          if(this.shortType === 'date'){
            value = value.toDateString();
          }else if(this.shortType === 'number'){
            value = parseFloat(value);
          }
          return {
            "isValid": true,
            "type": this.partObj.valueObj.type,
            "value": value
          };
        }
        return null;
      },

      tryGetValueObject: function(){
        if(this.isValidValue()){
          return this.getValueObject();
        }else if(this.isEmptyValue()){
          return {
            "isValid": true,
            "type": this.partObj.valueObj.type,
            "value": this.shortType === 'string' ? "" : null
          };
        }
        return null;
      },

      setRequired: function(required){
        this._dijit.set("required", required);
      }

    });
  });