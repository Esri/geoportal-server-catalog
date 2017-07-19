/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define(["dojo/_base/declare",
  "jimu/BaseWidgetSetting",
  "dijit/_WidgetsInTemplateMixin"],
function(declare, BaseWidgetSetting, _WidgetsInTemplateMixin) {

  var oThisClass = declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

    baseClass: "jimu-widget-geoportal-search-setting",

    postCreate: function() {
      this.inherited(arguments);
    },

    startup: function() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      this.setConfig(this.config);
    },

    getConfig: function() {
      if (!this.config) {
        this.config = {};
      }
      return this.config;
    },

    setConfig: function(config) {
      this.config = config || {};
    }

  });

  return oThisClass;
});
