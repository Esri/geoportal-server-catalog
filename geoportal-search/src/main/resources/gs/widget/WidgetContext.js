///////////////////////////////////////////////////////////////////////////
// Copyright © 2017 Esri. All Rights Reserved.
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
define(["dojo/_base/declare",
  "dojo/_base/lang"],
function(declare, lang) {

  var _def = declare([], {

    i18n: null,
    widgetFolder: "gs/widget",

    constructor: function(args) {
      lang.mixin(this, args);
    },

    checkMixedContent: function(uri) {
      if ((typeof window.location.href === "string") &&
          (window.location.href.indexOf("https://") === 0)) {
        if ((typeof uri === "string") && (uri.indexOf("http://") === 0)) {
          uri = "https:" + uri.substring("5");
        }
      }
      return uri;
    },

    generateRandomId: function() {
      var t = null;
      if (typeof Date.now === "function") {
        t = Date.now();
      } else {
        t = (new Date()).getTime();
      }
      var r = ("" + Math.random()).replace("0.", "r");
      return (t + "" + r).replace(/-/g, "");
    },

    getMap: function() {
      return null;
    },

    showError: function(title,error) {
      console.warn("wro/Context.showError",title,error);
    },

    showMessage: function(title,message) {
      console.warn("wro/Context.showMessage",title,message);
    },

    showMessages: function(title,subTitle,messages) {
      console.warn("wro/Context.showMessages",title,subTitle,messages);
    }

  });

  return _def;
});
