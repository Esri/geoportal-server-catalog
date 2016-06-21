///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Esri. All Rights Reserved.
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
define([],
function() {

  return {

    checkMixedContent: function(uri) {
      var href = window.location.href;
      if ((typeof href === "string") && (href.indexOf("https://") === 0)) {
        if ((typeof uri === "string") && (uri.indexOf("http://") === 0)) {
          uri = "https:"+uri.substring("5");
        }
      }
      return uri;
    },
    
    generateRandomId: function() {
      var t = null;
      if (typeof Date.now === "function") t = Date.now();
      else t = (new Date()).getTime();
      var r = (""+Math.random()).replace("0.","r");
      return (t+""+r).replace(/-/g,"");
    }

  };

});
