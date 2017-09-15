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
    "dojo/_base/lang",
    'dojo/on',
    'dojo/_base/html',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./SizeSelector.html',
    "dijit/form/NumberSpinner",
    'jimu/dijit/CheckBox'
  ],
  function(declare, lang, on, html,
           _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
      templateString: template,
      nls: null,
      _size: null,
      _isCustom: false,

      postCreate: function() {
        this.inherited(arguments);
        this._initSize();
      },
      startup: function() {
        //TODO over screen piex
        this.inherited(arguments);
      },
      _initSize: function() {
        this.own(on(this.percent25, 'click', lang.hitch(this, function() {
          this._cleanSelected();
          html.addClass(this.percent25, "selected");
        })));
        this.own(on(this.percent50, 'click', lang.hitch(this, function() {
          this._cleanSelected();
          html.addClass(this.percent50, "selected");
        })));
        this.own(on(this.percent75, 'click', lang.hitch(this, function() {
          this._cleanSelected();
          html.addClass(this.percent75, "selected");
        })));
        this.own(on(this.percent100, 'click', lang.hitch(this, function() {
          this._cleanSelected();
          html.addClass(this.percent100, "selected");
        })));
        this.own(on(this.custom, 'click', lang.hitch(this, function() {
          this._cleanSelected();
          html.addClass(this.custom, "selected");
          this._setCustomSizeDisplay();
        })));
      },
      _setCustomSizeDisplay: function() {
        if (html.hasClass(this.custom, 'selected')) {
          html.setStyle(this.wh, "display", "block");
        } else {
          html.setStyle(this.wh, "display", "none");
        }
      },
      _cleanSelected: function() {
        html.removeClass(this.percent25, 'selected');
        html.removeClass(this.percent50, 'selected');
        html.removeClass(this.percent75, 'selected');
        html.removeClass(this.percent100, 'selected');
        html.removeClass(this.custom, 'selected');
        this._setCustomSizeDisplay();
      },

      getValue: function() {
        var val = {};
        val.mode = "percent";
        if (html.hasClass(this.percent25, 'selected')) {
          val.percent = "25%";
        } else if (html.hasClass(this.percent50, 'selected')) {
          val.percent = "50%";
        } else if (html.hasClass(this.percent75, 'selected')) {
          val.percent = "75%";
        } else if (html.hasClass(this.percent100, 'selected')) {
          val.percent = "100%";
        } else if (html.hasClass(this.custom, 'selected')) {
          val.mode = "wh";
        }
        //record wh values all the time
        val.wh = {};
        val.wh.w = this.width.getValue();
        val.wh.h = this.height.getValue();

        return val;
      },
      setValue: function(obj) {
        this._cleanSelected();
        if (typeof obj === "object") {
          if (typeof obj.wh !== "undefined") {
            this.width.setValue(obj.wh.w);
            this.height.setValue(obj.wh.h);
          }

          if (obj.mode === "wh") {
            html.addClass(this.custom, "selected");
          }

          if (obj.mode === "percent" && typeof obj.percent !== "undefined") {
            if (obj.percent === "25%") {
              html.addClass(this.percent25, "selected");
            } else if (obj.percent === "50%") {
              html.addClass(this.percent50, "selected");
            } else if (obj.percent === "75%") {
              html.addClass(this.percent75, "selected");
            } else {
              html.addClass(this.percent100, "selected");
            }
          }
        }
        this._setCustomSizeDisplay();
      }
    });
  });