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
    'dojo/_base/config',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/Evented',
    'dojo/text!./templates/_Transparency.html',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/on',
    'dijit/form/HorizontalSlider',
    'dijit/form/HorizontalRuleLabels',
    'dijit/form/HorizontalRule'
  ],
  function(declare, dojoConfig, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    Evented, template, lang, html, on, HorizontalSlider, HorizontalRuleLabels,
    HorizontalRule) {/* jshint unused: false */
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'jimu-transparency',
      declaredClass: 'jimu.dijit.Transparency',
      templateString: template,
      nls: null,
      _nls0: '0%',
      _nls50: '50%',
      _nls100: '100%',

      //options:
      alpha: 1.0,

      //public methods:
      //setAlpha
      //getAlpha

      //events：
      //change

      postMixInProperties: function() {
        this.nls = window.jimuNls.transparency;
        var locale = dojoConfig.locale || "";
        locale = locale.toLowerCase();
        if(locale === 'ar'){
          this._nls0 = '٪0';
          this._nls50 = '٪50';
          this._nls100 = '٪100';
        }else if(locale === 'tr'){
          this._nls0 = '%0';
          this._nls50 = '%50';
          this._nls100 = '%100';
        }
      },

      postCreate: function(){
        this.inherited(arguments);
        if(typeof this.alpha === 'number'){
          this.setAlpha(this.alpha);
        }
      },

      setAlpha: function(alpha){
        var value = Math.round(100 - alpha * 100);
        this.opacitySlider.set('value', value);
      },

      getAlpha: function(){
        var alpha = Math.round(100 - this.opacitySlider.get('value')) / 100;
        return alpha;
      },

      _onAlphaChanged: function(){
        var alpha = this.getAlpha();
        this.emit('change', alpha);
      }

    });
  });