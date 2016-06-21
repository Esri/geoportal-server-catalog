///////////////////////////////////////////////////////////////////////////
// Copyright © 2015 Esri. All Rights Reserved.
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
  'dojo/Deferred',
  'dojo/json',
  'esri/geometry/Extent',
  'esri/SpatialReference',
  'libs/storejs/store',
  'libs/md5/md5',
  'jimu/tokenUtils'
  ], function(declare, lang, Deferred, json, Extent,
    SpatialReference, storejs, md5js, TokenUtils) {
    var instance = null;
    var clazz = declare(null, {
      rawAppConfig: null,
      mapMd5: null,
      appStateKey: null,

      setRawAppConfig: function(rAppConfig) {
        this.rawAppConfig = rAppConfig;
      },

      _getAppStateMd5: function() {
        if (typeof this.mapMd5 === 'string') {
          return this.mapMd5;
        } else {
          var str = json.stringify(this.rawAppConfig.map);
          this.mapMd5 = md5js(str);
          return this.mapMd5;
        }
      },

      _getAppStateKey: function() {
        if (this.appStateKey) {
          return this.appStateKey;
        }

        // xt or integration use id of app as key,
        // deploy app use pathname as key
        this.appStateKey = 'wab_appstate_' +  this.urlParams.id || this.urlParams.appid ||
          window.path;
        return this.appStateKey;
      },

      getWabAppState: function() {
        var def = new Deferred();
        var data = {};
        if (TokenUtils.isInConfigOrPreviewWindow() ||
          !(this.rawAppConfig && this.rawAppConfig.map)) {
          def.resolve(data);
          return def;
        }
        var appStateKey = this._getAppStateKey();

        var appState = storejs.get(appStateKey);
        if (appState && appState.appStateMd5 === this._getAppStateMd5()){
          var extent = appState.map && appState.map.extent;
          var layers = appState.map && appState.map.layers;
          if (extent) {
            data.extent = new Extent(
              extent.xmin,
              extent.ymin,
              extent.xmax,
              extent.ymax,
              new SpatialReference(extent.spatialReference)
            );
          }
          if (layers) {
            data.layers = layers;
          }
        } else {
          storejs.remove(appStateKey);
        }

        def.resolve(data);

        return def;
      },

      saveWabAppState: function(map, layerInfosObj) {
        if (!map || TokenUtils.isInConfigOrPreviewWindow()) {
          return;
        }

        var key = this._getAppStateKey();
        var mapObj = {
          extent: {
            xmin: map.extent.xmin,
            xmax: map.extent.xmax,
            ymin: map.extent.ymin,
            ymax: map.extent.ymax,
            spatialReference: {
              wkid: map.extent.spatialReference.wkid,
              wkt: map.extent.spatialReference.wkt
            }
          },
          layers: {}
        };
        if (layerInfosObj && layerInfosObj.traversal) {
          layerInfosObj.traversal(lang.hitch(this, function(layerInfo) {
            mapObj.layers[layerInfo.id] = {
              visible: layerInfo.isVisible()
            };
          }));
        }
        storejs.set(key, {
          map: mapObj,
          appStateMd5: this._getAppStateMd5()
        });
      }
    });

    clazz.getInstance = function(urlParams) {
      if (instance === null) {
        instance = new clazz();
      }
      instance.urlParams = urlParams;
      return instance;
    };

    return clazz;
  });