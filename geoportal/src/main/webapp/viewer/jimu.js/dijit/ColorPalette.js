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
  'jimu/dijit/ColorPicker',
  'jimu/dijit/ColorRecords',
  'dijit/popup',
  'jimu/utils',
  "dijit/a11yclick"
],
  function (Evented, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    lang, html, on, Color, query,
    ColorChooser, JimuColorPicker, ColorRecords, dojoPopup, jimuUtils, a11yclick) {
    return declare([_WidgetBase, _WidgetsInTemplateMixin, _TemplatedMixin, Evented], {
      templateString: "<div></div>",
      baseClass: 'jimu-color-palette',
      declaredClass: 'jimu.dijit.ColorPalette',
      _TRANSPARENT_STR: "rgba(0, 0, 0, 0)",

      value: "",//dojoColor
      _defaultAppearance: {
        showTransparent: true,
        showColorPalette: true,
        showColorPickerOK: false,
        showCoustom: true,
        showCoustomRecord: true
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
      _createContent: function () {
        this.appearance = lang.mixin(this._defaultAppearance, this.appearance);

        var tooltipDialogContent = html.create("div", { "class": "jimu-colorpalette" }, this.domNode);

        if (this.appearance.showTransparent) {
          this._createSpecialColors(tooltipDialogContent);
        }
        if (this.appearance.showColorPalette) {
          this._createColorChooser(tooltipDialogContent);
        }
        if (this.appearance.showCoustom) {
          this._createJimuColorPicker(tooltipDialogContent);
        }
        if (this.appearance.showCoustom && this.appearance.showCoustomRecord) {
          this._createCoustomRecord(tooltipDialogContent);
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
      changeColor: function(){
        if ("undefined" !== typeof this.value.a && 0 === this.value.a) {
          this.onChange(this.value);
        } else {
          this.onChange(this.value.toHex());
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

      //3. JimuColorPicker
      _createJimuColorPicker: function (tooltipDialogContent) {
        this.coustomtBtn = html.create("div", {
          "class": "coustom btn"
        }, tooltipDialogContent);

        var customColorHtml = '<div class="btn-wapper"><div class="custom icon jimu-float-leading"></div>' +
          '<div class="custom text jimu-float-leading">' + this.nls.custom + '</div></div>';
        this.picker = new JimuColorPicker({
          ensureMode: true,
          showOk: this.appearance.showColorPickerOK,
          showLabel: false,
          value: this.value.toHex(),
          onChange: lang.hitch(this, function (colorHex) {
            //JimuColorPicker use hex or RGB only, can't use Rgba
            var color = new Color(colorHex);
            this.setColor(color);
            this.changeColor();

            if (this.colorRecords && this.colorRecords.push) {
              this.colorRecords.push(color);
            }
          }),
          onClose: lang.hitch(this, function () {
            this.emit("jimuColorPicker-popupClose");
          })
        });
        this.picker.placeAt(this.coustomtBtn);
        this.picker.setLabel(customColorHtml);//icon + text
        //this.picker.setColor(this.value, false);
        this.picker.setColor(this.value);
        // this.own(on(this.picker, 'popupopen', lang.hitch(this, function () {
        //   this.emit("jimuColorPicker-popupOpen");
        // })));
        // this.own(on(this.picker, 'popupclose', lang.hitch(this, function () {
        //   this.emit("jimuColorPicker-popupClose");
        // })));
      },
      isJimuColorPickerTooltipDialogOpened: function(){
        return this.picker.isTooltipDialogOpened();
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
      getPickerTooltipDialog: function(){
        var tooltipDialog = null;
        if(this.picker && this.picker.tooltipDialog){
          tooltipDialog = this.picker.tooltipDialog;
        }
        return tooltipDialog;
      }//,
      // onChange: function (newColor) {
      // /*jshint unused: false*/
      // // if (this.showColorInBG) {
      // //   html.setStyle(this.domNode, 'backgroundColor', newColor.toString());
      // // }
      // // if (this.showLabel) {
      // //   this._changeLabel(newColor);
      // // }
      //   this.emit("change", newColor);
      // }
    });
  });