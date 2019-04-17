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
    'dojo/_base/html',
    'dojo/on',
    'dojo/aspect',
    'dojo/cookie',
    'dojo/sniff',
    'dojo/query',
    './ColorPickerEditor',
    './BackgroundSelector',
    './SizeSelector',
    './AlignSelector',
    'dijit/registry',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Editor',
    'jimu/utils',
    'jimu/BaseWidgetSetting',
    "jimu/dijit/CheckBox",
    'jimu/dijit/TabContainer',
    'jimu/dijit/LoadingShelter',
    'dojo/Deferred',
    'dojo/NodeList-manipulate',
    "jimu/dijit/RadioBtn",
    'dijit/_editor/plugins/LinkDialog',
    'dijit/_editor/plugins/ViewSource',
    'dijit/_editor/plugins/FontChoice',
    'dojox/editor/plugins/Preview',
    'dijit/_editor/plugins/TextColor',
    'dojox/editor/plugins/ToolbarLineBreak',
    'dijit/ToolbarSeparator',
    'dojox/editor/plugins/FindReplace',
    'dojox/editor/plugins/PasteFromWord',
    'dojox/editor/plugins/InsertAnchor',
    'dojox/editor/plugins/Blockquote',
    'dojox/editor/plugins/UploadImage',
    'jimu/dijit/EditorChooseImage',
    'jimu/dijit/EditorTextColor',
    'jimu/dijit/EditorBackgroundColor'
  ],
  function(declare, lang, html, on, aspect, cookie, has, query,
           ColorPickerEditor, BackgroundSelector, SizeSelector, AlignSelector,
           registry, _WidgetsInTemplateMixin,
           Editor, utils, BaseWidgetSetting, CheckBox, TabContainer, LoadingShelter, Deferred) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-splash-setting',
      _defaultSize: {mode: "wh", wh: {w: 600, h: 264}},
      _defaultColor: '#485566',
      _defaultConfirmColor: "#ffffff",
      _defaultTransparency: 0,

      postMixInProperties: function() {
        this.nls = lang.mixin(this.nls, window.jimuNls.common);
      },
      postCreate: function() {
        //LoadingShelter
        this.shelter = new LoadingShelter({
          hidden: true
        });
        this.shelter.placeAt(this.domNode);
        this.shelter.startup();

        this.tab = new TabContainer({
          tabs: [{
            title: this.nls.content,
            content: this.contentTab
          }, {
            title: this.nls.appearance,
            content: this.appearanceTab
          }, {
            title: this.nls.options,
            content: this.optionsTab
          }],
          selected: this.nls.content
        });
        this.tab.placeAt(this.tabsContainer);
        this.tab.startup();
        //the editor of first page, need to calculate scroll bar
        this.own(on(this.tab, 'tabChanged', lang.hitch(this, function(title) {
          if (title === this.nls.content) {
            this.resize();
          }
        })));

        this.inherited(arguments);
      },
      initContentTab: function() {
        var head = document.getElementsByTagName('head')[0];
        var tcCssHref = window.apiUrl + "dojox/editor/plugins/resources/css/TextColor.css";
        var tcCss = query('link[href="' + tcCssHref + '"]', head)[0];
        if (!tcCss) {
          utils.loadStyleLink("editor_plugins_resources_TextColor", tcCssHref);
        }
        var epCssHref = window.apiUrl + "dojox/editor/plugins/resources/editorPlugins.css";
        var epCss = query('link[href="' + epCssHref + '"]', head)[0];
        if (!epCss) {
          utils.loadStyleLink("editor_plugins_resources_editorPlugins", epCssHref);
        }
        var pfCssHref = window.apiUrl + "dojox/editor/plugins/resources/css/PasteFromWord.css";
        var pfCss = query('link[href="' + pfCssHref + '"]', head)[0];
        if (!pfCss) {
          utils.loadStyleLink("editor_plugins_resources_PasteFromWord", pfCssHref);
        }

        this.initEditor();
      },
      initAppearanceTab: function() {
        this.sizeSelector = new SizeSelector({nls: this.nls}, this.sizeSelector);

        this.backgroundSelector = new BackgroundSelector({nls: this.nls}, this.backgroundSelector);
        this.backgroundSelector.startup();

        this.alignSelector = new AlignSelector({nls: this.nls}, this.alignSelector);
        this.alignSelector.startup();

        this.buttonColorPicker = new ColorPickerEditor({nls: this.nls}, this.buttonColorPickerEditor);
        this.buttonColorPicker.startup();

        this.confirmColorPicker = new ColorPickerEditor({nls: this.nls}, this.confirmColorPickerEditor);
        this.confirmColorPicker.startup();
      },
      initOptionsTab: function() {
        this.own(on(this.requireConfirmSplash, 'click', lang.hitch(this, function() {
          this.set('requireConfirm', true);
        })));
        this.own(on(this.noRequireConfirmSplash, 'click', lang.hitch(this, function() {
          this.set('requireConfirm', false);
        })));
        this.own(this.watch('requireConfirm', lang.hitch(this, this._changeRequireConfirm)));
        this.own(aspect.before(this, 'getConfig', lang.hitch(this, this._beforeGetConfig)));
        this.showOption = new CheckBox({
          label: this.nls.optionText,
          checked: false
        }, this.showOption);
        this.showOption.startup();
        html.addClass(this.showOption.domNode, 'option-text');
        this.confirmOption = new CheckBox({
          label: this.nls.confirmOption,
          checked: false
        }, this.confirmOption);
        this.confirmOption.startup();
        html.addClass(this.confirmOption.domNode, 'confirm-option');
      },

      startup: function() {
        this.inherited(arguments);
        this.shelter.show();
        if (!this.config.splash) {
          this.config.splash = {};
        }

        this.initContentTab();
        this.initAppearanceTab();
        this.initOptionsTab();

        this.setConfig(this.config);

        this.resize();
      },

      initEditor: function() {
        this.editor = new Editor({
          plugins: [
            'bold', 'italic', 'underline',
            utils.getEditorTextColor("splash"), utils.getEditorBackgroundColor("splash"),
            '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
            '|', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent'
          ],
          extraPlugins: [
            '|', 'createLink', 'unlink', 'pastefromword', '|', 'undo', 'redo',
            '|', 'chooseImage', '|', 'viewsource', 'toolbarlinebreak',
            {
              name: "dijit._editor.plugins.FontChoice",
              command: "fontName",
              custom: "Arial;Comic Sans MS;Courier New;Garamond;Tahoma;Times New Roman;Verdana".split(";")
            },
            'fontSize', 'formatBlock'
          ],
          style: "font-family:Verdana;"
        }, this.editor);
        html.setStyle(this.editor.domNode, {
          width: '100%',
          height: '100%'
        });
        this.editor.startup();

        var instrBox = html.getMarginBox(this.instructionNode);
        var footerBox = html.getMarginBox(this.splashFooterNode);

        html.setStyle(this.editorContainer, {
          top: instrBox.h + 8 + 'px',
          bottom: footerBox.h + 10 + 10 + 'px'
        });

        if (has('ie') !== 8) {
          this.editor.resize({
            w: '100%',
            h: '100%'
          });
        } else {
          var box = html.getMarginBox(this.editorContainer);
          this.editor.resize({
            w: box.w,
            h: box.h
          });
        }
      },

      setConfig: function(config) {
        this.config = config;

        this._setWidthForOldVersion().then(lang.hitch(this, function() {
          this.editor.set('value', config.splash.splashContent || this.nls.defaultContent);
          this.set('requireConfirm', config.splash.requireConfirm);
          this.showOption.setValue(config.splash.showOption);
          this.confirmOption.setValue(config.splash.confirmEverytime);
          html.setAttr(
            this.confirmText,
            'value',
            utils.stripHTML(config.splash.confirm.text || this.nls.defaultConfirmText)
          );
          this.confirmColorPicker.setValues({
            "color": config.splash.confirm.color || this._defaultConfirmColor,
            "transparency": config.splash.confirm.transparency || this._defaultTransparency
          });

          this.sizeSelector.setValue(config.splash.size || this._defaultSize);
          if ("undefined" !== typeof config.splash.image) {
            this.imageChooser.setDefaultSelfSrc(config.splash.image);
          }

          this.alignSelector.setValue(config.splash.contentVertical);

          this.backgroundSelector.setValues(config);

          this.buttonColorPicker.setValues({
            "color": config.splash.button.color || this._defaultColor,
            "transparency": config.splash.button.transparency || this._defaultTransparency
          });
          html.setAttr(
            this.buttonText, 'value',
            utils.stripHTML(config.splash.button.text || this.nls.ok)
          );

          this.shelter.hide();
          this.resize();
          setTimeout(lang.hitch(this, function () {
            this.resize();
          }), 200);
        }));
      },

      _beforeGetConfig: function() {
        var isFirstKey = this._getCookieKey();
        cookie(isFirstKey, true, {
          expires: 1000,
          path: '/'
        });
      },

      _getCookieKey: function() {
        return 'isfirst_' + encodeURIComponent(utils.getAppIdFromUrl());
      },

      isValid: function () {
        return this.backgroundSelector.isValid() &&
          this.buttonColorPicker.isValid() &&
          this.confirmColorPicker.isValid();
      },
      getConfig: function () {
        if (!this.isValid()) {
          return false;
        }

        this.config.splash.splashContent = this._getEditorValue();
        this.config.splash.size = this.sizeSelector.getValue();

        this.config.splash.requireConfirm = this.get('requireConfirm');
        this.config.splash.showOption = this.showOption.getValue();
        this.config.splash.confirmEverytime = this.confirmOption.getValue();

        if (this.get('requireConfirm')) {
          this.config.splash.confirm.text = utils.stripHTML(this.confirmText.value || "");
        } else {
          this.config.splash.confirm.text = "";
        }
        var confirmColor = this.confirmColorPicker.getValues();
        if (confirmColor) {
          this.config.splash.confirm.color = confirmColor.color;
          this.config.splash.confirm.transparency = confirmColor.transparency;
        }

        this.config.splash.background = this.backgroundSelector.getValues();

        this.config.splash.button = {};
        var btnColor = this.buttonColorPicker.getValues();
        if (btnColor) {
          this.config.splash.button.color = btnColor.color;
          this.config.splash.button.transparency = btnColor.transparency;
        }
        this.config.splash.button.text = utils.stripHTML(this.buttonText.value || "");

        this.config.splash.contentVertical = this.alignSelector.getValue();
        return this.config;
      },

      _changeRequireConfirm: function() {
        var _selectedNode = null;

        if (this.get('requireConfirm')) {
          _selectedNode = this.requireConfirmSplash;
          html.setStyle(this.confirmContainer, 'display', 'block');
          html.setStyle(this.showOption.domNode, 'display', 'none');
        } else {
          _selectedNode = this.noRequireConfirmSplash;
          html.setStyle(this.showOption.domNode, 'display', 'block');
          html.setStyle(this.confirmContainer, 'display', 'none');
        }

        var _radio = registry.byNode(query('.jimu-radio', _selectedNode)[0]);
        _radio.check(true);
      },

      destroy: function() {
        var head = document.getElementsByTagName('head')[0];
        query('link[id^="editor_plugins_resources"]', head).remove();

        this.inherited(arguments);
      },
      _onConfirmTextBlur: function() {
        this.confirmText.value = utils.stripHTML(this.confirmText.value || "");
      },
      _onButtonTextBlur: function() {
        this.buttonText.value = utils.stripHTML(this.buttonText.value || "");
      },
      _getEditorValue: function() {
        var contentVal = this.editor.get('value');
        if (contentVal === "") {
          contentVal = "<p></p>";
        }
        return contentVal;
      },
      //for old version update
      _setWidthForOldVersion: function() {
        var def = new Deferred();
        var size = this.config.splash.size;
        var isOldVersion = ("wh" === size.mode && typeof size.wh !== "undefined" && null === size.wh.h);
        if (true === isOldVersion) {
          return utils.getEditorContentHeight(this.config.splash.splashContent, this.domNode, {
            "contentWidth": 600 - 40,
            "contentMarginTop": 20,//contentMarginTop
            "footerHeight": 88 + 10//contentMarginBottom
          }).then(
            lang.hitch(this, function(h) {
              size.wh.h = h;
              return h;
            }));
        } else {
          def.resolve();
          return def;
        }
      },
      _selectItem: function(name) {
        var _radio = this[name];
        if (_radio && _radio.check) {
          _radio.check(true);
        }
      },

      resize: function() {
        var wapperBox = html.getContentBox(this.editorContainer);
        var iFrame = query('.dijitEditorIFrameContainer', this.editorContainer)[0];
        var headBox;
        if (this.editor && this.editor.header) {
          headBox = html.getContentBox(this.editor.header);
        }
        if (iFrame && wapperBox && headBox) {
          html.setStyle(iFrame, 'height', wapperBox.h - headBox.h - 4 + "px");
        }
      }
    });
  });