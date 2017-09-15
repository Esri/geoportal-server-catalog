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
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/on',
    'dojo/_base/Color',
    'dijit/TooltipDialog',
    'dijit/popup',
    'jimu/dijit/ColorPalette',
    'jimu/utils'
  ],
  function(declare, _WidgetBase, _TemplatedMixin, lang, html, on, Color, TooltipDialog,
    dojoPopup, ColorPalette, jimuUtils) {
    return declare([_WidgetBase, _TemplatedMixin], {
      baseClass: 'jimu-color-pickerPopup',
      declaredClass: 'jimu.dijit.ColorPickerPopup',
      templateString: '<div class="jimu-color-picker"></div>',
      _isTooltipDialogOpened: false,
      color: null, //dojo.Color or hex string

      showLabel: false,
      //events:
      //change
      recordUID: "",

      postCreate: function() {
        this.inherited(arguments);
        this._createTooltipDialog(this.domNode);
        this._hideTooltipDialog();
      },

      destroy: function() {
        dojoPopup.close(this.tooltipDialog);
        this.picker.destroy();
        this.tooltipDialog.destroy();
        this.inherited(arguments);
      },

      isPartOfPopup: function(target) {
        var node = this.tooltipDialog.domNode;
        var isInternal1 = target === node || html.isDescendant(target, node);

        var nodeInsidePopup = null;
        if (this.picker && this.picker.getPickerTooltipDialog) {
          nodeInsidePopup = this.picker.getPickerTooltipDialog().domNode;
        }
        var isInternal2 = target === nodeInsidePopup || html.isDescendant(target, nodeInsidePopup);

        var isInternal = isInternal1 || isInternal2;
        return isInternal;
      },

      hideTooltipDialog: function() {
        this._hideTooltipDialog();
      },

      _showTooltipDialog: function() {
        dojoPopup.open({
          parent: this.getParent(),
          popup: this.tooltipDialog,
          around: this.domNode
        });
        this._isTooltipDialogOpened = true;
      },

      _hideTooltipDialog: function() {
        dojoPopup.close(this.tooltipDialog);
        this._isTooltipDialogOpened = false;
      },

      _createTooltipDialog: function() {
        var ttdContent = html.create("div");
        this.tooltipDialog = new TooltipDialog({
          content: ttdContent
        });
        html.addClass(this.tooltipDialog.domNode, 'jimu-color-picker-popup-dialog');

        var picker = new ColorPalette({
          appearance: {
            showTransparent: false,
            showColorPalette: true,
            showCoustom: true,
            showCoustomRecord: true
          },
          recordUID: this.recordUID,
          onChange: lang.hitch(this, function(color) {
            if (color) {
              var newColor = new Color(color);
              this.setColor(newColor);
              this.onChange(newColor);
            }
          })
        });
        picker.placeAt(ttdContent);
        picker.startup();

        // this.own(on(picker, 'jimuColorPicker-popupOpen', lang.hitch(this, function () {
        // })));
        this.own(on(picker, 'jimuColorPicker-popupClose', lang.hitch(this, function () {
          this._hideTooltipDialog();
        })));

        this.own(on(this.domNode, 'click', lang.hitch(this, function(event) {
          event.stopPropagation();
          event.preventDefault();

          if (this._isTooltipDialogOpened) {
            this._hideTooltipDialog();
          } else {
            this._showTooltipDialog();
          }
        })));
        this.own(on(document, 'click', lang.hitch(this, function(event) {
          var target = event.srcElement || event.target;
          if (!this.isPartOfPopup(target)) {
            this._hideTooltipDialog();
          }
        })));

        this.picker = picker;
      },

      setColor: function(newColor) {
        if (!(newColor instanceof Color)) {
          return;
        }

        //init label
        if (this.color === null && true === this.showLabel) {
          this._changeLabel(newColor);
        }

        var newHex = newColor.toHex();
        this.color = newColor;
        html.setStyle(this.domNode, 'backgroundColor', newHex);
        if (this.picker) {
          this.picker.refreshRecords();
          this.picker.setColor(newHex, false, true);
        }

        if (this.showLabel) {
          this._changeLabel(this.color);
        }
      },

      getColor: function() {
        return this.color;
      },

      _changeLabel: function(newColor) {
        html.empty(this.domNode);
        html.create('span', {
          innerHTML: newColor.toHex(),
          className: "color-label",
          style: {
            color: jimuUtils.invertColor(newColor.toHex())
          }
        }, this.domNode);
      },

      onChange: function(newColor) {
        /*jshint unused: false*/
        if (newColor && this.showLabel) {
          this._changeLabel(newColor);
        }
      },
      changeColor: function() {
        if (this.picker) {
          this.picker.changeColor();
        }
        if (this.showLabel) {
          this._changeLabel(this.color);
        }
      },
      setTitle: function(str) {
        this.domNode.title = str;
      },
      getTooltipDialog: function() {
        return this.tooltipDialog || null;
      },
      isJimuColorPickerTooltipDialogOpened: function(){
        return this.picker.isJimuColorPickerTooltipDialogOpened();
      }
    });
  });