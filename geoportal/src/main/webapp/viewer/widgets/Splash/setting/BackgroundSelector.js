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
    './ColorPickerEditor',
    'jimu/dijit/ImageChooser',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./BackgroundSelector.html',
    'jimu/dijit/RadioBtn'
  ],
  function(declare, lang, on, html,
           ColorPickerEditor, ImageChooser,
           _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
      templateString: template,
      nls: null,
      _defaultColor: '#485566',
      _defaultTransparency: 0,
      _defaultFillType: "fill",
      _imageMaxSize: (1024),//1M

      postCreate: function() {
        this.backgroundColorPicker = new ColorPickerEditor({nls: this.nls}, this.backgroundColorPickerEditor);
        this.backgroundColorPicker.startup();

        this.imageChooser = new ImageChooser({
          cropImage: false,
          showSelfImg: true,
          format: [ImageChooser.GIF, ImageChooser.JPEG, ImageChooser.PNG],
          goldenWidth: 160,
          goldenHeight: 90,
          maxSize: this._imageMaxSize,
          label: this.nls.chooseFile
        }, this.imageChooser);

        this.inherited(arguments);
      },
      startup: function() {
        this._initBgEvent();
        this._selectItem(this._defaultFillType);
        this.sizeType = this._defaultFillType;
        this.inherited(arguments);
      },

      _initBgEvent: function() {
        this.own(on(this.colorFillBtn, 'click', lang.hitch(this, function() {
          this._clickColorFillBtn();
        })));
        this.own(on(this.imageFillBtn, 'click', lang.hitch(this, function() {
          this._clickImageFillBtnBtn();
        })));

        this.own(on(this.imageChooser, 'imageChange', lang.hitch(this, function(data, fileProperty) {
          /* jshint unused: true */
          this._showFillsType();
          if (fileProperty) {
            this._setFileName(fileProperty.fileName);
          }
        })));

        this.own(on(this.fill, 'click', lang.hitch(this, function() {
          this.sizeType = "fill";
        })));
        this.own(on(this.fit, 'click', lang.hitch(this, function() {
          this.sizeType = "fit";
        })));
        this.own(on(this.stretch, 'click', lang.hitch(this, function() {
          this.sizeType = "stretch";
        })));
        this.own(on(this.center, 'click', lang.hitch(this, function() {
          this.sizeType = "center";
        })));
        this.own(on(this.tile, 'click', lang.hitch(this, function() {
          this.sizeType = "tile";
        })));
      },
      isValid: function () {
        return this.backgroundColorPicker.isValid();
      },
      getValues: function() {
        var bg = {};
        bg.mode = this.mode;
        //if ("image" === this.mode) {
        //image
        bg.image = this.imageChooser.imageData;
        bg.type = this.sizeType;
        bg.fileName = encodeURIComponent(this.fileName.innerHTML);
        //} else {
        //color
        var bgColor = this.backgroundColorPicker.getValues();
        bg.color = bgColor.color;
        bg.transparency = bgColor.transparency;
        //}
        return bg;
      },
      _setColorPicker: function(bg) {
        var color = this._defaultColor;
        var transparency = this._defaultTransparency;
        if (bg) {
          color = bg.color;
          transparency = bg.transparency;
        }

        this.backgroundColorPicker.setValues({
          "color": color,
          "transparency": transparency
        });
      },
      setValues: function(config) {
        if ("undefined" !== typeof config.splash && "undefined" !== typeof config.splash.background) {
          var bg = config.splash.background;
          //if ("image" === bg.mode) {
          //this._setColorPicker();
          // } else {
          this._setColorPicker(bg);
          if (bg.image) {
            this.imageChooser.setDefaultSelfSrc(bg.image);
            this._showFillsType();
          }
          if (bg.fileName) {
            this.fileName.innerHTML = decodeURIComponent(bg.fileName);
          }
          if (bg.type) {
            this._selectItem(bg.type);
            this.sizeType = bg.type;
          }

          if ("image" === bg.mode) {
            this._selectItem("imageFillBtn");
            this._clickImageFillBtnBtn();
          } else {
            this._selectItem("colorFillBtn");
            this._clickColorFillBtn();
          }
          //}
          // } else {
          //   this._setColorPicker();
          //   this._selectItem("colorFillBtn");
          //   this._clickColorFillBtn();
        }
      },
      _selectItem: function(name) {
        var _radio = this[name];//registry.byNode(query('.jimu-radio', this[name])[0]);
        if (_radio && _radio.check) {
          _radio.check(true);
        }
      },
      _clickColorFillBtn: function() {
        html.addClass(this.colorFillOptions, 'hide');
        html.addClass(this.imageFillOptions, 'hide');
        html.removeClass(this.colorFillOptions, 'hide');
        this.mode = "color";
      },
      _clickImageFillBtnBtn: function() {
        html.addClass(this.colorFillOptions, 'hide');
        html.addClass(this.imageFillOptions, 'hide');
        html.removeClass(this.imageFillOptions, 'hide');
        this.mode = "image";
      },
      _hideFillsType: function() {
        html.addClass(this.fillsType, 'hide');
      },
      _showFillsType: function() {
        html.removeClass(this.fillsType, 'hide');
      },
      _setFileName: function(str) {
        this.fileName.innerHTML = str;
      }
    });
  });