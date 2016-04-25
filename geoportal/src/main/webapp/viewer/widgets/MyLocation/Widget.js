///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
    'jimu/BaseWidget',
    "esri/dijit/LocateButton",
    'dojo/_base/html',
    'dojo/on',
    'dojo/_base/lang',
    'jimu/dijit/Message',
    'dojo/touch'
  ],
  function(
    declare,
    BaseWidget,
    LocateButton,
    html,
    on,
    lang) {
    var clazz = declare([BaseWidget], {

      name: 'MyLocation',
      baseClass: 'jimu-widget-mylocation',

      startup: function() {
        this.inherited(arguments);
        this.placehoder = html.create('div', {
          'class': 'place-holder'
        }, this.domNode);

        if (window.navigator.geolocation) {
          this.own(on(this.placehoder, 'click', lang.hitch(this, this.onLocationClick)));
        } else {
          html.setAttr(this.placehoder, 'title', this.nls.browserError);
        }
      },

      onLocationClick: function() {
        if (html.hasClass(this.domNode, "onCenter") ||
          html.hasClass(this.domNode, "locating")) {
          html.removeClass(this.domNode, "onCenter");
          html.removeClass(this.placehoder, "tracking");
          this._destroyGeoLocate();
        } else {
          this._createGeoLocate();
          this.geoLocate.locate();
          html.addClass(this.placehoder, "locating");
        }
      },

      onLocate: function(parameters) {
        html.removeClass(this.placehoder, "locating");
        if (this.geoLocate.useTracking) {
          html.addClass(this.placehoder, "tracking");
        }

        if (parameters.error) {
          console.error(parameters.error);
          // new Message({
          //   message: this.nls.failureFinding
          // });
        } else {
          html.addClass(this.domNode, "onCenter");
          this.neverLocate = false;
        }
      },

      _createGeoLocate: function() {
        var json = this.config.locateButton;
        json.map = this.map;
        // json.useTracking = true;
        json.centerAt = true;
        this.geoLocate = new LocateButton(json);
        this.geoLocate.startup();

        this.geoLocate.own(on(this.geoLocate, "locate", lang.hitch(this, this.onLocate)));
      },

      _destroyGeoLocate: function() {
        if (this.geoLocate) {
          this.geoLocate.clear();
          this.geoLocate.destroy();
        }

        this.geoLocate = null;
      },

      destroy: function() {
        this._destroyGeoLocate();
        this.inherited(arguments);
      }
    });
    clazz.inPanel = false;
    clazz.hasUIFile = false;
    return clazz;
  });