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
  'dojo/on',
  'dojo/Evented',
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin'
],
function(on, Evented, html, lang, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    templateString: '<div></div>',
    baseClass: 'jimu-mobile-filter-popup',
    declaredClass: 'jimu.dijit.MobileFilterPopup',

    //options:
    filter: null,//Filter dijit instance
    onClose: null,//callback method
    onOk: null,//callback method
    onCancel: null,//callback method

    //methods:
    //close

    postCreate: function(){
      this.inherited(arguments);

      this.filter.placeAt(this.domNode);

      this.own(on(this.filter, 'apply', lang.hitch(this, function(){
        if(typeof this.onOk === 'function'){
          this.onOk();
        }
        this.close();
      })));

      this.own(on(this.filter, 'back', lang.hitch(this, function(){
        if(typeof this.onCancel === 'function'){
          this.onCancel();
        }
        this.close();
      })));

      html.place(this.domNode, document.body);
    },

    close: function(){
      if(typeof this.onClose === 'function'){
        this.onClose();
      }
      this.destroy();
    }
  });
});