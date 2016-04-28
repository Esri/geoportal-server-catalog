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
        "dojo/_base/lang",
        "app/common/Templated",
        "dojo/text!./templates/MapPanel.html",
        "dojo/i18n!../nls/resources",
        "dojo/sniff",
        "dojo/dom-style",
        "dojo/dom-geometry"], 
function(declare, lang, Templated, template, i18n, has, domStyle, domGeometry) {

  var oThisClass = declare([Templated], {

    i18n: i18n,
    templateString: template,
    
    mapWasInitialized: false,
    
    postCreate: function() {
      this.inherited(arguments);
    },
    
    addToMap: function(params) {
      var mapWindow  = this.mapFrameNode.contentWindow;
      if (mapWindow && typeof mapWindow.addToMapListener === "function") {
        mapWindow.addToMapListener(params);
      }
    },
  
    ensureMap: function(urlParams) {
      var url = "./viewer/index.html"; // TODO config this?
      if (!this.mapWasInitialized) {
        this.mapWasInitialized = true;
        if (urlParams) {
          var sProp = null, oProp = null, props = urlParams;
          for (sProp in props) {
            if (props.hasOwnProperty(sProp)) {
              oProp = props[sProp];
              if (typeof oProp !== "undefined" && oProp !== null) {
                if (url.indexOf("?") === -1) url += "?";
                else url += "&";
                url += sProp+"="+encodeURIComponent(oProp);
              }
            }
          }
        }
        //console.warn("viewerUrl",url);
        this.mapFrameNode.src = url;
      }
    }

  });

  return oThisClass;
});