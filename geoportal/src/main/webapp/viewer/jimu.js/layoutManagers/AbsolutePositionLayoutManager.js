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
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/promise/all',
  'dojo/when',
  '../WidgetManager',
  '../PanelManager',
  '../utils',
  '../dijit/LoadingShelter',
  './BaseLayoutManager'
],

function(declare, lang, array, html, topic, domConstruct, domGeometry,
  all, when, WidgetManager, PanelManager, utils, LoadingShelter, BaseLayoutManager) {
  /* global jimuConfig:true */
  var instance = null, clazz;

  clazz = declare([BaseLayoutManager], {
    name: 'AbsolutePositionLayoutManager',

    constructor: function() {
      /*jshint unused: false*/
      this.widgetManager = WidgetManager.getInstance();
      this.panelManager = PanelManager.getInstance();

      topic.subscribe("changeMapPosition", lang.hitch(this, this.onChangeMapPosition));

      this.onScreenGroupPanels = [];
    },

    map: null,

    resize: function() {
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

    getMapDiv: function(){
      if(html.byId(this.mapId)){
        return html.byId(this.mapId);
      }else{
        return html.create('div', {
          id: this.mapId,
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

    loadAndLayout: function(appConfig){
      console.time('Load widgetOnScreen');
      this.setMapPosition(appConfig.map.position);

      var loading = new LoadingShelter(), defs = [];
      loading.placeAt(this.layoutId);
      loading.startup();
      //load widgets
      defs.push(this.loadOnScreenWidgets(appConfig));

      //load groups
      array.forEach(appConfig.widgetOnScreen.groups, function(groupConfig) {
        defs.push(this._loadOnScreenGroup(groupConfig, appConfig));
      }, this);

      all(defs).then(lang.hitch(this, function(){
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

    destroyOnScreenWidgetsAndGroups: function(){
      this.panelManager.destroyAllPanels();
      this.destroyOnScreenOffPanelWidgets();
      this.destroyWidgetPlaceholders();
      this.destroyOnScreenWidgetIcons();
    },

    ///seems this function is not used any more, leave it here for backward compatibility.
    openWidget: function(widgetId){
      //if widget is in group, we just ignore it

      //check on screen widgets, we don't check not-closeable off-panel widget
      array.forEach(this.onScreenWidgetIcons, function(widgetIcon){
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
    },

    /////////////functions to handle builder events
    onLayoutChange: function(appConfig){
      this._changeMapPosition(appConfig);

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

      //relayout groups
      array.forEach(this.onScreenGroupPanels, function(panel){
        var position = appConfig.getConfigElementById(panel.config.id).panel.position;
        panel.setPosition(position);
      }, this);
    },

    onWidgetChange: function(appConfig, widgetConfig){
      widgetConfig = appConfig.getConfigElementById(widgetConfig.id);

      this.onOnScreenWidgetChange(appConfig, widgetConfig);

      array.forEach(this.onScreenGroupPanels, function(panel){
        panel.reloadWidget(widgetConfig);
      }, this);

    },

    onGroupChange: function(appConfig, groupConfig){
      groupConfig = appConfig.getConfigElementById(groupConfig.id);

      if(groupConfig.isOnScreen){
        //for now, onscreen group can change widgets in it only
        this.panelManager.destroyPanel(groupConfig.id + '_panel');
        this.removeDestroyed(this.onScreenGroupPanels);
        this._loadOnScreenGroup(groupConfig, appConfig);
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
      }
    },

    onActionTriggered: function(info){
      if(info.action === 'highLight'){
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
        array.forEach(this.onScreenGroupPanels, function(panel){
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

    onChangeMapPosition: function(position) {
      var pos = lang.clone(this.mapPosition);
      lang.mixin(pos, position);
      this.setMapPosition(pos);
    },

    setMapPosition: function(position){
      this.mapPosition = position;

      var posStyle = utils.getPositionStyle(position);
      html.setStyle(this.mapId, posStyle);
      if (this.map && this.map.resize) {
        this.map.resize();
      }
    },

    getMapPosition: function(){
      return this.mapPosition;
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

    _changeMapPosition: function(appConfig){
      if(!this.map){
        return;
      }
      if(!utils.isEqual(this.getMapPosition(), appConfig.map.position)){
        this.setMapPosition(appConfig.map.position);
      }
    },

    _loadOnScreenGroup: function(groupJson, appConfig) {
      if(!appConfig.mode && (!groupJson.widgets || groupJson.widgets.length === 0)){
        return when(null);
      }
      return this.panelManager.showPanel(groupJson).then(lang.hitch(this, function(panel){
        panel.configId = groupJson.id;
        this.onScreenGroupPanels.push(panel);
        return panel;
      }));
    }
  });

  clazz.getInstance = function() {
    if (instance === null) {
      instance = new clazz();
      window._absolutLayoutManager = instance;
    }
    return instance;
  };
  return clazz;
});
