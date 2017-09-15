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
  'dojo/_base/html',
  'dijit/_WidgetBase',
  'dojo/topic',
  'dojo/on',
  'dojo/query',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/debounce',
  'require',
  './MapManager',
  './utils'
],

function(declare, lang, html, _WidgetBase, topic, on, query,
  Deferred, all, debounce, require, MapManager, utils) {
  /* global jimuConfig:true */
  var instance = null, clazz;

  /**
   * This is the general layout manager, and it will deleget the layout manage responsibility to other manager
   *   depends on the config.
   * What this class does is:
   *   * load and manage theme change
   *   * load and manage map change
   *   * delegate layout manage to other manager
   * @param  {[type]} options [description]
   * @param  {[type]} domId)  {                       this.widgetManager [description]
   * @return {[type]}         [description]
   */
  clazz = declare([_WidgetBase], {
    constructor: function(options, domId) {
      /*jshint unused: false*/

      this.own(topic.subscribe("appConfigLoaded", lang.hitch(this, this._onAppConfigLoaded)));
      this.own(topic.subscribe("appConfigChanged", lang.hitch(this, this._onAppConfigChanged)));

      this.own(topic.subscribe("mapLoaded", lang.hitch(this, this._onMapLoaded)));
      this.own(topic.subscribe("mapChanged", lang.hitch(this, this._onMapChanged)));
      this.own(topic.subscribe("beforeMapDestory", lang.hitch(this, this._onBeforeMapDestory)));

      this.own(topic.subscribe("preloadModulesLoaded", lang.hitch(this, this._onPreloadModulesLoaded)));

      //If a widget want to open another widget, please publish this message with widgetId as a
      //parameter
      this.own(topic.subscribe("openWidget", lang.hitch(this, this._onOpenWidgetRequest)));

      this.own(topic.subscribe("builder/actionTriggered", lang.hitch(this, this._onActionTriggered)));

      //avoid mobileKeyboard resize
      if (!utils.isMobileUa()) {
        this.own(on(window, 'resize', debounce(lang.hitch(this, this.resize), 200)));
      }

      this.id = domId;

      this.preloadModulesLoadDef = new Deferred();
    },

    postCreate: function(){
      this.containerNode = this.domNode;
    },

    map: null,
    mapId: 'map',
    mapDiv: null,
    hlDiv: null,
    layoutManager: null,

    animTime: 500,

    resize: function() {
      if(this.layoutManager){
        this.layoutManager.resize();
      }
    },

    _onAppConfigLoaded: function(config){
      this.appConfig = lang.clone(config);

      this.preloadModulesLoadDef.then(lang.hitch(this, function(){
        this._loadLayoutManager(this.appConfig).then(lang.hitch(this, function(layoutManager){
          this.layoutManager = layoutManager;

          this.layoutManager.onEnter(this.appConfig, this.mapId);
          this.mapDiv = this.layoutManager.getMapDiv();
          this._loadMap(this.mapId);

          if(this.appConfig.theme){
            this._loadTheme(this.appConfig.theme);
          }
        }));
      }));
    },

    _loadLayoutManager: function(appConfig){
      var managerName;
      if(appConfig.layoutDefinition){
        managerName = appConfig.layoutDefinition.manager;
      }else{
        managerName = 'jimu/layoutManagers/AbsolutePositionLayoutManager';
      }

      var def = new Deferred();
      require([managerName], lang.hitch(this, function(ManagerClass){
        var instance = ManagerClass.getInstance();
        if (this.map) {
          instance.setMap(this.map);
        }
        def.resolve(instance);
      }));
      return def;
    },

    _loadMap: function(mapId) {
      this.mapManager = MapManager.getInstance({
        appConfig: this.appConfig,
        urlParams: this.urlParams
      }, mapId);
      this.mapManager.showMap();
    },

    _onMapLoaded: function(map) {
      this.map = map;
      this.layoutManager.setMap(map);
      this.layoutManager.loadAndLayout(this.appConfig);
    },

    _onPreloadModulesLoaded: function(){
      this.preloadModulesLoadDef.resolve();
    },

    _loadTheme: function(theme) {
      var def = new Deferred();
      require(['themes/' + theme.name + '/main'], lang.hitch(this, function(){
        all([this._loadThemeCommonStyle(theme), this._loadThemeCurrentStyle(theme)])
        .then(lang.hitch(this, function() {
          this._addCustomStyle(theme);
          this.layoutManager.onThemeLoad();
          def.resolve();
        }));
      }));
      return def;
    },

    _loadThemeCommonStyle: function(theme) {
      // append theme name for better selector definition
      html.addClass(this.domNode, theme.name);

      return utils.loadStyleLink(this._getThemeCommonStyleId(theme), 'themes/' + theme.name + '/common.css');
    },

    _loadThemeCurrentStyle: function(theme) {
      // append theme style name for better selector definitions
      html.addClass(this.domNode, theme.styles[0]);

      return utils.loadStyleLink(this._getThemeCurrentStyleId(theme),
        'themes/' + theme.name + '/styles/' + theme.styles[0] + '/style.css');
    },

    _addCustomStyle: function(theme) {
      var customStyles = lang.getObject('customStyles', false, theme);
      if(!customStyles){
        return;
      }
      var cssText = ".jimu-main-background{background-color: ${mainBackgroundColor} !important;}";
      var themeCssText = this._getFixedThemeStyles(theme);
      if(themeCssText){
        cssText += themeCssText;
      }
      cssText = lang.replace(cssText, customStyles, /\$\{([^\}]+)\}/g);

      var style = html.create('style', {
        type: 'text/css'
      });
      try {
        style.appendChild(document.createTextNode(cssText));
      } catch(err) {
        style.styleSheet.cssText = cssText;
      }
      style.setAttribute('source', 'custom');

      document.head.appendChild(style);
    },

    /**
     * This is a temp fix because the custom color can override one color only.
     * @param  {Object} theme
     * @return {String} The CSS string
     */
    _getFixedThemeStyles: function(theme){
      //fix popup
      var cssText = '.esriPopup .titlePane {background-color: ${mainBackgroundColor} !important;}';
      if(theme.name === 'PlateauTheme'){
        cssText += '.jimu-widget-header-controller .jimu-title, .jimu-widget-header-controller .jimu-subtitle' +
          '{color: ${mainBackgroundColor} !important;}';
        cssText += '.jimu-widget-header-controller .links .jimu-link' +
          '{color: ${mainBackgroundColor} !important;}';
        cssText += '.jimu-widget-homebutton .HomeButton .home, .jimu-widget-mylocation,' +
          ' .jimu-widget-mylocation .place-holder, .jimu-widget-zoomslider.vertical .zoom-in,' +
          ' .jimu-widget-zoomslider.vertical .zoom-out, .jimu-widget-extent-navigate.vertical .operation' +
          '{background-color: ${mainBackgroundColor} !important;}';
        cssText += '.jimu-preload-widget-icon-panel > .jimu-panel-title,' +
          ' .jimu-foldable-panel > .jimu-panel-title, .jimu-title-panel > .title' +
          '{color: ${mainBackgroundColor} !important;}';
        cssText += '.jimu-panel{border-color: ${mainBackgroundColor} !important;}';
        cssText += '.jimu-widget-header-controller' +
          '{border-bottom-color: ${mainBackgroundColor} !important;}';
        cssText += '.jimu-tab>.control>.tab' +
          '{color: ${mainBackgroundColor} !important; border-color: ${mainBackgroundColor} !important}';
      }else if(theme.name === 'BillboardTheme'){
        cssText += '.jimu-widget-homebutton .HomeButton .home, .jimu-widget-mylocation,' +
          ' .jimu-widget-mylocation .place-holder, .jimu-widget-zoomslider.vertical .zoom-in,' +
          ' .jimu-widget-zoomslider.vertical .zoom-out, .jimu-widget-extent-navigate .operation' +
          '{background-color: ${mainBackgroundColor} !important;}';
        cssText += '.jimu-widget-onscreen-icon' +
          '{background-color: ${mainBackgroundColor} !important;}';
      }else if(theme.name === 'BoxTheme'){
        cssText += '.jimu-widget-homebutton .HomeButton .home, .jimu-widget-mylocation,' +
          ' .jimu-widget-mylocation .place-holder, .jimu-widget-zoomslider.vertical .zoom-in,' +
          ' .jimu-widget-zoomslider.vertical .zoom-out, .jimu-widget-extent-navigate' +
          '{background-color: ${mainBackgroundColor} !important;}';
      }else if(theme.name === 'TabTheme'){
        cssText += '.tab-widget-frame .title-label{color: ${mainBackgroundColor} !important;}';
      }
      else if(theme.name === 'DashboardTheme'){
        cssText += '.jimu-widget-dnd-header{background-color: ${mainBackgroundColor} !important;}';
      }
      return cssText;
    },

    ////////////////////////// handle events for builder
    _onAppConfigChanged: function(appConfig, reason, changeData){
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
      case 'layoutDefinitionChange':
        this._onLayoutDefinitionChange(appConfig, changeData);
        break;
      case 'onScreenGroupsChange':
        this._onOnScreenGroupsChange(appConfig, changeData);
        break;
      }
      this.appConfig = appConfig;
    },

    _onMapChanged: function(map){
      this.map = map;
      this.layoutManager.setMap(map);
      this.layoutManager.loadAndLayout(this.appConfig);
    },

    _onBeforeMapDestory: function(){
      //when map changed, use destroy and then create to simplify the widget development
      //destroy widgets before map, because the widget may use map in thire destory method

      this.layoutManager.destroyOnScreenWidgetsAndGroups();
    },

    _onThemeChange: function(appConfig){
      this.layoutManager.destroyOnScreenWidgetsAndGroups();

      this._removeThemeCommonStyle(this.appConfig.theme);
      this._removeThemeCurrentStyle(this.appConfig.theme);
      this._removeCustomStyle();

      all([this._loadLayoutManager(appConfig), this._loadTheme(appConfig.theme)])
      .then(lang.hitch(this, function(results){
        var layoutManager = results[0];
        if(this.layoutManager.name !== layoutManager.name){
          this.layoutManager.onLeave();
          layoutManager.onEnter(appConfig, this.mapId);

          this.layoutManager = layoutManager;
        }
        this.layoutManager.loadAndLayout(appConfig);
      }));
    },

    _onResetConfig: function(appConfig){
      var oldAC = this.appConfig;
      topic.publish('appConfigChanged', appConfig, 'mapChange', appConfig);//this line will change this.appConfig
      this.appConfig = oldAC;

      this._loadLayoutManager(appConfig).then(lang.hitch(this, function(layoutManager){
        this.layoutManager = layoutManager;

        this._removeThemeCommonStyle(this.appConfig.theme);
        this._removeThemeCurrentStyle(this.appConfig.theme);
        this._removeCustomStyle();
        this._loadTheme(this.appConfig.theme);
      }));
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

    _onStyleChange: function(appConfig){
      var currentTheme = this.appConfig.theme;
      this._removeThemeCurrentStyle(currentTheme);
      this._loadThemeCurrentStyle(appConfig.theme);
      this._removeCustomStyle();
      this._addCustomStyle(appConfig.theme);
    },

    _onLayoutChange: function(appConfig){
      //layout manager is not allowed changed between layout
      this.layoutManager.onLayoutChange(appConfig);
    },

    _onWidgetChange: function(appConfig, widgetJson){
      this.layoutManager.onWidgetChange(appConfig, widgetJson);
    },

    _onGroupChange: function(appConfig, groupJson){
      this.layoutManager.onGroupChange(appConfig, groupJson);
    },

    _onWidgetPoolChange: function(appConfig, changeData){
      this.layoutManager.onWidgetPoolChange(appConfig, changeData);
    },

    _onActionTriggered: function(actionInfo){
      this.layoutManager.onActionTriggered(actionInfo);
    },

    _onLayoutDefinitionChange: function(appConfig, layoutDefinition){
      this.layoutManager.onLayoutDefinitionChange(appConfig, layoutDefinition);
    },

    _onOnScreenGroupsChange: function(appConfig, groups){
      this.layoutManager.onOnScreenGroupsChange(appConfig, groups);
    },

    _removeThemeCommonStyle: function(theme){
      html.removeClass(this.domNode, theme.name);
      html.destroy(this._getThemeCommonStyleId(theme));
    },

    _removeThemeCurrentStyle: function(theme){
      html.removeClass(this.domNode, theme.styles[0]);
      html.destroy(this._getThemeCurrentStyleId(theme));
    },

    _removeCustomStyle: function() {
      query('style[source="custom"]', document.head).forEach(function(s) {
        html.destroy(s);
      });
    },

    _getThemeCommonStyleId: function(theme){
      return 'theme_' + theme.name + '_style_common';
    },

    _getThemeCurrentStyleId: function(theme){
      return 'theme_' + theme.name + '_style_' + theme.styles[0];
    },

    _doPostLoad: function(){
      //load somethings that may be used later.
      //let it load behind the stage.
      require(['dynamic-modules/postload']);
    },

    _onOpenWidgetRequest: function(widgetId){
      this.layoutManager.openWidget(widgetId);
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
