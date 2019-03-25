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
  'dojo/_base/fx',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/on',
  'dojo/topic',
  'dojo/when',
  'require',
  './utils',
  './WidgetManager'],
function (declare, lang, array, html, baseFx, Deferred, all, on, topic, when,
  require, utils, WidgetManager) {
  var clazz, instance = null;

  clazz = declare(null, {
    constructor: function(){
      //{id, uri, object}
      this.panels = [];
      this.widgetManager = WidgetManager.getInstance();
      on(window, 'resize', lang.hitch(this, this.onWindowResize));

      this.activePanel = null;

      //because for moveable panel, we can't listen mousedown event of the mover,
      //and because panel may re-create moveable so we also can't listen moveable's event,
      //so, we list this topic event.
      topic.subscribe('/dnd/move/start', lang.hitch(this, this._onMoveStart));

      topic.subscribe('widgetActived', lang.hitch(this, this._onWidgetActived));
    },

    showPanel: function(config){
      var def = new Deferred();

      var pid = config.id + '_panel',  panel = this.getPanelById(pid);
      if(panel){
        if(panel.state === 'closed'){
          this.openPanel(panel);
        }
        def.resolve(panel);
      }else{
        all({
          Panel: this._loadPanelClass(config.panel.uri),
          nls: this._loadThemeI18N(config.panel.uri)
        }).then(lang.hitch(this, function(result){
          var pid = config.id + '_panel',  panel = this.getPanelById(pid);

          var options = {
            label: config.label,
            config: config,
            uri: config.panel.uri,
            position: config.panel.position,
            map: this.map,
            widgetManager: this.widgetManager,
            panelManager: this,
            id: pid,
            gid: config.gid,
            nls: result.nls
          };
          lang.mixin(options, config.panel.options);

          try{
            panel = new result.Panel(options);
            console.log('panel [' + pid + '] created.');
          }catch(error){
            console.log('create panel error: ' + error + ', panelId: ' + pid);
            def.reject(error);
            return;
          }

          panel.setPosition(config.panel.position);

          utils.setVerticalCenter(panel.domNode);
          this.openPanel(panel);

          // on(panel.domNode, 'click', lang.hitch(this, this._onPanelClick, panel));
          panel.domNode.addEventListener('click', lang.hitch(this, this._onPanelClick, panel), {capture: true});

          def.resolve(panel);
        }));
      }
      return def;
    },

    setMap: function(map){
      this.map = map;
      on(this.map, 'resize', lang.hitch(this, this.onMapResize));
    },

    closeOtherPanelsInTheSameGroup: function (panel){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return;
        }
      }

      for(var i = 0; i < this.panels.length; i++){
        if(this.panels[i].gid === panel.gid && this.panels[i].id !== panel.id){
          this.closePanel(this.panels[i]);
        }
      }
    },

    closeAllPanelsInGroup: function (groupId){
      for(var i = 0; i < this.panels.length; i++){
        if(this.panels[i].gid === groupId){
          this.closePanel(this.panels[i]);
        }
      }
    },

    openPanel: function(panel){
      var def = new Deferred();

      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          def.reject();
          return def;
        }
      }else{
        if(!this.panels.some(function(p){
          return p.id === panel.id;
        })){
          this.panels.push(panel);
        }
      }

      if(!panel.started){
        try {
          panel.started = true;
          panel.startup();
        } catch (err) {
          console.error('fail to startup panel ' + panel.id + '. ' + err.stack);
        }
      }

      if(panel.state === 'opened'){
        this._activePanel(panel);
        def.resolve(panel);
        return def;
      }

      //set state here to avoid openPanel is called twice
      panel.setState('opened');

      return this.playOpenPanelAnimation(panel).then(lang.hitch(this, function(){
        html.setStyle(panel.domNode, 'display', '');
        panel.onOpen();

        this._activePanel(panel);
        return panel;
      }));
    },

    closePanel: function(panel){
      var def = new Deferred();

      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          def.resolve();
          return def;
        }
      }

      if(panel.state === 'closed'){
        def.resolve();
        return def;
      }

      return this.playClosePanelAnimation(panel).then(lang.hitch(this, function(){
        if(this.activePanel && this.activePanel.id === panel.id){
          this.activePanel.onDeActive();
          this.activePanel = null;
        }
        panel.setState('closed');
        panel.onClose();
        if(panel.domNode){
          html.setStyle(panel.domNode, 'display', 'none');
        }
      }));
    },

    minimizePanel: function(panel){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return;
        }
      }

      if(panel.state === 'closed'){
        this.openPanel(panel);
      }

      panel.setWindowState('minimized');

      try{
        panel.onMinimize();
      }catch(err){
        console.log(console.error('fail to minimize panel ' + panel.id + '. ' + err.stack));
      }
    },

    maximizePanel: function(panel){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return;
        }
      }

      if(panel.state === 'closed'){
        this.openPanel(panel);
      }

      panel.setWindowState('maximized');
      try{
        panel.onMaximize();
      }catch(err){
        console.log(console.error('fail to maximize panel ' + panel.id + '. ' + err.stack));
      }
    },

    normalizePanel: function(panel){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return;
        }
      }

      if(panel.state === 'closed'){
        this.openPanel(panel);
      }

      panel.setWindowState('normal');
      try{
        panel.onNormalize();
      }catch(err){
        console.log(console.error('fail to noralize panel ' + panel.id + '. ' + err.stack));
      }
    },

    changeWindowStateTo: function(panel, state){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return;
        }
      }

      if(state === 'normal'){
        this.normalizePanel(panel);
      }else if(state === 'minimized'){
        this.minimizePanel(panel);
      }else if(state === 'maximized'){
        this.maximizePanel(panel);
      }else{
        console.log('error state: ' + state);
      }
    },

    getPanelById: function(pid){
      for(var i = 0; i < this.panels.length; i++){
        if(this.panels[i].id === pid){
          return this.panels[i];
        }
      }
    },

    onWindowResize: function(){
      for(var i = 0; i < this.panels.length; i++){
        if(this.panels[i].state !== 'closed' &&
          this.panels[i].position.relativeTo !== 'map'){
          this.panels[i].resize();
        }
      }
    },

    onMapResize: function(){
      for(var i = 0; i < this.panels.length; i++){
        if(this.panels[i].state !== 'closed' &&
          this.panels[i].position.relativeTo === 'map'){
          this.panels[i].resize();
        }
      }
    },

    destroyPanel: function(panel){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return;
        }
      }

      if(!panel.domNode){
        return;
      }
      if(panel.state !== 'closed'){
        this.closePanel(panel);
      }
      this._removePanel(panel);
      try{
        panel.destroy();
      }catch(err){
        console.log(console.error('fail to destroy panel ' + panel.id + '. ' + err.stack));
      }
    },

    destroyAllPanels: function(){
      var allPanelIds = array.map(this.panels, function(panel){
        return panel.id;
      });
      array.forEach(allPanelIds, function (panelId) {
        this.destroyPanel(panelId);
      }, this);
      this.panels = [];
    },

    playOpenPanelAnimation: function(panel){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return when();
        }
      }

      if(!panel.openAnimation || panel.animationDuration === 0){
        return when();
      }

      var def = new Deferred();
      if(typeof panel.openAnimation === 'string'){
        if(panel.openAnimation === 'fadeIn'){
          html.setStyle(panel.domNode, {
            opacity: 0,
            display: ''
          });

          baseFx.fadeIn({
            node: panel.domNode,
            duration: panel.animationDuration,
            onEnd: function(){
              def.resolve();
            }
          }).play();
        }else{
          def.resolve();
        }
      }else{
        def.resolve();
      }
      return def;
    },

    playClosePanelAnimation: function(panel){
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return when();
        }
      }

      if(!panel.closeAnimation || panel.animationDuration === 0){
        return when();
      }

      var def = new Deferred();
      if(typeof panel.closeAnimation === 'string'){
        if(panel.closeAnimation === 'fadeOut'){
          baseFx.fadeOut({
            node: panel.domNode,
            duration: panel.animationDuration,
            onEnd: function(){
              def.resolve();
            }
          }).play();
        }else{
          def.resolve();
        }
      }
      return def;
    },

    getPositionOnMobile: function(panel){
      //the position is minimized as title, half widget/height, full screen
      if(typeof panel === 'string'){
        panel = this.getPanelById(panel);
        if(!panel){
          return {};
        }
      }

      var box = html.getMarginBox(window.jimuConfig.layoutId);
      var titleTop = box.h / 2;
      var borderRadius = '4px';

      if(!panel.titleHeight){
        panel.titleHeight = 35;
      }

      if(panel.windowState === 'maximized'){
        return {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          width: 'auto',
          height: 'auto',
          contentHeight: box.h - panel.titleHeight,
          borderRadiusStyle: {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          }
        };
      }else if(panel.windowState === 'minimized'){
        var minimizedPanels = this.panels.filter(function(p){
          return p.windowState === 'minimized' && p.state !== 'closed' && p.id !== panel.id;
        });

        var bottom = 0;
        if(minimizedPanels.some(function(p){
          return p._mobileBottom === 0;
        })){
          bottom = panel.titleHeight;
        }

        panel._mobileBottom = bottom;

        if(box.h > box.w){ //portrait, stay at bottom
          return {
            left: 0,
            right: 0,
            top: 'auto',
            bottom: bottom,
            width: 'auto',
            height: panel.titleHeight,
            contentHeight: 0,
            borderRadiusStyle: {
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }
          };
        }else{//landscape, stay at right, half width
          return {
            left: box.w - box.w / 2,
            right: 0,
            top: 'auto',
            bottom: bottom,
            width: box.w / 2,
            height: panel.titleHeight,
            contentHeight: box.h,
            borderRadiusStyle: window.isRTL?
              {//stay at left
                borderTopLeftRadius: 0,
                borderTopRightRadius: borderRadius,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: borderRadius
              }: {//stay at left
                borderTopLeftRadius: borderRadius,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: borderRadius,
                borderBottomRightRadius: 0
              }
          };
        }
      }else{//windowState=normal
        if(box.h > box.w){ //portrait, stay at bottom
          return {
            left: 0,
            right: 0,
            top: titleTop,
            bottom: 0,
            width: 'auto',
            height: 'auto',
            contentHeight: box.h - titleTop - panel.titleHeight,
            borderRadiusStyle: {
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }
          };
        }else{//landscape, stay at right, half width
          return {
            left: box.w - box.w / 2,
            right: 0,
            top: 0,
            bottom: 0,
            width: box.w / 2,
            height: 'auto',
            contentHeight: box.h - titleTop - panel.titleHeight,
            borderRadiusStyle: window.isRTL?
              {//stay at left
                borderTopLeftRadius: 0,
                borderTopRightRadius: borderRadius,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: borderRadius
              }: {//stay at left
                borderTopLeftRadius: borderRadius,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: borderRadius,
                borderBottomRightRadius: 0
              }
          };
        }
      }
    },

    _onPanelClick: function(panel){
      this._activePanel(panel);
    },

    activatePanel: function(panel){
      if(panel.state !== 'opened'){
        return;
      }

      this._activePanel(panel);
    },

    _activePanel: function(panel){
      if(this.activePanel){
        if(this.activePanel.id === panel.id){
          //zIndex may be reset by panel self
          if(this.activePanel.moveTopOnActive){
            html.setStyle(this.activePanel.domNode, 'zIndex', 101);
          }
          return;
        }
        if(this.activePanel.state === 'active'){
          this.activePanel.setState('opened');
          html.setStyle(this.activePanel.domNode, 'zIndex',
            typeof this.activePanel.position.zIndex !== 'undefined'?
              this.activePanel.position.zIndex: 'auto');
          this.activePanel.onDeActive();
        }
      }

      var aw = this.widgetManager.activeWidget;
      if(aw && aw.state === 'active' && aw.getPanel() !== panel){
        aw.setState('opened');
        if(aw.inPanel === false){
          html.setStyle(aw.domNode, 'zIndex',
          typeof aw.position.zIndex !== 'undefined'? aw.position.zIndex: 'auto');
        }
        aw.onDeActive();
        this.widgetManager.activeWidget = null;
      }

      this.activePanel = panel;
      if(this.activePanel.state === 'active'){
        return;
      }
      this.activePanel.setState('active');
      if(this.activePanel.moveTopOnActive){
        html.setStyle(this.activePanel.domNode, 'zIndex', 101);
      }
      this.activePanel.onActive();
    },

    _removePanel: function(panel){
      var index = this.panels.indexOf(panel);
      if(index > -1){
        this.panels.splice(index, 1);
      }

      if(this.activePanel && this.activePanel.id === panel.id){
        this.activePanel = null;
      }
    },

    _onMoveStart: function(mover){
      array.forEach(this.panels, function(panel){
        if(panel.domNode === mover.node){
          this._activePanel(panel);
        }
      }, this);
    },

    _onWidgetActived: function(widget){
      if(this.activePanel &&
        this.activePanel.state === 'active' &&
        widget.getPanel() !== this.activePanel){
        this.activePanel.setState('opened');
        html.setStyle(this.activePanel.domNode, 'zIndex',
            typeof this.activePanel.position.zIndex !== 'undefined'?
              this.activePanel.position.zIndex: 'auto');
        this.activePanel.onDeActive();
        this.activePanel = null;
      }
    },

    _loadPanelClass: function(panelUri){
      var def = new Deferred();
      require([panelUri], function(Panel){
        def.resolve(Panel);
      });
      return def;
    },

    _loadThemeI18N: function(panelUri){
      //panel will use theme's nls file
      var def = new Deferred();
      if(panelUri.startWith('themes')){
        var segs = panelUri.split('/');
        var nlsFile = segs[0] + '/' + segs[1] + '/nls/strings';
        require(['dojo/i18n!' + nlsFile], function(bundle) {
          def.resolve(bundle);
        });
      }else{
        //panel is not in theme
        def.resolve({});
      }

      return def;
    }

  });

  clazz.getInstance = function () {
    if(instance === null) {
      instance = new clazz();
      window._panelManager = instance;
    }
    return instance;
  };

  return clazz;
});
