///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
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
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Deferred',
  'jimu/utils',
  'esri/request',
  'esri/IdentityManager'
],
function(declare, lang, array, Deferred, jimuUtils, esriRequest, IdentityManager) {

  //properties required:
  //leafTypes
  //serviceTypes

  //methods need to be overridden:
  //getItem
  //getSubItemUrls
  //getIconImageName
  var BaseRule = declare([], {
    leafTypes: null,//string array
    serviceTypes: null,//such as['MapServer','FeatureServer'] or ['GPServer']...

    _restInfoCache: {},

    constructor: function(options){
      lang.mixin(this, options);
      if(!lang.isArrayLike(this.leafTypes)){
        this.leafTypes = [];
      }
      if(!lang.isArrayLike(this.serviceTypes)){
        this.serviceTypes = [];
      }
    },

    //to be override
    //this method return a Deferred object,
    //the Deferred object resolve an item object{name,type,url} of the input url
    //here is the default implementation of getItem
    getItem: function(url){
      return this.defaultGetItem(url);
    },

    //to be override
    //this method return a Deferred object,
    //the Deferred object resolve an the children urls
    getSubItemUrls: function(url){
      return this.defaultGetSubItemUrls(url);
    },

    //to be override
    getIconImageName: function(item, opened) {
      /* jshint unused: false */
      var imageName = "";
      return imageName;
    },

    //resolve {name,type,url,definition}
    defaultGetItem: function(url){
      var def = new Deferred();
      url = url.replace(/\/*$/g, '');
      if(this.isUrlEndWithServiceType(url)){
        var splits = url.split('/');
        var serviceType = splits[splits.length - 1];
        var serviceName = splits[splits.length - 2];
        this.getRestInfo(url).then(lang.hitch(this, function(definition){
          var item = {
            name: serviceName,
            type: serviceType,
            url: url,
            definition: definition
          };
          def.resolve(item);
        }), lang.hitch(this, function(err){
          console.error(err);
          def.reject({
            errorCode: 'NETWORK_ERROR',
            error: err
          });
        }));
      }else{
        def.resolve(null);
      }
      return def;
    },

    defaultGetSubItemUrls: function(url){
      /*jshint unused: false*/
      var def = new Deferred();
      def.resolve([]);
      return def;
    },

    getRestInfo: function(url){
      var def = new Deferred();

      url = url.replace(/\/*$/g, '');
      var info = this._restInfoCache[url];
      if (info) {
        def.resolve(info);
      } else {
        var args = {
          url: url,
          content: {
            f: "json"
          },
          handleAs: "json",
          callbackParamName: "callback",
          timeout: 20000
        };
        var credential = IdentityManager.findCredential(url);
        if(credential && credential.token){
          args.content.token = credential.token;
        }
        esriRequest(args).then(lang.hitch(this, function(response) {
          this._restInfoCache[url] = response;
          def.resolve(response);
        }), function(err) {
          def.reject(err);
        });
      }

      return def;
    },

    isServiceTypeSupported: function(type){
      type = type.toLowerCase();
      return array.some(this.serviceTypes, lang.hitch(this, function(serviceType){
        return serviceType.toLowerCase() === type;
      }));
    },

    isUrlEndWithServiceType: function(url){
      return array.some(this.serviceTypes, lang.hitch(this, function(type){
        return jimuUtils.isStringEndWith(url, '/' + type);
      }));
    },

    isUrlContainsServiceType: function(url){
      url = url.toLowerCase();
      return array.some(this.serviceTypes, lang.hitch(this, function(type){
        type = type.toLowerCase();
        return url.indexOf('/' + type) >= 0;
      }));
    }
  });

  return BaseRule;
});