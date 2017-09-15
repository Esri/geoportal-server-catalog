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
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/ExportChooser.html',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/dom-construct',
  'dojo/dom-class',
  'dojo/dom-style',
  'dojo/dom-geometry',
  'dojo/on',
  'dojo/Evented'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, lang, array,
  domConstruct, domClass, domStyle, domGeom, on, Evented) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
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
          this.own(on(this.exportMask, 'click', lang.hitch(this, this.hide)));
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

    _onFormatClick: function(event){
      event.preventDefault();
      event.stopPropagation();
      var target = event.target || event.srcElement;
      if(domClass.contains(target, 'export-item')){
        this.hide();

        var format = target.getAttribute('data-value');
        this.dataSource.setFormat(format);
        this.dataSource.download();
        this.emit('start-downloading', format);
      }
    },

    show: function(anchorX, anchorY){
      var left, top, size, offset = 5;

      domStyle.set(this.domNode, {
        left: '-1000px',
        top: '0px',
        display: 'block'
      });

      size = domGeom.getMarginSize(this.domNode);

      if(window.isRTL) {
        if(anchorX + size.w > window.innerWidth){ // beyond right side of the browser
          left = window.innerWidth - size.w;
        }else if(anchorX < 0){// beyond left side of the browser
          left = 0;
        }else{
          left = anchorX;
        }
      } else {
        if(anchorX - size.w < 0){ // beyond left side of the browser
          left = 0;
        }else if(anchorX > window.innerWidth){ // beyond right side of the browser
          left = window.innerWidth - size.w;
        }else{
          left = anchorX - size.w;
        }
      }

      if(size.h > window.innerHeight) {
        top = 0;
      }else if(anchorY + size.h > window.innerHeight){
        top = window.innerHeight - size.h;
      }else if(anchorY + size.h + offset < window.innerHeight){
        top = anchorY + offset;
      }else {
        top = anchorY;
      }

      domStyle.set(this.domNode, {
        left: left + 'px',
        top: top + 'px'
      });
    },

    hide: function(){
      domStyle.set(this.domNode, 'display', 'none');
    }
  });
});