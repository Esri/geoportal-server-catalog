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

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/html',
  'dijit/_WidgetBase',
  'dijit/_Container',
  './dijit/LoadingIndicator',
  './BaseWidgetFrame',
  './utils'],
function (declare, lang, array, html, _WidgetBase, _Container, LoadingIndicator,
    BaseWidgetFrame, utils) {
  return declare([_WidgetBase, _Container], {
    baseClass: 'jimu-panel jimu-container',
    started: false,
    state: 'closed',
    windowState: 'normal',

    moveTopOnActive: true,

    /**************
    *animations, can be:
    * string:
          For open animation: fadeIn, wipeIn ...
          For close animation: fadeOut, wipeOut ...
    * array: array of the above effects, will be played one by one
    * function: an animation function
    ***************/
    openAnimation: null,
    closeAnimation: null,

    // onPositionChangeAnimation: null,

    //
    animationDuration: 0,

    startup: function(){
      this.inherited(arguments);

      this.loadAllWidgetsInOrder();
      this.started = true;
    },

    loadAllWidgetsInOrder: function(){
      var configs = this.getAllWidgetConfigs();
      if(Array.isArray(this.config.widgets)){
        configs = this.config.widgets;
      }else{
        configs = [this.config];
      }
      array.forEach(configs, function(widgetConfig){
        var frame, loading;
        if(widgetConfig.visible === false){
          return;
        }
        loading = new LoadingIndicator();
        frame = this.createFrame(widgetConfig);
        this.addChild(frame);
        frame.setLoading(loading);

        this.widgetManager.loadWidget(widgetConfig).then(lang.hitch(this, function(widget){
          frame.setWidget(widget);
          widget.startup();
        }));
      }, this);
    },

    getAllWidgetConfigs: function(){
      var configs = [];
      if(Array.isArray(this.config.widgets)){
        configs = this.config.widgets;
      }else{
        configs = [this.config];
      }
      return configs;
    },

    getWidgetById: function(widgetId){
      var frames = this.getChildren();
      for(var i = 0; i < frames.length; i++){
        if(frames[i].getWidget() && frames[i].getWidget().id === widgetId){
          return frames[i].getWidget();
        }
      }
    },

    getWidgets: function(){
      return this.getChildren().map(function(f){
        return f.getWidget();
      });
    },

    createFrame: function(widgetSetting){
      /*jshint unused: false*/
      return new BaseWidgetFrame();
    },

    setPosition: function(position, containerNode){
      this.position = position;
      var style = utils.getPositionStyle(this.position);
      style.position = 'absolute';

      if(!containerNode){
        if(position.relativeTo === 'map'){
          containerNode = this.map.id;
        }else{
          containerNode = window.jimuConfig.layoutId;
        }
      }

      if(this.started){
        this.resize();
      }else{
        if(this.openAnimation){//hiden panel to play animation
          style.display = 'none';
        }
      }

      html.place(this.domNode, containerNode);
      html.setStyle(this.domNode, style);
    },

    getPosition: function(){
      return this.position;
    },

    setState: function(state){
      this.state = state;
      // console.log('Panel', this.id, 'state:', state);
    },

    setWindowState: function(state){
      this.windowState = state;
    },

    resize: function(){
      this.getChildren().forEach(function(frame){
        frame.resize();
      });
    },

    onPositionChange: function(position){
      this.setPosition(position);
    },

    onOpen: function(){
      array.forEach(this.getChildren(), function(frame){
        if(frame.getWidget()){
          this.widgetManager.openWidget(frame.getWidget());
        }
      }, this);
    },

    onClose: function(){
      array.forEach(this.getChildren(), function(frame){
        if(frame.getWidget()){
          this.widgetManager.closeWidget(frame.getWidget());
        }
      }, this);
    },

    onMaximize: function(){
      array.forEach(this.getChildren(), function(frame){
        if(frame.getWidget()){
          this.widgetManager.maximizeWidget(frame.getWidget());
        }
      }, this);
    },

    onMinimize: function(){
      array.forEach(this.getChildren(), function(frame){
        if(frame.getWidget()){
          this.widgetManager.minimizeWidget(frame.getWidget());
        }
      }, this);
    },

    onNormalize: function(){
      array.forEach(this.getChildren(), function(frame){
        if(frame.getWidget()){
          this.widgetManager.normalizeWidget(frame.getWidget());
        }
      }, this);
    },

    onActive: function(){
      // summary:
      //    this function will be called when panel is clicked.
    },

    onDeActive: function(){
      // summary:
      //    this function will be called when another panel is clicked.
    },

    //update the config without reload the widget
    updateConfig: function(_config){
      this._updateConfig(_config);
    },

    reloadWidget: function(widgetConfig){
      if(!this.isWidgetInPanel(widgetConfig)){
        return;
      }

      this._updateConfig(widgetConfig);

      this.getChildren().forEach(function(frame){
        if(frame.getWidget() && frame.getWidget().id === widgetConfig.id){
          frame.getWidget().destroy();
          frame.setLoading(new LoadingIndicator());
          this.widgetManager.loadWidget(widgetConfig).then(lang.hitch(this, function(widget){
            frame.setWidget(widget);
            widget.startup();
            if(this.state === 'closed'){
              this.widgetManager.closeWidget(widget);
            }
          }));
        }
      }, this);
    },

    isWidgetInPanel: function(widgetConfig){
      if(array.some(this.getAllWidgetConfigs(), function(wc){
        if(widgetConfig.id === wc.id){
          return true;
        }
      })){
        //the widget is in the panel
        return true;
      }else{
        return false;
      }
    },

    _updateConfig: function(widgetConfig) {
      if(Array.isArray(this.config.widgets)){
        var index = -1;
        for(var i = 0; i < this.config.widgets.length; i++){
          if(this.config.widgets[i].id === widgetConfig.id){
            index = i;
          }
        }
        if(index > 0){
          this.config.widgets[index] = widgetConfig;
        }
      }else{
        this.config = widgetConfig;
      }
    },

    destroy: function(){
      this.getChildren().forEach(function(frame){
        try{
          if(frame.domNode){
            frame.destroy();
          }
        }catch(error){
          console.error('destroy widget frame error.' + error.stack);
        }
      });
      this.inherited(arguments);
    }
  });
});