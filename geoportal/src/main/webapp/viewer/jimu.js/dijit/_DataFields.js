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
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/_base/query',
  'dojo/on',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/Evented',
  'dojo/text!./templates/_DataFields.html'
],
function(declare, lang, array, html, query, on, _WidgetBase, _TemplatedMixin, Evented, template) {
  return declare([_WidgetBase, Evented, _TemplatedMixin], {
    baseClass: 'jimu-dijit-data-fields',
    templateString: template,
    isSingle: false,

    //public methods:
    //clear
    //setFields
    //selectFields
    //getSelectedFieldNames

    postMixInProperties:function(){
      this.nls = lang.clone(window.jimuNls.simpleTable);
    },

    postCreate: function(){
      this.inherited(arguments);
      this.own(on(this.domNode, 'click', lang.hitch(this, this._onDomClicked)));
    },

    clear: function(){
      html.empty(this.fieldsContent);
      this.emit('change');
    },

    setSingleMode: function(){
      this.isSingle = true;
      this._checkSingleMode();
    },

    setMultipleMode: function(){
      this.isSingle = false;
    },

    _checkSingleMode: function(checkedBox){
      if(!this.isSingle){
        return;
      }

      var allCbxes  = query('input', this.domNode);

      var checkedCbxes = array.filter(allCbxes, lang.hitch(this, function(cbx){
        return cbx.checked;
      }));

      if(checkedCbxes.length === 0){
        return;
      }

      if(!checkedBox){
        checkedBox = checkedCbxes[0];
      }

      var invalidCheckedCbxes = array.filter(checkedCbxes, lang.hitch(this, function(cbx){
        return cbx !== checkedBox;
      }));

      array.forEach(invalidCheckedCbxes, lang.hitch(this, function(cbx){
        cbx.checked = false;
      }));
    },

    setFields: function(fields){
      //[{name,alias,checked}]
      this.clear();
      array.forEach(fields, lang.hitch(this, function(item){
        var str = '<div class="field-item"><input type="checkbox" /><span class="jimu-ellipsis" /></div>';
        var fieldItemDom = html.toDom(str);
        var cbx = query('input', fieldItemDom)[0];
        var span = query('span', fieldItemDom)[0];
        cbx.checked = !!item.checked;
        span.innerHTML = item.alias || item.name;
        span.title = item.alias || item.name;
        fieldItemDom.fieldName = item.name;
        html.place(fieldItemDom, this.fieldsContent);
        this.own(on(cbx, 'change', lang.hitch(this, function(){
          if(cbx.checked){
            this._checkSingleMode(cbx);
          }
          this.emit('change');
        })));
      }));
      this.emit('change');
    },

    selectFields: function(fieldNames, notMoveFieldToFirst) {
      if (lang.isArrayLike(fieldNames)) {
        var names = lang.clone(fieldNames);
        names.reverse();
        array.forEach(names, lang.hitch(this, function(name) {
          var fieldItemDom = this._getFieldItemDivByName(name);
          if (fieldItemDom) {
            if(!notMoveFieldToFirst){
              html.place(fieldItemDom, fieldItemDom.parentNode, 'first');
            }
            var cbx = query('input', fieldItemDom)[0];
            cbx.checked = true;
          }
        }));
      }
      this.emit('change');
    },

    getSelectedFieldNames: function(){
      var fieldItemDivs = query('.field-item', this.fieldsContent);
      var fieldNames = [];
      array.forEach(fieldItemDivs, lang.hitch(this, function(fieldItemDom){
        var cbx = query('input', fieldItemDom)[0];
        if(cbx.checked){
          fieldNames.push(fieldItemDom.fieldName);
        }
      }));
      return fieldNames;
    },

    _getFieldItemDivByName: function(name){
      var divs = query('.field-item', this.fieldsContent);
      var fieldItemDoms = array.filter(divs, lang.hitch(this, function(div){
        return div.fieldName === name;
      }));
      return fieldItemDoms[0];
    },

    _onDomClicked: function(event){
      var target = event.target || event.srcElement;
      if(html.isDescendant(target, this.fieldsContent) && target !== this.fieldsContent){
        var tagName = target.tagName.toLowerCase();
        var fieldItemDom = null;
        if(html.hasClass(target, 'field-item')){
          fieldItemDom = target;
          this._selectFieldItemDom(fieldItemDom);
        }
        else if(tagName === 'span'){
          fieldItemDom = target.parentNode;
          this._selectFieldItemDom(fieldItemDom);
        }
        else if(tagName === 'input'){
          fieldItemDom = target.parentNode;
          if(target.checked){
            this._selectFieldItemDom(fieldItemDom);
          }
          else{
            html.removeClass(fieldItemDom, 'selected');
          }
        }

        this._updateHighLightIcons();
      }
    },

    _updateHighLightIcons: function() {
      var fieldItemDom = this._getSelectedFieldItemDiv();

      if (fieldItemDom && html.hasClass(fieldItemDom, 'selected')) {
        var highLightClass = 'high-light';

        if (fieldItemDom.previousSibling) {
          html.addClass(this.btnUp, highLightClass);
        } else {
          html.removeClass(this.btnUp, highLightClass);
        }

        if (fieldItemDom.nextSibling) {
          html.addClass(this.btnDown, highLightClass);
        } else {
          html.removeClass(this.btnDown, highLightClass);
        }
      }
    },

    _selectFieldItemDom: function(fieldItemDom){
      query('.field-item', this.fieldsContent).removeClass('selected');
      html.addClass(fieldItemDom, 'selected');
    },

    _getSelectedFieldItemDiv: function(){
      var fieldItemDom = null;
      var divs = query('.field-item.selected', this.fieldsContent);
      if(divs.length > 0){
        fieldItemDom = divs[0];
      }
      return fieldItemDom;
    },

    _moveUp: function(){
      var fieldItemDom = this._getSelectedFieldItemDiv();
      if(fieldItemDom && fieldItemDom.previousSibling){
        html.place(fieldItemDom, fieldItemDom.previousSibling, 'before');
      }
      this._updateHighLightIcons();
    },

    _moveDown: function(){
      var fieldItemDom = this._getSelectedFieldItemDiv();
      if(fieldItemDom && fieldItemDom.nextSibling){
        html.place(fieldItemDom, fieldItemDom.nextSibling, 'after');
      }
      this._updateHighLightIcons();
    }
  });
});