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
  'dijit/_WidgetsInTemplateMixin',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/on',
  'dojo/_base/Color',
  'dojo/query',
  "jimu/dijit/ColorChooser",
  'jimu/dijit/CustomColorPicker',
  'jimu/dijit/ColorRecords',
  'dijit/popup',
  'jimu/utils',
  "dijit/a11yclick"
],
  function (Evented, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    lang, html, on, Color, query,
    ColorChooser, CustomColorPicker, ColorRecords, dojoPopup, jimuUtils, a11yclick) {
    return declare([_WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Evented], {
      templateString: "<div></div>",
      baseClass: 'jimu-color-palette',
      declaredClass: 'jimu.dijit.ColorPalette',
      _TRANSPARENT_STR: "rgba(0, 0, 0, 0)",

      value: "",//typeof dojoColor
      _defaultAppearance: {
        showTransparent: true,
        showColorPalette: true,
        showCoustom: true,
        showColorPickerOK: false,//ok btn
        showColorPickerApply: true,//apply btn
        showCoustomRecord: true,
        closeDialogWhenChange: false//close colorPalette dialog, when color changed
      },
      recordUID: "",//uid for colorRecords

      postMixInProperties: function () {
        this.nls = window.jimuNls.colorPalette;
      },

      postCreate: function () {
        this.inherited(arguments);

        //default color
        if (this.value) {
          this.value = new Color(this.value);
        } else {
          this.value = new Color('#fff');
        }

        this._createContent();
      },

      initUI: function () {
        //restore init ui
        var isTirggerEvent = false;
        this._toggleCustomColorPicker("init", isTirggerEvent);
      },

      _createContent: function () {
        this.appearance = lang.mixin(this._defaultAppearance, this.appearance);

        var tooltipDialogContent = html.create("div", { "class": "jimu-colorpalette" }, this.domNode);

        this.initPanel = html.create("div", { "class": "init-panel" }, tooltipDialogContent);
        this.customPanel = html.create("div", { "class": "custom-panel hide" }, tooltipDialogContent);

        if (this.appearance.showTransparent) {
          this._createSpecialColors( this.initPanel);
        }
        if (this.appearance.showColorPalette) {
          this._createColorChooser( this.initPanel);
        }
        if (this.appearance.showCoustom) {
          this._createCustomColorPicker( this.initPanel);
        }
        if (this.appearance.showCoustom && this.appearance.showCoustomRecord) {
          this._createCoustomRecord( this.initPanel);
        }
      },
      setColor: function (newColor) {
        if (!this._isColorEqual(newColor)) {
          this.value = new Color(newColor);

          this._setSpatialColor(this.value);
          if ("undefined" !== typeof this.value.a && 0 === this.value.a) {
            //"transparent"
            this.colorChooser.setColor(new Color('transparent'), false);
            this.picker.setColor(new Color("#fff"), false);//set white color for picker, as "transparent"
          } else {
            //not "transparent"
            this.colorChooser.setColor(this.value.toHex(), false);//hex work,only
            this.picker.setColor(this.value, false);
          }

          if (this.colorRecords) {
            this.colorRecords.selecteColor(this.value);
          }
        }
      },
      getColor: function () {
        return this.value;
      },
      changeColor: function(isClose){
        if ("undefined" !== typeof this.value.a && 0 === this.value.a) {
          this.onChange(this.value);
        } else {
          this.onChange(this.value.toHex());
        }

        this.emit("change", this.value);

        if (true === this.appearance.closeDialogWhenChange &&
          isClose !== false//DO NOT close dialog, when apply click
        ) {
          this._closeDialog();
        }
      },
      refreshRecords: function () {
        if (this.colorRecords) {
          this.colorRecords.refresh();
        }
      },
      destroy: function () {
        dojoPopup.close(this.tooltipDialog);
        this.picker.destroy();
        this.inherited(arguments);
      },

      //1.SpecialColors
      _createSpecialColors: function (tooltipDialogContent) {
        var specialColorDom = html.create("div", {
          "class": "special-color"
        }, tooltipDialogContent);

        this.transparentBtn = html.create("div", {
          "class": "transparent btn",
          innerHTML: '<div class="btn-wapper"><div class="transparent icon jimu-float-leading"></div>' +
          '<div class="transparent text jimu-float-leading">' + this.nls.transparent + '</div></div>'
        }, specialColorDom);

        this.own(on(this.transparentBtn, a11yclick, lang.hitch(this, this._onTransparentClick)));
      },
      _onTransparentClick: function () {
        this.setColor(new Color("transparent"));
        this.changeColor();
      },
      _setSpatialColor: function (color) {
        if (this.transparentBtn) {
          var wapper = query(".btn-wapper",this.transparentBtn)[0];
          html.removeClass(wapper, "selected");
          if (color && color.toString) {
            var isTransparent = (color.toString() === this._TRANSPARENT_STR);
            if (isTransparent) {
              html.addClass(wapper, "selected");
            }
          }
        }
      },

      //2. DojoColorPalette
      _createColorChooser: function (tooltipDialogContent) {
        this.colorChooser = new ColorChooser({});
        this.colorChooser.placeAt(tooltipDialogContent);
        this.own(on(this.colorChooser, 'change', lang.hitch(this, function (colorStr) {
          var color = new Color(colorStr);
          this.setColor(color);
          this.changeColor();
        })));
      },

      //3. customColorPicker
      _createCustomColorPicker: function () {
        this.coustomtBtn = html.create("div", {
          "class": "coustom btn",
          "innerHTML": '<div class="btn-wapper"><div class="custom icon jimu-float-leading"></div>' +
          '<div class="custom text jimu-float-leading">' + this.nls.custom + '</div></div>'
        }, this.initPanel);

        this.own(on(this.coustomtBtn, 'click', lang.hitch(this, function () {
          this._toggleCustomColorPicker("custom");
        })));

        this.picker = new CustomColorPicker({
          showOk: this.appearance.showColorPickerOK,
          showApply: this.appearance.showColorPickerApply,
          value: this.value.toHex()
        });

        this.picker.placeAt(this.customPanel);
        this.picker.setColor(this.value);

        this.own(on(this.picker, 'ok', lang.hitch(this, function (color) {
          this.setColor(new Color(color));
          this.changeColor();

          this._addAColorRecord(color);

          this._toggleCustomColorPicker("init");
          this._closeDialog();
        })));
        this.own(on(this.picker, 'apply', lang.hitch(this, function (color) {
          this.setColor(new Color(color));
          var isClose = false;
          this.changeColor(isClose);

          this._addAColorRecord(color);
        })));
        this.own(on(this.picker, 'cancel', lang.hitch(this, function () {
          this._toggleCustomColorPicker("init");
          this._closeDialog();
        })));
      },

      _toggleCustomColorPicker: function (mode, isTirgger) {
        if ("custom" === mode) {
          html.removeClass(this.customPanel, "hide");
          html.addClass(this.initPanel, "hide");
        } else {
          html.addClass(this.customPanel, "hide");
          html.removeClass(this.initPanel, "hide");
        }

        if ("undefined" !== typeof isTirgger && false === isTirgger) {

        } else {
          this.emit("change-style");
        }
      },

      //4. CoustomRecord
      _createCoustomRecord: function (tooltipDialogContent) {
        this.colorRecords = new ColorRecords({
          recordsLength: 10,
          uid: this.recordUID || ""
        });
        this.colorRecords.placeAt(tooltipDialogContent);

        this.own(on(this.colorRecords, 'choose', lang.hitch(this, function (color) {
          this.setColor(new Color(color));
          this.changeColor();
        })));
      },
      _addAColorRecord: function(color){
        if (this.colorRecords && this.colorRecords.push) {
          this.colorRecords.push(color);//update colorRecord
        }
      },

      ///////////////////////////////////////////////////////////////////////////////
      _isColorEqual: function (newColor) {
        if (this.value.toString() === new Color(newColor).toString()) {
          return true;
        } else {
          return false;
        }
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
      // onChange: function (newColor) {
      //   this.emit("change", newColor);
      // },
      onOpen: function(){
        this.openDialog();
      },
      openDialog: function(){
        this.initUI();
      },
      _closeDialog: function(){
        this.emit("close");
      },
      onClose: function () {
        this._closeDialog();//for parent call, like EditorBackgroundColor.js
      }
    });
  });