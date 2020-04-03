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

define([
    'dojo/_base/declare',
    'jimu/BaseWidgetSetting',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/query',
    'jimu/dijit/CheckBox',
    'jimu/dijit/RadioBtn'
  ],
  function(
    declare,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin,
    registry,
    lang,
    on,
    query,
    CheckBox) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      baseClass: 'jimu-widget-overviewmap-setting',

      _selectedAttachTo: "",

      postCreate: function() {
        this.expandBox = new CheckBox({
          label: this.nls.expandText,
          checked: false
        }, this.expandBox);
        this.expandBox.startup();

        this.own(on(this.topLeftNode, 'click', lang.hitch(this, function() {
          this._selectItem('top-left');
        })));
        this.own(on(this.topRightNode, 'click', lang.hitch(this, function() {
          this._selectItem('top-right');
        })));
        this.own(on(this.bottomLeftNode, 'click', lang.hitch(this, function() {
          this._selectItem('bottom-left');
        })));
        this.own(on(this.bottomRightNode, 'click', lang.hitch(this, function() {
          this._selectItem('bottom-right');
        })));
      },

      startup: function() {
        this.inherited(arguments);
        if (!this.config.overviewMap) {
          this.config.overviewMap = {};
        }
        this.setConfig(this.config);
      },

      setConfig: function(config) {
        this.config = config;
        this.expandBox.setValue(config.overviewMap.visible);
        if (this.config.overviewMap.attachTo) {
          this._selectItem(this.config.overviewMap.attachTo);
        } else {
          var _attachTo = "";
          if (this.position) {
            if (this.position.top !== undefined && this.position.left !== undefined) {
              _attachTo = !window.isRTL ? "top-left" : "top-right";
            } else if (this.position.top !== undefined && this.position.right !== undefined) {
              _attachTo = !window.isRTL ? "top-right" : "top-left";
            } else if (this.position.bottom !== undefined && this.position.left !== undefined) {
              _attachTo = !window.isRTL ? "bottom-left" : "bottom-right";
            } else if (this.position.bottom !== undefined && this.position.right !== undefined) {
              _attachTo = !window.isRTL ? "bottom-right" : "bottom-left";
            }
          } else {
            _attachTo = !window.isRTL ? "top-right" : "top-left";
          }
          this._selectItem(_attachTo);
        }
      },

      _selectItem: function(attachTo) {
        var _selectedNode = null;
        if (attachTo === 'top-left') {
          _selectedNode = this.topLeftNode;
        } else if (attachTo === 'top-right') {
          _selectedNode = this.topRightNode;
        } else if (attachTo === 'bottom-left') {
          _selectedNode = this.bottomLeftNode;
        } else if (attachTo === 'bottom-right') {
          _selectedNode = this.bottomRightNode;
        }
        var _radio = registry.byNode(query('.jimu-radio', _selectedNode)[0]);
        _radio.check(true);

        this._selectedAttachTo = attachTo;
      },

      _getSelectedAttachTo: function() {
        return this._selectedAttachTo;
      },

      getConfig: function() {
        this.config.overviewMap.visible = this.expandBox.checked;
        this.config.overviewMap.attachTo = this._getSelectedAttachTo();
        var _hasMaximizeButton = 'maximizeButton' in this.config.overviewMap;
        this.config.overviewMap.maximizeButton = _hasMaximizeButton ?
          this.config.overviewMap.maximizeButton : true;
        return this.config;
      }
    });
  });