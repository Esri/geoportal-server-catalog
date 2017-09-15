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
    'dojo/Evented',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dojo/on',
    'dojo/query',
    'dijit/registry',
    'jimu/utils',
    'jimu/dijit/CheckBox'
  ],
  function(declare, _WidgetBase, _TemplatedMixin, Evented, lang, html, array, on, query, registry,
  jimuUtils, CheckBox) {

    return declare([_WidgetBase, _TemplatedMixin, Evented], {
      baseClass: 'jimu-simple-table',
      declaredClass: 'jimu.dijit.SimpleTable',
      templateString: '<div>' +
        '<div class="head-section" data-dojo-attach-point="headDiv">' +
          '<div class="table-div" data-dojo-attach-point="headTableDiv">' +
            '<table class="table" cellspacing="0"' +
              ' data-dojo-attach-point="tableInHeadSection">' +
              '<colgroup data-dojo-attach-point="headColgroup"></colgroup>' +
              '<thead class="simple-table-thead simple-table-title" ' +
              ' data-dojo-attach-point="thead"></thead>' +
            '</table>' +
          '</div>' +
        '</div>' +
        '<div class="body-section" data-dojo-attach-point="bodyDiv">' +
          '<div class="table-div" data-dojo-attach-point="bodyTableDiv">' +
            '<table class="table" cellspacing="0"' +
             'data-dojo-attach-point="tableInBodySection">' +
              '<colgroup data-dojo-attach-point="bodyColgroup"></colgroup>' +
              '<tbody class="simple-table-tbody" data-dojo-attach-point="tbody"></tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>',
      _name: null,
      _rowIndex: 0,
      _rowHeight: 30,
      _headHeight: 36,
      REPEATING_ERROR: "REPEATING_ERROR",
      _classSimpleTableRow: 'simple-table-row',
      _classFirstSimpleTableRow: 'first-simple-table-row',
      _classLastSimpleTableRow: 'last-simple-table-row',
      _classJimuStateDisabled: 'jimu-state-disabled',
      _classRowUpDiv: 'row-up-div',
      _classRowDownDiv: 'row-down-div',
      _classVerticalScroll: 'vertical-scroll',

      //options:
      autoHeight: true, //if true, automatically calculate the height
      selectable: false,
      fields: null,
      /*
        //fieldInfo's attributes:
        //name:field name
        //title:field title
        //type:text radio checkbox actions empty extension
        //class:class name of th and td
        //width:width of the field column, auto is default.
        //hidden:default false.If true,the field column will be hidden.

        //if text
          //editable:the text can be edited if true, default is false
          //unique:field value is unique in the column.
        //if checkbox
          //available values: true, false, null (null means the CheckBox is disabled)
          //onChange: the callback function for checkbox value change event, you can get tr and
          //CheckBox from this function
        //if actions
          //actions:['up','down','edit','delete']
        //if extension
          //create //function
          //setValue //function
          //getValue //function
      */

      //public methods:
      //clear
      //updateUI
      //clearEmptyRows
      //addEmptyRow
      //addRows
      //addRow
      //deleteRow
      //editRow
      //selectRow
      //getRows
      //getSelectedRow
      //getSelectedRowData
      //getData
      //getRowData
      //getRowDataArrayByFieldValue

      //events:
      //row-click
      //row-dblclick
      //row-select
      //rows-clear
      //row-add
      //row-edit
      //row-delete
      //row-up
      //row-down
      //actions-edit

      //css classes:
      //simple-table-title
      //simple-table-row
      //simple-table-field
      //simple-table-cell

      postMixInProperties: function(){
        this.nls = window.jimuNls.simpleTable;
      },

      postCreate: function() {
        this.inherited(arguments);
        this._initSelf();
      },

      startup: function() {
        this.inherited(arguments);
        this.updateUI();
      },

      _initSelf: function() {
        this.own(
          jimuUtils.bindClickAndDblclickEvents(this.tableInBodySection,
            lang.hitch(this, function(evt) {
              var target = evt.target || evt.srcElement;
              var tr = jimuUtils.getAncestorDom(target, function(dom) {
                return html.hasClass(dom, 'simple-table-row') && html.hasClass(dom, 'not-empty');
              }, this.tbody);
              if(tr){
                this.selectRow(tr);
                this._onClickRow(tr);
              }
            }), lang.hitch(this, function(evt) {
              var target = evt.target || evt.srcElement;
              var tr = jimuUtils.getAncestorDom(target, function(dom) {
                return html.hasClass(dom, 'simple-table-row') && html.hasClass(dom, 'not-empty');
              }, this.tbody);
              if(tr){
                this.selectRow(tr);
                this._onDblClickRow(tr);
              }
            }))
        );

        var num = Math.random().toString();
        this._name = 'jimu_table_' + num.slice(2, num.length);

        if (this.fields && this.fields.length > 0) {
          var tr = html.create('tr', {}, this.thead);
          array.forEach(this.fields, lang.hitch(this, function(item){
            var width = 'auto';
            if(item.type === 'actions'){
              item.name = 'actions';
            }

            if(item.hidden){
              width = 1;
            }
            else if(item.width !== undefined && item.width !== null){
              width = item.width;
            }
            else if(item.type === 'actions'){
              if(!item.name){
                item.width = this._calculateActionsWidth(item) + 20;
                width = item.width;
              }
            }

            html.create('col', {width:width}, this.headColgroup);
            html.create('col', {width:width}, this.bodyColgroup);

            var th = html.create('th', {
              innerHTML: item.title,
              title: item.title
            }, tr);

            if(item.type === 'checkbox'){
              th.innerHTML = "";
              //we should not bind its onChange event, because it maybe result in unexpected result
              var cbx = new CheckBox({
                label: item.title
              });
              var iconNode = query('.checkbox', cbx.domNode)[0];
              if(iconNode){
                iconNode.style.marginTop = "10px";
              }
              this.own(on(cbx.domNode, 'click', lang.hitch(this, function() {
                if (cbx.getValue()) {
                  this._checkAllTdCheckBoxes(item.name);
                } else {
                  this._uncheckAllTdCheckBoxes(item.name);
                }
              })));
              cbx.placeAt(th);
            }

            html.addClass(th, 'simple-table-field');

            if(item.hidden){
              html.addClass(th, 'hidden-column');
            }

            if (item['class']) {
              html.addClass(th, item['class']);
            }
            html.addClass(th, item.name);
          }));

          //this.addEmptyRow();
        } else {
          this.fields = null;
        }
      },

      _getThCheckBox: function(fieldName){
        var cbx = null;
        var selector = ".simple-table-field." + fieldName + " .jimu-checkbox";
        var dom = query(selector, this.thead)[0];
        cbx = registry.byNode(dom);
        return cbx;
      },

      _getAllEnabledTdCheckBoxes: function(fieldName){
        var selector = ".simple-table-cell." + fieldName + " .jimu-checkbox";
        var doms = query(selector, this.tbody);
        var cbxes = array.map(doms, function(dom){
          return registry.byNode(dom);
        });
        //just return enabled checkbox
        cbxes = array.filter(cbxes, function(cbx){
          return cbx.getStatus();
        });
        return cbxes;
      },

      _checkAllTdCheckBoxes: function(fieldName){
        var cbxes = this._getAllEnabledTdCheckBoxes(fieldName);
        array.forEach(cbxes, function(cbx){
          if(!cbx.getValue()){
            cbx.setValue(true);
          }
        });
      },

      _uncheckAllTdCheckBoxes: function(fieldName){
        var cbxes = this._getAllEnabledTdCheckBoxes(fieldName);
        array.forEach(cbxes, function(cbx){
          if(cbx.getValue()){
            cbx.setValue(false);
          }
        });
      },

      _delaySyncThCheckBoxStatusWithAllTdCheckBoxes: function(fieldName){
        setTimeout(lang.hitch(this, function(){
          this._syncThCheckBoxStatusWithAllTdCheckBoxes(fieldName);
        }), 100);
      },

      _syncThCheckBoxStatusWithAllTdCheckBoxes: function(fieldName){
        var cbxes = this._getAllEnabledTdCheckBoxes(fieldName);
        //find enabled cbxes
        cbxes = array.filter(cbxes, lang.hitch(this, function(cbx){
          return cbx.getStatus();
        }));
        if(cbxes.length === 0){
          return;
        }
        var thCbx = this._getThCheckBox(fieldName);
        var isAllChecked = array.every(cbxes, function(cbx){
          return cbx.getValue();
        });
        if(isAllChecked){
          if(!thCbx.getValue()){
            thCbx.setValue(true);
          }
        }else{
          if(thCbx.getValue()){
            thCbx.setValue(false);
          }
        }
      },

      clear: function() {
        var trs = this._getNotEmptyRows();
        var data = array.map(trs, lang.hitch(this, function(tr){
          return this.getRowData(tr);
        }));
        html.empty(this.tbody);
        array.forEach(trs, lang.hitch(this, function(tr, index) {
          var rowData = data[index];
          this._onDeleteRow(tr, rowData);
        }));
        //this.addEmptyRow();
        this.updateUI();
        this._rowIndex = 0;
        this._onClearRows(trs);
      },

      addRows: function(rowsData) {
        var results = [];
        if (this.fields && rowsData && rowsData.length > 0) {
          array.forEach(rowsData, lang.hitch(this, function(item) {
            results.push(this.addRow(item, -1, true));
          }));
        }
        this.updateUI();
        return results;
      },

      //example:{name1:value1,name2:value2...}
      addRow: function(rowData, /* optional */ index, /* optional */ dontUpdateUI) {
        this._rowIndex++;
        var result = {
          success: false,
          tr: null,
          errorCode: null,
          errorMessage: null,
          repeatFields: null
        };
        if (!this.fields || (typeof rowData !== 'object')) {
          return result;
        }

        var uniqueFieldMetas = array.filter(this.fields, lang.hitch(this, function(item) {
          return item.type === 'text' && item.unique === true;
        }));

        var repeatFieldMetas = array.filter(uniqueFieldMetas, lang.hitch(this, function(item) {
          var sameValueRows = this.getRowDataArrayByFieldValue(item.name, rowData[item.name]);
          return sameValueRows.length > 0;
        }));

        if (repeatFieldMetas.length > 0) {
          result.errorCode = this.REPEATING_ERROR;
          result.errorMessage = "repeating data";
          result.repeatFields = repeatFieldMetas;
          return result;
        }

        // this.clearEmptyRows();
        var tr = html.create("tr", {
          'class': "simple-table-row not-empty"
        }, this.tbody);
        var rowId = 'row' + this._rowIndex;
        html.setAttr(tr, 'rowId', rowId);

        array.forEach(this.fields, lang.hitch(this, function(fieldMeta) {
          var fieldData = rowData[fieldMeta.name];
          var type = fieldMeta.type;
          var td = null;
          if (type === 'actions') {
            td = this._createActionsTd(tr, fieldMeta);
          } else {
            if (type === "text") {
              td = this._createTextTd(tr, fieldMeta, fieldData);
            } else if (type === "radio") {
              td = this._createRadioTd(tr, fieldMeta, fieldData);
            } else if (type === 'checkbox') {
              td = this._createCheckboxTd(tr, fieldMeta, fieldData);
            } else if (type === "empty") {
              td = this._createEmptyTd(tr, fieldMeta);
            }
            else if(type === "extension"){
              td = this._createExtensionTd(tr, fieldMeta, fieldData);
            }
            if(fieldMeta.hidden){
              html.addClass(td, 'hidden-column');
            }
          }
        }));
        if(!dontUpdateUI){
          this.updateUI();
          var trs = this.getRows();
          if (typeof index === 'number' && index >= 0 && index < trs.length) {
            html.place(tr, trs[index], 'before');
          }
        }
        result.success = true;
        result.tr = tr;
        result.errorMessage = null;
        this._onAddRow(tr);
        return result;
      },

      deleteRow:function(tr){
        if(tr){
          var rowData = this.getRowData(tr);
          html.destroy(tr);
          this.updateUI();
          this._onDeleteRow(tr, rowData);
        }
      },

      selectRow:function(tr){
        if(this.selectable){
          var trs = query('.simple-table-row', this.tbody);
          trs.removeClass('jimu-state-active');
          html.addClass(tr, 'jimu-state-active');
          this._onSelectRow(tr);
        }
      },

      updateUI: function(){
        this._updateRowClassName();
        this._updateHeight();

        html.removeClass(this.domNode, this._classVerticalScroll);

        if(this.bodyDiv.clientHeight > 0){
          if(this.bodyDiv.clientHeight < this.bodyDiv.scrollHeight){
            html.addClass(this.domNode, this._classVerticalScroll);
          }
        }

        array.forEach(this.fields, lang.hitch(this, function(fieldMeta) {
          if (fieldMeta.type === 'checkbox') {
            this._delaySyncThCheckBoxStatusWithAllTdCheckBoxes(fieldMeta.name);
          }
        }));
      },

      _updateHeadTableWidth: function(){
        if(!this.domNode){
          return;
        }
        var bodyTableBox = html.getContentBox(this.tableInBodySection);
        var w = bodyTableBox.w;
        var headTableWidth = "100%";
        if(typeof w === 'number' && w > 0){
          headTableWidth = w + 'px';
        }
        html.setStyle(this.tableInHeadSection, 'width', headTableWidth);
      },

      _updateHeight: function(){
        if(this.autoHeight){
          var rows = this.getRows();
          var trCount = rows.length > 0 ? rows.length : 1;
          // var count = trCount + 1;
          var height = this._headHeight + this._rowHeight * trCount + 1;
          html.setStyle(this.domNode, 'height', height + 'px');
          // this.bodyDiv.style.overflowY = 'hidden';
        }
      },

      _updateRowClassName: function() {
        var originalFirtTr = query('.' + this._classFirstSimpleTableRow, this.tbody)[0];
        if(originalFirtTr){
          var originalFirstUpDiv = query('.' + this._classRowUpDiv, originalFirtTr)[0];
          if(originalFirstUpDiv){
            html.removeClass(originalFirstUpDiv, this._classJimuStateDisabled);
          }
        }

        var originalLastTr = query('.' + this._classLastSimpleTableRow, this.tbody)[0];
        if(originalLastTr){
          var originalLastDownDiv = query('.' + this._classRowDownDiv, originalLastTr)[0];
          if(originalLastDownDiv){
            html.removeClass(originalLastDownDiv, this._classJimuStateDisabled);
          }
        }

        var trs = query('.' + this._classSimpleTableRow, this.tbody);
        trs.removeClass('odd');
        trs.removeClass('even');
        trs.removeClass(this._classFirstSimpleTableRow);
        trs.removeClass(this._classLastSimpleTableRow);

        array.forEach(trs, lang.hitch(this, function(tr, index) {
          if (index % 2 === 0) {
            html.addClass(tr, 'odd');
          } else {
            html.addClass(tr, 'even');
          }
        }));

        if(trs.length > 0){
          var firstTr = trs[0];
          html.addClass(firstTr, this._classFirstSimpleTableRow);
          var firstUpDiv = query('.' + this._classRowUpDiv, firstTr)[0];
          if(firstUpDiv){
            html.addClass(firstUpDiv, this._classJimuStateDisabled);
          }

          var lastTr = trs[trs.length - 1];
          html.addClass(lastTr, this._classLastSimpleTableRow);
          var lastDownDiv = query('.' + this._classRowDownDiv, lastTr)[0];
          if(lastDownDiv){
            html.addClass(lastDownDiv, this._classJimuStateDisabled);
          }
        }
      },

      _createTextTd: function(tr, fieldMeta, fieldData) {
        var td = null;
        if (fieldMeta.editable) {
          td = this._createEditableTextTd(tr, fieldMeta, fieldData);
        } else {
          td = this._createNormalTextTd(tr, fieldMeta, fieldData);
        }
        return td;
      },

      _createNormalTextTd: function(tr, fieldMeta, fieldData) {
        var strTd = '<td class="simple-table-cell normal-text-td">' +
          '<div class="normal-text-div"></div></td>';
        var td = html.toDom(strTd);
        html.addClass(td, fieldMeta.name);
        var textDiv = query('div', td)[0];
        textDiv.innerHTML = fieldData || "";
        textDiv.title = fieldData || "";
        if (fieldMeta['class']) {
          html.addClass(td, fieldMeta['class']);
        }
        html.place(td, tr);
        return td;
      },

      _createEditableTextTd: function(tr, fieldMeta, fieldData) {
        var tdStr = '<td class="editable-text-td ' + fieldMeta.name + '">' +
        '<div class="editable-div">' +
        '</div><input class="editable-input" type="text" style="display:none;" /></td>';
        var td = html.toDom(tdStr);
        html.addClass(td, 'simple-table-cell');
        html.place(td, tr);
        if (fieldMeta['class']) {
          html.addClass(td, fieldMeta['class']);
        }
        var editableDiv = query('div', td)[0];
        var editableInput = query('input', td)[0];
        editableDiv.innerHTML = fieldData || "";
        if (editableDiv.innerHTML !== "") {
          editableDiv.title = editableDiv.innerText || editableDiv.innerHTML;
        }
        editableInput.value = editableDiv.innerHTML;
        this.own(on(editableDiv, 'dblclick', lang.hitch(this, function(event) {
          event.stopPropagation();
          editableInput.value = editableDiv.innerText || editableDiv.innerHTML;
          html.setStyle(editableDiv, 'display', 'none');
          html.setStyle(editableInput, 'display', 'inline');
          editableInput.focus();
        })));
        this.own(on(editableInput, 'blur', lang.hitch(this, function() {
          editableInput.value = lang.trim(editableInput.value);
          var oldValue = editableDiv.innerText || editableDiv.innerHTML;
          var newValue = editableInput.value;
          if (newValue !== '') {
            if (fieldMeta.unique) {
              var sameValueRows = this.getRowDataArrayByFieldValue(fieldMeta.name, newValue, tr);
              if (sameValueRows.length > 0) {
                editableInput.value = oldValue;
              } else {
                editableDiv.innerHTML = newValue;
              }
            } else {
              editableDiv.innerHTML = newValue;
            }
          } else {
            editableInput.value = oldValue;
          }

          html.setStyle(editableInput, 'display', 'none');
          html.setStyle(editableDiv, 'display', 'block');
        })));
        return td;
      },

      _createRadioTd: function(tr, fieldMeta, fieldData) {
        var tdStr = '<td class="radio-td ' + fieldMeta.name + '"><input class="jimu-radio-btn" type="radio" /></td>';
        var td = html.toDom(tdStr);
        html.addClass(td, 'simple-table-cell');
        html.place(td, tr);
        if (fieldMeta['class']) {
          html.addClass(td, fieldMeta['class']);
        }
        var radio = query('input', td)[0];
        if (fieldMeta.radio && fieldMeta.radio === "row") {
          radio.name = this._name + this._rowIndex;
        } else {
          radio.name = this._name + fieldMeta.name;
        }

        radio.checked = fieldData === true;
        return td;
      },

      _createCheckboxTd: function(tr, fieldMeta, fieldData) {
        var tdStr = '<td class="checkbox-td ' + fieldMeta.name + '"></td>';
        var td = html.toDom(tdStr);
        html.addClass(td, 'simple-table-cell');
        html.place(td, tr);
        if (fieldMeta['class']) {
          html.addClass(td, fieldMeta['class']);
        }
        var cbx = new CheckBox({
          onChange: lang.hitch(this, function(){
            this._delaySyncThCheckBoxStatusWithAllTdCheckBoxes(fieldMeta.name);
            if(typeof fieldMeta.onChange === 'function'){
              setTimeout(lang.hitch(this, function(){
                fieldMeta.onChange(tr, cbx);
              }), 200);
            }
          })
        });
        this.own(on(cbx, 'status-change', lang.hitch(this, function(){
          this._delaySyncThCheckBoxStatusWithAllTdCheckBoxes(fieldMeta.name);
        })));
        // var value = fieldData === true;
        // cbx.setValue(value);
        this._setValueForCheckBox(cbx, fieldData);
        cbx.placeAt(td);
        return td;
      },

      _createActionsTd: function(tr, fieldMeta) {
        var tdStr = '<td class="actions-td">' +
        '<div class="action-item-parent jimu-float-leading"></div></td>';
        var td = html.toDom(tdStr);
        html.addClass(td, 'simple-table-cell');
        var actionItemParent = query(".action-item-parent", td)[0];
        html.place(td, tr);
        if (fieldMeta['class']) {
          html.addClass(td, fieldMeta['class']);
        }

        array.forEach(fieldMeta.actions, lang.hitch(this, function(item) {
          if (item === 'up') {
            var moveupDiv = html.create('div', {
              'class': 'action-item jimu-float-leading row-up-div jimu-icon jimu-icon-up'
            }, actionItemParent);
            moveupDiv.title = this.nls.moveUp;
            this.own(on(moveupDiv, 'click', lang.hitch(this, function(event) {
              event.stopPropagation();

              if (!this.onBeforeRowUp(tr)){
                return;
              }
              var trs = query('.simple-table-row', this.tbody);
              var index = array.indexOf(trs, tr);
              if (index > 0) {
                var newIndex = index - 1;
                var trRef = trs[newIndex];
                if (trRef) {
                  html.place(tr, trRef, 'before');
                  this.updateUI();
                  this.emit('row-up', tr);
                }
              }
            })));
          } else if (item === 'down') {
            var movedownDiv = html.create('div', {
              'class': 'action-item jimu-float-leading row-down-div jimu-icon jimu-icon-down'
            }, actionItemParent);
            movedownDiv.title = this.nls.moveDown;
            this.own(on(movedownDiv, 'click', lang.hitch(this, function(event) {
              event.stopPropagation();

              if (!this.onBeforeRowDown(tr)){
                return;
              }
              var trs = query('.simple-table-row', this.tbody);
              var index = array.indexOf(trs, tr);
              if (index < trs.length - 1) {
                var newIndex = index + 1;
                var trRef = trs[newIndex];
                if (trRef) {
                  html.place(tr, trRef, 'after');
                  this.updateUI();
                  this.emit('row-down', tr);
                }
              }
            })));
          } else if (item === 'edit') {
            var editDiv = html.create('div', {
              'class': 'action-item jimu-float-leading row-edit-div jimu-icon jimu-icon-edit'
            }, actionItemParent);
            editDiv.title = this.nls.edit;
            this.own(on(editDiv, 'click', lang.hitch(this, function(event) {
              event.stopPropagation();

              if (!this.onBeforeRowEdit(tr)){
                return;
              }
              this._onActionsEdit(tr);
            })));
          } else if (item === 'delete') {
            var deleteDiv = html.create('div', {
              'class': 'action-item jimu-float-leading row-delete-div jimu-icon jimu-icon-delete'
            }, actionItemParent);
            deleteDiv.title = this.nls.deleteRow;
            this.own(on(deleteDiv, 'click', lang.hitch(this, function(event) {
              event.stopPropagation();

              if (!this.onBeforeRowDelete(tr)){
                return;
              }
              this.deleteRow(tr);
            })));
          }
        }));
        var width = this._calculateActionsWidth(fieldMeta) + 'px';
        html.setStyle(actionItemParent, 'width', width);
        return td;
      },

      _calculateActionsWidth:function(fieldMeta){
        var items = array.map(fieldMeta.actions, function(item){
          return item === 'up' || item === 'down' || item === 'edit' || item === 'delete';
        });
        return items.length * 20;
      },

      _createEmptyTd: function(tr, fieldMeta) {
        var td = html.create('td', {
          'class': fieldMeta.name
        }, tr);
        html.addClass(td, 'simple-table-cell');
        html.addClass(td, 'empty-text-td');
        if (fieldMeta['class']) {
          html.addClass(td, fieldMeta['class']);
        }
        return td;
      },

      _createExtensionTd: function(tr, fieldMeta, fieldData){
        var td = html.create('td', {
          'class': fieldMeta.name
        }, tr);
        html.addClass(td, 'simple-table-cell');
        html.addClass(td, 'extension-td');
        if (fieldMeta['class']){
          html.addClass(td, fieldMeta['class']);
        }
        if(fieldMeta.create && typeof fieldMeta.create === 'function'){
          fieldMeta.create(td);
        }
        if(fieldMeta.setValue && typeof fieldMeta.setValue === 'function'){
          fieldMeta.setValue(td, fieldData);
        }
        return td;
      },

      //tr is row you want to edit
      //rowData is like {name1:value1, name2: value2...}
      editRow: function(tr, rowData) {
        var result = {
          success: false,
          tr: null,
          errorCode: null,
          errorMessage: null,
          repeatFields: null
        };
        if (!this.fields || (typeof rowData !== 'object')) {
          return result;
        }
        if (!html.isDescendant(tr, this.tbody)) {
          return result;
        }
        var allFieldMetas = lang.mixin([], this.fields);
        var uniqueFieldMetas = array.filter(allFieldMetas, lang.hitch(this, function(item) {
          return item.type === 'text' && item.unique === true;
        }));

        var repeatFieldMetas = array.filter(uniqueFieldMetas, lang.hitch(this, function(item) {
          var sameValueRows = this.getRowDataArrayByFieldValue(item.name, rowData[item.name], tr);
          return sameValueRows.length > 0;
        }));

        if (repeatFieldMetas.length > 0) {
          result.errorCode = this.REPEATING_ERROR;
          result.errorMessage = "repeating data";
          result.repeatFields = repeatFieldMetas;
          return result;
        }
        var tds = query('.simple-table-cell', tr);
        array.forEach(this.fields, lang.hitch(this, function(fieldMeta, idx) {
          if (!rowData.hasOwnProperty(fieldMeta.name)) {
            return;
          }
          var td = tds[idx];
          var fieldData = rowData[fieldMeta.name];
          var type = fieldMeta.type;
          if (type === 'text') {
            if (fieldMeta.editable) {
              this._editEditableText(td, fieldMeta, fieldData);
            } else {
              this._editNormalText(td, fieldMeta, fieldData);
            }
          } else if (type === 'radio') {
            this._editRadio(td, fieldMeta, fieldData);
          } else if (type === 'checkbox') {
            this._editCheckbox(td, fieldMeta, fieldData);
          }
          else if(type === 'extension'){
            this._editExtension(td, fieldMeta, fieldData);
          }
        }));
        result.success = true;
        result.tr = tr;
        result.errorMessage = null;
        this._onEditRow(tr);
        return result;
      },

      _editNormalText: function(td, fieldMeta, fieldData) {
        /*jshint unused: false*/
        var normalTextDiv = query('div', td)[0];
        normalTextDiv.innerHTML = fieldData || "";
        normalTextDiv.title = normalTextDiv.innerHTML;
      },

      _editEditableText: function(td, fieldMeta, fieldData) {
        /*jshint unused: false*/
        var editableDiv = query('div', td)[0];
        editableDiv.innerHTML = fieldData || "";
        var editableInput = query('input', td)[0];
        editableInput.value = editableDiv.innerHTML;
      },

      _editRadio: function(td, fieldMeta, fieldData) {
        /*jshint unused: false*/
        var radio = query('input', td)[0];
        radio.checked = fieldData === true;
      },

      _editCheckbox: function(td, fieldMeta, fieldData) {
        /*jshint unused: false*/
        var dom = query('.jimu-checkbox', td)[0];
        var cbx = registry.byNode(dom);
        // var newValue = fieldData === true;
        // cbx.setValue(newValue);
        this._setValueForCheckBox(cbx, fieldData);
      },

      _setValueForCheckBox: function(cbx, value){
        if(value === null){
          cbx.setStatus(false);
        }else{
          cbx.setStatus(true);
          if(value !== cbx.getValue()){
            cbx.setValue(value);
          }
        }
      },

      _editExtension: function(td, fieldMeta, fieldData){
        if(fieldMeta.setValue && typeof fieldMeta.setValue === 'function'){
          fieldMeta.setValue(td, fieldData);
        }
      },

      _getAllRows: function(){
        return query('.simple-table-row', this.tbody);
      },

      _getNotEmptyRows: function() {
        var trs = this._getAllRows();
        return array.filter(trs, lang.hitch(this, function(tr) {
          return !html.hasClass(tr, 'empty');
        }));
      },

      _getEmptyRows: function() {
        var trs = this._getAllRows();
        return array.filter(trs, lang.hitch(this, function(tr) {
          return html.hasClass(tr, 'empty');
        }));
      },

      getRows: function() {
        return this._getNotEmptyRows();
      },

      getSelectedRow: function() {
        var result = null;
        var trs = query('.simple-table-row', this.tbody);
        var filterTrs = array.filter(trs, lang.hitch(this, function(tr) {
          return !html.hasClass(tr, 'empty') && html.hasClass(tr, 'jimu-state-active');
        }));
        if (filterTrs.length > 0) {
          result = filterTrs[0];
        }
        return result;
      },

      getSelectedRowData: function() {
        var result = null;
        var tr = this.getSelectedRow();
        if (tr) {
          result = this._getRowDataByTr(tr);
        }
        return result;
      },

      getData: function(/*optional*/ ignoredTr) {
        var trs = this._getNotEmptyRows();
        if(ignoredTr){
          trs = array.filter(trs, lang.hitch(this, function(tr){
            return tr !== ignoredTr;
          }));
        }
        var result = array.map(trs, lang.hitch(this, function(tr) {
          return this._getRowDataByTr(tr);
        }));
        return result;
      },

      getRowData: function(tr) {
        return this._getRowDataByTr(tr);
      },

      _getRowDataByTr: function(tr) {
        var rowData = null;
        if (tr) {
          rowData = {};
        } else {
          return null;
        }
        array.forEach(this.fields, lang.hitch(this, function(fieldMeta) {
          var type = fieldMeta.type;
          if (type === 'actions') {
            return;
          }
          var name = fieldMeta.name;
          rowData[name] = null;
          var td = query('.simple-table-cell.' + name, tr)[0];
          if (td) {
            if (type === 'text') {
              if (fieldMeta.editable) {
                var editableDiv = query('div', td)[0];
                rowData[name] = editableDiv.innerText || editableDiv.innerHTML;
              } else {
                var normalTextDiv = query('div', td)[0];
                rowData[name] = normalTextDiv.innerText || normalTextDiv.innerHTML;
              }
            } else if (type === 'radio') {
              var radio = query('input', td)[0];
              rowData[name] = radio.checked;
            } else if (type === 'checkbox') {
              var dom = query('.jimu-checkbox', td)[0];
              var cbx = registry.byNode(dom);
              if(cbx.getStatus()){
                rowData[name] = cbx.getValue();
              }else{
                rowData[name] = null;
              }
            }
            else if(type === 'extension'){
              if(fieldMeta.getValue && typeof fieldMeta.getValue === 'function'){
                rowData[name] = fieldMeta.getValue(td, fieldMeta);
              }
            }
          }
        }));
        return rowData;
      },

      getRowDataArrayByFieldValue: function(fieldName, fieldValue, /*optional*/ ignoredTr) {
        var result = [];
        if (!this.fields) {
          return [];
        }
        var validField = array.some(this.fields, lang.hitch(this, function(item) {
          return item.name === fieldName;
        }));
        if (!validField) {
          return [];
        }
        var rows = this.getData(ignoredTr);
        result = array.filter(rows, lang.hitch(this, function(row) {
          /* jshint eqeqeq: false*/
          return row[fieldName] == fieldValue;
        }));
        return result;
      },

      moveToTop: function(tr){
        if(tr && tr.parentNode === this.tbody){
          html.place(tr, this.tbody, 'first');
        }
      },

      _onClickRow: function(tr){
        this.emit('row-click', tr);
      },

      _onDblClickRow: function(tr){
        this.emit('row-dblclick', tr);
      },

      _onSelectRow: function(tr){
        this.emit('row-select', tr);
      },

      _onAddRow: function(tr){
        this.emit('row-add', tr);
      },

      _onEditRow: function(tr){
        this.emit('row-edit', tr);
      },

      _onDeleteRow: function(tr, rowData){
        this.emit('row-delete', tr, rowData);
      },

      _onEnterRow: function(tr){
        this.emit('row-enter', tr);
      },

      _onClearRows: function(trs){
        this.emit('rows-clear', trs);
      },

      _onActionsEdit: function(tr){
        this.emit('actions-edit', tr);
      },

      onBeforeRowUp: function(tr){
        /*jshint unused : false*/
        return true;
      },

      onBeforeRowDown: function(tr){
        /*jshint unused : false*/
        return true;
      },

      onBeforeRowEdit: function(tr){
        /*jshint unused : false*/
        return true;
      },

      onBeforeRowDelete: function(tr){
        /*jshint unused : false*/
        return true;
      }
    });
  });