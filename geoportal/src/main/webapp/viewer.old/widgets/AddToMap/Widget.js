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
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/Deferred",
  "dijit/_WidgetsInTemplateMixin",
  "jimu/BaseWidget",
  "jimu/dijit/Message",
  "./LayerProcessor"],
function(declare, lang, Deferred, _WidgetsInTemplateMixin, BaseWidget, 
  Message, LayerProcessor) {
  
  return declare([BaseWidget, _WidgetsInTemplateMixin], {    

    name: "AddToMap",
    baseClass: "geoportal-addToMap",

    postCreate: function(){
      this.inherited(arguments);
      
      var self = this;
      if (!window.addToMapListener){
        
        //console.warn("navigator.userAgent",navigator.userAgent);
        if (!window._saveGetComputedStyle && navigator && navigator.userAgent && 
          navigator.userAgent.indexOf("Firefox") !== -1) {
          console.warn("Overriding window.getComputedStyle for:",navigator.userAgent);
          window._saveGetComputedStyle = window.getComputedStyle;
          window.getComputedStyle = function (element,pseudoElt) {
            var t = window._saveGetComputedStyle(element,pseudoElt);
            if (t === null) {
              return {getPropertyValue: function(){}};
            } else {
              return t;
            }
          };
        }
        
        window.addToMapListener = function(params){
          //console.warn("addToMapListener",params);
          return self._addLayer(params.type,params.url);
        };
      }
      
      this._checkWindowUrl();
    },
    
    _addLayer: function(type,url){
      // console.warn("AddToMap.addLayer...",type,url);      
      var dfd = new Deferred();
      var msg = this.nls.unableToLoadPattern.replace("{url}",url);
      var popupMsg = function() {
        new Message({message:msg});
      };
      var processor = new LayerProcessor();
      processor.addLayer(this.map,type,url).then(function(result){
        if (result) {
          dfd.resolve(result);
        } else {
          dfd.reject("Failed");
          console.warn("AddToMap failed for",url);
          popupMsg();
        }
      }).otherwise(function(error){
        dfd.reject(error);
        if (typeof error === "string" && error === "Unsupported") {
          console.warn("AddToMap: Unsupported type",type,url);
        } else {
          console.warn("AddToMap failed for",url);
          console.warn(error);
        }
        popupMsg();
      }); 
      return dfd;
    },
    
    _checkWindowUrl: function(){
      //console.warn("AddToMap._checkWindowUrl...");
      var queryObject = this._parseParameters();  // window.queryObject; env.js // <-- did not work well, so using above function
      if(queryObject.resource){
        var resource = queryObject.resource; 
        //console.warn("Add to map parameters => " + resource);        
        var title = "";
        if(queryObject.title){
          title = decodeURIComponent(queryObject.title);
        }
        var parts = resource.split(":");
        if(!parts && parts.length<2){
          return;
        }

        var linkType = parts[0];
        var href = "";
        // loop parameter values in array elements since value may contain ':'
        for(var i=1; i<parts.length; i++){
          if(href.length > 0){
            href += ":";
          }
          href += parts[i]; 
        }
        if (href.length === 0)return;
        this._addLayer(linkType,href);
      }
    },
    
    _parseParameters: function(){
      var query = window.location.search;
      if (query.indexOf('?') > -1) {
        query = query.substr(1);
      }
      var pairs = query.split('&');
      var queryObject = {};
      for(var i = 0; i < pairs.length; i++){
        var splits = decodeURIComponent(pairs[i]).split('=');
        var parameterValue = "";
        // loop parameter values in array elements since value may contain '='
        for(var j=1; j<splits.length; j++){
          if(parameterValue.length > 0){
            parameterValue += "=";
          }
          parameterValue += splits[j]; 
        }
        queryObject[splits[0]] = parameterValue;
      }
      return queryObject;
    }

  });
});