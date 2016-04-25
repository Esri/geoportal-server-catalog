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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dijit/_WidgetBase',
  'dojo/topic',
  'dojo/on',
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/when',
  'require',
  './WidgetManager',
  './PanelManager',
  './MapManager',
  './utils',
  './OnScreenWidgetIcon',
  './WidgetPlaceholder',
  './dijit/LoadingShelter'
],

function(declare, lang, array, html, _WidgetBase, topic, on,  domConstruct, domGeometry,
  Deferred, all, when, require, WidgetManager, PanelManager,
  MapManager, utils, OnScreenWidgetIcon, WidgetPlaceholder, LoadingShelter) {
  /* global jimuConfig:true */
  var instance = null, clazz;

  clazz = declare([_WidgetBase], {
    constructor: function(options, domId) {
      /*jshint unused: false*/
      this.widgetManager = WidgetManager.getInstance();
      this.panelManager = PanelManager.getInstance();

      this.own(topic.subscribe("appConfigLoaded", lang.hitch(this, this.onAppConfigLoaded)));
      this.own(topic.subscribe("appConfigChanged", lang.hitch(this, this.onAppConfigChanged)));

      this.own(topic.subscribe("mapLoaded", lang.hitch(this, this.onMapLoaded)));
      this.own(topic.subscribe("mapChanged", lang.hitch(this, this.onMapChanged)));
      this.own(topic.subscribe("beforeMapDestory", lang.hitch(this, this.onBeforeMapDestory)));

      this.own(topic.subscribe("builder/actionTriggered",
        lang.hitch(this, this.onActionTriggered)));

      //If a widget want to open another widget, please publish this message with widgetId as a
      //parameter
      this.own(topic.subscribe("openWidget", lang.hitch(this, this._onOpenWidgetRequest)));

      this.widgetPlaceholders = [];
      this.preloadWidgetIcons = [];
      this.preloadGroupPanels = [];
      this.invisibleWidgetIds = [];

      this.own(on(window, 'resize', lang.hitch(this, this.resize)));

      this.id = domId;
    },

    postCreate: function(){
      this.containerNode = this.domNode;
    },

    map: null,
    mapId: 'map',
    hlDiv: null,

    animTime: 500,

    resize: function() {
      //resize widgets. the panel's resize is called by the panel manager.
      //widgets which is in panel is resized by panel
      array.forEach(this.widgetManager.getAllWidgets(), function(w){
        if(w.inPanel === false){
          w.resize();
        }
      }, this);
    },

    onAppConfigLoaded: function(config){
      this.appConfig = lang.clone(config);
      if(this.appConfig.theme){
        this._loadTheme(this.appConfig.theme);
      }
      this._loadMap();
    },

    onAppConfigChanged: function(appConfig, reason, changeData){
      appConfig = lang.clone(appConfig);
      //deal with these reasons only
      switch(reason){
      case 'themeChange':
        this._onThemeChange(appConfig);
        break;
      case 'styleChange':
        this._onStyleChange(appConfig);
        break;
      case 'layoutChange':
        this._onLayoutChange(appConfig);
        break;
      case 'widgetChange':
        this._onWidgetChange(appConfig, changeData);
        break;
      case 'groupChange':
        this._onGroupChange(appConfig, changeData);
        break;
      case 'widgetPoolChange':
        this._onWidgetPoolChange(appConfig, changeData);
        break;
      case 'resetConfig':
        this._onResetConfig(appConfig);
        break;
      case 'loadingPageChange':
        this._onLoadingPageChange(appConfig, changeData);
        break;
      }
      this.appConfig = appConfig;
    },

    onMapLoaded: function(map) {
      this.map = map;
      this.panelManager.setMap(map);
      this._loadPreloadWidgets(this.appConfig);
    },

    onMapChanged: function(map){
      this.map = map;
      this.panelManager.setMap(map);
      this._loadPreloadWidgets(this.appConfig);
    },

    onBeforeMapDestory: function(){
      //when map changed, use destroy and then create to simplify the widget development
      //destroy widgets before map, because the widget may use map in thire destory method
      this.panelManager.destroyAllPanels();
      this._destroyOffPanelWidgets();
      this._destroyWidgetPlaceholders();
      this._destroyPreloadWidgetIcons();
    },

    onActionTriggered: function(info){
      if(info.action === 'highLight'){
        array.forEach(this.widgetPlaceholders, function(placehoder){
          if(placehoder.configId === info.elementId){
            this._highLight(placehoder);
          }
        }, this);
        array.forEach(this.preloadWidgetIcons, function(widgetIcon){
          if (widgetIcon.configId === info.elementId){
            this._highLight(widgetIcon);
          }
        }, this);
        array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(panelessWidget){
          if (panelessWidget.configId === info.elementId){
            this._highLight(panelessWidget);
          }
        }, this);
        array.forEach(this.preloadGroupPanels, function(panel){
          if (panel.configId === info.elementId){
            this._highLight(panel);
          }
        }, this);
      }
      if(info.action === 'removeHighLight'){
        this._removeHighLight();
      }
      if(info.action === 'showLoading'){
        html.setStyle(jimuConfig.loadingId, 'display', 'block');
        html.setStyle(jimuConfig.mainPageId, 'display', 'none');
      }
      if(info.action === 'showApp'){
        html.setStyle(jimuConfig.loadingId, 'display', 'none');
        html.setStyle(jimuConfig.mainPageId, 'display', 'block');
      }
    },

    _highLight: function(dijit){
      if(!dijit.domNode){
        //the dijit may be destroyed
        return;
      }
      if (this.hlDiv){
        this._removeHighLight(dijit);
      }
      var position = domGeometry.getMarginBox(dijit.domNode);
      var hlStyle = {
        position: 'absolute',
        left: position.l + 'px',
        top: position.t + 'px',
        width: position.w + 'px',
        height: position.h + 'px'
      };
      this.hlDiv = domConstruct.create('div', {
        "style": hlStyle,
        "class": 'icon-highlight'
      }, dijit.domNode, 'before');
    },

    _removeHighLight: function(){
      if (this.hlDiv){
        domConstruct.destroy(this.hlDiv);
        this.hlDiv = null;
      }
    },

    _onWidgetChange: function(appConfig, widgetConfig){
      widgetConfig = appConfig.getConfigElementById(widgetConfig.id);
      if(widgetConfig.isController){
        this._reloadControllerWidget(appConfig, widgetConfig.id);
        return;
      }
      array.forEach(this.widgetPlaceholders, function(placeholder){
        if(placeholder.configId === widgetConfig.id){
          placeholder.destroy();
          this._loadPreloadWidget(widgetConfig, appConfig);
        }
      }, this);
      this._removeDestroyed(this.widgetPlaceholders);

      array.forEach(this.preloadWidgetIcons, function(icon){
        if(icon.configId === widgetConfig.id){
          var state = icon.state;
          icon.destroy();
          this._loadPreloadWidget(widgetConfig, appConfig).then(function(iconNew){
            if(widgetConfig.uri && state === 'opened'){
              iconNew.onClick();
            }
          });
        }
      }, this);
      this._removeDestroyed(this.preloadWidgetIcons);

      array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(widget){
        if(widget.configId === widgetConfig.id){
          widget.destroy();
          if(widgetConfig.visible === false){
            if(this.invisibleWidgetIds.indexOf(widgetConfig.id) < 0){
              this.invisibleWidgetIds.push(widgetConfig.id);
            }
            return;
          }
          this._loadPreloadWidget(widgetConfig, appConfig);
        }
      }, this);

      array.forEach(this.preloadGroupPanels, function(panel){
        panel.reloadWidget(widgetConfig);
      }, this);

      this._updatePlaceholder(appConfig);

      //if widget change visible from invisible, it's not exist in preloadPanelessWidgets
      //so, load it here
      array.forEach(this.invisibleWidgetIds, function(widgetId){
        if(widgetId === widgetConfig.id && widgetConfig.visible !== false){
          this._loadPreloadWidget(widgetConfig, appConfig);
          var i = this.invisibleWidgetIds.indexOf(widgetConfig.id);
          this.invisibleWidgetIds.splice(i, 1);
        }
      }, this);

      if(!widgetConfig.isOnScreen){
        array.forEach(this.widgetManager.getControllerWidgets(), function(controllerWidget){
          if(controllerWidget.widgetIsControlled(widgetConfig.id)){
            this._reloadControllerWidget(appConfig, controllerWidget.id);
          }
        }, this);
      }
    },

    _onGroupChange: function(appConfig, groupConfig){
      groupConfig = appConfig.getConfigElementById(groupConfig.id);

      if(groupConfig.isOnScreen){
        //for now, onscreen group can change widgets in it only
        this.panelManager.destroyPanel(groupConfig.id + '_panel');
        this._removeDestroyed(this.preloadGroupPanels);
        this._loadPreloadGroup(groupConfig, appConfig);
      }else{
        //for now, we support group label change only in widget pool
        array.forEach(this.widgetManager.getControllerWidgets(), function(controllerWidget){
          if(controllerWidget.isControlled(groupConfig.id)){
            this._reloadControllerWidget(appConfig, controllerWidget.id);
          }
        }, this);

        array.forEach(this.panelManager.panels, function(panel){
          if(panel.config.id === groupConfig.id){
            panel.updateConfig(groupConfig);
          }
        }, this);
      }
    },

    _updatePlaceholder: function (appConfig) {
      array.forEach(this.widgetPlaceholders, function(placehoder){
        placehoder.setIndex(appConfig.getConfigElementById(placehoder.configId).placeholderIndex);
      }, this);
    },

    _onWidgetPoolChange: function(appConfig, changeData){
      this._reloadControllerWidget(appConfig, changeData.controllerId);
    },

    _reloadControllerWidget: function(appConfig, controllerId){
      var controllerWidget = this.widgetManager.getWidgetById(controllerId);
      if(!controllerWidget){
        return;
      }

      //get old info
      var openedIds = controllerWidget.getOpenedIds();
      var windowState = controllerWidget.windowState;

      //destory all panels controlled by the controller.
      //we can't destroy the opened only, because some panels are closed but the
      //instance is still exists

      //destroy controlled widgets
      array.forEach(controllerWidget.getAllConfigs(), function(configJson){
        if(configJson.widgets){//it's group
          this.panelManager.destroyPanel(configJson.id + '_panel');
          array.forEach(configJson.widgets, function(widgetItem){
            //Group items must be in panel
            this.panelManager.destroyPanel(widgetItem.id + '_panel');
          }, this);
        }else{
          var widget = this.widgetManager.getWidgetById(configJson.id);
          if(!widget){
            return;
          }
          if(configJson.inPanel){
            this.panelManager.destroyPanel(widget.getPanel());
          }else{
            this.widgetManager.destroyWidget(widget);
          }
        }

      }, this);

      //destroy controller itself
      this.widgetManager.destroyWidget(controllerWidget);

      //load widget
      var newControllerJson = appConfig.getConfigElementById(controllerId);
      if(newControllerJson.visible === false){
        return;
      }
      this._loadPreloadWidget(newControllerJson, appConfig).then(lang.hitch(this, function(widget){
        this.widgetManager.changeWindowStateTo(widget, windowState);
        if(openedIds){
          widget.setOpenedIds(openedIds);
        }
      }));
    },

    _removeDestroyed: function(_array){
      var willBeDestroyed = [];
      array.forEach(_array, function(e){
        if(e._destroyed){
          willBeDestroyed.push(e);
        }
      });
      array.forEach(willBeDestroyed, function(e){
        var i = _array.indexOf(e);
        _array.splice(i, 1);
      });
    },

    _destroyPreloadWidgetIcons: function(){
      array.forEach(this.preloadWidgetIcons, function(icon){
        icon.destroy();
      }, this);
      this.preloadWidgetIcons = [];
    },

    _destroyOffPanelWidgets: function(){
      array.forEach(this.widgetManager.getOffPanelWidgets(), function(widget){
        this.widgetManager.destroyWidget(widget);
      }, this);
    },

    _destroyWidgetPlaceholders: function(){
      array.forEach(this.widgetPlaceholders, function(placeholder){
        placeholder.destroy();
      }, this);
      this.widgetPlaceholders = [];
    },

    _destroyPreloadGroupPanels: function(){
      array.forEach(this.preloadGroupPanels, function(panel){
        this.panelManager.destroyPanel(panel);
      }, this);
      this.preloadGroupPanels = [];
    },

    _changeMapPosition: function(appConfig){
      if(!this.map){
        return;
      }
      if(!utils.isEqual(this.mapManager.getMapPosition(), appConfig.map.position)){
        this.mapManager.setMapPosition(appConfig.map.position);
      }
    },

    _onThemeChange: function(appConfig){
      this._destroyPreloadWidgetIcons();
      this._destroyWidgetPlaceholders();
      this._destroyOffPanelWidgets();
      this._destroyPreloadGroupPanels();

      this.panelManager.destroyAllPanels();

      this._removeThemeCommonStyle(this.appConfig.theme);
      this._removeThemeCurrentStyle(this.appConfig.theme);

      require(['themes/' + appConfig.theme.name + '/main'], lang.hitch(this, function(){
        this._loadThemeCommonStyle(appConfig.theme);
        this._loadThemeCurrentStyle(appConfig.theme);
        this._changeMapPosition(appConfig);
        this._loadPreloadWidgets(appConfig);
      }));
    },

    _onResetConfig: function(appConfig){
      if(appConfig.map.itemId !== this.appConfig.map.itemId){
        topic.publish('appConfigChanged', appConfig, 'mapChange', appConfig);
        this._updateCommonStyle(appConfig);
        this._onStyleChange(appConfig);
        this._changeMapPosition(appConfig);
      }else{
        this._onThemeChange(appConfig);
      }
    },

    _onLoadingPageChange: function(appConfig, changeData){
      if('backgroundColor' in changeData){
        html.setStyle(jimuConfig.loadingId, 'background-color',
            appConfig.loadingPage.backgroundColor);
      }else if('backgroundImage' in changeData){
        var bgImage = appConfig.loadingPage.backgroundImage;
        if(bgImage.visible && bgImage.uri){
          html.setStyle(jimuConfig.loadingImageId, 'background-image',
            'url(\'' + bgImage.uri + '\')');
          html.setStyle(jimuConfig.loadingImageId, 'width', bgImage.width + 'px');
          html.setStyle(jimuConfig.loadingImageId, 'height', bgImage.height + 'px');
        }else{
          html.setStyle(jimuConfig.loadingImageId, 'background-image',
            'url(\'\')');
          html.setStyle(jimuConfig.loadingImageId, 'width', '0px');
          html.setStyle(jimuConfig.loadingImageId, 'height', '0px');
        }
      }else if('loadingGif' in changeData){
        var gifImage = appConfig.loadingPage.loadingGif;
        if(gifImage.visible && gifImage.uri){
          html.setStyle(jimuConfig.loadingGifId, 'background-image',
              'url(\'' + gifImage.uri + '\')');
          html.setStyle(jimuConfig.loadingGifId, 'width', gifImage.width + 'px');
          html.setStyle(jimuConfig.loadingGifId, 'height', gifImage.height + 'px');
        }else{
          html.setStyle(jimuConfig.loadingGifId, 'background-image',
              'url(\'\')');
          html.setStyle(jimuConfig.loadingGifId, 'width', '0px');
          html.setStyle(jimuConfig.loadingGifId, 'height', '0px');
        }
      }
    },

    _updateCommonStyle : function(appConfig){
      var currentTheme = this.appConfig.theme;

      // remove old theme name
      this._removeThemeCommonStyle(currentTheme);
      this._loadThemeCommonStyle(appConfig.theme);
    },

    _onStyleChange: function(appConfig){
      var currentTheme = this.appConfig.theme;
      this._removeThemeCurrentStyle(currentTheme);
      this._loadThemeCurrentStyle(appConfig.theme);
    },

    _onLayoutChange: function(appConfig){
      this._changeMapPosition(appConfig);

      //relayout placehoder
      array.forEach(this.widgetPlaceholders, function(placeholder){
        placeholder.moveTo(appConfig.getConfigElementById(placeholder.configId).position);
      }, this);

      //relayout icons
      array.forEach(this.preloadWidgetIcons, function(icon){
        icon.moveTo(appConfig.getConfigElementById(icon.configId).position);
      }, this);

      //relayout paneless widget
      array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(widget){
        if(widget.closeable){
          //this widget position is controlled by icon
          return;
        }
        var position = appConfig.getConfigElementById(widget.id).position;
        widget.setPosition(position);
      }, this);

      //relayout groups
      array.forEach(this.preloadGroupPanels, function(panel){
        var position = appConfig.getConfigElementById(panel.config.id).panel.position;
        panel.setPosition(position);
      }, this);
    },

    _loadTheme: function(theme) {
      //summary:
      //    load theme style, including common and current style(the first)
      require(['themes/' + theme.name + '/main'], lang.hitch(this, function(){
        this._loadThemeCommonStyle(theme);
        this._loadThemeCurrentStyle(theme);
      }));
    },

    _loadThemeCommonStyle: function(theme) {
      utils.loadStyleLink(this._getThemeCommonStyleId(theme),
        'themes/' + theme.name + '/common.css');
      // append theme name for better selector definition
      html.addClass(this.domNode, theme.name);
    },

    _removeThemeCommonStyle: function(theme){
      html.removeClass(this.domNode, theme.name);
      html.destroy(this._getThemeCommonStyleId(theme));
    },

    _loadThemeCurrentStyle: function(theme) {
      utils.loadStyleLink(this._getThemeCurrentStyleId(theme),
        'themes/' + theme.name + '/styles/' + theme.styles[0] + '/style.css');
      // append theme style name for better selector definitions
      html.addClass(this.domNode, theme.styles[0]);
    },

    _removeThemeCurrentStyle: function(theme){
      html.removeClass(this.domNode, theme.styles[0]);
      html.destroy(this._getThemeCurrentStyleId(theme));
    },

    _getThemeCommonStyleId: function(theme){
      return 'theme_' + theme.name + '_style_common';
    },

    _getThemeCurrentStyleId: function(theme){
      return 'theme_' + theme.name + '_style_' + theme.styles[0];
    },

    _loadMap: function() {
      html.create('div', {
        id: this.mapId,
        style: lang.mixin({
          position: 'absolute',
          backgroundColor: '#EEEEEE',
          overflow: 'hidden',
          minWidth:'1px',
          minHeight:'1px'
        })
      }, this.id);
      this.mapManager = MapManager.getInstance({
        appConfig: this.appConfig,
        urlParams: this.urlParams
      }, this.mapId);
      this.mapManager.setMapPosition(this.appConfig.map.position);

      this.mapManager.showMap();
    },

    _createPreloadWidgetPlaceHolder: function(widgetConfig){
      var pid;
      if(widgetConfig.position.relativeTo === 'map'){
        pid = this.mapId;
      }else{
        pid = this.id;
      }
      var cfg = lang.clone(widgetConfig);

      cfg.position.width = 40;
      cfg.position.height = 40;
      var style = utils.getPositionStyle(cfg.position);
      var phDijit = new WidgetPlaceholder({
        index: cfg.placeholderIndex,
        configId: widgetConfig.id
      });
      html.setStyle(phDijit.domNode, style);
      html.place(phDijit.domNode, pid);
      this.widgetPlaceholders.push(phDijit);
      return phDijit;
    },

    _createPreloadWidgetIcon: function(widgetConfig){
      var iconDijit = new OnScreenWidgetIcon({
        panelManager: this.panelManager,
        widgetManager: this.widgetManager,
        widgetConfig: widgetConfig,
        configId: widgetConfig.id,
        map: this.map
      });

      if(widgetConfig.position.relativeTo === 'map'){
        html.place(iconDijit.domNode, this.mapId);
      }else{
        html.place(iconDijit.domNode, this.id);
      }
      //icon position doesn't use width/height in config
      html.setStyle(iconDijit.domNode, utils.getPositionStyle({
        top: widgetConfig.position.top,
        left: widgetConfig.position.left,
        right: widgetConfig.position.right,
        bottom: widgetConfig.position.bottom,
        width: 40,
        height: 40
      }));
      iconDijit.startup();

      if(!this.openAtStartWidget && widgetConfig.openAtStart){
        iconDijit.switchToOpen();
        this.openAtStartWidget = widgetConfig.name;
      }

      this.preloadWidgetIcons.push(iconDijit);
      return iconDijit;
    },

    _loadPreloadWidgets: function(appConfig) {
      console.time('Load widgetOnScreen');
      var loading = new LoadingShelter(), defs = [];
      loading.placeAt(this.id);
      loading.startup();
      //load widgets
      array.forEach(appConfig.widgetOnScreen.widgets, function(widgetConfig) {
        if(widgetConfig.visible === false){
          this.invisibleWidgetIds.push(widgetConfig.id);
          return;
        }
        defs.push(this._loadPreloadWidget(widgetConfig, appConfig));
      }, this);

      //load groups
      array.forEach(appConfig.widgetOnScreen.groups, function(groupConfig) {
        defs.push(this._loadPreloadGroup(groupConfig, appConfig));
      }, this);

      all(defs).then(lang.hitch(this, function(){
        if(loading){
          loading.destroy();
          loading = null;
        }
        console.timeEnd('Load widgetOnScreen');
        topic.publish('preloadWidgetsLoaded');
        this._doPostLoad();
      }), lang.hitch(this, function(){
        if(loading){
          loading.destroy();
          loading = null;
        }
        //if error when load widget, let the others continue
        console.timeEnd('Load widgetOnScreen');
        topic.publish('preloadWidgetsLoaded');
        this._doPostLoad();
      }));

      // setTimeout(function(){
      //   if(loading){
      //     loading.destroy();
      //     loading = null;
      //   }
      // }, jimuConfig.timeout);
    },


    _doPostLoad: function(){
      //load somethings that may be used later.
      //let it load behind the stage.
      require(['dynamic-modules/postload']);
    },

    _loadPreloadWidget: function(widgetConfig, appConfig) {
      var def = new Deferred();

      if(appConfig.mode === 'config' && !widgetConfig.uri){
        var placeholder = this._createPreloadWidgetPlaceHolder(widgetConfig);
        def.resolve(placeholder);
        return def;
      }else if(!widgetConfig.uri){
        //in run mode, when no uri, do nothing
        def.resolve(null);
        return def;
      }

      var iconDijit;
      if(widgetConfig.inPanel || widgetConfig.closeable){//TODO closeable rename
        //in panel widget or closeable off panel widget
        iconDijit = this._createPreloadWidgetIcon(widgetConfig);
        def.resolve(iconDijit);
      }else{
        //off panel
        this.widgetManager.loadWidget(widgetConfig).then(lang.hitch(this, function(widget){
          try{
            widget.setPosition(widget.position);
            this.widgetManager.openWidget(widget);
          }catch(err){
            console.log(console.error('fail to startup widget ' + widget.name + '. ' + err.stack));
          }

          widget.configId = widgetConfig.id;
          def.resolve(widget);
        }), function(err){
          def.reject(err);
        });
      }

      return def;
    },

    _loadPreloadGroup: function(groupJson, appConfig) {
      if(!appConfig.mode && (!groupJson.widgets || groupJson.widgets.length === 0)){
        return when(null);
      }
      return this.panelManager.showPanel(groupJson).then(lang.hitch(this, function(panel){
        panel.configId = groupJson.id;
        this.preloadGroupPanels.push(panel);
        return panel;
      }));
    },

    _onOpenWidgetRequest: function(widgetId){
      //if widget is in group, we just ignore it

      //check on screen widgets, we don't check not-closeable off-panel widget
      array.forEach(this.preloadWidgetIcons, function(widgetIcon){
        if(widgetIcon.configId === widgetId){
          widgetIcon.switchToOpen();
        }
      }, this);

      //check controllers
      array.forEach(this.widgetManager.getControllerWidgets(), function(controllerWidget){
        if(controllerWidget.widgetIsControlled(widgetId)){
          controllerWidget.setOpenedIds([widgetId]);
        }
      }, this);
    }
  });

  clazz.getInstance = function(options, domId) {
    if (instance === null) {
      instance = new clazz(options, domId);
      window._layoutManager = instance;
    }
    return instance;
  };
  return clazz;
});
