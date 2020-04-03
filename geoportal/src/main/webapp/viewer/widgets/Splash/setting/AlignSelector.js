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
    "dojo/_base/lang",
    'dojo/on',
    'dojo/_base/html',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./AlignSelector.html',
    "dijit/form/NumberSpinner",
    'jimu/dijit/CheckBox'
  ],
  function(declare, lang, on, html,
           _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
      templateString: template,
      nls: null,
      // _size: null,
      // _isCustom: false,

      postCreate: function() {
        this.inherited(arguments);
        this._initAlign();
      },
      startup: function() {
        this.inherited(arguments);
      },
      _initAlign: function() {
        this.own(on(this.top, 'click', lang.hitch(this, function() {
          this._cleanSelected();
          html.addClass(this.top, "selected");
        })));
        this.own(on(this.middle, 'click', lang.hitch(this, function() {
          this._cleanSelected();
          html.addClass(this.middle, "selected");
        })));
      },

      _cleanSelected: function() {
        html.removeClass(this.top, 'selected');
        html.removeClass(this.middle, 'selected');
      },

      getValue: function() {
        var val;
        if (html.hasClass(this.top, 'selected')) {
          val = "top";
        } else if (html.hasClass(this.middle, 'selected')) {
          val = "middle";
        }
        return val;
      },
      setValue: function(align) {
        this._cleanSelected();
        if (typeof align === "string") {
          if (align === "top") {
            html.addClass(this.top, "selected");
          } else if (align === "middle") {
            html.addClass(this.middle, "selected");
          }
        }
      }
    });
  });