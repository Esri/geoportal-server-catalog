///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
    'dojo/_base/Color',
    'dojo/on',
    'dojo/aspect',
    'dojo/cookie',
    'dojo/sniff',
    'dojo/query',
    'dojo/io-query',
    'dijit/registry',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Editor',
    'jimu/utils',
    'jimu/BaseWidgetSetting',
    'jimu/dijit/ColorPicker',
    'dojo/NodeList-manipulate',
    "jimu/dijit/CheckBox",
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
    './ChooseImage'
  ],
  function(
    declare,
    lang,
    html,
    Color,
    on,
    aspect,
    cookie,
    has,
    query,
    ioquery,
    registry,
    _WidgetsInTemplateMixin,
    Editor,
    utils,
    BaseWidgetSetting) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      //these two properties is defined in the BaseWidget
      baseClass: 'jimu-widget-splash-setting',
      _defaultColor: '#485566',

      postCreate: function() {
        this.own(on(this.requireConfirmSplash, 'click', lang.hitch(this, function() {
          this.set('requireConfirm', true);
        })));
        this.own(on(this.noRequireConfirmSplash, 'click', lang.hitch(this, function() {
          this.set('requireConfirm', false);
        })));
        this.own(this.watch('requireConfirm', lang.hitch(this, this._changeRequireConfirm)));
        this.own(aspect.before(this, 'getConfig', lang.hitch(this, this._beforeGetConfig)));

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

        this.urlParams = this.getUrlParams();

        this.inherited(arguments);
      },

      startup: function() {
        this.inherited(arguments);
        if (!this.config.splash) {
          this.config.splash = {};
        }
        this.initEditor();

        this.setConfig(this.config);
      },

      initEditor: function() {
        this.editor = new Editor({
          plugins: [
            'bold', 'italic', 'underline', 'foreColor', 'hiliteColor',
            '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
            '|', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent'
          ],
          extraPlugins: [
            '|', 'createLink', 'unlink', 'pastefromword', '|', 'undo', 'redo',
            '|', 'chooseImage', 'uploadImage', 'toolbarlinebreak',
            'fontName', 'fontSize', 'formatBlock'
          ]
        }, this.editor);
        html.setStyle(this.editor.domNode, {
          width: '100%',
          height: '100%'
        });
        this.editor.startup();

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

        this.editor.set('value', config.splash.splashContent || this.nls.defaultContent);
        this.set('requireConfirm', config.splash.requireConfirm);
        this.showOption.setValue(config.splash.showOption);
        this.confirmOption.setValue(config.splash.confirmEverytime);
        html.setAttr(
          this.confirmText,
          'value',
          utils.stripHTML(config.splash.confirmText || this.nls.defaultConfirmText)
        );
        this.colorPicker.setColor(new Color(config.splash.backgroundColor || this._defaultColor));
      },

      _beforeGetConfig: function() {
        var isFirstKey = this._getCookieKey();
        cookie(isFirstKey, true, {
          expires: 1000,
          path: '/'
        });
      },

      getUrlParams: function() {
        var s = window.location.search,
          p;
        if (s === '') {
          return {};
        }

        p = ioquery.queryToObject(s.substr(1));
        return p;
      },

      _getCookieKey: function() {
        // xt or integration use id of app as key,
        // deploy app use pathname as key
        return 'isfirst_' +  this.urlParams.id || this.urlParams.appid ||
          window.path;
      },

      getConfig: function() {
        this.config.splash.splashContent = this.editor.get('value');
        this.config.splash.requireConfirm = this.get('requireConfirm');
        this.config.splash.showOption = this.showOption.getValue();
        this.config.splash.confirmEverytime = this.confirmOption.getValue();
        if (this.get('requireConfirm')) {
          this.config.splash.confirmText = utils.stripHTML(this.confirmText.value || "");
        } else {
          this.config.splash.confirmText = "";
        }
        var bgColor = this.colorPicker.getColor();
        if (bgColor && bgColor.toHex) {
          this.config.splash.backgroundColor = bgColor.toHex();
        }

        return this.config;
      },

      _onConfirmTextBlur: function() {
        this.confirmText.value = utils.stripHTML(this.confirmText.value || "");
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
      }
    });
  });