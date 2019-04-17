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

define(['dojo/Evented',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/_base/Color',
  "jimu/dijit/ColorSelector"
],
  function (Evented, declare, _WidgetBase, _TemplatedMixin, lang, html, on, Color, ColorSelector) {
    return declare([_WidgetBase, _TemplatedMixin, Evented], {
      baseClass: 'jimu-color-picker',
      declaredClass: 'jimu.dijit.ColorPicker',
      templateString: '<div></div>',
      _isTooltipDialogOpened: false,

      //options:
      color: null, //dojo.Color or hex string
      showHex: true,
      showHsv: true,
      showRgb: true,
      ensureMode: false,
      showLabel: false,

      //public methods:
      //setColor
      //getColor
      //isPartOfPopup

      //events:
      //change

      postMixInProperties: function () {
        this.nls = window.jimuNls.common;
      },

      postCreate: function () {
        this.inherited(arguments);
        if (this.color) {
          if (!(this.color instanceof Color)) {
            this.color = new Color(this.color);
          }
        } else {
          this.color = new Color('#ccc');
        }

        html.setStyle(this.domNode, 'backgroundColor', this.color.toHex());

        this._createDialog(this.domNode);
      },

      destroy: function () {
        //dojoPopup.close(this.tooltipDialog);
        this.picker.destroy();
        //this.tooltipDialog.destroy();
        this.inherited(arguments);
      },

      _handlerOk: function (event) {
        if (event && event.stopPropagation && event.preventDefault) {
          event.stopPropagation();
          event.preventDefault();
        }

        this.emit("ok", this.color);
      },
      _handlerApply: function (event) {
        if (event && event.stopPropagation && event.preventDefault) {
          event.stopPropagation();
          event.preventDefault();
        }

        this.emit("apply", this.color);
      },
      _handlerCancel: function (event) {
        if (event && event.stopPropagation && event.preventDefault) {
          event.stopPropagation();
          event.preventDefault();
        }

        this.emit("cancel");
      },

      _createDialog: function () {
        var ttdContent = html.create("div", {
          "class": "dojox-color-picker-container"
        }, this.domNode);
        var picker = new ColorSelector({
          showHex: this.showHex,
          showRgb: this.showRgb,
          showHsv: this.showHsv,
          value: this.color.toHex(),
          onChange: lang.hitch(this, function (newHex) {
            var color = new Color(newHex);
            this.setColor(color);
          })
        });
        picker.placeAt(ttdContent);
        picker.startup();

        var btnsContainer = html.create("div", {
          "class": "btns-container jimu-float-trailing"
        }, ttdContent);
        //1. "ok" will set color AND close dialog
        if (true === this.showOk) {
          var ok = html.create('div', {
            'class': 'jimu-btn jimu-float-leading ok',
            'title': this.nls.ok,
            'innerHTML': this.nls.ok
          }, btnsContainer);
          this.own(on(ok, 'click', lang.hitch(this, function (e) {
            var c = this.picker.get('value');
            this.setColor(new Color(c));
            this._handlerOk(e);
          })));
        }
        //2. "apply" will set color, DO NOT close dialog
        if (true === this.showApply) {
          var apply = html.create('div', {
            'class': 'jimu-btn jimu-float-leading apply',
            'title': this.nls.apply,
            'innerHTML': this.nls.apply
          }, btnsContainer);
          this.own(on(apply, 'click', lang.hitch(this, function (e) {
            var c = this.picker.get('value');
            this.setColor(new Color(c));
            this._handlerApply(e);
          })));
        }
        //3. just close dialog
        var cancel = html.create('div', {
          'class': 'jimu-btn jimu-btn-vacation jimu-float-leading',
          'title': this.nls.cancel,
          'innerHTML': this.nls.cancel
        }, btnsContainer);
        this.own(on(cancel, 'click', lang.hitch(this, function (e) {
          this._handlerCancel(e);
        })));

        this.picker = picker;
      },

      setColor: function (newColor/*, isOnChange*/) {
        if (!(newColor instanceof Color)) {
          return;
        }
        var oldColor = this.color;
        var oldHex = '';
        if (oldColor) {
          oldHex = oldColor.toHex();
        }
        var newHex = newColor.toHex();
        this.color = newColor;

        if (oldHex !== newHex) {
          this.picker.set('value', newHex);
          // if (false !== isOnChange) {
          //   this.onChange(new Color(newHex)); //==> onChange will hide popoup
          // }
        }
      },

      getColor: function () {
        return this.color;
      },
      // onChange: function (newColor) {
      //   /*jshint unused: false*/

      //   if (this.showLabel) {
      //     this._changeLabel(newColor);
      //   }
      // },
      onClose: function () {
      }
    });
  });