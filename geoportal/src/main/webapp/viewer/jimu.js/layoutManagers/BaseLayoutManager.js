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
  'dijit/_WidgetBase',
  'dojo/Deferred',
  'dojo/promise/all',
  '../utils',
  '../WidgetPlaceholder',
  '../OnScreenWidgetIcon'
],

function(declare, lang, array, html, _WidgetBase, Deferred, all, jimuUtils, WidgetPlaceholder, OnScreenWidgetIcon) {
  var instance = null, clazz;

  /*jshint unused:false */
  /* global jimuConfig:true */

  clazz = declare([_WidgetBase], {
    constructor: function() {
      this.widgetPlaceholders = [];
      this.onScreenWidgetIcons = [];
      this.invisibleWidgetIds = [];
    },

    name: 'BaseLayoutManager',
    mapId: 'map',
    map: null,
    layoutId: 'jimu-layout-manager',

    postCreate: function(){
      this.containerNode = this.domNode;
      this.layoutId = jimuConfig.layoutId;
    },

    resize: function() {
    },

    isSupportEdit: function(){
      return false;
    },

    getMapDiv: function(){
    },

    setMap: function(map){
      this.map = map;
    },

    onEnter: function(appConfig, mapId){
      this.appConfig = appConfig;
      this.mapId = mapId;
    },

    onLeave: function(){

    },

    onThemeLoad: function() {
    },

    /**
     * do load and layout job in this function, including onscreen widgets and map
     *
     * @param  {[type]} appConfig [description]
     * @return {[type]}           [description]
     */
    loadAndLayout: function(appConfig){

    },

    openWidget: function(widgetId){

    },

    /////////////functions to handle builder events
    onLayoutChange: function(appConfig){

    },

    onWidgetChange: function(appConfig, widgetJson){

    },

    onGroupChange: function(appConfig, groupJson){

    },

    onWidgetPoolChange: function(appConfig, changeData){
      this.reloadControllerWidget(appConfig, changeData.controllerId);
    },

    onActionTriggered: function(actionInfo){
    },

    onLayoutDefinitionChange: function(appConfig, layoutDefinition){

    },

    onOnScreenGroupsChange: function(appConfig, groups){

    },

    destroyOnScreenWidgetsAndGroups: function(appConfig){

    },

    /*
      Because, for now, onscreen widgets are managed by the same way by these 2 layout manager, so, put code here.
      when we have a layout that does not use the same way to manage onscreen widgets, we'll refactor the code
      These functions are used to called by sub class, not used to be inherited.
    */

    loadOnScreenWidgets: function(appConfig){
      var defs = [];
      array.forEach(appConfig.widgetOnScreen.widgets, function(widgetConfig) {
        if(widgetConfig.visible === false){
          this.invisibleWidgetIds.push(widgetConfig.id);
          return;
        }
        defs.push(this.loadOnScreenWidget(widgetConfig, appConfig));
      }, this);

      return all(defs);
    },

    loadOnScreenWidget: function(widgetConfig, appConfig){
      var def = new Deferred();

      if(appConfig.mode === 'config' && !widgetConfig.uri){
        var placeholder = this._createOnScreenWidgetPlaceHolder(widgetConfig);
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
        iconDijit = this._createOnScreenWidgetIcon(widgetConfig);
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

    onOnScreenWidgetChange: function(appConfig, widgetJson){
      widgetJson = appConfig.getConfigElementById(widgetJson.id);
      if(widgetJson.isController){
        this.reloadControllerWidget(appConfig, widgetJson.id);
        return;
      }
      array.forEach(this.widgetPlaceholders, function(placeholder){
        if(placeholder.configId === widgetJson.id){
          placeholder.destroy();
          this.loadOnScreenWidget(widgetJson, appConfig);
        }
      }, this);
      this.removeDestroyed(this.widgetPlaceholders);
      this._updatePlaceholder(appConfig);

      array.forEach(this.onScreenWidgetIcons, function(icon){
        if(icon.configId === widgetJson.id){
          var state = icon.state;
          icon.destroy();
          this.loadOnScreenWidget(widgetJson, appConfig).then(function(iconNew){
            if(widgetJson.uri && state === 'opened'){
              iconNew.onClick();
            }
          });
        }
      }, this);
      this.removeDestroyed(this.onScreenWidgetIcons);

      array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(widget){
        if(widget.configId === widgetJson.id){
          widget.destroy();
          if(widgetJson.visible === false){
            if(this.invisibleWidgetIds.indexOf(widgetJson.id) < 0){
              this.invisibleWidgetIds.push(widgetJson.id);
            }
            return;
          }
          this.loadOnScreenWidget(widgetJson, appConfig);
        }
      }, this);

      //if widget change visible from invisible, it's not exist in onscreen offpanel Widgets
      //so, load it here
      array.forEach(this.invisibleWidgetIds, function(widgetId){
        if(widgetId === widgetJson.id && widgetJson.visible !== false){
          this.loadOnScreenWidget(widgetJson, appConfig);
          var i = this.invisibleWidgetIds.indexOf(widgetJson.id);
          this.invisibleWidgetIds.splice(i, 1);
        }
      }, this);

      if(!widgetJson.isOnScreen){
        array.forEach(this.widgetManager.getControllerWidgets(), function(controllerWidget){
          if(controllerWidget.widgetIsControlled(widgetJson.id)){
            this.reloadControllerWidget(appConfig, controllerWidget.id);
          }
        }, this);
      }
    },

    destroyOnScreenWidgetIcons: function(){
      array.forEach(this.onScreenWidgetIcons, function(icon){
        icon.destroy();
      }, this);
      this.onScreenWidgetIcons = [];
    },

    destroyOnScreenOffPanelWidgets: function(){
      array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(widget){
        this.widgetManager.destroyWidget(widget);
      }, this);
    },

    destroyWidgetPlaceholders: function(){
      array.forEach(this.widgetPlaceholders, function(placeholder){
        placeholder.destroy();
      }, this);
      this.widgetPlaceholders = [];
    },

    removeDestroyed: function(_array){
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

    _createOnScreenWidgetPlaceHolder: function(widgetConfig){
      var pid;
      if(widgetConfig.position.relativeTo === 'map'){
        pid = this.mapId;
      }else{
        pid = this.layoutId;
      }
      var cfg = lang.clone(widgetConfig);

      cfg.position.width = 40;
      cfg.position.height = 40;
      var style = jimuUtils.getPositionStyle(cfg.position);
      var phDijit = new WidgetPlaceholder({
        index: cfg.placeholderIndex,
        configId: widgetConfig.id
      });
      html.setStyle(phDijit.domNode, style);
      html.place(phDijit.domNode, pid);
      this.widgetPlaceholders.push(phDijit);
      return phDijit;
    },

    _createOnScreenWidgetIcon: function(widgetConfig){
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
        html.place(iconDijit.domNode, this.layoutId);
      }
      //icon position doesn't use width/height in config
      html.setStyle(iconDijit.domNode, jimuUtils.getPositionStyle({
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

      this.onScreenWidgetIcons.push(iconDijit);
      return iconDijit;
    },

    reloadControllerWidget: function(appConfig, controllerId){
      var controllerWidget = this.widgetManager.getWidgetById(controllerId);
      if(!controllerWidget){
        this._loadControllerWidget(appConfig, controllerId);
        return;
      }

      //get old info
      var openedIds = controllerWidget.getOpenedIds();
      var windowState = controllerWidget.windowState;

      this._destroyControllerWidget(controllerWidget);
      this._loadControllerWidget(appConfig, controllerId, openedIds, windowState);
    },

    _destroyControllerWidget: function(controllerWidget){
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
    },

    _loadControllerWidget: function(appConfig, controllerId, openedIds, windowState){
      //load widget
      var newControllerJson = appConfig.getConfigElementById(controllerId);
      if(newControllerJson.visible === false){
        return;
      }
      this.loadOnScreenWidget(newControllerJson, appConfig).then(lang.hitch(this, function(widget){
        if(windowState){
          this.widgetManager.changeWindowStateTo(widget, windowState);
        }
        if(openedIds){
          widget.setOpenedIds(openedIds);
        }
      }));
    },

    _updatePlaceholder: function (appConfig) {
      array.forEach(this.widgetPlaceholders, function(placehoder){
        placehoder.setIndex(appConfig.getConfigElementById(placehoder.configId).placeholderIndex);
      }, this);
    }

  });

  clazz.getInstance = function() {
    if (instance === null) {
      instance = new clazz();
    }
    return instance;
  };
  return clazz;
});
