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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/Deferred',
  'dojo/topic',
  'dojo/Evented',
  'dojo/on',
  'dojo/aspect',
  'dojo/json',
  'dojo/query',
  'dojo/request/xhr',
  'dojo/promise/all',
  'dijit/registry',
  './utils',
  'jimu/tokenUtils',
  './dijit/Message',
  './DataSourceManager'
],
function(declare, lang, array, html, Deferred, topic, Evented, on, aspect,
  json, query, xhr, all, registry, utils, tokenUtils, Message, DataSourceManager) {
  var instance = null,
  clazz = declare(Evented, {

    constructor: function() {
      //the loaded widget list
      this.loaded = [];

      //action is triggered, but the widget has not been loaded
      //{id: widgetId, action: {}}
      this.missedActions = [];

      this.activeWidget = null;

      if(window.isBuilder){
        topic.subscribe("app/mapLoaded", lang.hitch(this, this._onMapLoaded));
        topic.subscribe("app/mapChanged", lang.hitch(this, this._onMapChanged));
      }else{
        topic.subscribe("mapLoaded", lang.hitch(this, this._onMapLoaded));
        topic.subscribe("mapChanged", lang.hitch(this, this._onMapChanged));
      }

      if(window.isBuilder){
        topic.subscribe("app/sceneViewLoaded", lang.hitch(this, this._onSceneViewLoaded));
        topic.subscribe("app/sceneViewChanged", lang.hitch(this, this._onSceneViewChanged));
      }else{
        topic.subscribe("sceneViewLoaded", lang.hitch(this, this._onSceneViewLoaded));
        topic.subscribe("sceneViewChanged", lang.hitch(this, this._onSceneViewChanged));
      }

      if(window.isBuilder){
        topic.subscribe("app/appConfigLoaded", lang.hitch(this, this._onAppConfigLoaded));
        topic.subscribe("app/appConfigChanged", lang.hitch(this, this._onAppConfigChanged));
      }else{
        topic.subscribe("appConfigLoaded", lang.hitch(this, this._onAppConfigLoaded));
        topic.subscribe("appConfigChanged", lang.hitch(this, this._onAppConfigChanged));
      }


      topic.subscribe('userSignIn', lang.hitch(this, this._onUserSignIn));
      topic.subscribe('userSignOut', lang.hitch(this, this._onUserSignOut));

      //events from builder
      topic.subscribe('builder/actionTriggered', lang.hitch(this, this._onActionTriggered));

      //see panel manager
      topic.subscribe('/dnd/move/start', lang.hitch(this, this._onMoveStart));
    },

    loadWidget: function(setting) {
      // summary:
      //    load and create widget, return deferred. when defer is resolved,
      //    widget is returned.
      // description:
      //    setting should contain 2 properties:
      //    id: id should be unique, same id will return same widget object.
      //    uri: the widget's main class

      var def = new Deferred(),
        findWidget;

      setting = lang.clone(setting);

      findWidget = this.getWidgetById(setting.id);

      if (findWidget) {
        //widget have loaded(identified by id)
        def.resolve(findWidget);
      } else {
        all([this.loadWidgetClass(setting), this.loadWidgetManifest(setting)])
          .then(lang.hitch(this, function(results) {
            var clazz = results[0];
            var setting = results[1];
            this.loadWidgetResources(setting).then(lang.hitch(this, function(resouces) {
              try {
                var widget = this.createWidget(setting, clazz, resouces);
                html.setAttr(widget.domNode, 'data-widget-name', setting.name);
                console.log('widget [' + setting.uri + '] created.');
              } catch (err) {
                console.log('create [' + setting.uri + '] error:' + err.stack);
                new Message({
                  message: window.jimuNls.widgetManager.createWidgetError + ': ' + setting.uri
                });

                //when creation is failed, but the dijit is still registered
                if(registry.byId(setting.id)){
                  registry.byId(setting.id).destroy();
                }
                def.reject(err);
              }

              //use timeout to let the widget can get the correct dimension in startup function
              setTimeout(lang.hitch(this, function() {
                def.resolve(widget);
                this.emit('widget-created', widget);
                topic.publish('widgetCreated', widget);
              }), 50);

            }), function(err) {
              def.reject(err);
            });
          }), function(err) {
            def.reject(err);
          });
      }
      return def;
    },

    loadWidgetClass: function(setting) {
      // summary:
      //    load the widget's main class, and return deferred
      var def = new Deferred();

      var uri;
      if(setting.isRemote){
        uri = setting.uri + '.js';
      }else{
        uri = setting.uri;
      }
      require(utils.getRequireConfig(), [uri], lang.hitch(this, function(clazz) {
        def.resolve(clazz);
      }));

      utils.checkError(setting.uri, def);
      return def;
    },

    loadWidgetResources: function(setting) {
      // summary:
      //    load the widget's resources(local, style, etc.), and return deferred

      var def = new Deferred(),
        defConfig, defI18n, defStyle, defTemplate, defs = [];

      var setting2 = lang.clone(setting);

      defConfig = this.tryLoadWidgetConfig(setting2);
      defI18n = this._tryLoadResource(setting2, 'i18n');
      defStyle = this._tryLoadResource(setting2, 'style');
      defTemplate = this._tryLoadResource(setting2, 'template');

      defs.push(defConfig);
      defs.push(defI18n);
      defs.push(defTemplate);
      defs.push(defStyle);

      all(defs).then(lang.hitch(this, function(results) {
        var res = {};
        res.config = results[0];
        res.i18n = results[1];
        res.template = results[2];
        res.style = results[3];
        def.resolve(res);
      }), function(err) {
        def.reject(err);
      });

      return def;
    },

    loadWidgetManifest: function(widgetJson){
      var def = new Deferred();
      var info = utils.getUriInfo(widgetJson.uri);
      var url;
      if(info.isRemote){
        url = info.folderUrl + 'manifest.json?f=json';
      }else{
        url = info.folderUrl + 'manifest.json';
      }

      //json.manifest is added in configmanager if manifest is merged.
      if(widgetJson.manifest){
        def.resolve(widgetJson);
        return def;
      }

      xhr(url, {
        handleAs:'json',
        headers: {
          "X-Requested-With": null
        }
      }).then(lang.hitch(this, function(manifest){
        if(manifest.error && manifest.error.code){
          //request manifest from AGOL item, and there is an error
          //error code may be: 400, 403
          return def.reject(manifest.error);
        }

        manifest.category = 'widget';
        lang.mixin(manifest, utils.getUriInfo(widgetJson.uri));

        utils.manifest.addI18NLabel(manifest).then(lang.hitch(this, function(){
          this._processManifest(manifest);
          utils.widgetJson.addManifest2WidgetJson(widgetJson, manifest);
          def.resolve(widgetJson);
        }));
      }), function(err){
        def.reject(err);
      });

      return def;
    },

    getWidgetMarginBox: function(widget) {
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return {};
        }
      }
      if(widget._marginBox){
        return widget._marginBox;
      }

      var position = {
        left: -9999,
        top: -9999,
        relativeTo: widget.position.relativeTo
      };
      widget._isTestSizeFlag = true;//set flag for getSize
      widget.setPosition(position);
      this.openWidget(widget);

      widget._marginBox = widget.getMarginBox();

      this.closeWidget(widget);

      if ("undefined" !== typeof widget._isTestSizeFlag) {
        delete widget._isTestSizeFlag;//delete flag
      }
      return widget._marginBox;
    },

    _processManifest: function(manifest){
      utils.manifest.addManifestProperies(manifest);
      utils.manifest.processManifestLabel(manifest, window.dojoConfig.locale);
    },

    createWidget: function(setting, clazz, resouces) {
      var widget;

      //here, check whether widget have loaded again because loading and create a widget
      //needs some time. If in this period time, more then one loading request will create
      //more widgets with the same id, it's a error.

      if (this.getWidgetById(setting.id)) {
        return this.getWidgetById(setting.id);
      }

      //the config can contain i18n placeholders
      if (resouces.config && resouces.i18n) {
        resouces.config = utils.replacePlaceHolder(resouces.config, resouces.i18n);
      }

      setting.rawConfig = setting.config;
      setting.config = resouces.config || {};
      if (this.appConfig._appData) {
        this._mergeAgolConfig(setting);
      }
      setting.nls = resouces.i18n || {};
      if (resouces.template) {
        setting.templateString = resouces.template;
      }

      setting['class'] = 'jimu-widget';
      if (!setting.label) {
        setting.label = setting.name;
      }
      if (this.map) {
        setting.map = this.map;
      }
      setting.appConfig = this.appConfig;

      // for IE8
      var setting2 = {};
      for (var prop in setting) {
        if (setting.hasOwnProperty(prop)) {
          setting2[prop] = setting[prop];
        }
      }

      setting2.widgetManager = this;

      widget = new clazz(setting2);
      widget.clazz = clazz;
      aspect.after(widget, 'startup', lang.hitch(this, this._postWidgetStartup, widget));
      aspect.before(widget, 'destroy', lang.hitch(this, this._onDestroyWidget, widget));

      // on(widget.domNode, 'click', lang.hitch(this, this._onClickWidget, widget));
      widget.domNode.addEventListener('click', lang.hitch(this, this._onClickWidget, widget), {capture: true});

      this.loaded.push(widget);
      return widget;
    },

    getAllWidgets: function() {
      return this.loaded;
    },

    destroyAllWidgets: function() {
      var allWidgetIds = array.map(this.loaded, function(widget) {
        return widget.id;
      });
      array.forEach(allWidgetIds, function(widgetId) {
        this.destroyWidget(widgetId);
      }, this);
      this.loaded = [];
    },

    //load the widget setting page class and create setting page object
    //do not cache for now.
    loadWidgetSettingPage: function(setting) {
      var def = new Deferred();
      setting = lang.clone(setting);

      setting.id = setting.id + '_setting';
      all([this.loadWidgetSettingClass(setting)]).
      then(lang.hitch(this, function(results) {
        var clazz = results[0];

        this.loadWidgetSettingPageResources(setting).then(lang.hitch(this, function(resources) {
          var settingObject; // style = results[2]

          // for IE8
          var setting2 = {
            nls: resources.i18n,
            templateString: resources.template,
            appConfig: this.appConfig,
            // map: this.map,
            'class': 'jimu-widget-setting'
          };

          if(window.appInfo.appType === "HTML3D"){
            //for 3D Map, we pass sceneView
            setting2.sceneView = this.sceneView;
          }else{
            //for 2D Map, we pass map
            setting2.map = this.map;
          }

          for (var prop in setting) {
            if (setting.hasOwnProperty(prop)) {
              setting2[prop] = setting[prop];
            }
          }
          try {
            settingObject = new clazz(setting2);
            html.setAttr(settingObject.domNode, 'data-widget-name-setting', setting2.name);
            aspect.before(settingObject, 'destroy',
              lang.hitch(this, this._onDestroyWidgetSetting, settingObject));
            def.resolve(settingObject);
          } catch (err) {
            new Message({
              message: window.jimuNls.widgetManager.createWidgetSettingPageError + ':' + setting.uri
            });
            //when creation is failed, but the dijit is still registered
            if(registry.byId(setting2.id)){
              registry.byId(setting2.id).destroy();
            }
            def.reject(err);
          }
        }), function(err) {
          console.log(err);
        });

      }), function(err) {
        def.reject(err);
      });
      return def;
    },

    loadWidgetSettingClass: function(setting) {
      // summary:
      //    load the widget's main class, and return deferred
      var def = new Deferred();

      var uri;
      if(setting.isRemote){
        uri = setting.folderUrl + 'setting/Setting.js';
      }else{
        uri = setting.amdFolder + 'setting/Setting';
      }
      require(utils.getRequireConfig(), [uri],
      lang.hitch(this, function(clazz) {
        def.resolve(clazz);
      }));

      utils.checkError(setting.folderUrl + 'setting/Setting.js', def);
      return def;
    },

    loadWidgetSettingPageResources: function(setting) {
      var def = new Deferred();
      var defI18n, defStyle, defTemplate, defs = [];

      setting = lang.clone(setting);
      defI18n = this._tryLoadResource(setting, 'settingI18n');
      defTemplate = this._tryLoadResource(setting, 'settingTemplate');
      defStyle = this._tryLoadResource(setting, 'settingStyle');

      defs.push(defI18n);
      defs.push(defTemplate);
      defs.push(defStyle);

      all(defs).then(lang.hitch(this, function(results) {
        var res = {};
        res.i18n = results[0] || {};
        res.template = results[1];
        res.style = results[2];
        def.resolve(res);
      }), function(err) {
        console.log(err);
      });

      return def;
    },

    getWidgetById: function(id) {
      var ret;
      array.some(this.loaded, function(w) {
        if (w.id === id) {
          ret = w;
          return true;
        }
      }, this);
      return ret;
    },

    getWidgetByLabel: function(label) {
      var ret;
      array.some(this.loaded, function(w) {
        if (w.label === label) {
          ret = w;
          return true;
        }
      }, this);
      return ret;
    },

    getWidgetsByName: function(name) {
      var ret = [];
      array.some(this.loaded, function(w) {
        if (w.name === name) {
          ret.push(w);
        }
      }, this);
      return ret;
    },

    //normal, minimized, maximized
    changeWindowStateTo: function(widget, state) {
      if (state === 'normal') {
        this.normalizeWidget(widget);
      } else if (state === 'minimized') {
        this.minimizeWidget(widget);
      } else if (state === 'maximized') {
        this.maximizeWidget(widget);
      } else {
        console.log('error state: ' + state);
      }
    },

    closeWidget: function(widget) {
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return;
        }
      }
      if (widget.state !== 'closed') {
        if(this.activeWidget && this.activeWidget.id === widget.id){
          this.activeWidget.onDeActive();
          this.activeWidget = null;
        }
        html.setStyle(widget.domNode, 'display', 'none');
        widget.setState('closed');
        try {
          widget.onClose();
        } catch (err) {
          console.log(console.error('fail to close widget ' + widget.name + '. ' + err.stack));
        }
      }

      if(!this.appConfig.mode){
        this._removeDataSourceUsage(widget);
      }
    },

    openWidget: function(widget) {
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return;
        }
      }
      if(!widget.started){
        try {
          widget.started = true;
          widget.startup();
        } catch (err) {
          console.error('fail to startup widget ' + widget.name + '. ' + err.stack);
        }
      }
      if (widget.state === 'closed') {
        html.setStyle(widget.domNode, 'display', '');
        widget.setState('opened');
        try {
          widget.onOpen();
        } catch (err) {
          console.error('fail to open widget ' + widget.name + '. ' + err.stack);
        }
      }

      if(!this.appConfig.mode){
        this._addDataSourceUsage(widget);
      }
    },

    activateWidget: function(widget){
      //activate a widget, the widget must be opened first
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return;
        }
      }
      if(widget.state !== 'opened'){
        return;
      }

      this._activeWidget(widget);
    },

    maximizeWidget: function(widget) {
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return;
        }
      }
      if (widget.state === 'closed') {
        this.openWidget(widget);
      }

      widget.setWindowState('maximized');
      try {
        widget.onMaximize();
      } catch (err) {
        console.log(console.error('fail to maximize widget ' + widget.name + '. ' + err.stack));
      }
    },

    minimizeWidget: function(widget) {
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return;
        }
      }

      if (widget.state === 'closed') {
        this.openWidget(widget);
      }
      widget.setWindowState('minimized');
      try {
        widget.onMinimize();
      } catch (err) {
        console.log(console.error('fail to minimize widget ' + widget.name + '. ' + err.stack));
      }
    },

    normalizeWidget: function(widget) {
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return;
        }
      }

      if (widget.state === 'closed') {
        this.openWidget(widget);
      }
      widget.setWindowState('normal');
      try {
        widget.onNormalize();
      } catch (err) {
        console.log(console.error('fail to normalize widget ' + widget.name + '. ' +
        err.stack));
      }
    },

    destroyWidget: function(widget) {
      var m;
      if (typeof widget === 'string') {
        m = this.getWidgetById(widget);
        if (!m) {
          //maybe, the widget is loading
          return;
        } else {
          widget = m;
        }
      }
      this._removeWidget(widget);
      try {
        widget.destroy();
      } catch (err) {
        console.log(console.error('fail to destroy widget ' + widget.name + '. ' + err.stack));
      }
    },

    tryLoadWidgetConfig: function(setting) {
      return this._tryLoadWidgetConfig(setting).then(lang.hitch(this, function(config) {
        return this._upgradeWidgetConfig(setting, config).then(function(widgetConfig){
          setting.config = widgetConfig;
          return widgetConfig;
        });
      }));
    },

    triggerWidgetOpen: function(widgetId){
      var def = new Deferred();
      var widget = this.getWidgetById(widgetId);
      if(widget){
        if(widget.state !== 'closed'){
          def.resolve(widget);
          return def;
        }else{
          resolveAfterOpen(widget);
        }
      }else{
        var handle = topic.subscribe('widgetCreated', lang.hitch(this, function(_widget){
          if(_widget.id === widgetId){
            handle.remove();
            //we resolve here instead of waiting for onOpen, because onOpen may have been
            //triggered before this call back.
            def.resolve(_widget);
          }
        }));
      }

      topic.publish('openWidget', widgetId);

      function resolveAfterOpen(widget){
        var handle = aspect.after(widget, 'onOpen', function(){
          handle.remove();
          def.resolve(widget);
        });
      }

      return def;
    },

    _tryLoadWidgetConfig: function(setting) {
      var def = new Deferred();
      //need load config first, because the template may be use the config data
      if (setting.config && lang.isObject(setting.config)) {
        //if widget is configurated in the app config.json, the i18n has beed processed
        def.resolve(setting.config);
        return def;
      } else if (setting.config) {
        if(require.cache['url:' + setting.config]){
          def.resolve(json.parse(require.cache['url:' + setting.config]));
          return def;
        }
        var configFile = utils.processUrlInAppConfig(setting.config);
        // The widgetConfig filename is dependent on widget label,
        // IE8 & IE9 do not encode automatically while attempt to request file.
        var configFileArray = configFile.split('/');
        configFileArray[configFileArray.length - 1] =
          encodeURIComponent(configFileArray[configFileArray.length - 1]);
        configFile = configFileArray.join('/');
        return xhr(configFile, {
          handleAs: "json",
          headers: {
            "X-Requested-With": null
          }
        });
      } else {
        return this._tryLoadResource(setting, 'config').then(function(config){
          //this property is used in map config plugin
          setting.isDefaultConfig = true;
          return config;
        });
      }
    },

    _upgradeWidgetConfig: function(json, oldConfig){
      var def = new Deferred();
      var widgetVersion = json.manifest.version;
      var configVersion = json.version;
      var newConfig;

      if(widgetVersion === configVersion){
        def.resolve(oldConfig);
        return def;
      }

      if(json.hasVersionManager === false){
        //widget config loaded from builder needs update version
        json.version = widgetVersion;

        //if widget doesn't have version manager, we assume the widget
        //is old version compatible
        def.resolve(oldConfig);
        return def;
      }

      require(utils.getRequireConfig(), [json.amdFolder + (json.isRemote? 'VersionManager.js': 'VersionManager')],
      lang.hitch(this, function(VersionManager) {
        var versionManager = new VersionManager();

        var configVersionIndex = versionManager.getVersionIndex(configVersion);
        var widgetVersionIndex = versionManager.getVersionIndex(widgetVersion);
        if(configVersionIndex > widgetVersionIndex){
          def.reject('Bad widget version number, ' + json.name + ',' + configVersion);
        }else{
          try{
            newConfig = versionManager.upgrade(oldConfig, configVersion, widgetVersion);
            json.version = widgetVersion;
            def.resolve(newConfig);
          }catch(err){
            console.log('Read widget [' + json.name + '] old config error,' + err.stack);
            def.resolve(oldConfig);
          }
        }
      }));

      return def;
    },

    /*
     * Load the css file in a widget.
     * This function load the widget's css file and insert it into the HTML page through <link>.
     * It also ensure that the css file is inserted only one time.
     */
    loadWidgetStyle: function(widgetSetting) {
      var id = this._getStyleIdFromWidgetJson(widgetSetting, false),
        def = new Deferred();
      if (html.byId(id)) {
        def.resolve('load');
        return def;
      }
      var themeCommonStyleId = 'theme_' + this.appConfig.theme.name + '_style_common';
      //insert widget style before theme style, to let theme style over widget style
      return utils.loadStyleLink(id, widgetSetting.styleFile, themeCommonStyleId);
    },

    loadWidgetSettingStyle: function(widgetSetting) {
      var id = this._getStyleIdFromWidgetJson(widgetSetting, true),
        def = new Deferred();
      if (html.byId(id)) {
        def.resolve('load');
        return def;
      }
      return utils.loadStyleLink(id, widgetSetting.settingStyleFile);
    },

    loadWidgetConfig: function(widgetSetting) {
      var configFilePath = require(utils.getRequireConfig()).toUrl(widgetSetting.configFile);
      if(require.cache['url:' + configFilePath]){
        var def = new Deferred();
        def.resolve(json.parse(require.cache['url:' + configFilePath]));
        return def;
      }
      return xhr(configFilePath, {
        handleAs: "json",
        headers: {
          "X-Requested-With": null
        }
      });
    },

    loadWidgetI18n: function(widgetSetting) {
      var def = new Deferred();
      require(utils.getRequireConfig(), ['dojo/i18n!' + widgetSetting.i18nFile],
      function(bundle) {
        def.resolve(bundle);
      });
      return def;
    },

    loadWidgetSettingI18n: function(widgetSetting) {
      var def = new Deferred();
      require(utils.getRequireConfig(), ['dojo/i18n!' + widgetSetting.settingI18nFile],
      function(bundle) {
        def.resolve(bundle);
      });
      return def;
    },

    loadWidgetTemplate: function(widgetSetting) {
      var def = new Deferred();
      require(utils.getRequireConfig(), ['dojo/text!' + widgetSetting.templateFile],
      function(template) {
        def.resolve(template);
      });

      utils.checkError(widgetSetting.templateFile, def);
      return def;
    },

    loadWidgetSettingTemplate: function(widgetSetting) {
      var def = new Deferred();
      require(utils.getRequireConfig(), ['dojo/text!' + widgetSetting.settingTemplateFile],
      function(template) {
        def.resolve(template);
      });

      utils.checkError(widgetSetting.settingTemplateFile, def);
      return def;
    },

    removeWidgetStyle: function(widget) {
      this._removeStyle(this._getStyleIdFromWidgetJson(widget, false));
    },

    removeWidgetSettingStyle: function(widget) {
      this._removeStyle(this._getStyleIdFromWidgetJson(widget, true));
    },

    _removeStyle: function(styleId){
      if(!html.byId(styleId)){
        return;
      }
      var importStyles = html.attr(styleId, 'data-import-styles');
      if(importStyles){
        for(var i = 0; i < parseInt(importStyles, 10); i ++){
          html.destroy(styleId + '_import_' + i);
        }
      }
      html.destroy(styleId);
    },

    _getStyleIdFromWidgetJson: function(widgetJson, isSetting){
      var p = widgetJson.itemId? widgetJson.itemId: widgetJson.uri;
      var id = 'widget/style/' + p + (isSetting? '/setting': '');
      return this._replaceId(id);
    },

    getControllerWidgets: function() {
      return array.filter(this.loaded, function(widget) {
        return widget.isController;
      });
    },

    getOffPanelWidgets: function() {
      return array.filter(this.loaded, function(widget) {
        return !widget.inPanel;
      });
    },

    getOnScreenOffPanelWidgets: function() {
      return array.filter(this.loaded, function(widget) {
        return widget.isOnScreen && !widget.inPanel;
      });
    },

    closeOtherWidgetsInTheSameGroup: function(widget){
      if (typeof widget === 'string') {
        widget = this.getWidgetById(widget);
        if (!widget) {
          return;
        }
      }
      for(var i = 0; i < this.loaded.length; i++){
        if(this.loaded[i].gid === widget.gid && this.loaded[i].id !== widget.id){
          this.closeWidget(this.loaded[i]);
        }
      }
    },

    closeAllWidgetsInGroup: function (groupId){
      for(var i = 0; i < this.loaded.length; i++){
        if(this.loaded[i].gid === groupId){
          this.closeWidget(this.loaded[i]);
        }
      }
    },

    _addDataSourceUsage: function(widget){
      array.forEach(this._getUsedDataSourceIdFromWidget(widget), function(dsId){
        DataSourceManager.getInstance().addDataSourceUsage(dsId, widget.id);
      });
    },

    _removeDataSourceUsage: function(widget){
      array.forEach(this._getUsedDataSourceIdFromWidget(widget), function(dsId){
        DataSourceManager.getInstance().removeDataSourceUsage(dsId, widget.id);
      });
    },

    _getUsedDataSourceIdFromWidget: function(widget){
      var widgetJson = this.appConfig.getConfigElementById(widget.id);
      if(!widgetJson || !widgetJson.config){
        return;
      }
      var configStr = json.stringify(widgetJson.config);
      return array.filter(Object.keys(this.appConfig.dataSource.dataSources), function(dsId){
        return configStr.indexOf(dsId) > -1;
      }, this);
    },

    // Merge AGOL configs when first open widget (because the
    // widgetConfig just loaded if the widget has not been edited yet).
    // This method only merge fields in widget config,
    // the other fields were merged in ConfigManager.js
    _mergeAgolConfig: function(setting) {
      var values = this.appConfig._appData.values;
      function doMerge(sectionKey) {
        for (var key in values) {
          var sectionKeyIndex = key.replace(/\//g, '_').indexOf(sectionKey + '_config');
          if (sectionKeyIndex >= 0){
            utils.template.setConfigValue(setting,
                        key.replace(/\//g, '_').substr(sectionKeyIndex, key.length).
                        replace(sectionKey, 'widget'),
                        values[key]);
          }
        }
      }
      var sectionKey;
      sectionKey = 'widgets[' + setting.id + ']';
      doMerge(sectionKey);
    },

    _onUserSignIn: function(credential) {
      array.forEach(this.loaded, function(m) {
        m.onSignIn(credential);
      }, this);
    },

    _onUserSignOut: function() {
      array.forEach(this.loaded, function(m) {
        m.onSignOut();
      }, this);
    },

    _activeWidget: function(widget){
      if(this.activeWidget){
        if(this.activeWidget.id === widget.id){
          //zIndex may be reset by widget self, we do not set in-panel widget zindex
          if(this.activeWidget.inPanel === false && this.activeWidget.moveTopOnActive){
            html.setStyle(this.activeWidget.domNode, 'zIndex', 101);
          }
          return;
        }
        if(this.activeWidget.state === 'active'){
          this.activeWidget.setState('opened');
          if(this.activeWidget.inPanel === false){
            html.setStyle(widget.domNode, 'zIndex',
            'zIndex' in widget.position? widget.position.zIndex: 'auto');
          }
          this.activeWidget.onDeActive();
        }
      }
      this.activeWidget = widget;
      if(this.activeWidget.state !== 'opened'){
        return;
      }
      this.activeWidget.setState('active');
      if(this.activeWidget.inPanel === false && this.activeWidget.moveTopOnActive){
        html.setStyle(this.activeWidget.domNode, 'zIndex', 101);
      }
      this.activeWidget.onActive();
      topic.publish('widgetActived', widget);
    },

    _onClickWidget: function(widget, evt){
      var childWidgets = query('.jimu-widget', widget.domNode);
      if(childWidgets.length > 0){
        for(var i = 0; i < childWidgets.length; i++){
          if(evt.target === childWidgets[i] || html.isDescendant(evt.target, childWidgets[i])){
            //click on the child widget or child widget's children dom
            return;
          }
        }
      }
      this._activeWidget(widget);
    },

    _onMoveStart: function(mover){
      array.forEach(this.loaded, function(widget){
        if(widget.domNode === mover.node){
          this._activeWidget(widget);
        }
      }, this);
    },

    _onAppConfigLoaded: function(_appConfig) {
      var appConfig = lang.clone(_appConfig);
      this.appConfig = appConfig;
      tokenUtils.setPortalUrl(appConfig.portalUrl);
    },

    _onMapLoaded: function(map) {
      this.map = map;
    },

    _onMapChanged: function(map) {
      this.map = map;
    },

    _onSceneViewLoaded: function(sceneView){
      this.sceneView = sceneView;
    },

    _onSceneViewChanged: function(sceneView){
      this.sceneView = sceneView;
    },

    _onAppConfigChanged: function(_appConfig, reason, changedData, otherOptions) {
      var appConfig = lang.clone(_appConfig);
      this.appConfig = appConfig;
      array.forEach(this.loaded, function(w) {
        if (!w) {
          //widget maybe deleted in the handler of appConfigChange event
          return;
        }
        w.onAppConfigChanged(appConfig, reason, changedData, otherOptions);
        if (reason === 'widgetChange') {
          this._onConfigChanged(changedData.id, changedData.config, otherOptions);
        }
      }, this);
    },

    _onConfigChanged: function(id, config) {
      //summary:
      //  widget which care it's own config change should override onConfigChanged function
      var w = this.getWidgetById(id);
      if (!w) {
        return;
      }

      w.onConfigChanged(config);
      lang.mixin(w.config, config);
    },

    _onActionTriggered: function(info) {
      if (info.elementId === 'map' || info.elementId === 'app') {
        return;
      }
      var m = this.getWidgetById(info.elementId);
      if (!m) {
        this.missedActions.push({
          id: info.elementId,
          action: {
            name: info.action,
            data: info.data
          }
        });
      } else {
        m.onAction(info.action, info.data);
      }
      //may be the controller widget also need process the action
      array.forEach(this.getControllerWidgets(), function(ctrlWidget) {
        if (ctrlWidget.widgetIsControlled(info.elementId)) {
          ctrlWidget.onAction(info.action, {
            widgetId: info.elementId,
            data: info.data
          });
        }
      }, this);
    },

    _postWidgetStartup: function(widgetObject) {
      widgetObject.started = true;//for backward compatibility
      utils.setVerticalCenter(widgetObject.domNode);
      aspect.after(widgetObject, 'resize', lang.hitch(this,
        utils.setVerticalCenter, widgetObject.domNode));
      this.openWidget(widgetObject);
      // if(widgetObject.defaultState){
      //   this.changeWindowStateTo(widgetObject, widgetObject.defaultState);
      // }

      var portalUrl = this.appConfig.portalUrl;
      var credential = tokenUtils.getPortalCredential(portalUrl);
      if (credential) {
        widgetObject.onSignIn(credential);
      } else {
        widgetObject.onSignOut();
      }
      this._triggerMissedAction(widgetObject);
    },

    _triggerMissedAction: function(widget) {
      this.missedActions.forEach(function(info) {
        if (info.id === widget.id) {
          widget.onAction(info.action.name, info.action.data);
        }
      });
    },

    _remove: function(id) {
      return array.some(this.loaded, function(w, i) {
        if (w.id === id) {
          this.loaded.splice(i, 1);
          return true;
        }
      }, this);
    },

    _tryLoadResource: function(setting, flag) {
      var file, hasp,
        def = new Deferred(),
        doLoad = function() {
          var loadDef;
          if (flag === 'config') {
            loadDef = this.loadWidgetConfig(setting);
          } else if (flag === 'style') {
            loadDef = this.loadWidgetStyle(setting);
          } else if (flag === 'i18n') {
            loadDef = this.loadWidgetI18n(setting);
          } else if (flag === 'template') {
            loadDef = this.loadWidgetTemplate(setting);
          } else if (flag === 'settingTemplate') {
            loadDef = this.loadWidgetSettingTemplate(setting);
          } else if (flag === 'settingStyle') {
            loadDef = this.loadWidgetSettingStyle(setting);
          } else if (flag === 'settingI18n') {
            loadDef = this.loadWidgetSettingI18n(setting);
          } else {
            return def;
          }
          loadDef.then(function(data) {
            def.resolve(data);
          }, function(err) {
            console.error('Load widget resource error. resource:', flag);
            console.error(err);
            new Message({
              message: window.jimuNls.widgetManager.loadWidgetResourceError + ': ' + setting.uri
            });
            def.reject(err);
          });
        };

      if (flag === 'config') {
        file = setting.amdFolder + 'config.json';
        setting.configFile = file;
        hasp = 'hasConfig';
      } else if (flag === 'style') {
        file = setting.amdFolder + 'css/style.css';
        setting.styleFile = file;
        hasp = 'hasStyle';
      } else if (flag === 'i18n') {
        file = setting.amdFolder + 'nls/strings.js';
        if(setting.isRemote){
          setting.i18nFile = file;
        }else{
          setting.i18nFile = setting.amdFolder + 'nls/strings';
        }
        hasp = 'hasLocale';
      } else if (flag === 'template') {
        file = setting.amdFolder + 'Widget.html';
        setting.templateFile = file;
        hasp = 'hasUIFile';
      } else if (flag === 'settingTemplate') {
        file = setting.amdFolder + 'setting/Setting.html';
        setting.settingTemplateFile = file;
        hasp = 'hasSettingUIFile';
      } else if (flag === 'settingI18n') {
        file = setting.amdFolder + 'setting/nls/strings.js';
        if(setting.isRemote){
          setting.settingI18nFile = file;
        }else{
          setting.settingI18nFile = setting.amdFolder + 'setting/nls/strings';
        }
        hasp = 'hasSettingLocale';
      } else if (flag === 'settingStyle') {
        file = setting.amdFolder + 'setting/css/style.css';
        setting.settingStyleFile = file;
        hasp = 'hasSettingStyle';
      } else {
        return def;
      }

      if (setting[hasp]){
        doLoad.apply(this);
      }else {
        def.resolve(null);
      }
      return def;
    },

    _replaceId: function(id) {
      return id.replace(/\//g, '_').replace(/\./g, '_');
    },

    _onDestroyWidget: function(widget) {
      if (widget.state !== 'closed') {
        this.closeWidget(widget);
      }
      this._removeWidget(widget);
      this.emit('widget-destroyed', widget.id);
      topic.publish('widgetDestroyed', widget.id);
      console.log('destroy widget [' + widget.uri + '].');
    },

    _onDestroyWidgetSetting: function(settingWidget) {
      this.removeWidgetSettingStyle(settingWidget);
    },

    _removeWidget: function(widget) {
      var m;
      if (typeof widget === 'string') {
        m = this.getWidgetById(widget);
        if (!m) {
          //maybe, the widget is loading
          return;
        } else {
          widget = m;
        }
      }

      if(this.activeWidget && this.activeWidget.id === widget.id){
        this.activeWidget = null;
      }
      this._remove(widget.id);
      if(this.getWidgetsByName(widget.name).length === 0){
        this.removeWidgetStyle(widget);
      }
    }
  });

  clazz.getInstance = function(urlParams) {
    if (instance === null) {
      instance = new clazz(urlParams);
      window._widgetManager = instance;
    }
    return instance;
  };
  return clazz;
});