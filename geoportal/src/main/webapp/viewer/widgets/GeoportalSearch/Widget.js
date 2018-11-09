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
  "dojo/_base/array",
  "jimu/BaseWidget",
  "dijit/_WidgetsInTemplateMixin",
  "./gs/widget/SearchPane",
  "./gs/widget/WidgetContext",
  "dojo/i18n!./gs/widget/nls/strings",
  "esri/config"],
function(declare, array, BaseWidget, _WidgetsInTemplateMixin, SearchPane,
  WidgetContext, i18n, esriConfig) {

  var oThisClass = declare([BaseWidget, _WidgetsInTemplateMixin], {

    baseClass: "jimu-widget-geoportal-search",
    i18n: i18n,
    name: "GeoportalSearch",

    postCreate: function() {
      this.inherited(arguments);
    },

    startup: function() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      this._init();
    },

    _init: function() {
      var localGeoportalUrl = this._createLocalCatalogUrl();
      if (localGeoportalUrl) {
        array.forEach(this.config.targets, function(target){
          if (target.type === "geoportal" && !target.url) {
            target.url = localGeoportalUrl;
          }
        });
      }
      var widgetContext = new WidgetContext({
        i18n: i18n,
        map: this.map,
        proxyUrl: esriConfig.defaults.io.proxyUrl,
        wabWidget: this,
        widgetConfig: this.config
      });
      var searchPane = new SearchPane({
        i18n: widgetContext.i18n,
        widgetContext: widgetContext
      },this.widgetNode);
      searchPane.startup();
    },
    
    _createLocalCatalogUrl: function() {
      if (window && window.top && window.top.geoportalServiceInfo) {
        var loc = window.top.location;
        var gpt = window.top.geoportalServiceInfo;
        return loc.protocol + "//" + loc.host + loc.pathname + "elastic/" + gpt.metadataIndexName + "/item/_search";
      }
      return null;
    }

  });

  return oThisClass;
});
