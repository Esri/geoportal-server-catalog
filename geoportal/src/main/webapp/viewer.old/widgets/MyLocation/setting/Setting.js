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
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'jimu/dijit/Message',
    'dijit/form/NumberTextBox',
    'jimu/dijit/CheckBox'
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    Message) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      //these two properties is defined in the BaseWidget
      baseClass: 'jimu-widget-mylocation-setting',

      startup: function() {
        this.inherited(arguments);
        if (!this.config.locateButton) {
          this.config.locateButton = {};
        }
        if (!this.config.locateButton.geolocationOptions) {
          this.config.locateButton.geolocationOptions = {};
        }
        this.setConfig(this.config);
      },

      setConfig: function(config) {
        this.config = config;
        if (config.locateButton.geolocationOptions &&
          config.locateButton.geolocationOptions.timeout) {
          this.timeout.set('value', config.locateButton.geolocationOptions.timeout);
        }
        if (config.locateButton.highlightLocation ||
          typeof(config.locateButton.highlightLocation) === "undefined") {
          this.highlightLocation.setValue(true);
        } else {
          this.highlightLocation.setValue(false);
        }
        if (config.locateButton.useTracking ||
          typeof(config.locateButton.useTracking) === "undefined") {
          this.useTracking.setValue(true);
        } else {
          this.useTracking.setValue(false);
        }
        //set the scale to zoom , when location has been found
        if (config.locateButton.scale) {
          this.scale.set('value', config.locateButton.scale);
        }
      },

      getConfig: function() {
        //check inputs
        if (!this.isValid()) {
          new Message({
            message: this.nls.warning
          });
          return false;
        }
        this.config.locateButton.geolocationOptions.timeout = parseInt(this.timeout.value, 10);
        // if (!this.config.locateButton.highlightLocation) {
        this.config.locateButton.highlightLocation = this.highlightLocation.checked;
        // }
        this.config.locateButton.useTracking = this.useTracking.checked;

        this.config.locateButton.scale = parseFloat(this.scale.value);
        return this.config;
      },

      isValid: function () {
        if (!this.scale.isValid() || !this.timeout.isValid()) {
          return false;
        }

        return true;
      }
    });
  });