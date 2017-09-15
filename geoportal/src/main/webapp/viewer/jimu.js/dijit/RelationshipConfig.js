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

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/RelationshipConfig.html',
  'dojo/dom-construct',
  'dojo/_base/lang',
  'dojo/_base/array'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
  template, domConstruct, lang, array) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    _def:null,
    declaredClass: 'jimu.dijit.RelationshipConfig',
    baseClass:'jimu-single-filter',
    templateString:template,
    fields:null,//array,{name,alias,type,/*optional*/ visible}
    config:null,
    title:'',

    postCreate: function(){
      this.inherited(arguments);

      if(this.fields){
        this.setFields(this.fields);
      }
    },

    getConfig: function(){
      var config = {
        tableId: this.tableId,
        fields:[]
      };
      var trs = this.fieldsTable.getRows();
      array.forEach(trs, lang.hitch(this, function(tr){
        var rowData = this.fieldsTable.getRowData(tr);
        if (rowData.visibility) {
          config.fields.push({
            name: rowData.name,
            alias: rowData.alias,
            type: tr.fieldType,
            showInInfoWindow:true
          });
        }
      }));
      return config;
    },

    setFields:function(fields, visibleFields){
      if(fields instanceof Array && fields.length > 0){
        this._setFields(fields, visibleFields);
        this.loading.hide();
      }
    },

    setTitle: function(val){
      this.title = val;
      domConstruct.empty(this.titleLabel);
      domConstruct.create('div', {
        innerHTML: val
      }, this.titleLabel);
    },

    clear:function(){
      this.fieldsTable.clear();
    },

    _setFields:function(fields, visibleFields){
      this.fields = array.filter(fields, function(item) {
        return item.type !== 'esriFieldTypeGeometry';
      });
      if (this.fields.length > 0) {
        array.forEach(this.fields, lang.hitch(this, function(fieldInfo) {
          var visible = false;
          if(visibleFields instanceof Array &&
            array.indexOf(visibleFields, fieldInfo.name) >= 0){
            visible = true;
          }
          this._addRow(fieldInfo, visible);
        }));
      }
    },

    _addRow:function(fieldInfo, visible){
      var rowData = {
        visibility: visible,
        name:fieldInfo.name,
        alias:fieldInfo.alias || fieldInfo.name
      };
      var result = this.fieldsTable.addRow(rowData);
      if(result.success){
        result.tr.fieldType = fieldInfo.type;
      }
    },

    _destroySelf:function(){
      this.destroy();
    }
  });
});