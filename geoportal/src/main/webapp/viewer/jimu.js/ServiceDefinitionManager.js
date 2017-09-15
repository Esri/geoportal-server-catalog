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
    'esri/request'
  ],
  function(declare, esriRequest) {
    var instance = null;

    var clazz = declare(null, {
      cache: {}, //{url:deferred}

      getServiceDefinition: function(url, /*optional*/ handleAs) {
        if(!handleAs){
          handleAs = 'json';
        }
        var def = this.cache[url];
        if(this._getDefStatus(def) <= 0){
          def = esriRequest({
            url: url,
            handleAs: handleAs,
            content: {
              f: handleAs
            },
            callbackParamName: 'callback'
          });
          this.cache[url] = def;
        }
        return def;
      },

      //-1 means rejected or canceled
      //0 means def is null
      //1 means pending
      //2 means resolved
      _getDefStatus: function(def) {
        if (def) {
          if (def.isFulfilled()) {
            if (def.isResolved()) {
              return 2;
            } else {
              return -1;
            }
          } else {
            return 1;
          }
        } else {
          return 0;
        }
      }
    });

    clazz.getInstance = function() {
      if (!instance) {
        instance = new clazz();
        window._serviceDefinitionManager = instance;
      }
      return instance;
    };

    return clazz;
  });