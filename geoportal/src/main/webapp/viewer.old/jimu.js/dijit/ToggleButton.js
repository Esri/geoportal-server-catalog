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
  'dijit/_WidgetBase',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/Evented'
],
function(declare, _WidgetBase, lang, html, on, Evented) {

  return declare([_WidgetBase, Evented], {
    'baseClass': 'jimu-toggle-button',
    declaredClass: 'jimu.dijit.ToggleButton',

    checked: false,

    postCreate: function(){
      this.innerNode = html.create('div', {
        'class': 'inner'
      }, this.domNode);

      if(this.checked){
        html.addClass(this.domNode, 'checked');
      }

      this.own(
        on(this.domNode, 'click', lang.hitch(this, function(){
          this.toggle();
        }))
      );
    },

    check: function(){
      this.checked = true;
      html.addClass(this.domNode, 'checked');
      this.emit('change', this.checked);
    },

    uncheck: function(){
      this.checked = false;
      html.removeClass(this.domNode, 'checked');
      this.emit('change', this.checked);
    },

    toggle: function(){
      if(this.checked){
        this.uncheck();
      }else{
        this.check();
      }
    },

    setValue: function(isCheck){
      if(this.checked === isCheck){
        return;
      }

      this.toggle();
    }

  });
});