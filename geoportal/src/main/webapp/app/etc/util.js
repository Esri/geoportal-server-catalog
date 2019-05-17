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
define(["dojo/_base/lang"],
function (lang) {
  
  var oThisObject = {

    checkMixedContent: function(uri) {
      if ((typeof window.location.href === "string") && (window.location.href.indexOf("https://") === 0)) {
        if ((typeof uri === "string") && (uri.indexOf("http://") === 0)) {
          uri = "https:"+uri.substring("5");
        }
      }
      return uri;
    },
    
    escapeForLucene: function(value) {
      var a = ['+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
      var r = new RegExp("(\\" + a.join("|\\") + ")", "g");
      return value.replace(r, "\\$1");
    },
    
    setNodeText: function(nd,text) {
      nd.innerHTML = "";
      if (text) nd.appendChild(document.createTextNode(text));
    },
    
    getRequestParam: function(name) {
      param = location.search.split(/[?&]/).filter(function(p){ return p.startsWith(name); });
      if (param && param.length>0) {
        var value = param[0].substring(name.length+1);
        return decodeURIComponent(value);
      }
      return;
    }
    
  };
  
  return oThisObject;
});