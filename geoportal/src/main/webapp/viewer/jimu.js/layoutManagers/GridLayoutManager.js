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
  'dojo/on',
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/Deferred',
  'dojo/debounce',
  'require',
  '../WidgetManager',
  '../PanelManager',
  '../utils',
  '../dijit/LoadingShelter',
  './BaseLayoutManager',
  './GridMobileController'
],

function(declare, lang, array, html, topic, on, domConstruct, domGeometry,
  Deferred, debounce, require, WidgetManager, PanelManager,
  utils, LoadingShelter, BaseLayoutManager, MobileController) {
  /* global jimuConfig:true */
  /* global $:true */
  var instance = null, clazz;
  var LAYOUT_TYPE_STACK = 'stack', LAYOUT_TYPE_COMPONENT = 'component';
  var PORTRAIT_MODE = 1, LANDSCAPE_MODE = 2;

  clazz = declare([BaseLayoutManager], {
    isEditing: false,
    maxStackId: 0,
    dashboardWidgets: [],
    dashboardPanels: {},
    currentMode: 0,
    _createLayoutDeferred: null,
    _isLastLayoutMobile: false,
    _isDestroying: false,
    nls: null,
    _addWidgetTipTemplate: '<div class="tip">' +
      '<div class="idx">${groupIndex}</div>' +
      '<div class="label">${this.nls.addWidgetTip}</div>' +
      '</div>',

    name: 'GridLayoutManager',

    constructor: function(options, domId) {
      /*jshint unused: false*/
      this.widgetManager = WidgetManager.getInstance();
      this.panelManager = PanelManager.getInstance();

      this.widgetPlaceholders = [];
      this.preloadWidgetIcons = [];
      this.preloadGroupPanels = [];
      this.invisibleWidgetIds = [];

      //avoid mobileKeyboard resize
      if (!utils.isMobileUa()) {
        this.own(on(window, 'resize', lang.hitch(this, this.resize)));
      } else {
        this.own(on(window, 'orientationchange', lang.hitch(this, this.resize)));
      }

      this.id = domId;
      this._createLayoutDeferred = null;
    },

    postMixInProperties: function() {
      this.inherited(arguments);
      this.nls = {};
      lang.mixin(this.nls, window.jimuNls.gridLayout, window.jimuNls.common);
      this._addWidgetTipTemplate =
        this._addWidgetTipTemplate.replace('${this.nls.addWidgetTip}', this.nls.addWidgetTip);
    },

    isSupportEdit: function(){
      return true;
    },

    postCreate: function(){
      this.containerNode = this.domNode;
      this._isLastLayoutMobile = window.appInfo.isRunInMobile;
    },

    layout: null,
    map: null,
    mapContainer: null,
    mapId: 'map',
    hlDiv: null,

    animTime: 500,

    resize: function() {
      //resize golden layout container
      this._resizeLayout();
      //resize widgets. the panel's resize is called by the panel manager.
      //widgets which is in panel is resized by panel
      array.forEach(this.widgetManager.getAllWidgets(), function(w) {
        if (w.inPanel === false) {
          w.resize();
        }
      }, this);
    },

    setMap: function(map){
      this.inherited(arguments);
      this.panelManager.setMap(map);
    },

    _resizeLayout: function() {
      if(window.appInfo.isRunInMobile){
        var box = domGeometry.getMarginBox(window.jimuConfig.layoutId);
        var mode;
        if (box.w > box.h) {
          mode = LANDSCAPE_MODE;
        } else {
          mode = PORTRAIT_MODE;
        }
        if(this.mobilePanel) {
          if(this.currentMode !== mode){
            this.currentMode = mode;
            this.mobilePanel.setMobileLayout(mode);
          }
          this.mobilePanel.resize();
        }
      }
      var container, width, height;
      //resize golden layout container
      if (!this.isEditing && this.layout) {
        container = $(this.layoutContainer);
        width = container.width();
        height = container.height();
        this.layout.updateSize(width, height);
      } else if (this.isEditing && this.editingLayout) {
        container = $(this.editLayoutDiv);
        width = container.width();
        height = container.height();
        this.editingLayout.updateSize(width, height);
      }
    },

    // Two conditions to invoke this method:
    // 1. Map loaded or map changed.
    // 2. Theme changed.
    // Create and arrange widgets in this method
    loadAndLayout: function(appConfig){
      this.appConfig = appConfig;
      // this.setMapPosition(appConfig.map.position);
      var loading = new LoadingShelter(), def;
      loading.placeAt(this.layoutId);
      loading.startup();
      // load dashboard grouops
      if (this._createLayoutDeferred && !this._createLayoutDeferred.isResolved()) {
        def = this._createLayoutDeferred;
      } else {
        def = new Deferred();
        def.resolve();
      }

      def.then(lang.hitch(this, this._loadOnScreenGroups))
        .then(lang.hitch(this, this._reArrangeWidgetsLayout, true))
        .then(lang.hitch(this, function(){
        if(loading){
          loading.destroy();
          loading = null;
        }
        console.timeEnd('Load widgetOnScreen');
        topic.publish('preloadWidgetsLoaded');
      }), lang.hitch(this, function(){
        if(loading){
          loading.destroy();
          loading = null;
        }
        //if error when load widget, let the others continue
        console.timeEnd('Load widgetOnScreen');
        topic.publish('preloadWidgetsLoaded');
      }));
    },

    createMapDiv: function(mapId){
      if(html.byId(mapId)){
        this.mapDiv = html.byId(mapId);
      }else{
        this.mapDiv = html.create('div', {
          id: mapId,
          style: lang.mixin({
            position: 'absolute',
            backgroundColor: '#EEEEEE',
            overflow: 'hidden',
            minWidth:'1px',
            minHeight:'1px'
          }, utils.getPositionStyle(this.appConfig.map.position))
        }, this.layoutId);
      }
    },

    getMapDiv: function() {
      return this.mapDiv;
    },

    onThemeLoad: function() {
      this._resizeLayout();
    },

    _enableEditing: function() {
      if (this.isEditing) {
        return;
      }
      this._createEditingLayout();

      $(this.layoutContainer).addClass('hidden');
      $(this.editContainer).removeClass('hidden');
      $(this.modifyLayoutBtn).addClass('hidden');
      this.isEditing = true;
      this._resizeLayout();
    },

    _disableEditing: function() {
      $(this.layoutContainer).removeClass('hidden');
      $(this.editContainer).addClass('hidden');
      $(this.modifyLayoutBtn).removeClass('hidden');

      this.isEditing = false;
      this._resizeLayout();
    },

    _resetLayoutDefinition: function() {
      this._disableEditing();
      this._createLayout(false, false);
      topic.publish('editLayoutCancelled');
    },

    _saveLayoutDefinition: function() {
      var newConfig = lang.clone(this.editingLayout.toConfig());
      var newLayoutDefinition = lang.clone(this.appConfig.layoutDefinition);
      this._simplifyLayoutDefinition(newConfig.content[0]);
      this._disableEditing();

      var rootElem = this.editingLayout.root.contentItems[0];
      var stacks = rootElem.getItemsByType('stack');
      var groupIds = [];
      array.forEach(stacks, function(item) {
        var isMapStack = array.some(item.contentItems, lang.hitch(this, function(contentItem) {
          if(contentItem.isComponent && contentItem.config.componentName === 'map') {
            return true;
          }
        }));
        if (!isMapStack && /^dd_group_\d+$/.test(item.config.id)) {
          groupIds.push(item.config.id);
        }
      });
      newLayoutDefinition.layout.config.content = newConfig.content;
      topic.publish('layoutDefinitionChanged', {
        layoutDefinition: newLayoutDefinition,
        groupIds: groupIds
      });
    },

    // Remove all items of type 'component'
    _simplifyLayoutDefinition: function(contentItem) {
      if (contentItem.type === 'component') {
        return;
      } else if (contentItem.type === 'stack') {
        var mapComponent;
        contentItem.activeItemIndex = 0;
        array.some(contentItem.content, lang.hitch(this, function(item) {
          if(item.type === 'component' && item.componentName === 'map') {
            mapComponent = item;
            return true;
          }
        }));
        if (mapComponent) {
          contentItem.id = 'map';
          contentItem.content = [mapComponent];
        } else {
          contentItem.content = [];
        }
        return;
      }
      array.forEach(contentItem.content, lang.hitch(this, function(item) {
        this._simplifyLayoutDefinition(item);
      }));
    },

    // Invoke this method every time a new layout is created.
    _bindLayoutEvents: function() {
      this.editingLayout.on( 'initialised', lang.hitch(this, function(){
        // Make the create button as a drag source
        this.editingLayout.createDragSource( $(this.dragCreateBtn), {
          title: ' ',
          type: 'component',
          reorderEnabled: false,
          componentName: 'widget panel'
        });
        // Get the max index of dashboard group panel
        var rootElem = this.editingLayout.root.contentItems[0];
        var stacks = rootElem.getItemsByType('stack');
        var stackIds = [];
        array.forEach(stacks, function(item) {
          if (/^dd_group_\d+$/.test(item.config.id)) {
            var idx = parseInt(item.config.id.split('_')[2], 10);
            stackIds.push(idx);
          }
        });
        if (stackIds.length > 0) {
          stackIds = stackIds.sort(function(a, b) {
            return a > b;
          });
          this.maxStackId = stackIds[stackIds.length - 1];
        } else {
          this.maxStackId = 0;
        }
        this._arrangeWidgetsInEditingLayout();
      }));
      this.editingLayout.on( 'stackCreated', lang.hitch(this, function(stack){
        // Assign id to stack that has no id attribute
        this.maxStackId++;
        if (!stack.config.id) {
          stack.config.id = 'dd_group_' + this.maxStackId;
        }
      }));
    },

    _arrangeWidgetsInEditingLayout: function() {
      var groups = this.appConfig.widgetOnScreen.groups;
      array.forEach(groups, lang.hitch(this, function(group){
        var groupConfig = this.appConfig.getConfigElementById(group.id);
        var rootElem = this.editingLayout.root.contentItems[0];
        var result = rootElem.getItemsById(groupConfig.id), stack;
        if (result && result.length > 0 &&
          LAYOUT_TYPE_STACK === result[0].type) {
          stack = result[0];
        }
        if (stack ) {
          // Layout has been recreated. Each stack contains only one component.
          array.forEach(groupConfig.widgets, lang.hitch(this, function(widget, index) {
            var itemConfig = {
              id: widget.id,
              type: 'component',
              title: widget.label,
              reorderEnabled: false,
              componentName: 'widget panel',
              componentState: {
                label: widget.label
              }
            };
            if (stack.contentItems.length > index) {
              var contentItem = stack.contentItems[index];
              // replace the first component
              contentItem.config.id = widget.id;
              contentItem.setTitle(widget.label);
            } else {
              stack.addChild(itemConfig);
            }
          }));
        }
      }));
    },

    _createActionBar: function(container) {
      if (!this.actionBar) {
        this.actionBar = domConstruct.create('div', {
          "class": 'layout-actionbar'
        }, container);

        this.dragCreateBtn = domConstruct.create('div', {
          "class": 'jimu-btn jimu-float-leading jimu-leading-margin2 add-btn',
          innerHTML: this.nls.dragToAdd
        }, this.actionBar);
        var cancelBtn = domConstruct.create('div', {
          "class": 'jimu-btn-vacation jimu-float-trailing jimu-trailing-margin2 cancel-btn',
          innerHTML: this.nls.cancel
        }, this.actionBar);
        var saveBtn = domConstruct.create('div', {
          "class": 'jimu-btn jimu-float-trailing save-btn',
          innerHTML: this.nls.ok
        }, this.actionBar);
        this.own(on(cancelBtn, 'click', lang.hitch(this, this._resetLayoutDefinition)));
        this.own(on(saveBtn, 'click', lang.hitch(this, this._saveLayoutDefinition)));
      }
    },

    _destroyActionBar: function() {
      domConstruct.destroy(this.actionBar);
      this.actionBar = null;
    },

    /**
     * There are three types of layout:
     * 1. Normal layout for PC to view the app
     * 2. Mobile layout for mobile device to view the app
     * 3. Editing layout for builder to edit the layout. Only available for PC.
     * @param {groupsChanged} boolean Indicate whether the on screen widget groups have
     * been changed. If true, we need to invoke this._loadOnScreenGroups() to update
     * this.dashboardWidgets and this.dashboardPanels. If false, all widgets and panels
     * are ready to use, just re-arrange the widget groups.
     * @param {reloadOnScreenWidgets} boolean Whether the on screen widgets should be recreated.
     */
    _createLayout: function(groupsChanged, reloadOnScreenWidgets, createLayoutOnly) {
      // Previous createlayout operation
      if (this._createLayoutDeferred && !this._createLayoutDeferred.isResolved()) {
        return this._createLayoutDeferred.then(lang.hitch(this, function() {
          return this._doCreateLayout(groupsChanged, reloadOnScreenWidgets, createLayoutOnly);
        }));
      } else {
        return this._doCreateLayout(groupsChanged, reloadOnScreenWidgets, createLayoutOnly);
      }
    },

    _doCreateLayout: function(groupsChanged, reloadOnScreenWidgets, createLayoutOnly) {
      var createLayoutFunc, def = new Deferred();
      this._createLayoutDeferred = new Deferred();
      if(this.isEditing) {
        return this._createEditingLayout();
      }
      if(window.appInfo.isRunInMobile) {
        createLayoutFunc = lang.hitch(this, this._createMobileLayout);
      } else {
        if (this.mobileController) {
          this.mobileController.destroyOnScreenWidgets();
          this.mobileController.destroy();
          this.mobileController = null;
        }
        createLayoutFunc = lang.hitch(this, this._createNormalLayout);
      }
      if(createLayoutOnly) { // map not initialized, only create layout
        createLayoutFunc().then(lang.hitch(this, function() {
          this._createLayoutDeferred.resolve();
          def.resolve();
        }));
      } else if(groupsChanged) {
        createLayoutFunc()
          .then(lang.hitch(this, this._loadOnScreenGroups))
          .then(lang.hitch(this, this._reArrangeWidgetsLayout, reloadOnScreenWidgets))
          .then(lang.hitch(this, function() {
            this._createLayoutDeferred.resolve();
            def.resolve();
          }));
      } else {
        createLayoutFunc()
          .then(lang.hitch(this, this._reArrangeWidgetsLayout, reloadOnScreenWidgets))
          .then(lang.hitch(this, function() {
            this._createLayoutDeferred.resolve();
            def.resolve();
          }));
      }
      return def;
    },

    // detach all widget panels
    _detachWidgets: function(contentItem) {
      if (contentItem.type === 'stack') {
        while (contentItem.contentItems.length > 1) {
          contentItem.removeChild(contentItem.contentItems[0], true);
        }
        var lastChild = contentItem.contentItems[0];
        contentItem.addChild({
          type: "component",
          componentName: "widget panel",
          title: ' ',
          isClosable: false
        });
        contentItem.removeChild(lastChild, true);
        return;
      }
      array.forEach(contentItem.contentItems, lang.hitch(this, function(item) {
        this._detachWidgets(item);
      }));
    },

    _setupWidgets: function(contentItem, isClosable) {
      contentItem.isClosable = isClosable;
      if (contentItem.type === 'component') {
        return;
      }else if (contentItem.type === 'stack') {
        if (contentItem.content.length === 0) {
          contentItem.content = [{
            type: "component",
            componentName: "widget panel",
            title: ' ',
            isClosable: isClosable
          }];
        }
        return;
      }
      array.forEach(contentItem.content, lang.hitch(this, function(item) {
        this._setupWidgets(item);
      }));
    },

    _onActivePanelChanged: function(contentItem) {
      var panel;
      if (this._isDestroying) {
        return;
      }
      if (contentItem.componentName === 'widget panel') {
        if (contentItem.config.id) {
          panel = this.dashboardPanels[contentItem.config.id];
          if (!panel || !panel.domNode) { // Load panel when it is first activated.
            this._loadDashboardWidget(contentItem.config.id).then(lang.hitch(this, function(panel) {
              if (panel) {
                contentItem.container.getElement().html(panel.domNode);
                contentItem.container.on('resize', debounce(lang.hitch(this, function() {
                  if (contentItem.container.width > 0 && contentItem.container.height > 0) {
                    panel.resize();
                  }
                }), 200));
                panel.resize();
                this.panelManager.openPanel(panel);
              }
            }));
          } else {
            if (contentItem.container.getElement().find('.jimu-panel').length === 0) {
              contentItem.container.getElement().html(panel.domNode);
              contentItem.container.on('resize', debounce(lang.hitch(this, function() {
                if (contentItem.container.width > 0 && contentItem.container.height > 0) {
                  if (panel) {
                    panel.resize();
                  }
                }
              }), 200));
            }
            panel.resize();
            this.panelManager.openPanel(panel);
          }

          // Close all other panels
          var groupId = contentItem.parent.config.id;
          var groups = this.appConfig.widgetOnScreen.groups, widgets;
          array.some(groups, lang.hitch(this, function(groupConfig) {
            if (groupConfig.id === groupId) {
              widgets = groupConfig.widgets;
              return true;
            }
          }));
          array.forEach(widgets, lang.hitch(this, function(widgetConfig) {
            if(widgetConfig.id !== contentItem.config.id) {
              panel = this.dashboardPanels[widgetConfig.id];
              if(panel) {
                this.panelManager.closePanel(panel);
              }
            }
          }));
        }
      }
    },

    _createNormalLayout: function() {
      var def = new Deferred();
      this._isDestroying = false;
      // recreate golden layout instance
      if(!this.layoutContainer) {
        this.layoutContainer = domConstruct.create('div', {
          "class": this.appConfig.mode === 'config' ? 'jimu-dnd-layout config' : 'jimu-dnd-layout'
        }, this.layoutId);
        if (this.appConfig.mode === 'config') {
          this.modifyLayoutBtn = domConstruct.create('div', {
            "class": 'jimu-dnd-layout modify-btn',
            innerHTML: '<div class="jimu-ellipsis"><span class="feature-action icon-edit"></span>' +
              this.nls.modifyLayout + '</div>'
          }, this.layoutId);
          this.own(on(this.modifyLayoutBtn, 'click', lang.hitch(this, function(){
            topic.publish('editLayout');
          })));
        }
      }
      array.some(this.appConfig.widgetOnScreen.widgets, function(widgetConfig) {
        if (widgetConfig.uri === 'themes/DashboardTheme/widgets/Header/Widget') {
          if (widgetConfig.visible) {
            html.setStyle(this.layoutContainer, 'top', '80px');
          } else {
            this._removeHighLight(widgetConfig.id);
            html.setStyle(this.layoutContainer, 'top', 0);
          }
          return true;
        }
      }, this);

      var oldLayout = this.layout;
      var config = lang.clone(this.appConfig.layoutDefinition.layout.config);
      if (this.appConfig.mode === 'config') {
        config.settings.reorderEnabled = false;
        config.settings.resizeEnabled = false;
        config.settings.enableHeaderDragging = false;
        config.dimensions = {
          borderWidth: 5,
          dragProxyWidth: 0,
          dragProxyHeight: 0
        };
      }
      this._setupWidgets(config.content[0], false);
      require(['libs/goldenlayout/goldenlayout'], lang.hitch(this, function(GodenLayout){
        if (this.appConfig.mode === 'config') {
          $(this.modifyLayoutBtn).removeClass('hidden');
        }
        this.layout = new GodenLayout(config, this.layoutContainer);
        this.layout.registerComponent( 'widget panel', lang.hitch(this, function( container, componentState) {
          var stack = container.parent.parent;
          var groupId = stack.config.id, index, content;
          if (!componentState.widgetId) {
            content = this._addWidgetTipTemplate;
            array.some(this.appConfig.widgetOnScreen.groups, function(groupConfig) {
              if(groupConfig.id === groupId) {
                if(this.appConfig.mode === 'config' && groupConfig.widgets.length === 0){
                  index = groupConfig.placeholderIndex;
                }
                return true;
              }
            }, this);
            if(index){
              content = content.replace('${groupIndex}', index);
              container.getElement().html(content);
            }
          }
        }));
        this.layout.registerComponent( 'map', lang.hitch(this, function( container ){
          this.mapContainer = container.getElement();
          $('#' + this.mapId).appendTo(this.mapContainer);
          if (oldLayout) {
            this._isDestroying = true;
            this._detachWidgets(oldLayout.root.contentItems[0]);
            oldLayout.destroy();
            this._isDestroying = false;
          }
          if (this.mobilePanel) {
            this.mobilePanel.destroy();
            this.mobilePanel = null;
          }
        }));
        this.layout.on( 'initialised', lang.hitch(this, function(){
          def.resolve();
        }));
        this.layout.on( 'stackCreated', lang.hitch(this, function(stack){
          stack.on('activeContentItemChanged', lang.hitch(this, function(contentItem) {
            this._onActivePanelChanged(contentItem);
          }));
        }));
        this.layout.init();
      }));
      return def;
    },

    _createMobileLayout: function() {
      var def = new Deferred();
      if (this.modifyLayoutBtn) {
        $(this.modifyLayoutBtn).addClass('hidden');
      }
      if (!this.mobilePanel) {
        if (this.layout) {
          this._isDestroying = true;
          this._detachWidgets(this.layout.root.contentItems[0]);
          this._isDestroying = false;
        }
        var box = domGeometry.getMarginBox(window.jimuConfig.layoutId), mobileLayout;
        if (box.w > box.h) {
          mobileLayout = LANDSCAPE_MODE;
        } else {
          mobileLayout = PORTRAIT_MODE;
        }
        this._loadMobilePanel(this.layoutId, mobileLayout).then(lang.hitch(this, function() {
          if (this.layout) {
            this.layout.destroy();
            this.layout = null;
          }
          def.resolve();
        }));
      } else {
        this.mobilePanel.clearPanels();
        def.resolve();
      }
      return def;
    },

    _createEditingLayout: function() {
      if(!this.editContainer) {
        this.editContainer = domConstruct.create('div', {
          "class": 'jimu-edit-layout hidden'
        }, this.layoutId);
        this._createActionBar(this.editContainer);
        this.editLayoutDiv = domConstruct.create('div', {
          "class": 'layout-container'
        }, this.editContainer);
      }

      var oldLayout = this.editingLayout;
      var config = lang.clone(this.appConfig.layoutDefinition.layout.config);
      config.settings.enableHeaderDropping = false;
      config.settings.reorderEnabled = false;
      config.dimensions = {
        borderWidth: 5,
        dragProxyWidth: 0,
        dragProxyHeight: 0
      };
      this._setupWidgets(config.content[0], true);
      require(['libs/goldenlayout/goldenlayout'], lang.hitch(this, function(GodenLayout){
        this.editingLayout = new GodenLayout(config, this.editLayoutDiv);
        this.editingLayout.registerComponent( 'widget panel', lang.hitch(this, function( container){
          container.getElement().html('');
        }));
        this.editingLayout.registerComponent( 'map', lang.hitch(this, function( container ){
          container.getElement().html( '<div class="maptip">' + this.nls.mapArea + '</div>' );
          if (oldLayout) {
            oldLayout.destroy();
          }
        }));
        this._bindLayoutEvents();
        this.editingLayout.init();
      }));
    },

    _destroyLayout: function() {
      $('#' + this.mapId).appendTo('#' + this.layoutId);
      if(this.layout) {
        this.layout.destroy();
        this.layout = null;
        domConstruct.destroy(this.layoutContainer);
        this.layoutContainer = null;
        if (this.modifyLayoutBtn) {
          domConstruct.destroy(this.modifyLayoutBtn);
          this.modifyLayoutBtn = null;
        }
      }
      if (this.editingLayout) {
        this._destroyActionBar();
        this.editingLayout.destroy();
        this.editingLayout = null;
        domConstruct.destroy(this.editContainer);
        this.editContainer = null;
      }
    },

    /**
     * before map destroy
     * before theme change
     */
    destroyOnScreenWidgetsAndGroups: function(){
      this._destroyOnScreenWidgets();
      // Destroy dashboard group widgets
      this._destroyOnScreenGroups();
    },

    onActionTriggered: function(info){
      if(window.appInfo.isRunInMobile) { // do not hanble action in mobile layout
        return;
      }

      if (info.action === 'editLayout') {
        this._enableEditing();
      } else if(info.action === 'highLight'){
        var goldenItem = this._findContentItemById(info.elementId);
        if (goldenItem) {
          if (goldenItem.isStack) {
            $(goldenItem.element).addClass('highlight');
          } else if(goldenItem.isComponent) {
            $(goldenItem.tab.element).addClass('highlight');
          }
          return;
        }
        array.forEach(this.widgetPlaceholders, function(placehoder){
          if(placehoder.configId === info.elementId){
            this._highLight(placehoder);
          }
        }, this);
        array.forEach(this.onScreenWidgetIcons, function(widgetIcon){
          if (widgetIcon.configId === info.elementId){
            this._highLight(widgetIcon);
          }
        }, this);
        array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(panelessWidget){
          if (panelessWidget.configId === info.elementId){
            this._highLight(panelessWidget);
          }
        }, this);
      } else if(info.action === 'removeHighLight'){
        this._removeHighLight(info.elementId);
      } else if(info.action === 'showLoading'){
        html.setStyle(jimuConfig.loadingId, 'display', 'block');
        html.setStyle(jimuConfig.mainPageId, 'display', 'none');
      } else if(info.action === 'showApp'){
        html.setStyle(jimuConfig.loadingId, 'display', 'none');
        html.setStyle(jimuConfig.mainPageId, 'display', 'block');
      }
    },

    /**
     * Find item from the layout.
     * type parameter is optional. Its value can be 'stack' or 'component'
     */
    _findContentItemById: function(id, type) {
      var rootElem = this.layout.root.contentItems[0];
      var result = rootElem.getItemsById(id);
      if (result && result.length > 0 &&
        (!type || type === result[0].type)) {
        return result[0];
      }
      return null;
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

    _removeHighLight: function(elementId){
      if (/^dd_group_\d+$/.test(elementId)) { // dashboard group
        var stack = this._findContentItemById(elementId, LAYOUT_TYPE_STACK);
        if (stack) {
          $(stack.element).removeClass('highlight');
        }
      } else if(/^widgets_\w+_\d+$/.test(elementId)) { // a specific widget
        var component = this._findContentItemById(elementId, LAYOUT_TYPE_COMPONENT);
        if (component) {
          $(component.tab.element).removeClass('highlight');
        }
      }
      if (this.hlDiv){
        domConstruct.destroy(this.hlDiv);
        this.hlDiv = null;
      }
    },

    onEnter: function(appConfig, mapId){
      this.appConfig = appConfig;
      this.isEditing = false;
      this.createMapDiv(mapId);
      // create layout
      this._createLayout(false, false, true);
    },

    onLeave: function(){
      this._destroyLayout();
      this.map = null;
    },

    // Widget configuration changed.
    onWidgetChange: function(appConfig, widgetConfig){
      this.appConfig = appConfig;

      if (widgetConfig.uri === 'themes/DashboardTheme/widgets/Header/Widget') {
        if (widgetConfig.visible) {
          html.setStyle(this.layoutContainer, 'top', '80px');
        } else {
          this._removeHighLight(widgetConfig.id);
          html.setStyle(this.layoutContainer, 'top', 0);
        }
        this._resizeLayout();
      }

      widgetConfig = appConfig.getConfigElementById(widgetConfig.id);

      var panel = this.dashboardPanels[widgetConfig.id];
      if (panel) {
        panel.reloadWidget(widgetConfig);
        var rootElem = this.layout.root.contentItems[0];
        var result = rootElem.getItemsByType('component');
        if (result && result.length > 0) {
          result.forEach(function(component) {
            if(component.config.id === widgetConfig.id &&
              component.config.title !== widgetConfig.label) {
              component.config.title = widgetConfig.label;
              component.setTitle(widgetConfig.label);
            }
          });
        }
        return;
      }

      if (this.mobileController) {
        this.mobileController.destroy();
        this.mobileController = new MobileController({
          appConfig: this.appConfig,
          panelContainerNode: this.mobilePanel.widgetContainerNode
        });
        this.mobileController.placeAt(this.mapId);
      }

      this.onOnScreenWidgetChange(appConfig, widgetConfig);
    },

    /*
    * Group changes. One widget is dragged from a group to another.
    * Doesn't change the number of widgets.
    */
    onOnScreenGroupsChange: function(appConfig) {
      this.appConfig = appConfig;
      this._createLayout(true, false);
    },

    onGroupChange: function(appConfig, groupConfig){
      this.appConfig = appConfig;
      groupConfig = appConfig.getConfigElementById(groupConfig.id);

      if(groupConfig.isOnScreen){
        this._createLayout(true, false);
      }else{
        array.forEach(this.widgetManager.getControllerWidgets(), function(controllerWidget){
          if(controllerWidget.isControlled(groupConfig.id)){
            this.reloadControllerWidget(appConfig, controllerWidget.id);
          }
        }, this);

        array.forEach(this.panelManager.panels, function(panel){
          if(panel.config.id === groupConfig.id){
            panel.updateConfig(groupConfig);
          }
        }, this);
        // TODO if in mobile layout, group change will affect the MobileController
      }
    },

    _reArrangeWidgetsLayout: function(reloadOnScreenWidgets) {
      // destroy all onscreen widgets
      if (reloadOnScreenWidgets) {
        this._destroyOnScreenWidgets();
      }
      if(window.appInfo.isRunInMobile) {
        // recreate onscreen widgets according to mobile layout config
        if (reloadOnScreenWidgets) {
          this._loadMobileOnScreenWidgets();
        }
        this.mobilePanel.setPanels(this.dashboardWidgets, this.dashboardPanels);
      } else {
        if (reloadOnScreenWidgets) {
          this.loadOnScreenWidgets(this.appConfig);
        }
        this._reArrangeWidgetsInDesktopLayout();
      }
    },

    _reArrangeWidgetsInDesktopLayout: function() {
      var groups = this.appConfig.widgetOnScreen.groups;

      array.forEach(groups, lang.hitch(this, function(group){
        var groupConfig = this.appConfig.getConfigElementById(group.id);
        var stack = this._findContentItemById(groupConfig.id, LAYOUT_TYPE_STACK);
        if (stack ) {
          // Layout has been recreated. Each stack contains only one component.
          array.forEach(groupConfig.widgets, lang.hitch(this, function(widget, index) {
            var itemConfig = {
              id: widget.id,
              type: 'component',
              title: widget.label,
              componentName: 'widget panel',
              componentState: {
                widgetId: widget.id
              }
            };
            if (stack.contentItems.length > index) {
              var contentItem = stack.contentItems[index];
              // replace the first component
              contentItem.config.id = widget.id;
              contentItem.config.title = widget.label;
              contentItem.config.componentState = {
                widgetId: widget.id
              };
              contentItem.setTitle(widget.label);
              stack.setActiveContentItem(contentItem);
            } else {
              stack.addChild(itemConfig);
            }
          }));
        }
      }));
    },

    _loadMobileOnScreenWidgets: function() {
      // in panel widgets
      this.mobileController = new MobileController({
        appConfig: this.appConfig,
        panelContainerNode: this.mobilePanel.widgetContainerNode
      });
      this.mobileController.placeAt(this.mapId);

      // onscreen widgets not in placeholder
      array.forEach(this.appConfig.widgetOnScreen.widgets, function(widget) {
        if (widget.uri && widget.visible && !widget.closeable) {
          this.loadOnScreenWidget(widget, this.appConfig);
        }
      }, this);
    },

    _loadMobilePanel: function(container, mobileLayout) {
      var panelConfig = this.appConfig.layoutDefinition.mobileLayout.panel,
        def = new Deferred();
      require([panelConfig.uri], lang.hitch(this, function(Panel){
        var options = {
          layoutId: this.layoutId,
          mapId: this.mapId,
          mobileLayout: mobileLayout,
          config: {},
          layoutManager: this
        };

        this.mobilePanel = new Panel(options);
        this.own(on(this.mobilePanel, 'resized', lang.hitch(this, function(pos) {
          if (this.mobileController) {
            this.mobileController.setPanelPosition(pos);
          }
        })));
        domConstruct.place(this.mobilePanel.domNode, container);
        def.resolve();
      }));
      return def;
    },

    // return the widget contained in specified panel
    _loadDashboardWidget: function(widgetId) {
      var def = new Deferred(), panel = this.dashboardPanels[widgetId];
      if (panel && panel.domNode) {
        def.resolve(this.dashboardPanels[widgetId]);
        return def;
      }
      var groups = this.appConfig.widgetOnScreen.groups, widgetConfig;
      array.some(groups, lang.hitch(this, function(groupConfig) {
        return array.some(groupConfig.widgets, lang.hitch(this, function(widget) {
          if (widget.id === widgetId) {
            widgetConfig = widget;
            return true;
          }
        }));
      }));
      if (!widgetConfig) {
        def.resolve(null);
        return def;
      }
      var panelConfig = this.appConfig.layoutDefinition.layout.panel;
      require([panelConfig.uri], lang.hitch(this, function(Panel){
        var options = {
          config: widgetConfig,
          uri: panelConfig.uri,
          map: this.map,
          widgetManager: this.widgetManager,
          panelManager: this.panelManager,
          id: widgetId + '_panel',
          position: {}
        }, panel;
        lang.mixin(options, widgetConfig.options);

        try{
          panel = new Panel(options);
          this.dashboardPanels[widgetId] = panel;
          def.resolve(panel);
          console.log('panel [' + options.id + '] created.');
        }catch(error){
          console.log('create panel error: ' + error + ', panelId: ' + options.id);
          def.reject(error);
          return;
        }
      }));
      return def;
    },

    onLayoutDefinitionChange: function(appConfig){
      this.appConfig = appConfig;
      this._createLayout(false, false);
    },

    onLayoutChange: function(appConfig){
      var isMobile = window.appInfo.isRunInMobile, reload = false;

      if(this.isEditing) { // Do not response layout change when editing layout
        return;
      }

      if (isMobile !== this._isLastLayoutMobile) {
        reload = true;
        this._isLastLayoutMobile = isMobile;
      }
      this.appConfig = appConfig;
      // group and widgets not changed. But if switch between mobile and desktop layout,
      // we should recreate onscreen widget.
      this._createLayout(false, reload).then(lang.hitch(this, function() {
        //relayout placehoder
        array.forEach(this.widgetPlaceholders, function(placeholder){
          placeholder.moveTo(appConfig.getConfigElementById(placeholder.configId).position);
        }, this);

        //relayout icons
        array.forEach(this.onScreenWidgetIcons, function(icon){
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
      }));
    },

    openWidget: function(widgetId){
      var contentItem, parent;
      contentItem = this._findContentItemById(widgetId, LAYOUT_TYPE_COMPONENT);
      if(contentItem) {
        parent = contentItem.parent;
        if (parent && parent.isStack) {
          parent.setActiveContentItem(contentItem);
        }
      }
    },

    _loadOnScreenGroups: function() {
      // Update widgets in golden layout, remove unused widgets
      var groups = this.appConfig.widgetOnScreen.groups;
      var widgetIds = [], def = new Deferred();

      array.forEach(groups, lang.hitch(this, function(group){
        var groupConfig = this.appConfig.getConfigElementById(group.id);
        array.forEach(groupConfig.widgets, function(widget) {
          widgetIds.push(widget.id);
        });
      }));
      array.forEach(this.dashboardWidgets, lang.hitch(this, function(widgetId) {
        if (widgetIds.indexOf(widgetId) < 0) { // not in current groups
          var panel = this.dashboardPanels[widgetId];
          if (panel) {
            this.panelManager.closePanel(panel);
            panel.destroy();
          }
          this.dashboardPanels[widgetId] = null;
        }
      }));
      this.dashboardWidgets = widgetIds;

      def.resolve();
      return def;
    },

    _destroyOnScreenWidgets: function() {
      this.destroyOnScreenOffPanelWidgets();
      this.destroyWidgetPlaceholders();
      this.destroyOnScreenWidgetIcons();
      if (this.mobileController) {
        this.mobileController.destroy();
        this.mobileController = null;
      }
    },

    _destroyOnScreenGroups: function() {
      array.forEach(this.dashboardWidgets, lang.hitch(this, function(widgetId){
        var panel = this.dashboardPanels[widgetId];
        if (panel) {
          this.panelManager.closePanel(panel);
          panel.destroy();
          panel = null;
        }
      }));
      this.panelManager.destroyAllPanels();
      this.dashboardWidgets = [];
      this.dashboardPanels = {};
      if (this.mobilePanel) {
        this.mobilePanel.clearPanels();
      }
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
