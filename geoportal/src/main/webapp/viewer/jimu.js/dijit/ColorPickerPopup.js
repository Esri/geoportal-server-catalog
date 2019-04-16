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
      around: null,

      _ENABLE: true,
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

      enable: function (){
        this._ENABLE = true;
        html.removeClass(this.domNode, "disable");
      },
      disable: function() {
        this._ENABLE = false;
        html.addClass(this.domNode, "disable");
      },

      isPartOfPopup: function(target) {
        var node = this.tooltipDialog.domNode;
        var isInternal = target === node || html.isDescendant(target, node);
        return isInternal;
      },

      hideTooltipDialog: function() {
        this._hideTooltipDialog();
      },

      showTooltipDialog: function() {
        this._showTooltipDialog();
      },

      initUI: function(){
        this.picker.initUI();
      },

      _showTooltipDialog: function() {
        dojoPopup.open({
          parent: this.getParent(),
          popup: this.tooltipDialog,
          around: this.around ? this.around : this.domNode,//position
          orient: this.orient
        });

        this._isTooltipDialogOpened = true;
      },

      _hideTooltipDialog: function() {
        dojoPopup.hide(this.tooltipDialog);
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
            showColorPickerOK: true,//ok btn
            showColorPickerApply: true,//apply btn
            showCoustomRecord: true,
            closeDialogWhenChange: true//TODO
          },
          recordUID: this.recordUID,
          onChange: lang.hitch(this, function(color) {
            if (color) {
              var newColor = new Color(color);
              this.setColor(newColor);
              this.onChange(newColor);//emit change event
            }
          })
        });
        picker.placeAt(ttdContent);
        picker.startup();

        this.own(on(picker, 'close', lang.hitch(this, function () {
          this._hideTooltipDialog();
        })));
        this.own(on(picker, 'change-style', lang.hitch(this, function () {
          this._hideTooltipDialog();
          this._showTooltipDialog();//re-open to re-posction
        })));

        this.own(on(this.domNode, 'click', lang.hitch(this, function(event) {
          event.stopPropagation();
          event.preventDefault();

          if (this._isTooltipDialogOpened) {
            this._hideTooltipDialog();
          } else {
            if (false !== this._ENABLE) {
              this._showTooltipDialog();
            }
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
      }
    });
  });