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
  'dojox/widget/ColorPicker'
],
function(declare, _WidgetBase, _TemplatedMixin, lang, html, on, Color, TooltipDialog,
  dojoPopup, DojoColorPicker) {
  return declare([_WidgetBase, _TemplatedMixin], {
    baseClass: 'jimu-color-picker-btn',
    declaredClass: 'jimu.dijit.ColorPickerButton',
    templateString: '<div>' +
      '<div class="color-node" data-dojo-attach-point="colorNode"></div>' +
      '<div class="seperator"></div>' +
      '<div class="action-node" data-dojo-attach-point="actionNode"></div>' +
    '</div>',
    _isTooltipDialogOpened: false,

    //options:
    color: null, //dojo.Color or hex string
    showHex: true,
    showHsv: true,
    showRgb: true,
    ensureMode: false,

    //public methods:
    //setColor
    //getColor
    //isPartOfPopup

    //events:
    //change

    postMixInProperties: function() {
      this.nls = window.jimuNls.common;
    },

    postCreate: function() {
      this.inherited(arguments);
      if (this.color) {
        if (!(this.color instanceof Color)) {
          this.color = new Color(this.color);
        }
      } else {
        this.color = new Color('#ccc');
      }

      html.setStyle(this.colorNode, 'backgroundColor', this.color.toHex());
      this.colorNode.title = this.color.toHex();

      if (this.showLabel) {
        this._changeLabel(this.color);
      }
      this._createTooltipDialog(this.domNode);
      this._hideTooltipDialog();

      this.own(on(this.colorNode, 'click', lang.hitch(this, this._onNodeClick)));
      this.own(on(this.actionNode, 'click', lang.hitch(this, this._onNodeClick)));

      this.own(on(document.body, 'click', lang.hitch(this, function(event) {
        var target = event.target || event.srcElement;
        if (!this.isPartOfPopup(target)) {
          this._hideTooltipDialog();
        }
      })));
    },

    _onNodeClick: function(event) {
      event.stopPropagation();
      event.preventDefault();

      if (this._isTooltipDialogOpened) {
        this._hideTooltipDialog();
      } else {
        this._showTooltipDialog();
      }
    },

    destroy: function() {
      dojoPopup.close(this.tooltipDialog);
      this.picker.destroy();
      this.tooltipDialog.destroy();
      this.inherited(arguments);
    },

    isPartOfPopup: function(target) {
      var node = this.tooltipDialog.domNode;
      var isInternal = target === node || html.isDescendant(target, node);
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
      html.addClass(this.tooltipDialog.domNode, 'jimu-color-picker-dialog');
      this.picker = new DojoColorPicker({
        showHex: this.showHex,
        showRgb: this.showRgb,
        showHsv: this.showHsv,
        value: this.color.toHex(),
        onChange: lang.hitch(this, function(newHex) {
          if (!this.ensureMode) {
            var color = new Color(newHex);
            this.setColor(color);
          }
        })
      });
      this.picker.placeAt(ttdContent);
      this.picker.startup();

      if (this.ensureMode) {
        var cancel = html.create('div', {
          'class': 'jimu-btn jimu-btn-vacation jimu-float-trailing jimu-leading-margin1',
          'title': this.nls.cancel,
          'innerHTML': this.nls.cancel
        }, ttdContent);
        this.own(on(cancel, 'click', lang.hitch(this, function() {
          this._hideTooltipDialog();
        })));

        var ok = html.create('div', {
          'class': 'jimu-btn jimu-float-trailing jimu-leading-margin1',
          'title': this.nls.ok,
          'innerHTML': this.nls.ok
        }, ttdContent);
        this.own(on(ok, 'click', lang.hitch(this, function() {
          var c = this.picker.get('value');
          this.setColor(new Color(c));
          this._hideTooltipDialog();
        })));

        var apply = html.create('div', {
          'class': 'jimu-btn jimu-float-trailing jimu-leading-margin1',
          'title': this.nls.apply,
          'innerHTML': this.nls.apply
        }, ttdContent);
        this.own(on(apply, 'click', lang.hitch(this, function() {
          var c = this.picker.get('value');
          this.setColor(new Color(c));
        })));
      }
    },

    setColor: function(newColor) {
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
      html.setStyle(this.colorNode, 'backgroundColor', newHex);
      if (oldHex !== newHex) {
        this.picker.set('value', newHex);
        this.onChange(new Color(newHex));
      }
    },

    getColor: function() {
      return this.color;
    },

    onChange: function(newColor) {
      /*jshint unused: false*/
    }
  });
});