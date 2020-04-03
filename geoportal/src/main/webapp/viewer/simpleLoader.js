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


(function(global){

  //load js, css files
  function loadResources(ress, onOneBeginLoad, onOneLoad, onLoad){
    var loaded = [];
    function _onOneLoad(url){
      //to avoid trigger onload more then one time
      if(checkHaveLoaded(url)){
        return;
      }
      loaded.push(url);
      if(onOneLoad){
        onOneLoad(url, loaded.length);
      }
      if(loaded.length === ress.length){
        if(onLoad){
          onLoad();
        }
      }
    }

    for(var i = 0; i < ress.length; i ++){
      loadResource(ress[i], onOneBeginLoad, _onOneLoad);
    }

    function checkHaveLoaded(url){
      for(var i = 0; i < loaded.length; i ++){
        if(loaded[i] === url){
          return true;
        }
      }
      return false;
    }
  }



  function getExtension(url) {
    url = url || "";
    var items = url.split("?")[0].split(".");
    return items[items.length-1].toLowerCase();
  }

  function loadResource(url, onBeginLoad, onLoad){
    if(onBeginLoad){
      onBeginLoad(url);
    }
    var type = getExtension(url);
    if(type.toLowerCase() === 'css'){
      loadCss(url);
    }else{
      loadJs(url);
    }

    function createElement(config) {
      var e = document.createElement(config.element);
      for (var i in config) {
        if (i !== 'element' && i !== 'appendTo') {
          e[i] = config[i];
        }
      }
      var root = document.getElementsByTagName(config.appendTo)[0];
      return (typeof root.appendChild(e) === 'object');
    }

    function loadCss(url) {
      var result = createElement({
        element: 'link',
        rel: 'stylesheet',
        type: 'text/css',
        href: url,
        onload: function(){
          elementLoaded(url);
        },
        appendTo: 'head'
      });

      //for the browser which doesn't fire load event
      //safari update documents.stylesheets when style is loaded.
      var ti = setInterval(function() {
        var styles = document.styleSheets;
        for(var i = 0; i < styles.length; i ++){
          // console.log(styles[i].href);
          if(styles[i].href &&
            styles[i].href.substr(styles[i].href.indexOf(url), styles[i].href.length) === url){
            clearInterval(ti);
            elementLoaded(url);
          }
        }
      }, 500);
      
      return (result);
    }

    function loadJs(url) {
      var result = createElement({
        element: 'script',
        type: 'text/javascript',
        onload: function(){
          elementLoaded(url);
        },
        onreadystatechange: function(){
          elementReadyStateChanged(url, this);
        },
        src: url,
        appendTo: 'body'
      });
      return (result);
    }

    function elementLoaded(url){
      if(onLoad){
        onLoad(url);
      }
    }
    function elementReadyStateChanged(url, thisObj){
      if (thisObj.readyState === 'loaded' || thisObj.readyState === 'complete') {
        elementLoaded(url);
      }
    }
  }

  /***********
  testLoad({
    test: window.console,
    success
  })
  ************/
  function testLoad(testObj){
    testObj.success = !!testObj.success? isArray(testObj.success)?
      testObj.success: [testObj.success]: [];
    testObj.failure = !!testObj.failure?
      isArray(testObj.failure)? testObj.failure: [testObj.failure]: [];

    if(testObj.test && testObj.success.length > 0){
      loadResources(testObj.success, null, null, testObj.callback);
    }else if(!testObj.test && testObj.failure.length > 0){
      loadResources(testObj.failure, null, null, testObj.callback);
    }else{
      testObj.callback();
    }
  }

  /* A must read: http://bonsaiden.github.com/JavaScript-Garden
     ************************************************************/
  function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  }

  function isArray(item) {
    return is("Array", item);
  }

  global.loadResources = loadResources;
  global.loadResource = loadResource;
  global.testLoad = testLoad;
}
)(window);
