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

define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/topic',
  'dojo/Deferred',
  'dojo/on',
  './utils',
  './WidgetManager',
  './shared/AppVersionManager',
  './ConfigLoader',
  './tokenUtils',
  './dijit/AGOLLoading',
  './portalUtils',
  'esri/config',
  'esri/tasks/GeometryService'
],
function (declare, lang, array, html, topic, Deferred, on, jimuUtils, WidgetManager,
  AppVersionManager, ConfigLoader, tokenUtils, AGOLLoading, portalUtils, esriConfig, GeometryService) {
  var instance = null, clazz;

  clazz = declare(null, {
    urlParams: null,
    appConfig: null,
    configFile: null,
    _configLoaded: false,
    portalSelf: null,

    constructor: function (urlParams) {
      this.urlParams = urlParams || {};
      this.listenBuilderEvents();
      this.versionManager = new AppVersionManager();
      this.widgetManager = WidgetManager.getInstance();
      this.configLoader = ConfigLoader.getInstance(this.urlParams, {
        versionManager: this.versionManager
      });

      if(this.urlParams.mode === 'config' && window.parent.setConfigViewerTopic &&
        lang.isFunction(window.parent.setConfigViewerTopic)){
        window.parent.setConfigViewerTopic(topic);
      }
      if(this.urlParams.mode === 'preview' && window.parent.setPreviewViewerTopic &&
        lang.isFunction(window.parent.setPreviewViewerTopic)){
        window.parent.setPreviewViewerTopic(topic);
      }

      if (!jimuUtils.isMobileUa()) {
        //mobile devices do NOT listen to the 'resize' event
        //avoid to virtual-keyboard appears and then app switches between "Mobile Mode" and "Desktop Mode"
        on(window, 'resize', lang.hitch(this, this._onWindowResize));
      }
      on(window, "orientationchange", lang.hitch(this, this._onOrientationChange));
    },

    listenBuilderEvents: function(){
      //whatever(app, map, widget, widgetPoolChanged) config changed, publish this event.
      //*when app changed, the id is "app", the data is app's properties, like title, subtitle.
      //*when map changed, the id is "map", the data is itemId
      //*when widget that is in preloadwidget/widgetpool changed, the id is widget's id,
      //  the data is widget's setting
      //*when anything in the widget pool changed, the id is "widgetPool", the data is
      //  widgets and groups

      topic.subscribe('builder/widgetChanged', lang.hitch(this, this._onWidgetChanged));
      topic.subscribe('builder/groupChanged', lang.hitch(this, this._onGroupChanged));

      topic.subscribe('builder/layoutDefinitionChanged', lang.hitch(this, this._onLayoutDefinitionChanged));
      topic.subscribe('builder/onScreenGroupsChanged', lang.hitch(this, this._onOnScreenGroupsChanged));

      topic.subscribe('builder/widgetPoolChanged', lang.hitch(this, this._onWidgetPoolChanged));
      topic.subscribe('builder/openAtStartChange', lang.hitch(this, this._onOpenAtStartChanged));

      topic.subscribe('builder/mapChanged', lang.hitch(this, this._onMapChanged));
      topic.subscribe('builder/mapOptionsChanged', lang.hitch(this, this._onMapOptionsChanged));
      topic.subscribe('builder/mapRefreshIntervalChanged', lang.hitch(this, this._onMapRefreshIntervalChanged));
      topic.subscribe('builder/appAttributeChanged', lang.hitch(this, this._onAppAttributeChanged));

      topic.subscribe('builder/dataSourceChanged', lang.hitch(this, this._onDataSourceChanged));

      //actionTriggered event is proccessed by layout manager.
      // topic.subscribe('builder/actionTriggered', lang.hitch(this, this._onConfigChanged));

      topic.subscribe('builder/setAppConfig', lang.hitch(this, this._onAppConfigSet));

      topic.subscribe('builder/themeChanged', lang.hitch(this, this._onThemeChanged));
      topic.subscribe('builder/layoutChanged', lang.hitch(this, this._onLayoutChanged));
      topic.subscribe('builder/styleChanged', lang.hitch(this, this._onStyleChanged));

      topic.subscribe('builder/syncExtent', lang.hitch(this, this._onSyncExtent));

      topic.subscribe('builder/loadingPageChanged', lang.hitch(this, this._onLoadingPageChanged));

      topic.subscribe('builder/templateConfigChanged',
        lang.hitch(this, this._onTemplateConfigChanged));

      topic.subscribe('builder/appProxyForMapChanged', lang.hitch(this,
        this._onAppProxyForMapChanged));

      topic.subscribe('builder/appProxyForUrlChanged', lang.hitch(this,
        this._onAppProxyForUrlChanged));

      topic.subscribe('builder/sharedThemeChanged', lang.hitch(this,
        this._onSharedThemeChanged));
    },

    loadConfig: function(){
      if(this.urlParams.mode === 'preview' ||
        this.urlParams.mode === 'config'){
        //in preview/config mode, the config is set by the builder.
        return;
      }

      var loading = new AGOLLoading();
      loading.placeAt(window.jimuConfig.layoutId);
      return this.configLoader.loadConfig().then(lang.hitch(this, function(appConfig){
        this.portalSelf = this.configLoader.portalSelf;
        this.appConfig = this._addDefaultValues(appConfig);

        console.timeEnd('Load Config');

        window.appInfo.isRunInMobile = jimuUtils.inMobileSize();

        var _ac = this.getAppConfig();
        loading.destroy();
        topic.publish("appConfigLoaded", _ac);
        return _ac;
      }), lang.hitch(this, function(err){
        loading.destroy();
        console.error(err);
        if(err && err.message && typeof err.message === 'string'){
          this._showErrorMessage(err.message);
        }
      }));
    },

    _showErrorMessage: function(msg){
      html.create('div', {
        'class': 'app-error',
        innerHTML: jimuUtils.sanitizeHTML(msg)
      }, document.body);
    },

    getAppConfig: function () {
      var c;
      if(window.appInfo.isRunInMobile){
        // console.log('Switch to mobile mode.');
        c = lang.clone(this._getMobileConfig(this.appConfig));
        c._originConfig = lang.clone(this.appConfig);
      }else{
        // console.log('Switch to desktop mode.');
        c = lang.clone(this.appConfig);
      }

      c.getConfigElementById = function(id){
        return jimuUtils.getConfigElementById(this, id);
      };

      c.getConfigElementsByName = function(name){
        return jimuUtils.getConfigElementsByName(this, name);
      };

      c.getCleanConfig = function(isForAGOLTemplate){
        if(this._originConfig){
          return getCleanConfig(this._originConfig, isForAGOLTemplate);
        }else{
          return getCleanConfig(this, isForAGOLTemplate);
        }
      };

      c.visitElement = function(cb){
        jimuUtils.visitElement(this, cb);
      };
      return c;
    },

    _onOrientationChange: function() {
      if (this.appConfig) {
        topic.publish("appConfigChanged", this.getAppConfig(), 'layoutChange');
      }
    },
    _onWindowResize: function () {
      var runInMobile = jimuUtils.inMobileSize();
      if(window.appInfo.isRunInMobile === runInMobile){
        return;
      }
      window.appInfo.isRunInMobile = runInMobile;

      if(this.appConfig){
        topic.publish("appConfigChanged", this.getAppConfig(), 'layoutChange');
      }
    },

    _getMobileConfig: function(appConfig) {
      return jimuUtils.mixinAppConfigPosition(appConfig, appConfig.mobileLayout);
    },

    _updateDataSourceForWidget: function(newJson){
      this._deleteDataSourcesFromWidget(newJson);
      this._addDataSourcesForWidget(newJson);
    },

    _deleteDataSourcesFromWidget: function(widgetJson){
      //remove all data sources of this widget
      for(var p in this.appConfig.dataSource.dataSources){
        if(p.startWith('widget~' + widgetJson.id + '~')){
          delete this.appConfig.dataSource.dataSources[p];
        }
      }
    },

    _addDataSourcesForWidget: function(widgetJson){
      array.forEach(widgetJson.provideDataSources, function(ds){
        var dsId = 'widget~' + widgetJson.id + '~' + ds.id;
        ds.id = dsId;
        this.appConfig.dataSource.dataSources[dsId] = ds;
      }, this);

      delete widgetJson.provideDataSources;
    },

    _addIdForWidgets: function (widgetJsons){
      var maxId = 0, i;

      this.getAppConfig().visitElement(function(e){
        if(!e.id){
          return;
        }
        //fix element id
        e.id = e.id.replace(/\//g, '_');

        var li = e.id.lastIndexOf('_');
        if(li > -1){
          i = e.id.substr(li + 1);
          maxId = Math.max(maxId, i);
        }
      });

      array.forEach(widgetJsons, function(e){
        if(!e.id){
          maxId ++;
          if(e.itemId){
            e.id = e.itemId + '_' + maxId;
          }else if(e.uri){
            e.id = e.uri.replace(/\//g, '_') + '_' + maxId;
          }else{
            e.id = ''  + '_' + maxId;
          }
        }
      });
    },

    _onWidgetChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);
      var oldJson = jimuUtils.getConfigElementById(this.appConfig, _newJson.id);

      this._updateDataSourceForWidget(newJson);

      //for placeholder, add off panel
      if(newJson.inPanel === false && !oldJson.uri){
        newJson.closeable = true;
      }

      //for now, we can add/update property only
      for(var p in newJson){
        oldJson[p] = newJson[p];
      }

      delete oldJson.isDefaultConfig;

      this.configLoader.addNeedValues(this.appConfig);
      this._addDefaultValues(this.appConfig);
      topic.publish('appConfigChanged', this.getAppConfig(), 'widgetChange', newJson);
    },

    _onGroupChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);
      var oldJson = jimuUtils.getConfigElementById(this.appConfig, _newJson.id);

      this._handleDataSourceForWidgets(oldJson, newJson);

      //for now, we can add/update property only
      for(var p in newJson){
        oldJson[p] = newJson[p];
      }

      this.configLoader.addNeedValues(this.appConfig);
      this._addDefaultValues(this.appConfig);

      topic.publish('appConfigChanged', this.getAppConfig(), 'groupChange', newJson);
    },

    /**
     * this function can handle widget array (group or pool) changes
     * @param  {[type]} oldJson [description]
     * @param  {[type]} newJson [description]
     * @return {[type]}         [description]
     */
    _handleDataSourceForWidgets: function(oldJson, newJson){
      var newAddedWidgets = array.filter(newJson.widgets, function(nw){
        if(!nw.id){
          return true;
        }else{
          return array.filter(oldJson.widgets, function(ow){return nw.id === ow.id;}).length === 0;
        }
      }, this);
      this._addIdForWidgets(newAddedWidgets);
      array.forEach(newAddedWidgets, function(w){
        this._addDataSourcesForWidget(w);
      }, this);

      var removedWidgets = array.filter(oldJson.widgets, function(ow){
        return array.filter(newJson.widgets, function(nw){return nw.id === ow.id;}).length === 0;
      }, this);
      array.forEach(removedWidgets, function(w){
        this._deleteDataSourcesFromWidget(w);
      }, this);

      array.forEach(newJson.widgets, function(nw){
        array.forEach(oldJson.widgets, function(ow){
          if(nw.id === ow.id && nw.provideDataSources){
            this._updateDataSourceForWidget(nw);
          }
        }, this);
      }, this);
    },

    _onWidgetPoolChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);
      var oldJson = this.appConfig.widgetPool;

      this._handleDataSourceForWidgetsSection(oldJson, newJson);

      var controllerWidgets = this.widgetManager.getControllerWidgets();
      if(controllerWidgets.length === 1){
        this.appConfig.widgetPool.widgets = newJson.widgets;
        this.appConfig.widgetPool.groups = newJson.groups;
      }else{
        var controllerJson = jimuUtils.getConfigElementById(this.appConfig, newJson.controllerId);

        //remove old jsons from pool
        array.forEach(controllerJson.controlledWidgets, function(widgetId){
          this._removeWidgetOrGroupFromPoolById(this.appConfig, widgetId);
        }, this);

        array.forEach(controllerJson.controlledGroups, function(groupId){
          this._removeWidgetOrGroupFromPoolById(this.appConfig, groupId);
        }, this);

        //add new jsons into pool
        if(typeof this.appConfig.widgetPool.widgets === 'undefined'){
          this.appConfig.widgetPool.widgets = newJson.widgets;
        }else{
          this.appConfig.widgetPool.widgets =
            this.appConfig.widgetPool.widgets.concat(newJson.widgets);
        }
        if(typeof this.appConfig.widgetPool.groups === 'undefined'){
          this.appConfig.widgetPool.groups = newJson.groups;
        }else{
          this.appConfig.widgetPool.groups =
            this.appConfig.widgetPool.groups.concat(newJson.groups);
        }

        //update controller setting
        controllerJson.controlledWidgets = array.map(newJson.widgets, function(widgetJson){
          return widgetJson.id;
        });
        controllerJson.controlledGroups = array.map(newJson.groups, function(groupJson){
          return groupJson.id;
        });
      }
      this.configLoader.addNeedValues(this.appConfig);
      this.configLoader.loadAndUpgradeAllWidgetsConfig(this.appConfig).then(lang.hitch(this, function(appConfig){
        this.appConfig = appConfig;
        this._addDefaultValues(this.appConfig);
        topic.publish('appConfigChanged', this.getAppConfig(), 'widgetPoolChange', newJson);
      }));
    },

    _handleDataSourceForWidgetsSection: function(oldJson, newJson){
      var newWidgets = newJson.widgets;
      array.forEach(newJson.groups, function(g){
        newWidgets = newWidgets.concat(g.widgets);
      }, this);

      var oldWidgets = oldJson.widgets;
      array.forEach(oldJson.groups, function(g){
        oldWidgets = oldWidgets.concat(g.widgets);
      }, this);

      this._handleDataSourceForWidgets({widgets: oldWidgets}, {widgets: newWidgets});
    },

    _removeWidgetOrGroupFromPoolById: function(appConfig, id){
      array.some(appConfig.widgetPool.widgets, function(widget, i){
        if(widget.id === id){
          appConfig.widgetPool.widgets.splice(i, 1);
          return true;
        }
      });

      array.some(appConfig.widgetPool.groups, function(group, i){
        if(group.id === id){
          appConfig.widgetPool.groups.splice(i, 1);
          return true;
        }
      });
    },

    _onOpenAtStartChanged: function(_newJson) {
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);
      //TODO we support only one controller for now, so we don't do much here
      var appConfig = this.appConfig;
      if (_newJson.isOnScreen) {
        var onScreenWidgets = appConfig.widgetOnScreen && appConfig.widgetOnScreen.widgets;
        if (onScreenWidgets && onScreenWidgets.length > 0) {
          array.forEach(onScreenWidgets, lang.hitch(this, function(w) {
            if (w.id === _newJson.id) {
              w.openAtStart = !w.openAtStart;
            } else {
              delete w.openAtStart;
            }
          }));
        }
      } else {
        var pool = appConfig.widgetPool;
        if (pool && pool.groups && pool.groups.length > 0) {
          array.forEach(pool.groups, lang.hitch(this, function(g) {
            if (g.id === _newJson.id) {
              g.openAtStart = !g.openAtStart;
            } else {
              delete g.openAtStart;
            }
          }));
        }
        if (pool && pool.widgets && pool.widgets.length > 0) {
          array.forEach(pool.widgets, lang.hitch(this, function(w) {
            if (w.id === _newJson.id) {
              w.openAtStart = !w.openAtStart;
            } else {
              delete w.openAtStart;
            }
          }));
        }
      }

      topic.publish('appConfigChanged', this.getAppConfig(), 'openAtStartChange', newJson);
    },

    _onAppAttributeChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);

      lang.mixin(this.appConfig, newJson);

      this.configLoader.processProxy(this.appConfig);

      this.configLoader.addNeedValues(this.appConfig);
      this._addDefaultValues(this.appConfig);
      topic.publish('appConfigChanged', this.getAppConfig(), 'attributeChange', newJson);
    },

    _onDataSourceChanged: function(_dataSource){
      var newDataSource = jimuUtils.reCreateObject(_dataSource);
      this.appConfig.dataSource = newDataSource;

      topic.publish('appConfigChanged', this.getAppConfig(), 'dataSourceChange', _dataSource);
    },

    _onLoadingPageChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);
      var oldConfig;

      if('backgroundColor' in newJson){
        this.appConfig.loadingPage.backgroundColor = newJson.backgroundColor;
      }else if('backgroundImage' in newJson){
        oldConfig = this.appConfig.loadingPage.backgroundImage || {};
        this.appConfig.loadingPage.backgroundImage =
            lang.mixin(oldConfig, newJson.backgroundImage);
      }else if('loadingGif' in newJson){
        oldConfig = this.appConfig.loadingPage.loadingGif || {};
        this.appConfig.loadingPage.loadingGif =
            lang.mixin(oldConfig, newJson.loadingGif);
      }

      this.configLoader.addNeedValues(this.appConfig);
      this._addDefaultValues(this.appConfig);
      topic.publish('appConfigChanged', this.getAppConfig(), 'loadingPageChange', newJson);
    },

    /**
     * _newJson pattern:
     * {
     *   mapItemId: itemId,
     *   proxyItems: [{
     *     sourceUrl: string;
     *     title: string;
     *     premium: boolean;
     *     consumeCredits: boolean;
     *     useProxy: boolean;
     *     proxyUrl?: string;
     *     proxyId?: string;
     *   }]
     * }
     */
    _onAppProxyForMapChanged: function(_newJson) {
      var newJson = jimuUtils.reCreateObject(_newJson);

      if (!('appProxy' in this.appConfig.map)) {
        // Set appProxy if there is no such property
        this.appConfig.map.appProxy = newJson;
      } else if (this.appConfig.map.appProxy.mapItemId !== newJson.mapItemId) {
        // Replace the app proxy if map changed.
        this.appConfig.map.appProxy = newJson;
      } else {
        // Update proxy items
        array.forEach(newJson.proxyItems, lang.hitch(this, function(item) {
          array.some(this.appConfig.map.appProxy.proxyItems, function(configItem) {
            if (configItem.sourceUrl === item.sourceUrl) {
              configItem.useProxy = item.useProxy;
              configItem.proxyUrl = item.proxyUrl || '';
              configItem.proxyId = item.proxyId || '';
              return true;
            }
          });
        }));
      }

      topic.publish('appConfigChanged', this.getAppConfig(), 'appProxyChange', newJson);
    },

    /**
     * _newJson pattern is array of:
     * {
     *   sourceUrl: string,
     *   proxyUrl?: string,
     *   proxyId?: string,
     *   useProxy: boolean,
     *   title: string,
     *   premium: boolean,
     *   consumeCredits: boolean
     * }
     */
    _onAppProxyForUrlChanged: function(_newJson) {
      var newJson = jimuUtils.reCreateObject(_newJson);

      this.appConfig.appProxies = newJson;

      topic.publish('appConfigChanged', this.getAppConfig(), 'appProxyChange', newJson);
    },

    _onTemplateConfigChanged: function(_newJson){
      var newJson = jimuUtils.reCreateObject(_newJson);
      this.appConfig.templateConfig = newJson;

      this.configLoader.addNeedValues(this.appConfig);
      this._addDefaultValues(this.appConfig);
      topic.publish('appConfigChanged', this.getAppConfig(), 'templateConfigChange', newJson);
    },

    _onMapChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);

      //remove the options that are relative to map's display when map is changed.
      if(this.appConfig.map.mapOptions){
        jimuUtils.deleteMapOptions(this.appConfig.map.mapOptions);
      }

      this.appConfig.map.mapRefreshInterval = {
        useWebMapRefreshInterval: true
      };

      lang.mixin(this.appConfig.map, newJson);

      this._deleteDataSourcesFromMap();

      this.configLoader.addNeedValues(this.appConfig);

      this.configLoader.loadAndUpgradeAllWidgetsConfig(this.appConfig).then(lang.hitch(this, function(appConfig){
        this.appConfig = appConfig;
        this._addDefaultValues(this.appConfig);
        topic.publish('appConfigChanged', this.getAppConfig(), 'mapChange', newJson);
      }));
    },

    _deleteDataSourcesFromMap: function(){
      array.forEach(Object.keys(this.appConfig.dataSource.dataSources), function(dsId){
        if(dsId.startWith('map')){
          delete this.appConfig.dataSource.dataSources[dsId];
        }
      }, this);
    },

    _onMapOptionsChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);
      if(!this.appConfig.map.mapOptions){
        this.appConfig.map.mapOptions = {};
      }
      lang.mixin(this.appConfig.map.mapOptions, newJson);
      topic.publish('appConfigChanged', this.getAppConfig(), 'mapOptionsChange', newJson);
    },

    _onMapRefreshIntervalChanged: function(_newJson){
      // transfer obj to another iframe may cause problems on IE8
      var newJson = jimuUtils.reCreateObject(_newJson);
      if(!this.appConfig.map.mapRefreshInterval){
        this.appConfig.map.mapRefreshInterval = {};
      }
      lang.mixin(this.appConfig.map.mapRefreshInterval, newJson);
      if(this.appConfig.map.mapRefreshInterval.useWebMapRefreshInterval){
        delete this.appConfig.map.mapRefreshInterval.minutes;
      }
      topic.publish('appConfigChanged', this.getAppConfig(), 'mapRefreshIntervalChange', newJson);
    },

    _onThemeChanged: function(theme){
      this._getAppConfigFromTheme(theme).then(lang.hitch(this, function(config){
        var oldOnScreen = lang.clone(this.appConfig.widgetOnScreen);
        this.appConfig = config;
        this._handleDataSourceForWidgetsSection(oldOnScreen, {});
        topic.publish('appConfigChanged', this.getAppConfig(), 'themeChange', theme.getName());
      }));
    },

    _onLayoutChanged: function(layout){
      //summary:
      //  * Layout contains widget/group position, panel uri.
      //  * For default layout, use the same format with app config to define it.
      //  * For other layouts, we support 2 ways:
      //    * Use array, one by one
      //    * Use object, key is widget uri, or ph_<index>(placeholder), or g_<index>(group)

      this.appConfig = jimuUtils.mixinAppConfigPosition(this.appConfig, layout.layoutConfig);
      this.appConfig.layoutDefinition = layout.layoutConfig.layoutDefinition;

      this.configLoader.addNeedValues(this.appConfig);
      this._addDefaultValues(this.appConfig);
      topic.publish('appConfigChanged', this.getAppConfig(), 'layoutChange', layout.name);
    },

    _onStyleChanged: function(style){
      this.appConfig.theme.styles = this._genStyles(this.appConfig.theme.styles, style.name);
      if (style.isCustom) {
        this.appConfig.theme.customStyles = {
          mainBackgroundColor: style.styleColor
        };
      } else {
        delete this.appConfig.theme.customStyles;
        delete this.appConfig.titleColor;
        this.appConfig.theme.sharedTheme = {
          isPortalSupport: this.appConfig.theme.sharedTheme.isPortalSupport,
          useHeader: false,
          useLogo: false
        };
      }
      topic.publish('appConfigChanged', this.getAppConfig(), 'styleChange', style.name);
    },

    _onOnScreenGroupsChanged: function(_data){
      var newData = jimuUtils.reCreateObject(_data);
      this.appConfig.widgetOnScreen.groups = newData.groups;

      topic.publish('appConfigChanged', this.getAppConfig(), 'onScreenGroupsChange', newData.groups);
    },

    _onLayoutDefinitionChanged: function(_data){
      var newData = jimuUtils.reCreateObject(_data);
      var oldDefinition = this.appConfig.layoutDefinition;
      if(jimuUtils.isEqual(oldDefinition, newData.layoutDefinition)){
        return;
      }
      this.appConfig.layoutDefinition = newData.layoutDefinition;

      var newGroupIds = newData.groupIds;
      this.appConfig.widgetOnScreen.groups =
        jimuUtils.handleGridLayoutOnScreenGroupChange(this.appConfig.widgetOnScreen.groups, newGroupIds);

      this.configLoader.addNeedValues(this.appConfig);
      this._addDefaultValues(this.appConfig);
      topic.publish('appConfigChanged', this.getAppConfig(), 'layoutDefinitionChange', newData.layoutDefinition);
    },

    _onSharedThemeChanged: function(_sharedTheme){
      var oldSharedTheme = this.appConfig.theme.sharedTheme;
      var newSharedTheme = jimuUtils.reCreateObject(_sharedTheme);

      //whenever shared theme change, the styleChange event will be published and handled in _onStyleChanged.
      if(newSharedTheme.useHeader && !oldSharedTheme.useHeader){
        if(this.portalSelf.portalProperties && this.portalSelf.portalProperties.sharedTheme){
          this.appConfig.theme.customStyles = {
            mainBackgroundColor: this.portalSelf.portalProperties.sharedTheme.header.background
          };
          this.appConfig.titleColor = this.portalSelf.portalProperties.sharedTheme.header.text;

          this._onAppAttributeChanged({
            titleColor: this.appConfig.titleColor
          });
        }else{
          console.error('Portal does not support sharedTheme.');
        }
      }

      if(!newSharedTheme.useHeader && oldSharedTheme.useHeader){
        //in this case, mainBackgroundColor will be handled by style change event, so it's not handled here.

        delete this.appConfig.titleColor;

        this._onAppAttributeChanged({
          titleColor: this.appConfig.titleColor
        });
      }

      if(newSharedTheme.useLogo && !oldSharedTheme.useLogo){
        if(this.portalSelf.portalProperties && this.portalSelf.portalProperties.sharedTheme){
          if(this.portalSelf.portalProperties.sharedTheme.logo.small){
            this.appConfig.logo = this.portalSelf.portalProperties.sharedTheme.logo.small;
          }else{
            this.appConfig.logo = 'images/app-logo.png';
          }

          this.appConfig.logoLink = this.portalSelf.portalProperties.sharedTheme.logo.link;

          this._onAppAttributeChanged({
            logo: this.appConfig.logo,
            logoLink: this.appConfig.logoLink
          });
        }else{
          console.error('Portal does not support sharedTheme.');
        }
      }

      if(!newSharedTheme.useLogo && oldSharedTheme.useLogo){
        this._onAppAttributeChanged({
          logo: this.appConfig.logo
        });
      }

      lang.mixin(oldSharedTheme, newSharedTheme);
      topic.publish('appConfigChanged', this.getAppConfig(), 'sharedThemeChange', newSharedTheme);
    },

    _onSyncExtent: function(map){
      topic.publish('syncExtent', map);
    },

    _genStyles: function(allStyle, currentStyle){
      var styles = [];
      styles.push(currentStyle);
      array.forEach(allStyle, function(_style){
        if(styles.indexOf(_style) < 0){
          styles.push(_style);
        }
      });
      return styles;
    },

    /**************************************
    Keep the following same between themes:
    1. map config excluding map's position
    2. widget pool config excluding pool panel config
    ***************************************/
    _getAppConfigFromTheme: function(theme){
      var def = new Deferred();
      var config, styles = [];
      var currentConfig = this.getAppConfig().getCleanConfig();

      currentConfig.mode = this.urlParams.mode;

      //because we don't allow user config panel for group,
      //and group's panel should be different between differrent theme
      //so, we delete group panel
      array.forEach(currentConfig.widgetPool.groups, function(group){
        delete group.panel;
      }, this);
      //theme has already appConfig object, use it but keep something
      if(theme.appConfig){
        config = lang.clone(theme.appConfig);
        config.map = currentConfig.map;
        config.map.position = theme.appConfig.map.position;
        this._copyPoolToThemePool(currentConfig, config);

        config.links = currentConfig.links;
        config.title = currentConfig.title;
        config.subtitle = currentConfig.subtitle;
        config.logo = currentConfig.logo;
      }else{
        //use layout and style to create a new appConfig, which may contain some place holders
        var layout = theme.getCurrentLayout();
        var style = theme.getCurrentStyle();

        config = lang.clone(currentConfig);
        var layoutConfig = lang.clone(layout.layoutConfig);

        //use onscreen
        config.widgetOnScreen = layoutConfig.widgetOnScreen;

        //add flag
        if(layoutConfig.widgetPool){
          array.forEach(layoutConfig.widgetPool.widgets, function(w){
            w.isPreconfiguredInTheme = true;
          });
          array.forEach(layoutConfig.widgetPool.groups, function(g){
            g.isPreconfiguredInTheme = true;
          });
        }

        //copy pool
        this._copyPoolToThemePool(currentConfig, layoutConfig);
        config.widgetPool = layoutConfig.widgetPool;

        if(layoutConfig.map && layoutConfig.map.position){
          config.map.position = layoutConfig.map.position;
        }
        config.mobileLayout = layoutConfig.mobileLayout;
        config.layoutDefinition = layoutConfig.layoutDefinition;

        //put all styles into the style array, and the current style is the first element
        styles = this._genStyles(array.map(theme.getStyles(), function(style){
          return style.name;
        }), style.name);
        config.theme = {
          name: theme.getName(),
          styles: styles,
          version: theme.getVersion()
        };

        if (this.portalSelf.portalProperties && this.portalSelf.portalProperties.sharedTheme) {
          config.theme.sharedTheme = {
            "useHeader": true,
            "useLogo": true,
            isPortalSupport: true
          };
          config.theme.customStyles = {
            mainBackgroundColor: this.portalSelf.portalProperties.sharedTheme.header.background
          };
        } else {
          config.theme.sharedTheme = {
            "useHeader": false,
            "useLogo": false,
            isPortalSupport: false
          };
          config.theme.customStyles = {
            mainBackgroundColor: ''
          };
        }

        config.titleColor = currentConfig.titleColor;
        config.logoLink = currentConfig.logoLink;
      }

      this.configLoader.addNeedValues(config);
      this.configLoader.loadWidgetsManifest(config).then(lang.hitch(this, function(config){
        return this.configLoader.loadAndUpgradeAllWidgetsConfig(config);
      })).then(lang.hitch(this, function(){
        this._addDefaultValues(config);
        def.resolve(config);
      }));
      return def;
    },

    _copyPoolToThemePool: function(currentAppConfig, themeAppConfig){
      var cpool = currentAppConfig.widgetPool;

      if(!themeAppConfig.widgetPool){
        themeAppConfig.widgetPool = {};
      }
      var tpool = themeAppConfig.widgetPool;

      //widgets/groups defined in theme
      var themePoolWidgets = array.filter(tpool.widgets, function(tw){
        if(tw.isPreconfiguredInTheme){
          return true;
        }

        //widgets that exists in the theme only(added by user, not pre-configured)
        if(!array.some(cpool.widgets, function(cw){
          return cw.name === tw.name;
        })){
          return true;
        }
      });
      var themePoolGroups = array.filter(tpool.groups, function(g){
        return g.isPreconfiguredInTheme;
      });

      //widgets/groups are shared
      var currentPoolWidgets = array.filter(cpool.widgets, function(w){
        return !w.isPreconfiguredInTheme;
      });
      var currentPoolGroups = array.filter(cpool.groups, function(g){
        return !g.isPreconfiguredInTheme;
      });

      currentPoolWidgets = this._getPoolWidgetsWithoutDuplicated(currentPoolWidgets,
          themeAppConfig.widgetOnScreen.widgets || []);

      tpool.widgets = currentPoolWidgets.concat(themePoolWidgets);
      tpool.groups = currentPoolGroups.concat(themePoolGroups);
    },

    _getPoolWidgetsWithoutDuplicated: function(currentPoolWidgets, themeOnScreeWidgets){
      var ret = lang.clone(currentPoolWidgets);
      var currentAppConfig = this.getAppConfig();
      //we don't care groups and theme pool, because all in-panel widgets are not singleton
      for(var i = currentPoolWidgets.length - 1; i >= 0; i --){
        for(var j = themeOnScreeWidgets.length - 1; j >= 0; j --){
          if(!themeOnScreeWidgets[j].uri){
            continue;
          }
          var wname = themeOnScreeWidgets[j].name;
          if(!wname){
            wname = jimuUtils.getWidgetNameFromUri(themeOnScreeWidgets[j].uri);
          }

          var wid = currentPoolWidgets[i].id;
          var wjson = currentAppConfig.getConfigElementById(wid);
          if(currentPoolWidgets[i] && currentPoolWidgets[i].name === wname &&
            wjson.supportMultiInstance === false){
            console.log('Widget', currentPoolWidgets[i].name,
              'is not copied to new theme because this widget exists in new theme.');
            ret.splice(i, 1);
          }
        }
      }
      return ret;
    },

    _onAppConfigSet: function(c){
      //summary:
      //  this method may be called by builder or UT
      c = jimuUtils.reCreateObject(c);

      window.appInfo.isRunInMobile = jimuUtils.inMobileSize();

      this.configLoader.processProxy(c);

      this.configLoader.addNeedValues(c);

      this.configLoader.loadAndUpgradeAllWidgetsConfig(c).then(lang.hitch(this, function(c){
        this._addDefaultValues(c);

        tokenUtils.setPortalUrl(c.portalUrl);
        window.portalUrl = c.portalUrl;

        if(this.appConfig){
          //remove the options that are relative to map's display when map is changed.
          jimuUtils.deleteMapOptions(c.map.mapOptions);
          this.appConfig = c;
          this._deleteDataSourcesFromMap();
          topic.publish('appConfigChanged', this.getAppConfig(), 'resetConfig', c);
        }else{
          this.appConfig = c;

          var portal = portalUtils.getPortal(c.portalUrl);
          portal.loadSelfInfo().then(lang.hitch(this, function(portalSelf){
            this.portalSelf = portalSelf;
            topic.publish("appConfigLoaded", this.getAppConfig());
          }));
        }
      }));
    },

    /**********************************************
    * Add default values
    ************************************************/
    _addDefaultValues: function(config) {
      this._addDefaultPortalUrl(config);
      this._addDefaultGeometryService(config);
      this._addDefaultStyle(config);
      this._addDefaultMap(config);
      this._addDefaultVisible(config);
      this._addDefaultDataSource(config);
      this._addDefaultSharedTheme(config);

      //preload widgets
      if(typeof config.widgetOnScreen === 'undefined'){
        config.widgetOnScreen = {};
      }

      if(typeof config.widgetPool === 'undefined'){
        config.widgetPool = {};
      }

      this._addDefaultPanelAndPosition(config);
      this._addDefaultOfWidgetGroup(config);
      //if the first widget or first group doesn't have index property, we add it
      if(config.widgetPool.widgets && config.widgetPool.widgets.length > 0 &&
        config.widgetPool.widgets[0].index === undefined ||
        config.widgetPool.groups && config.widgetPool.groups.length > 0 &&
        config.widgetPool.groups[0].index === undefined){
        this._addIndexForWidgetPool(config);
      }
      return config;
    },

    _addDefaultDataSource: function(config){
      if(!config.dataSource){
        config.dataSource = {
          dataSources: {},
          settings: {}
        };
      }else{
        if(!config.dataSource.dataSources){
          config.dataSource.dataSources = {};
        }

        if(!config.dataSource.settings){
          config.dataSource.settings = {};
        }
      }
    },

    _addDefaultPortalUrl: function(config){
      if(typeof config.portalUrl === 'undefined'){
        config.portalUrl = 'http://www.arcgis.com/';
      }
      if(config.portalUrl && config.portalUrl.substr(config.portalUrl.length - 1) !== '/'){
        config.portalUrl += '/';
      }
    },

    _addDefaultGeometryService: function(appConfig){
      var geoServiceUrl = appConfig && appConfig.geometryService;
      var validGeoServiceUrl = geoServiceUrl && typeof geoServiceUrl === 'string' &&
      lang.trim(geoServiceUrl);
      if(validGeoServiceUrl){
        geoServiceUrl = lang.trim(geoServiceUrl);
      }
      else{
        //TODO this.portalSelf is null if app is loaded in builder.
        //but we can ensure appConfig.geometryService is not null if app is created by builder,
        //so this line will not be executed.
        geoServiceUrl = this.portalSelf.helperServices.geometry.url;
      }
      appConfig.geometryService = geoServiceUrl;
      esriConfig.defaults.geometryService = new GeometryService(appConfig.geometryService);
    },

    _addDefaultStyle: function(config){
      if(config.theme){
        if(!config.theme.styles || config.theme.styles.length === 0){
          config.theme.styles = ['default'];
        }
      }
    },

    _addDefaultMap: function(config){
      config.map.id = 'map';

      if(typeof config.map['3D'] === 'undefined' && typeof config.map['2D'] === 'undefined'){
        config.map['2D'] = true;
      }

      if(typeof config.map.position === 'undefined'){
        config.map.position = {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        };
      }

      if(typeof config.map.portalUrl === 'undefined'){
        config.map.portalUrl = config.portalUrl;
      }
    },

    _addDefaultVisible: function(config){
      jimuUtils.visitElement(config, function(e){
        if(e.visible === undefined){
          e.visible = true;
        }
      });
    },

    _addDefaultSharedTheme: function(config){
      if(!config.theme.sharedTheme){
        config.theme.sharedTheme = {
          useHeader: false,
          useLogo: false
        };
      }else{
        if(typeof config.theme.sharedTheme.useHeader === 'undefined'){
          config.theme.sharedTheme.useHeader = false;
        }
        if(typeof config.theme.sharedTheme.useLogo === 'undefined'){
          config.theme.sharedTheme.useLogo = false;
        }
      }
    },

    _addDefaultPanelAndPosition: function(config){
      this._addOnScreenDefaultPanelAndPosition(config);
      this._addPoolDefaultPanelAndPosition(config);
    },

    _addOnScreenDefaultPanelAndPosition: function(config){
      var i, j, screenSectionConfig = config.widgetOnScreen;

      if(!screenSectionConfig){
        return;
      }

      var panelDefaultPositionR =
        screenSectionConfig.panel && screenSectionConfig.panel.positionRelativeTo?
        screenSectionConfig.panel.positionRelativeTo: 'map';

      if(typeof screenSectionConfig.panel === 'undefined' ||
        typeof screenSectionConfig.panel.uri === 'undefined'){
        screenSectionConfig.panel = {
          uri: 'jimu/OnScreenWidgetPanel',
          //positionRelativeTo: 'map',
          position: {
            //move positionRelativeTo to position.relativeTo
            relativeTo: panelDefaultPositionR
          }
        };
      }else if(typeof screenSectionConfig.panel.position === 'undefined'){
        screenSectionConfig.panel.position = {relativeTo: panelDefaultPositionR};
      }else if(typeof screenSectionConfig.panel.position.relativeTo === 'undefined'){
        screenSectionConfig.panel.position.relativeTo = panelDefaultPositionR;
      }

      if(screenSectionConfig.widgets){
        for(i = 0; i < screenSectionConfig.widgets.length; i++){
          if(!screenSectionConfig.widgets[i].position){
            screenSectionConfig.widgets[i].position = {};
          }
          if(!screenSectionConfig.widgets[i].position.relativeTo){
            screenSectionConfig.widgets[i].position.relativeTo =
              screenSectionConfig.widgets[i] && screenSectionConfig.widgets[i].positionRelativeTo?
              screenSectionConfig.widgets[i].positionRelativeTo: 'map';
          }
          if(screenSectionConfig.widgets[i].inPanel === true &&
            !screenSectionConfig.widgets[i].panel){
            screenSectionConfig.widgets[i].panel = lang.clone(screenSectionConfig.panel);
            screenSectionConfig.widgets[i].panel.position = screenSectionConfig.widgets[i].position;
            screenSectionConfig.widgets[i].panel.position.relativeTo =
            screenSectionConfig.widgets[i].position.relativeTo;
          }
        }
      }

      if(screenSectionConfig.groups){
        for(i = 0; i < screenSectionConfig.groups.length; i++){
          if(!screenSectionConfig.groups[i].panel){
            screenSectionConfig.groups[i].panel = screenSectionConfig.panel;
          }

          if(screenSectionConfig.groups[i].panel && !screenSectionConfig.groups[i].panel.position){
            screenSectionConfig.groups[i].panel.position = {};
          }

          if(!screenSectionConfig.groups[i].panel.position.relativeTo){
            screenSectionConfig.groups[i].panel.position.relativeTo =
              screenSectionConfig.groups[i].panel.positionRelativeTo?
              screenSectionConfig.groups[i].panel.positionRelativeTo:'map';
          }

          if(!screenSectionConfig.groups[i].widgets){
            screenSectionConfig.groups[i].widgets = [];
          }
          for(j = 0; j < screenSectionConfig.groups[i].widgets.length; j++){
            screenSectionConfig.groups[i].widgets[j].panel = screenSectionConfig.groups[i].panel;
          }
        }
      }
    },

    _addPoolDefaultPanelAndPosition: function(config){
      var i, j, poolSectionConfig = config.widgetPool;

      if(!poolSectionConfig){
        return;
      }

      var panelDefaultPositionR =
        poolSectionConfig.panel && poolSectionConfig.panel.positionRelativeTo?
        poolSectionConfig.panel.positionRelativeTo: 'map';

      if(typeof poolSectionConfig.panel === 'undefined' ||
        typeof poolSectionConfig.panel.uri === 'undefined'){
        poolSectionConfig.panel = {
          uri: 'jimu/OnScreenWidgetPanel',
          position: {
            relativeTo: panelDefaultPositionR
          }
        };
      }else if(typeof poolSectionConfig.panel.position === 'undefined'){
        poolSectionConfig.panel.position = {relativeTo: panelDefaultPositionR};
      }else if(typeof poolSectionConfig.panel.position.relativeTo === 'undefined'){
        poolSectionConfig.panel.position.relativeTo = panelDefaultPositionR;
      }

      if(poolSectionConfig.groups){
        for(i = 0; i < poolSectionConfig.groups.length; i++){
          if(!poolSectionConfig.groups[i].panel){
            poolSectionConfig.groups[i].panel = poolSectionConfig.panel;
          }else if(!poolSectionConfig.groups[i].panel.position.relativeTo){
            poolSectionConfig.groups[i].panel.position.relativeTo =
              poolSectionConfig.groups[i].panel.positionRelativeTo?
              poolSectionConfig.groups[i].panel.positionRelativeTo: 'map';
          }

          if(!poolSectionConfig.groups[i].widgets){
            poolSectionConfig.groups[i].widgets = [];
          }
          for(j = 0; j < poolSectionConfig.groups[i].widgets.length; j++){
            poolSectionConfig.groups[i].widgets[j].panel = poolSectionConfig.groups[i].panel;
          }
        }
      }

      if(poolSectionConfig.widgets){
        for(i = 0; i < poolSectionConfig.widgets.length; i++){
          if(poolSectionConfig.widgets[i].inPanel === false){
            var defaultWidgetPositionR = poolSectionConfig.widgets[i].positionRelativeTo?
                poolSectionConfig.widgets[i].positionRelativeTo: 'map';
            if(!poolSectionConfig.widgets[i].position){
              poolSectionConfig.widgets[i].position = {
                relativeTo: defaultWidgetPositionR
              };
            }else if(!poolSectionConfig.widgets[i].position.relativeTo){
              poolSectionConfig.widgets[i].position.relativeTo = defaultWidgetPositionR;
            }
          }else if(!poolSectionConfig.widgets[i].panel){
            poolSectionConfig.widgets[i].panel = config.widgetPool.panel;
          }
        }
      }
    },

    _addDefaultOfWidgetGroup: function(config){
      //group/widget labe, icon
      jimuUtils.visitElement(config, lang.hitch(this, function(e, info){
        e.isOnScreen = info.isOnScreen;
        if(e.widgets){
          //it's group
          e.gid = e.id;
          if(e.widgets.length === 1){
            if(!e.label){
              e.label = e.widgets[0].label? e.widgets[0].label: window.apiNls.common.groupLabel;
            }
            if(!e.icon){
              if(e.widgets[0].uri){
                e.icon = this._getDefaultIconFromUri(e.widgets[0].uri);
              }else{
                e.icon = 'jimu.js/images/group_icon.png';
              }
            }
          }else{
            e.icon = e.icon? e.icon: 'jimu.js/images/group_icon.png';
            e.label = e.label? e.label: (window.apiNls.common.groupLabel + ' ' + info.index);
          }
        }else{
          e.gid = info.groupId;
        }
      }));
    },

    _getDefaultIconFromUri: function(uri){
      var segs = uri.split('/');
      segs.pop();
      return segs.join('/') + '/images/icon.png?wab_dv=' + window.deployVersion;
    },

    _addIndexForWidgetPool: function(config){
      //be default, widgets are in front
      var index = 0, i, j;
      if(config.widgetPool.widgets){
        for(i = 0; i < config.widgetPool.widgets.length; i++){
          config.widgetPool.widgets[i].index = index;
          index ++;
        }
      }

      if(config.widgetPool.groups){
        for(i = 0; i < config.widgetPool.groups.length; i++){
          config.widgetPool.groups[i].index = index;
          index ++;
          for(j = 0; j < config.widgetPool.groups[i].widgets.length; j++){
            config.widgetPool.groups[i].widgets[j].index = j;
          }
        }
      }
    }

  });

  clazz.getInstance = function (urlParams) {
    if(instance === null) {
      instance = new clazz(urlParams);
    }else{
      if(urlParams){
        instance.urlParams = urlParams;
        if(instance.configLoader){
          instance.configLoader.urlParams = urlParams;
        }
      }
    }

    window.getAppConfig = lang.hitch(instance, instance.getAppConfig);
    return instance;
  };

  function getCleanConfig(config, isForAGOLTemplate){
    //delete the properties that framework add
    var newConfig = lang.clone(config);
    var properties = jimuUtils.widgetProperties;

    if(typeof isForAGOLTemplate === 'undefined'){
      isForAGOLTemplate = false;
    }
    delete newConfig.mode;
    delete newConfig.configWabVersion;
    jimuUtils.visitElement(newConfig, function(e, info){
      if(e.widgets){
        delete e.isOnScreen;
        delete e.gid;
        if(e.icon === 'jimu.js/images/group_icon.png'){
          delete e.icon;
        }
        delete e.openType;
        if(info.isOnScreen){
          if(e.panel && jimuUtils.isEqual(e.panel, newConfig.widgetOnScreen.panel)){
            delete e.panel;
          }
        }
        return;
      }

      if(e.icon && e.icon === e.folderUrl + 'images/icon.png?wab_dv=' + window.deployVersion){
        delete e.icon;
      }

      delete e.panel;
      delete e.folderUrl;
      delete e.amdFolder;
      delete e.thumbnail;
      delete e.configFile;
      delete e.gid;
      delete e.isOnScreen;
      delete e.isRemote;
      delete e.featureActions;

      properties.forEach(function(p){
        delete e[p];
      });

      if(!isForAGOLTemplate){
        if(e.visible){
          delete e.visible;
        }

        if(e.manifest && e.label === e.manifest.label){
          delete e.label;
        }

        if(e.isDefaultConfig){
          delete e.config;
          delete e.isDefaultConfig;
        }
      }else{
        if(typeof e.openAtStart === 'undefined'){
          e.openAtStart = false;
        }
      }

      delete e.manifest;

      if(e.itemId){
        delete e.uri;//uri will be get from item url
      }
    });
    delete newConfig.rawAppConfig;
    //the _ssl property is added by esriRequest
    delete newConfig._ssl;
    //delete all of the methods
    delete newConfig.getConfigElementById;
    delete newConfig.getConfigElementsByName;
    delete newConfig.processNoUriWidgets;
    delete newConfig.addElementId;
    delete newConfig.getCleanConfig;
    delete newConfig.visitElement;

    delete newConfig.agolConfig;
    delete newConfig._itemData;
    delete newConfig.oldWabVersion;

    delete newConfig.titleColor;

    return newConfig;
  }

  return clazz;
});
