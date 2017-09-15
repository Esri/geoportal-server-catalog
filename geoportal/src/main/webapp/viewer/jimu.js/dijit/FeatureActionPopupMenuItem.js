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
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/_base/event',
  'dojo/on',
  'dojo/mouse',
  'dojo/Evented',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin'
], function(declare, html, lang, Event, on, Mouse, Evented, _WidgetBase, _TemplatedMixin) {
  return declare([_WidgetBase, _TemplatedMixin, Evented], {
    baseClass: 'popup-menu-item',
    templateString: '<div>' +
      '<div class="icon jimu-float-leading">' +
      '<div class="feature-action" data-dojo-attach-point="iconNode"></div>' +
      '</div>' +
      '<div class="label" data-dojo-attach-point="labelNode"></div>' +
      '</div>',

    /**
     * An instance of jimu/BaseFeatureAction
     * {
     *   label: string;
     *   iconClass: string;
     *   onExecute: (args) => Promise;
     *   data: object
     * }
     */
    action: null,

    postCreate: function() {
      this.inherited(arguments);

      if (this.action) {
        this.labelNode.innerHTML = this.action.label;

        if(this.action.iconClass) {
          html.addClass(this.iconNode, this.action.iconClass);
        } else {
          html.setStyle(this.iconNode, 'background-image', 'url(' + this.action.getIcon('default') + ')');
        }

        this.own(on(this.domNode, Mouse.enter, lang.hitch(this, this._useHoverIcon)));
        this.own(on(this.domNode, Mouse.leave, lang.hitch(this, this._useNormalIcon)));
      }

      this.own(on(this.domNode, 'click', lang.hitch(this, this._clickHandler)));
    },

    _useNormalIcon: function() {
      if(this.action.iconClass) {
        html.removeClass(this.iconNode, 'highlight');
      } else {
        html.setStyle(this.iconNode, 'background-image', 'url(' + this.action.getIcon('default') + ')');
      }
    },

    _useHoverIcon: function() {
      if(this.action.iconClass) {
        html.addClass(this.iconNode, 'highlight');
      } else {
        html.setStyle(this.iconNode, 'background-image', 'url(' + this.action.getIcon('hover') + ')');
      }
    },

    _clickHandler: function(event) {
      Event.stop(event);

      if (this.action) {
        var layer;
        if(this.action.data.features && this.action.data.features.length > 0){
          layer = this.action.data.features[0].getLayer();
        }
        this.action.onExecute(this.action.data, layer);
      }

      this.emit('click');
    }
  });
});