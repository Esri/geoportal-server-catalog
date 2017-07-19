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
  "jimu/BaseWidget",
  "dijit/_WidgetsInTemplateMixin",
  "./gs/widget/Search"],
function(declare, BaseWidget, _WidgetsInTemplateMixin,Search) {

  var oThisClass = declare([BaseWidget, _WidgetsInTemplateMixin], {

    name: "GeoportalSearch",
    baseClass: "jimu-widget-geoportal-search",

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
      new Search({
        wabWidget: this
      },this.widgetNode);
    }

  });

  return oThisClass;
});
