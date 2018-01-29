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
define(["dojo/_base/array"],
function(array) {

  var _def = {

    checkMixedContent: function(uri) {
      if ((typeof window.location.href === "string") &&
        (window.location.href.indexOf("https://") === 0)) {
        if ((typeof uri === "string") && (uri.indexOf("http://") === 0)) {
          uri = "https:" + uri.substring("5");
        }
      }
      return uri;
    },

    endsWith: function(sv, sfx) {
      return (sv.indexOf(sfx, (sv.length - sfx.length)) !== -1);
    },

    escapeForLucene: function(value) {
      var a = ['+', '-', '&', '!', '(', ')', '{', '}', '[', ']',
      '^', '"', '~', '*', '?', ':', '\\'];
      var r = new RegExp("(\\" + a.join("|\\") + ")", "g");
      return value.replace(r, "\\$1");
    },

    findLayersAdded: function(map, itemId) {
      var ids = [],
        itemIds = [],
        layers = [];
      var response = {
        itemIds: itemIds,
        layers: layers
      };
      if (!map) {
        return response;
      }
      var checkId = (typeof itemId === "string" && itemId.length > 0);
      array.forEach(map.layerIds, function(id) {
        ids.push(id);
      });
      array.forEach(map.graphicsLayerIds, function(id) {
        ids.push(id);
      });
      array.forEach(ids, function(id) {
        var lyr = map.getLayer(id);
        if (lyr && typeof lyr.xtnItemId === "string" && lyr.xtnItemId.length > 0) {
          //console.warn("found added layer",lyr);
          if (!checkId || lyr.xtnItemId === itemId) {
            layers.push(lyr);
            if (itemIds.indexOf(lyr.xtnItemId) === -1) {
              itemIds.push(lyr.xtnItemId);
            }
          }
        }
      });
      return response;
    },

    setNodeText: function(nd, text) {
      nd.innerHTML = "";
      if (text) {
        nd.appendChild(document.createTextNode(text));
      }
    },

    setNodeTitle: function(nd, text) {
      nd.title = "";
      if (text) {
        nd.setAttribute("title", text);
      }
    },

    setNodeHTML: function(nd, html) {
      nd.innerHTML = "";
      if (html) {
        nd.innerHTML = html;
      }
    }

  };

  return _def;

});
