///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/ExportChooser.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/dom-style',
  'dojo/on'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang, array,
  dom, domConstruct, domClass, domStyle, on) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    templateString: template,
    baseClass: 'jimu-export-chooser',
    declaredClass: 'jimu.dijit.ExportChooser',
    dataSource: null,
    nls: null,

    postMixInProperties: function(){
      this.nls = window.jimuNls.exportTo;
    },

    postCreate: function(){
      this.inherited(arguments);

      if(this.dataSource){
        var supportedFormats = this.dataSource.getSupportExportFormats();
        if(supportedFormats.length > 0){
          this.initFormats(supportedFormats);
          this.own(on(this.exportFormats, 'click', lang.hitch(this, this._onFormatClick)));
          this.own(on(document.body, 'click', lang.hitch(this, this._onBodyClick)));
        }
      }
    },

    initFormats: function(supportedFormats){
      array.forEach(supportedFormats, function(format){
        var formatNode = domConstruct.create('div', {
          'class': 'export-item jimu-ellipsis',
          'data-value': format.value,
          innerHTML: format.label
        });
        domConstruct.place(formatNode, this.exportFormats);
      }, this);
    },

    _onBodyClick: function(event){
      var target = event.target || event.srcElement;
      if(!(target === this.exportFormats || dom.isDescendant(target, this.exportFormats))){
        this.hide();
      }
    },

    _onFormatClick: function(event){
      event.preventDefault();
      event.stopPropagation();
      var target = event.target || event.srcElement;
      if(domClass.contains(target, 'export-item')){
        this.hide();

        var format = target.getAttribute('data-value');
        this.dataSource.setFormat(format);
        this.dataSource.download();
      }
    },

    show: function(anchorX, anchorY){
      domStyle.set(this.domNode, {
        right: window.isRTL ? 'auto' : anchorX + 'px',
        left: window.isRTL ? anchorX + 'px' : 'auto',
        top: anchorY + 'px',
        display: 'block'
      });
    },

    hide: function(){
      domStyle.set(this.domNode, 'display', 'none');
    }
  });
});