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
  'dojo/aspect',
  'dojo/Deferred',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/_base/declare',
  './ValueProvider',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./ListValueProvider.html',
  'dojo/store/Memory',
  'jimu/utils',
  'dijit/form/FilteringSelect'
],
  function(aspect, Deferred, lang, html, array, declare, ValueProvider, _TemplatedMixin, _WidgetsInTemplateMixin,
    template, Memory, jimuUtils) {

    return declare([ValueProvider, _TemplatedMixin, _WidgetsInTemplateMixin], {
      templateString: template,
      codedValues: null,//[{value,label}] for coded values and sub types
      staticValues: null,//[{value,label}]
      showNullValues: false,//show null values

      postCreate: function(){
        this.inherited(arguments);
        html.addClass(this.domNode, 'jimu-filter-list-value-provider');

        this._uniqueValueCache = {};

        //[{id,value,label}]
        var store = new Memory({idProperty:'id', data: []});
        this.valuesSelect.set('store', store);

        if(!this.staticValues && typeof this.valuesSelect._onDropDownMouseDown === 'function'){
          if(!this.codedValues || (this.codedValues && this.filterCodedValue)){
            this.own(
              aspect.before(this.valuesSelect,
                            "_onDropDownMouseDown",
                            lang.hitch(this, this._onBeforeDropDownMouseDown))
            );
          }
        }
      },

      _onFilteringSelectInput: function(){
        this.emit('change');
      },

      _onBeforeDropDownMouseDown: function(){
        this._tryUpdatingUniqueValues(undefined, true);
        return arguments;
      },

      getDijits: function(){
        return [this.valuesSelect];
      },

      //maybe return a deferred
      setValueObject: function(valueObj){
        if(this.staticValues){
          return this._setValueForStaticValues(valueObj.value, this.staticValues);
        } else if(this.codedValues){
          if(this.filterCodedValue){
            return this._tryUpdatingUniqueValues(valueObj.value, false);
          }else{
            return this._setValueForStaticValues(valueObj.value, this.codedValues);
          }
        } else{
          return this._tryUpdatingUniqueValues(valueObj.value, false);
        }
      },

      getValueObject: function(){
        if(this.isValidValue()){
          var item = this.valuesSelect.get('item');
          var value = item.value;
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
        this.valuesSelect.set("required", required);
      },

      /*disable: function(){
        this.inherited(arguments);
        this.valuesSelect.closeDropDown(true);
        this.valuesSelect.set('disabled', true);
      },

      enable: function(){
        this.inherited(arguments);
        this.valuesSelect.set('disabled', false);
      },*/

      _setValueForStaticValues: function(selectedValue, valueLabels){
        //selectedValue maybe undefined or null
        var data = null;
        var selectedId = -1;
        var selectedItem = null;
        if(valueLabels){
          data = array.map(valueLabels, lang.hitch(this, function(item, index){
            var dataItem = {
              id: index,
              value: item.value,
              label: item.label
            };
            if(dataItem.value === selectedValue){
              selectedId = index;
            }
            return dataItem;
          }));
          this.valuesSelect.store.setData(data);
          if(selectedId >= 0){
            selectedItem = this.valuesSelect.store.get(selectedId);
            if(selectedItem){
              this.valuesSelect.set('item', selectedItem);
            }
          }
        }
      },

      _uniqueValueLoadingDef: null,
      _uniqueValueLoadingExpr: '',
      _uniqueValueCache: null,//{expr1:values1,expr2:values2}

      _tryUpdatingUniqueValues: function(selectedValue, showDropDownAfterValueUpdate){
        var def = new Deferred();
        if(!this.valuesSelect._opened){
          var newExpr = this.getFilterExpr();
          if(newExpr !== this._uniqueValueLoadingExpr){
            //expr changed
            this.valuesSelect.readOnly = true;
            if(this._uniqueValueLoadingDef){
              this._uniqueValueLoadingDef.reject();
              this._uniqueValueLoadingDef = null;
            }
            this._uniqueValueLoadingExpr = newExpr;
            this._uniqueValueLoadingDef = this._getUniqueValues(newExpr);
            this._uniqueValueLoadingDef.then(lang.hitch(this, function(valueLabels){
              if(!this.domNode){
                return;
              }
              this._uniqueValueLoadingDef = null;
              this.valuesSelect.readOnly = false;
              this._setValueForUniqueValues(selectedValue, valueLabels);
              this._hideLoadingIcon();
              if(showDropDownAfterValueUpdate){
                this.valuesSelect.toggleDropDown();
              }
              def.resolve();
            }), lang.hitch(this, function(err){
              console.error(err);
              if(!this.domNode){
                return;
              }
              this._uniqueValueLoadingDef = null;
              this.valuesSelect.readOnly = false;
              this._hideLoadingIcon();
              def.reject(err);
            }));
          }else{
            def.resolve();
          }
        }else{
          def.resolve();
        }
        return def;
      },

      //return a deferred
      _setValueForUniqueValues: function(selectedValue, valueLabels){
        valueLabels.sort(function(item1, item2){
          if(item1.value < item2.value){
            return -1;
          }else if(item1.value === item2.value){
            return 0;
          }else{
            return 1;
          }
        });
        //selectedValue maybe undefined or null
        if(!this.showNullValues){
          valueLabels = array.filter(valueLabels, lang.hitch(this, function(item){
            return item.value !== '<Null>' && item.value !== null;
          }));
        }
        if(selectedValue === undefined){
          var currentValueObj = this.getValueObject();
          if(currentValueObj){
            selectedValue = currentValueObj.value;
          }
        }
        var selectedId = -1;
        var selectedItem = null;
        var data = array.map(valueLabels, lang.hitch(this, function(item, index) {
          var dataItem = {
            id: index,
            value: item.value,
            label: item.label
          };

          if (item.value === selectedValue) {
            selectedId = index;
          }

          return dataItem;
        }));

        this.valuesSelect.store.setData(data);

        if (selectedId >= 0) {
          selectedItem = this.valuesSelect.store.get(selectedId);
        }

        //selectedItem maybe null
        //we need to set item to null to clear the previous invlaid value
        this.valuesSelect.set('item', selectedItem);
      },

      _showLoadingIcon: function(){
        html.addClass(this.valuesSelect.domNode, 'loading');
      },

      _hideLoadingIcon: function(){
        html.removeClass(this.valuesSelect.domNode, 'loading');
      },

      _getUniqueValues: function(where){
        var def = new Deferred();
        if(this._uniqueValueCache[where]){
          def.resolve(this._uniqueValueCache[where]);
        }else{
          this._showLoadingIcon();
          jimuUtils.getUniqueValues(this.url, this.fieldName, where, this.layerDefinition)
          .then(lang.hitch(this, function(valueLabels){
            if(!this.domNode){
              return;
            }
            this._uniqueValueCache[where] = valueLabels;
            def.resolve(valueLabels);
            this._hideLoadingIcon();
          }), lang.hitch(this, function(err){
            if(!this.domNode){
              return;
            }
            def.reject(err);
            this._hideLoadingIcon();
          }));
        }
        return def;
      }

    });
  });