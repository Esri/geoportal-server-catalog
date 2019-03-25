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
    'dojo/Evented',
    'dojo/on',
    'dojo/dom-attr',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dojo/query',
    'dijit/form/ValidationTextBox',
    'dijit/form/NumberTextBox',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./EditTable.html',
    'jimu/utils'
  ],
    function(lang, html, Evented, on, domAttr, declare, _WidgetBase, query,
      ValidationTextBox, NumberTextBox,
      _TemplatedMixin, _WidgetsInTemplateMixin,template, jimuUtils) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
        templateString: template,
        currentItem: null, //for radio
        dataList:[],
        codedValues: null,

        //optional
        isNumberField: true, //for validate
        tableType: 'unique', //for input[type=radio]

        postMixInProperties:function(){
          this.inherited(arguments);
          this.CommonNls = window.jimuNls.common;
          this.Nls = window.jimuNls.filterBuilder;
        },

        postCreate: function(){
          this.inherited(arguments);
          html.addClass(this.domNode, 'jimu-filter-mutcheck-list-value-provider');

          if(this.tableType === 'unique'){
            this.inputType = 'radio';
          }else{
            this.inputType = 'checkbox';
          }
        },

        //add dblclick event to item.
        _onListContentDblClicked: function(event){
          // console.log('dbclick...');
          this.isSearch = false;
          var target = event.target || event.srcElement;
          var itemDom = jimuUtils.getAncestorDom(target, function(dom){
            return html.hasClass(dom, 'item');
          }, 3);
          if(!itemDom){
            return;
          }
          if(!(html.hasClass(target, 'name') || html.hasClass(target, 'alias'))){
            return;
          }
          if(this._dijit){//click another when one is active
            this.editState = 'active';
            this.updateInputDivPre = this.updateInputDiv;
            this._dijitPre = this._dijit;
          }else{
            this.editState = 'negative';
          }

          //custom
          var isCustom = html.hasClass(itemDom, 'custom');
          this.placeHolder = target.innerText;
          if(!isCustom){
            this.currentLabel = target.innerText;
          }else{
            if(html.hasClass(target, 'alias') && this.placeHolder !== this.customLabel){
              this.currentLabel = target.innerText;
            }else{
              this.currentLabel = NaN;
            }
          }

          // this.currentLabel = target.innerText;
          domAttr.set(target, "innerHTML", '');

          var searchHtml = '';
          if(html.hasClass(target, 'name')){
            // '<span class="searchBtn" data-dojo-attach-event="click:_onSearchClicked">Search</span>'
            // searchHtml = '<span class="searchBtn">' + this.CommonNls.search + '</span>';
            // searchHtml = '<div class="searchBtn jimu-icon jimu-icon-search"></div>';
            searchHtml = '<div class="searchBtn"><div class="jimu-icon jimu-icon-down-arrow-8"></div></div>';
          }
          this.updateInputDiv = html.create("div", {
            "class": "updateInputDiv",
            "innerHTML":  '<div class="inputDiv"></div>' + searchHtml
          }, target);
          var inputNode = query('.inputDiv', this.updateInputDiv)[0];
          this.searchBtn = query('.searchBtn', this.updateInputDiv)[0];

          this.own(on(this.updateInputDiv, 'dblclick', lang.hitch(this, function(event){
            // console.log('dbclick..input...');
            event.stopPropagation();
            event.preventDefault();
          })));
          var dijitOptions = {
            required: false,
            intermediateChanges: false,
            value: this.currentLabel
          };
          if(this.codedValues && html.hasClass(target, 'name')){
            dijitOptions.disabled = true;
          }

          if(this.isNumberField && html.hasClass(target, 'name')){ //number
            dijitOptions.constraints = {pattern: "#####0.##########"};
            this._dijit = new NumberTextBox(dijitOptions);
          }else{ //string
            dijitOptions.trim = true;
            this._dijit = new ValidationTextBox(dijitOptions);
          }
          this._dijit.startup();

          this._dijit.on('keydown', (function(e){
            var code = e.keyCode || e.which;
            if (code === 13) {
              this._dijit.emit('blur');
            }
          }).bind(this));

          // this._dijit.on('mouseleave', (function(event){
          this._dijit.on('blur', lang.hitch(this, function(){
            var newLabel = this._dijit.state !== 'Error'? this._dijit.displayedValue : this.currentLabel;
            var dijitVal = this._dijit.get('value');
            if(dijitVal === '' || !dijitVal){//back to its previous value('' || NaN)
              newLabel = this.placeHolder;
            }else{
              if(this.placeHolder === this.customValue){//only verify by item's value
                var itemDom = jimuUtils.getAncestorDom(this._dijit.domNode, function(dom){
                  return html.hasClass(dom, 'item');
                }, 4);
                html.removeClass(itemDom, 'custom');
                this.emit("editTable_itemChanged");
              }
            }

            // domAttr.set(this._dijit.domNode.parentNode, "innerHTML", newLabel);
            // domAttr.set(this.updateInputDiv.parentNode, "innerHTML", newLabel);
            this.newLabel = newLabel;

            setTimeout(lang.hitch(this, function(){
              if(!this.isSearch && this.editState !== 'active'){
                if(html.hasClass(this.updateInputDiv.parentNode, 'name')){
                  this.updateInputDiv.parentNode.nextSibling.innerText = this.newLabel;
                }
                this.updateInputDiv.parentNode.innerHTML = this.newLabel;
                this._dijit = null;
                this.isSearch = false;
              }else if(this.editState === 'active'){
                if(html.hasClass(this.updateInputDiv.parentNode, 'name')){
                  this.updateInputDivPre.parentNode.nextSibling.innerText = this.newLabel;
                }
                this.updateInputDivPre.parentNode.innerHTML = this.newLabel;
                this.updateInputDivPre = null;
                this._dijitPre = null;
                this.editState = 'negative';
              }
            }), 300);
            // this._dijit = null;
            this.placeHolder = '';
          }));
          html.setStyle(this._dijit.domNode, 'width', '100%');
          // this._dijit.placeAt(target);
          this._dijit.placeAt(inputNode);

          // this._dijit.onFocus();
          // this._dijit.domNode.focus();
          var input = query('input', this._dijit.domNode)[1];
          if(this._dijit.get('value') === ''){
            domAttr.set(input, "placeholder", this.placeHolder);
          }
          input.focus();

          if(this.searchBtn){
            this.own(on(this.searchBtn, 'click', lang.hitch(this, function(event){
              if(this.isSearch){//prevent secondary clicks
                // console.log('repeated click');
                return;
              }
              this.isSearch = true;
              var _target = event.target || event.srcElement;
              this.searchTarget = _target;
              this.emit("editTable_openListSelectByName", this.newLabel);
              event.stopPropagation();
              event.preventDefault();
            })));

            if(this.codedValues){
              this.searchBtn.click();
            }
          }
        },

        _setNewLabel: function(name){
          // this._dijit.set('value', name);
          name = name ? name : this.newLabel;
          if(this.updateInputDiv && this.updateInputDiv.parentNode){
            var nameNode = this.updateInputDiv.parentNode;
            if(name === undefined){ //click outside when field is a codefield
              name = this._dijit.get('value');
            }else{
              nameNode.nextSibling.innerHTML = name;
              html.setAttr(nameNode, 'title', name);
              if(this.codedValues){
                var code = this._getCodeFromCodevalueLabel(name);
                html.setAttr(nameNode, 'data', code);
              }
              var itemDom = nameNode.parentNode;
              if(name !== this.customValue){
                html.removeClass(itemDom, 'custom');
              }
            }
            nameNode.innerHTML = name;
          }
          this.updateInputDiv = null;
          this._dijit = null;
        },

        // _onSearchClicked: function(){
        //   this.emit("editTable_openListSelectByName", 'table');
        // },

        _onListContentClicked: function(event){
          var target = event.target || event.srcElement;
          var itemDom = jimuUtils.getAncestorDom(target, function(dom){
            return html.hasClass(dom, 'item');
          }, 3);
          if(!itemDom){
            return;
          }
          if(html.hasClass(target, this.inputType)){
            if(this.inputType === 'radio' && this.currentItem === true){
              this.currentItem = this.getCurrentItem();
            }
            if(html.hasClass(target, 'checked')){
              if(this.inputType !== 'radio'){
                html.removeClass(target, 'checked');
              }else if(!html.hasClass(this.currentItem, 'checked')){ //can't unchecked current radio
                html.removeClass(target, 'checked');
              }
            }else{
              if(this.inputType === 'radio' && this.currentItem){
                html.removeClass(this.currentItem, 'checked');
              }
              html.addClass(target, 'checked');
              this.currentItem = target;
            }
          }else if(html.hasClass(target, 'action')){
            if(html.hasClass(target, 'up')){
              if(itemDom.previousElementSibling){
                html.place(itemDom, itemDom.previousElementSibling, 'before');
              }
            }else if(html.hasClass(target, 'down')){
              if(itemDom.nextElementSibling){
                html.place(itemDom, itemDom.nextElementSibling, 'after');
              }
            }else if(html.hasClass(target, 'delete')){
              html.destroy(itemDom);
              this.emit('editTable_itemChanged');
            }
          }
        },

        _getLabelFromCodevalue: function(codevalue){
          var label = codevalue;
          for(var key = 0; key < this.codedValues.length; key ++){
            var item = this.codedValues[key];
            if(item.value === codevalue){
              label = item.label;
              break;
            }
          }
          return label;
        },

        _getCodeFromCodevalueLabel: function(label){
          var codevalue = label;
          for(var key = 0; key < this.codedValues.length; key ++){
            var item = this.codedValues[key];
            if(item.label === label){
              codevalue = item.value;
              break;
            }
          }
          return codevalue;
        },

        _createTarget: function(name, label, checkedClass, isCustom){
          var itemClass = 'item';
          if(isCustom){
            name = this.customValue;
            label = this.customLabel;
            itemClass = 'item custom';
          }
          name = name || "";
          label = label ? label : name;
          checkedClass = checkedClass ? checkedClass : '';
          //save value to nameDom include codedvalue
          var value = name, dataAttr = '';
          if(this.codedValues && name !== this.Nls.addValuePlaceHolder){
            value = this._getLabelFromCodevalue(name);
            dataAttr = this.isNumberField ? "data=" + name : "data='" + name + "'";
          }
          var target = html.create("div", {
            "class": itemClass,
            "innerHTML": '<div class="label name jimu-ellipsis" title="' + name + '" ' + dataAttr + '>' +
                         value + '</div>' +
                         '<div class="label alias jimu-ellipsis" title="' + label + '">' + label + '</div>' +
                         '<div class="label ' + this.inputType + checkedClass + ' jimu-ellipsis"></div>' +
                         '<div class="actions jimu-float-trailing">' +
                            '<div class="delete action jimu-float-trailing"></div>' +
                            '<div class="down action jimu-float-trailing"></div>' +
                            '<div class="up action jimu-float-trailing"></div>' +
                         '</div>'
          }, this.listContent);
          return target;
        },

        _destroyTarget: function(name){
          var labels = query('.item .name', this.listContent);
          for(var key = 0; key < labels.length; key++){
            var label = labels[key];
            var labelTxt = domAttr.get(this._dijit.domNode.parentNode, "innerHTML");
            if(labelTxt === name){
              html.destroy(label.parentNode);
              break;
            }
          }
        },

        getCurrentItem: function(){
          var items = query('.item .radio', this.listContent);
          for(var key = 0; key < items.length; key ++){
            var item = items[key];
            if(html.hasClass(item,'checked')){
              return item;
            }
          }
          return null;
        },

        getListValues: function(){
          this.listItemsArray = [];//['a','b','c'];
          this.listValuesArray = [];
          var items = query('.item .name',this.listContent);
          for(var key = 0; key < items.length; key ++){
            var item = items[key];
            var parentDom = jimuUtils.getAncestorDom(item, function(dom){
              return html.hasClass(dom, 'item');
            }, 3);
            if(html.hasClass(parentDom, 'custom')){//delete item if value does not update
              continue;
            }
            var itemVal = item.innerText;
            if(this.codedValues){
              itemVal = html.getAttr(item, 'data');
            }
            itemVal = this.isNumberField? parseFloat(itemVal): itemVal;
            var itemObj = {
              value: itemVal,
              alias: item.nextSibling.innerText,
              isChecked: false
            };
            this.listItemsArray.push(itemObj);
            this.listValuesArray.push(item.innerText);
            if(html.hasClass(item.nextSibling.nextSibling, 'checked')){
              itemObj.isChecked = true;
            }
          }
          return {
            list: this.listItemsArray,
            valueList: this.listValuesArray //for multiple select to verify if cbxItem should be checked
          };
        },

        setListValues: function(dataList){
          domAttr.set(this.listContent, "innerHTML", '');
          for(var key = 0; key < dataList.length; key ++){
            var data = dataList[key];
            var checkedClass = '';
            if(data.isChecked){
              checkedClass = ' checked';
              this.currentItem = true;
            }

            this._createTarget(data.value, data.alias, checkedClass);
          }
        },


        _initTable: function(){

        },

        getDijits: function(){
          return [this.mutiValuesSelect];
        },

        destroy:function(){
          this.inherited(arguments);
        }
      });
  });