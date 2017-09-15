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
  "dojo/dom-class",
  'dojo/on',
  "dojo/query",
  "dojo/dom-style",
  'jimu/BaseWidget',
  "dojo/throttle",
  "dojo/_base/fx",
  "dijit/focus",
  'dojo/topic',
  "dojo/_base/window",
  'jimu/PanelManager',
  'jimu/utils'
], function(declare, lang, domClass, on, query, domStyle, BaseWidget, throttle,
            baseFx, focus, topic, win, PanelManager, jimuUtils) {
  var clazz = declare([BaseWidget], {
    name: 'FullScreen',
    baseClass: 'jimu-widget-fullScreen',
    domsCache: {
      map: null,
      doc: null
    },
    ACTION: {
      HIDE: "hide",
      SHOW: "show"
    },
    MODE: {
      RESTORE: "restore",
      MAXIMIZE: "maximize"
    },
    status: {
      lastState: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      _mouseX: -1,
      _mouseY: -1
    },
    _timer: null,
    _waitMouseStopTime: 2000,
    _animationList: [],
    _animFadeTime: 500,

    _changeColorThemes: ["BillboardTheme", "BoxTheme", "DartTheme", "PlateauTheme"],

    startup: function () {
      this.domsCache = {
        doc: this._getDocument(),
        body: win.body(),
        map: this._getFullscreenElementByTheme()
      };
      this.status.state = this.MODE.RESTORE;
      //init btn style
      domClass.add(this.fullScreenBtn, this.status.state);

      //need change color in those Themes
      var themeName = this.appConfig.theme.name;
      if (this._changeColorThemes.indexOf(themeName) > -1) {
        domClass.add(this.domNode, "jimu-main-background");
      }

      //click btn fullscreened, and then press F11 restore. At that time must handle event manually.
      this.own(on(this.domsCache.doc, 'webkitfullscreenchange,mozfullscreenchange,MSFullscreenChange,fullscreenchange',
        lang.hitch(this, '_onFullScreenChangeEvent')));
      this.own(on(this.domsCache.map, "mousemove", throttle(lang.hitch(this, this._setTimerByMouseMove), 100)));
      this.own(topic.subscribe('changeMapPosition', lang.hitch(this, this._changeMapPositionHandler)));
    },

    setPosition: function(position){
      this.inherited(arguments);
      var appConfig = window.getAppConfig();
      if (appConfig.theme.name === "DashboardTheme" && !window.appInfo.isRunInMobile) {
        domStyle.set(this.domNode, 'z-index', 110);
        this.placeAt(this._getDBThemeContainer());
      }
    },

    onAppConfigChanged: function (appConfig) {
      //need change color in those Themes
      var themeName = appConfig.theme.name;
      if (this._changeColorThemes.indexOf(themeName) > -1) {
        domClass.add(this.domNode, "jimu-main-background");
      } else {
        domClass.remove(this.domNode, "jimu-main-background");
      }
    },

    _onFullScreenClick: function() {
      this._toggleFullScreen();
    },
    // will be triggered after manual execute *requestFullScreen(), ONLY
    _onFullScreenChangeEvent: function() {
      if (false === this._isFullScreen(this.domsCache.doc)) {
        this.status.state = this.MODE.RESTORE;
        this._toggleFullScreen(this.status.state);
        this._restoreDisplayAllItems();
      } else {
        this.status.state = this.MODE.MAXIMIZE;
      }
      this._toggleBtnIcon();
    },

    // hide widgets , when long time no move
    _setTimerByMouseMove: function(evt) {
      if (!this._isMouseMoved(evt)) {
        return;
      }

      if (this._timer) {
        this._toggleItems(this.ACTION.SHOW);
        window.clearTimeout(this._timer);
        this._timer = null;
      }
      if (this.status.state === this.MODE.MAXIMIZE) {
        this._restoreDisplayAllItems();
        var that = this;
        this._timer = window.setTimeout(function() {
          that._toggleItems(that.ACTION.HIDE, null);
        }, this._waitMouseStopTime);
      }
    },

    //always need the document of topWindow( jimu.tokenUtilis.InConfigOrPreviewWindow()+isInBuilderWindow())
    _getDocument: function() {
      var isBuilder = jimuUtils.isInConfigOrPreviewWindow();
      if (isBuilder) {
        return window.top.document;
      } else {
        return window.document;
      }
    },
    //DashboardTheme Fullscreen all tab card
    _getFullscreenElementByTheme: function () {
      var appConfig = window.getAppConfig();
      if (appConfig && appConfig.theme.name === "DashboardTheme") {
        return this._getDBThemeContainer();
      } else {
        return this.map.container;
      }
    },

    _getDBThemeContainer: function(){
      var layoutContainer = null;
      if (window.appInfo.isRunInMobile) {
        layoutContainer = query("#main-page .DashboardTheme")[0];
      } else {
        layoutContainer = query(".jimu-dnd-layout")[0];
      }

      return layoutContainer;
    },

    //fix internal toggle , when mousePointer stop on icons
    _isMouseMoved: function(evt) {
      if (evt && evt.pageX && evt.pageY) {
        if (this.status._mouseX === evt.pageX && this.status._mouseY === evt.pageY) {
          return false;
        } else {
          this.status._mouseX = evt.pageX;
          this.status._mouseY = evt.pageY;
          return true;
        }
      }
    },
    // when a input is in typing , don't hide any widget
    _isAnyInputOnFocus: function(action) {
      if (action === this.ACTION.HIDE) {
        var allInputs = query("input");
        for (var i = 0, len = allInputs.length; i < len; i++) {
          if (focus.curNode === allInputs[i]) {
            return true;
          }
        }
      }
      return false;
    },
    // PanelManager change the position val and then publish "changeMapPosition" event.
    // so subscribe it & set all the val to 0
    _changeMapPositionHandler: function(pos) {
      if (pos && (0 !== pos.left || 0 !== pos.top) &&
        this.status.state === this.MODE.MAXIMIZE) {
        domStyle.set(this.domsCache.map, "top", "0px");
        domStyle.set(this.domsCache.map, "right", "0px");
        domStyle.set(this.domsCache.map, "bottom", "0px");
        domStyle.set(this.domsCache.map, "left", "0px");
      }
    },


    //top/right/bottom/left of map
    _toggleMapPosition: function(mode) {
      if (this._isFullScreen(this.domsCache.doc) || mode === this.MODE.RESTORE) {
        domStyle.set(this.domsCache.map, "top", this.status.lastState.top);
        domStyle.set(this.domsCache.map, "right", this.status.lastState.right);
        domStyle.set(this.domsCache.map, "bottom", this.status.lastState.bottom);
        domStyle.set(this.domsCache.map, "left", this.status.lastState.left);
      } else {
        this._getPositionEndWithPx("top");
        this._getPositionEndWithPx("right");
        this._getPositionEndWithPx("bottom");
        this._getPositionEndWithPx("left");
        domStyle.set(this.domsCache.map, "top", "0px");
        domStyle.set(this.domsCache.map, "right", "0px");
        domStyle.set(this.domsCache.map, "bottom", "0px");
        domStyle.set(this.domsCache.map, "left", "0px");
      }
    },
    //position = num + "px"
    _getPositionEndWithPx: function(pos) {
      if (pos) {
        var val = domStyle.get(this.domsCache.map, pos);
        if (typeof val === "number" ||
          (typeof val === "string" && !val.endWith("px"))) {
          val = val + "px";
        }
        this.status.lastState[pos] = val;
      }
    },
    _toggleBtnIcon: function() {
      domClass.toggle(this.fullScreenBtn, "restore");
      domClass.toggle(this.fullScreenBtn, "maximize");

      domClass.toggle(this.domsCache.body,"body-fullscreened");//css flag for dijitPopup
    },
    _toggleFullScreen: function(mode) {
      this._toggleMapPosition(mode);
      if (this._isFullScreen(this.domsCache.doc) || mode === this.MODE.RESTORE) {
        if (this._timer) {
          window.clearTimeout(this._timer);
          this._timer = null;
        }
        this._toggleItems(this.ACTION.SHOW, null);
        this._cancelFullScreen(this.domsCache.doc);
      } else {
        this._launchFullScreen(this.domsCache.map);
      }
    },

    _toggleItems: function(action, isForceShow, isImmediately) {
      if (true === this._isAnyInputOnFocus(action) && !isForceShow) {
        return;
      }
      this._interruptAndCleanAnimationList();

      this._toggleWidgetsAndPanels(action, isImmediately);
      //toggle placeholders
      this._toggleItemsByMode(query(".jimu-widget-placeholder"), action, isImmediately);
      this._toggleItemsByMode(query(".jimu-widget-onscreen-icon"), action, isImmediately);
    },
    _toggleItemsByMode: function(items, action, isImmediately) {
      for (var i = 0, lenI = items.length; i < lenI; i++) {
        var item = items[i];
        if (action === this.ACTION.SHOW) {
          this._fadeInItem(item, isImmediately);
        } else {
          this._fadeOutItem(item, isImmediately);
        }
      }
    },
    _toggleWidgetsAndPanels: function(action, isImmediately) {
      var appConfig = window.getAppConfig();
      var widgets, panels;
      if (appConfig && appConfig.theme.name === "DashboardTheme") {
        widgets = this.widgetManager.getOffPanelWidgets().filter(function(w) {
          return w.state !== 'closed';
        });
        panels = [];
      }else{
        widgets = this.widgetManager.getOffPanelWidgets().filter(function(w) {
          return w.state !== 'closed';
        });
        panels = PanelManager.getInstance().panels.filter(function(p) {
          return p.state !== 'closed';
        });
      }

      var items = [].concat(widgets, panels);
      if (action === this.ACTION.SHOW) {
        items.forEach((function(item) {
          this._fadeInItem(item.domNode, isImmediately);
        }).bind(this));
      } else {
        items.forEach((function(item) {
          this._fadeOutItem(item.domNode, isImmediately);
        }).bind(this));
      }
    },

    //Animations
    _fadeOutItem: function(item, isImmediately) {
      var durarionTime = isImmediately ? 1 : this._animFadeTime;
      var fadeOut = baseFx.fadeOut({node: item, duration: durarionTime, end: 0}).play(0, true);
      this.own(on(fadeOut, "End", lang.hitch(this, function() {
        domStyle.set(item, "display", "none");
        domStyle.set(item, "opacity", "");
      }), true));
      this._addToAnimationList(fadeOut);
    },
    _fadeInItem: function(item, isImmediately) {
      var durarionTime = isImmediately ? 1 : this._animFadeTime;
      domStyle.set(item, "display", "block");
      var fadeIn = baseFx.fadeIn({node: item, duration: durarionTime, end: 0.8}).play(0, true);
      this.own(on(fadeIn, "End", lang.hitch(this, function() {
        domStyle.set(item, "opacity", "");
      }), true));
      this._addToAnimationList(fadeIn);
    },
    _addToAnimationList: function(anim) {
      this._animationList.push(anim);
    },
    _interruptAndCleanAnimationList: function() {
      for (var i = 0, len = this._animationList.length; i < len; i++) {
        var one = this._animationList[i];
        one.stop(true);//stop
      }
      this._animationList.length = 0;//clean
      this._animationList = [];
    },
    _restoreDisplayAllItems: function() {
      this._interruptAndCleanAnimationList();
      this._toggleItems(this.ACTION.SHOW, true, true);
    },


    //fullscreen element is in the window.top.doc
    _isFullScreen: function(element) {
      return !(!element.fullscreenElement &&
        !element.mozFullScreenElement &&
        !element.webkitFullscreenElement &&
        !element.msFullscreenElement);
    },
    //in iframe , allowfullscreen="true" is necessary
    _launchFullScreen: function(element) {
      if (element.requestFullScreen) {
        element.requestFullScreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else {
        return false;
      }
    },
    _cancelFullScreen: function(element) {
      if (element.exitFullscreen) {
        element.exitFullscreen();
      } else if (element.mozCancelFullScreen) {
        element.mozCancelFullScreen();
      } else if (element.webkitCancelFullScreen) {
        element.webkitCancelFullScreen();
      } else if (element.msExitFullscreen) {
        element.msExitFullscreen();
      } else {
        return false;
      }
    }
  });

  return clazz;
});
