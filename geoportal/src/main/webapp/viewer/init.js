///////////////////////////////////////////////////////////////////////////
// Copyright ? 2014 Esri. All Rights Reserved.
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

var dojoConfig, jimuConfig;

/*global weinreUrl, loadResources, _loadPolyfills, loadingCallback, debug, allCookies, unescape */

var ie = (function() {

  var undef,
    v = 3,
    div = document.createElement('div'),
    all = div.getElementsByTagName('i');

  div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
  while(all[0]){
    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->';
  }
  return v > 4 ? v : undef;
}());

(function(argument) {
  if (ie < 8){
    var mainLoading = document.getElementById('main-loading');
    var appLoading = document.getElementById('app-loading');
    var ieNotes = document.getElementById('ie-note');
    appLoading.style.display = 'none';
    ieNotes.style.display = 'block';
    mainLoading.style.backgroundColor = "#fff";
    return;
  }

  //handle edit=true parameter
  if(!window.isXT && window.location.pathname.indexOf('/apps/webappviewer') > -1 &&
    window.queryObject.edit === 'true' && window.queryObject.appid){
    window.location.href = window.location.href.replace('webappviewer', 'webappbuilder');
    return;
  }

  var resources = [];
  if (debug) {
    resources.push(weinreUrl);
  }

  if (!window.apiUrl) {
    console.error('no apiUrl.');
  } else if (!window.path) {
    console.error('no path.');
  } else {
    if(window.location.protocol === 'https:'){
      var reg = /^http:\/\//i;
      if(reg.test(window.apiUrl)){
        window.apiUrl = window.apiUrl.replace(reg, 'https://');
      }
      if(reg.test(window.path)){
        window.path = window.path.replace(reg, 'https://');
      }
    }

    /*jshint unused:false*/
    dojoConfig = {
      parseOnLoad: false,
      async: true,
      tlmSiblingOfDojo: false,
      has: {
        'extend-esri': 1
      }
    };

    setLocale();

    resources = resources.concat([
      window.apiUrl + 'dojo/resources/dojo.css',
      window.apiUrl + 'dijit/themes/claro/claro.css',
      window.apiUrl + 'esri/css/esri.css',
      window.apiUrl + 'dojox/layout/resources/ResizeHandle.css',
      window.path + 'jimu.js/css/jimu-theme.css',
      window.path + 'libs/caja-html-sanitizer-minified.js',
      //because we have jimu/dijit/GridLayout dijit, so we import this css here
      window.path + 'libs/goldenlayout/goldenlayout-base.css',
      window.path + 'libs/goldenlayout/goldenlayout-light-theme.css'
    ]);

    if (window.apiUrl.substr(window.apiUrl.length - 'arcgis-js-api/'.length,
      'arcgis-js-api/'.length) === 'arcgis-js-api/') {
      //after build, we put js api here
      //user can also download release api package and put here
      dojoConfig.baseUrl = window.path;
      dojoConfig.packages = [{
        name: "dojo",
        location: window.apiUrl + "dojo"
      }, {
        name: "dijit",
        location: window.apiUrl + "dijit"
      }, {
        name: "dojox",
        location: window.apiUrl + "dojox"
      }, {
        name: "put-selector",
        location: window.apiUrl + "put-selector"
      }, {
        name: "xstyle",
        location: window.apiUrl + "xstyle"
      }, {
        name: "dgrid",
        location: window.apiUrl + "dgrid"
      }, {
        name: "dgrid1",
        location: window.apiUrl + "dgrid1"
      }, {
        name: "dstore",
        location: window.apiUrl + "dstore"
      }, {
        name: "moment",
        location: window.apiUrl + "moment"
      }, {
        name: "esri",
        location: window.apiUrl + "esri"
      }, {
        name: "widgets",
        location: "widgets"
      }, {
        name: "jimu",
        location: "jimu.js"
      }, {
        name: "themes",
        location: "themes"
      }, {
        name: "libs",
        location: "libs"
      }, {
        name: "dynamic-modules",
        location: "dynamic-modules"
      }];

      resources.push(window.apiUrl + '/dojo/dojo.js');
    } else {
      dojoConfig.baseUrl = window.apiUrl + 'dojo';
      dojoConfig.packages = [{
        name: "widgets",
        location: window.path + "widgets"
      }, {
        name: "jimu",
        location: window.path + "jimu.js"
      }, {
        name: "themes",
        location: window.path + "themes"
      }, {
        name: "libs",
        location: window.path + "libs"
      }, {
        name: "dynamic-modules",
        location: window.path + "dynamic-modules"
      }, {
        name: "configs",
        location: window.path + "configs"
      }];

      resources.push(window.apiUrl + 'init.js');
    }

    jimuConfig = {
      loadingId: 'main-loading',
      mainPageId: 'main-page',
      layoutId: 'jimu-layout-manager',
      mapId: 'map'
    };

    loadResources(resources, null, function(url, loaded) {
      if (typeof loadingCallback === 'function') {
        loadingCallback(url, loaded, resources.length);
      }
    }, function() {
      continueLoad();

      function continueLoad(){
        if(typeof require === 'undefined'){
          if (window.console){
            console.log('Waiting for API loaded.');
          }
          setTimeout(continueLoad, 100);
          return;
        }

        _loadPolyfills("", function() {
          window.appInfo.appPath = window.path;
          window.avoidRequireCache(require);
          require(['dojo/aspect', 'dojo/request/util'], function(aspect, requestUtil) {
            window.avoidRequestCache(aspect, requestUtil);

            require(['jimu/main', 'libs/main'], function(jimuMain) {
              //loadingCallback('jimu', resources.length + 1, resources.length);
              jimuMain.initApp();
            });
          });
        });
      }
    });
  }

  function setLocale(){
    if(window.queryObject.locale){
      dojoConfig.locale = window.queryObject.locale.toLowerCase();
      window._setRTL(dojoConfig.locale);
      return;
    }

    if(allCookies.esri_auth){
      /*jshint -W061 */
      var userObj = eval('(' + unescape(allCookies.esri_auth) + ')');
      if(userObj.culture){
        dojoConfig.locale = userObj.culture;
      }
    }

    if(window.queryObject.mode){
      if(allCookies.wab_locale){
        dojoConfig.locale = allCookies.wab_locale;
      }
    }else{
      if(allCookies.wab_app_locale){
        dojoConfig.locale = allCookies.wab_app_locale;
      }
    }


    if(!dojoConfig.locale){
      dojoConfig.locale = navigator.language ? navigator.language : navigator.userLanguage;
    }

    dojoConfig.locale = dojoConfig.locale.toLowerCase();
    window._setRTL(dojoConfig.locale);
  }
})();