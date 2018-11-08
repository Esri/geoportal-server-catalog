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
  'dojo/_base/html',
  'dojo/_base/declare',
  'dojo/on',
  './ValueProvider',
  'dijit/form/ValidationTextBox',
  'dijit/form/NumberTextBox',
  './DateValueSelector'
],
  function(html, declare, on, ValueProvider, ValidationTextBox, NumberTextBox, DateValueSelector) {

    return declare([ValueProvider], {

      templateString: "<div></div>",

      _dijit: null,

      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-filter-simple-value-provider');

        if(this.shortType === 'string'){
          this._dijit = new ValidationTextBox({
            required: false,
            trim: true,
            intermediateChanges: false
          });

          this._dijit.startup();
          this._dijit.on('keydown', (function(e){
            var code = e.keyCode || e.which;
            if (code === 13) {
              this._dijit.textbox.blur();
              this._dijit.emit('enter');
            }
          }).bind(this));
        }else if(this.shortType === 'number'){
          this._dijit = new NumberTextBox({
            required: false,
            intermediateChanges: false,
            constraints: {pattern: "#####0.##########"}
          });

          this._dijit.startup();
          this._dijit.on('keydown', (function(e){
            var code = e.keyCode || e.which;
            if (code === 13) {
              this._dijit.textbox.blur();
              this._dijit.emit('enter');
            }
          }).bind(this));
        }else{
          this._dijit = new DateValueSelector({
            popupInfo: this.popupInfo,
            _fieldInfo: this.fieldInfo
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
            //this._dijit is DateValueSelector
            this._dijit.setValueObject(valueObj);
          }else{
            this._dijit.set('value', valueObj.value);
          }
        }
      },

      //return {isValid,type,value}
      getValueObject: function(){
        if(this.isValidValue()){
          if(this.shortType === 'date'){
            //this._dijit is DateValueSelector
            var dateValueObject = this._dijit.getValueObject();
            if(dateValueObject && dateValueObject.value){
              dateValueObject.isValid = true;
              dateValueObject.type = this.partObj.valueObj.type;
              return dateValueObject;
            }else{
              return null;
            }
          }else{
            var value = this._dijit.get('value');
            if(this.shortType === 'number'){
              value = parseFloat(value);
            }
            return {
              "isValid": true,
              "type": this.partObj.valueObj.type,
              "value": value
            };
          }
        }
        return null;
      },

      //return {isValid,type,value}
      tryGetValueObject: function(){
        if(this.isValidValue()){
          return this.getValueObject();
        }else if(this.isEmptyValue()){
          return {
            "isValid": true,
            "type": this.partObj.valueObj.type,
            "value": null
          };
        }
        return null;
      },

      setRequired: function(required){
        this._dijit.set("required", required);
      }

    });
  });