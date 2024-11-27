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

define(['dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/_base/Color',
  'dijit/TooltipDialog',
  'dijit/popup',
  "jimu/dijit/ColorSelector",
  'jimu/utils'
],
  function (declare, _WidgetBase, _TemplatedMixin, lang, html, on, Color, TooltipDialog,
    dojoPopup, ColorSelector, jimuUtils) {
    return declare([_WidgetBase, _TemplatedMixin], {
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
        if (this.showLabel) {
          this._changeLabel(this.color);
        }
        this._createTooltipDialog(this.domNode);
        this._hideTooltipDialog();
      },

      destroy: function () {
        dojoPopup.close(this.tooltipDialog);
        this.picker.destroy();
        this.tooltipDialog.destroy();
        this.inherited(arguments);
      },

      isPartOfPopup: function (target) {
        var node = this.tooltipDialog.domNode;
        var isInternal = target === node || html.isDescendant(target, node);
        return isInternal;
      },

      hideTooltipDialog: function () {
        this._hideTooltipDialog();
      },

      _showTooltipDialog: function () {
        dojoPopup.open({
          parent: this.getParent(),
          popup: this.tooltipDialog,
          around: this.domNode
        });
        this._isTooltipDialogOpened = true;
        //this.emit("popupopen");
      },

      _hideTooltipDialog: function () {
        this._isTooltipDialogOpened = false;
        //this.emit("popupclose");
        this.onClose();
        dojoPopup.close(this.tooltipDialog);
      },

      _createTooltipDialog: function () {
        var ttdContent = html.create("div");
        this.tooltipDialog = new TooltipDialog({
          content: ttdContent
        });
        html.addClass(this.tooltipDialog.domNode, 'jimu-color-picker-dialog');
        var picker = new ColorSelector({
          showHex: this.showHex,
          showRgb: this.showRgb,
          showHsv: this.showHsv,
          value: this.color.toHex(),
          onChange: lang.hitch(this, function (newHex) {
            if (!this.ensureMode) {
              var color = new Color(newHex);
              this.setColor(color);
            }
          })
        });
        picker.placeAt(ttdContent);
        picker.startup();

        if (this.ensureMode) {
          var cancel = html.create('div', {
            'class': 'jimu-btn jimu-btn-vacation jimu-float-trailing',
            'title': this.nls.cancel,
            'innerHTML': this.nls.cancel
          }, ttdContent);
          this.own(on(cancel, 'click', lang.hitch(this, function () {
            this._hideTooltipDialog();
          })));

          if ("undefined" === typeof this.showOk || true === typeof this.showOk) {
            var ok = html.create('div', {
              'class': 'jimu-btn jimu-float-trailing ok',
              'title': this.nls.ok,
              'innerHTML': this.nls.ok
            }, ttdContent);
            this.own(on(ok, 'click', lang.hitch(this, function () {
              var c = this.picker.get('value');
              this.setColor(new Color(c));
              this._hideTooltipDialog();//ok will close this tooltipDialog
            })));
          }

          var apply = html.create('div', {
            'class': 'jimu-btn jimu-float-trailing',
            'title': this.nls.apply,
            'innerHTML': this.nls.apply
          }, ttdContent);
          this.own(on(apply, 'click', lang.hitch(this, function () {
            var c = this.picker.get('value');
            this.setColor(new Color(c));//apply will NOT _hideTooltipDialog
          })));
        }


        this.own(on(this.domNode, 'click', lang.hitch(this, function (event) {
          event.stopPropagation();
          event.preventDefault();

          if (this._isTooltipDialogOpened) {
            this._hideTooltipDialog();
          } else {
            this._showTooltipDialog();
          }
        })));

        this.own(on(document.body, 'click', lang.hitch(this, function (event) {
          var target = event.target || event.srcElement;
          if (!this.isPartOfPopup(target)) {
            this._hideTooltipDialog();
          }
        })));

        this.picker = picker;
      },

      setColor: function (newColor, isOnChange) {
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
        html.setStyle(this.domNode, 'backgroundColor', newHex);
        if (oldHex !== newHex) {
          this.picker.set('value', newHex);

          if (false !== isOnChange) {
            this.onChange(new Color(newHex));
          }
        }
      },

      getColor: function () {
        return this.color;
      },

      _changeLabel: function (newColor) {
        html.empty(this.domNode);
        html.create('span', {
          innerHTML: newColor.toHex(),
          className: "color-label",
          style: {
            color: jimuUtils.invertColor(newColor.toHex())
          }
        }, this.domNode);
      },

      onChange: function (newColor) {
        /*jshint unused: false*/

        if (this.showLabel) {
          this._changeLabel(newColor);
        }
      },

      onClose: function(){

      },

      getPopup: function () {
        return this.tooltipDialog || null;
      },

      setLabel: function(text) {
        html.empty(this.domNode);
        html.create('span', {
          innerHTML: text || "",
          className: "text-label"
        }, this.domNode);
      },

      isTooltipDialogOpened:function(){
        return this._isTooltipDialogOpened;
      }
    });
  });