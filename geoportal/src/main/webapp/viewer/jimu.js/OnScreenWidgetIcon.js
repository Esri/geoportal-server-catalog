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
  'dojo/on',
  'dijit/_WidgetBase',
  './utils'
],
function(declare, lang, array, html, on, _WidgetBase, utils) {
  /* global jimuConfig */
  return declare(_WidgetBase, {
    'class': 'jimu-widget-onscreen-icon',

    postCreate: function(){
      this.inherited(arguments);
      this.iconNode = html.create('img', {
        src: this.widgetConfig.icon
      }, this.domNode);
      html.setAttr(this.domNode, 'title', this.widgetConfig.label);
      html.setAttr(this.domNode, 'data-widget-name', this.widgetConfig.name);
      this.own(on(this.domNode, 'click', lang.hitch(this, function(){
        this.onClick();
      })));

      this.position = lang.clone(this.widgetConfig.position);
      if (this.widgetConfig.position.relativeTo === 'map') {
        this.own(on(this.map, 'resize', lang.hitch(this, function() {
          var _pos = lang.clone(this.position);
          delete _pos.width;
          delete _pos.height;
          if (this.panel) {
            this.panel.setPosition(_pos);
          }
        })));
      }

      this.state = 'closed';
    },

    startup: function(){
      this.inherited(arguments);
    },

    onClick: function(){
      if(this.state === 'closed'){
        this.switchToOpen();
      }else{
        this.switchToClose();
      }
    },

    moveTo: function(position){
      var style = {
        left: 'auto',
        right: 'auto',
        bottom: 'auto',
        top: 'auto',
        width: 'auto',
        height: 'auto'
      };
      style = lang.mixin(style, utils.getPositionStyle(position));
      //we don't change width and height through layout
      delete style.width;
      delete style.height;
      html.setStyle(this.domNode, style);
      this.position = lang.clone(position);

      if (this.widgetConfig && this.widgetConfig.panel){
        this.widgetConfig.panel.position = lang.clone(position);
        this.widgetConfig.position = lang.clone(position);
      }
      if(this.panel){
        this.panel.setPosition(lang.clone(position));
      }
      if(this.widget){
        this.widget.setPosition(this.getOffPanelWidgetPosition(this.widget));
      }
    },

    destroy: function(){
      if(this.panel){
        this.panelManager.destroyPanel(this.panel);
      }else if(this.widget){
        this.widgetManager.destroyWidget(this.widget);
      }
      this.inherited(arguments);
    },

    switchToOpen: function(){
      this.state = 'opened';

      this.panelManager.closeAllPanelsInGroup(this.widgetConfig.gid);
      array.forEach(this.widgetManager.getOnScreenOffPanelWidgets(), function(widget){
        if(widget.closeable){
          this.widgetManager.closeWidget(widget);
        }
      }, this);

      html.addClass(this.domNode, 'jimu-state-selected');
      this._showLoading();
      if(this.widgetConfig.inPanel === false){
        this.widgetManager.loadWidget(this.widgetConfig)
        .then(lang.hitch(this, function(widget){
          this.widget = widget;
          widget.setPosition(this.getOffPanelWidgetPosition(widget));
          this.widgetManager.openWidget(widget);
          this.own(on(widget, 'close', lang.hitch(this, function(){
            this.switchToClose();
          })));

          this._hideLoading();
        }));
      }else{
        this.panelManager.showPanel(lang.clone(this.widgetConfig))
        .then(lang.hitch(this, function(panel){
          this.panel = panel;
          this.own(on(panel, 'close', lang.hitch(this, function(){
            this.switchToClose();
          })));

          this._hideLoading();
        }));
      }
    },

    switchToClose: function(){
      this.state = 'closed';
      html.removeClass(this.domNode, 'jimu-state-selected');
      if(this.widgetConfig.inPanel === false){
        this.widgetManager.closeWidget(this.widget);
      }else{
        this.panelManager.closePanel(this.panel);
      }
    },

    getOffPanelWidgetPosition: function(widget){
      var position = {
        relativeTo: widget.position.relativeTo
      };
      var pbox = html.getMarginBox(this.domNode);
      var sbox = this.widgetManager.getWidgetMarginBox(widget);
      var containerBox = html.getMarginBox(position.relativeTo === 'map'?
        this.map.id: jimuConfig.layoutId);

      var top = pbox.t + pbox.h + 1;//put under icon by default
      if(top + sbox.h > containerBox.h){
        position.bottom = containerBox.h - pbox.t + 1;
      }else{
        position.top = top;
      }

      if (window.isRTL) {
        if(pbox.l + pbox.w - sbox.w < 0){
          position.right = 0;
        }else{
          position.right = pbox.l + pbox.w - sbox.w;
        }
      } else {
        if(pbox.l + sbox.w > containerBox.w){
          position.right = 0;
        }else{
          position.left = pbox.l;
        }
      }
      return position;
    },

    _showLoading: function(){
      html.setAttr(this.iconNode, 'src', require.toUrl('jimu') + '/images/loading_circle.gif');
    },

    _hideLoading: function(){
      html.setAttr(this.iconNode, 'src', this.widgetConfig.icon);
    }
  });
});