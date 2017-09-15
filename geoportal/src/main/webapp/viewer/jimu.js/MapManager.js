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
  'dojo/_base/html',
  'dojo/query',
  'dojo/topic',
  'dojo/on',
  'dojo/aspect',
  'dojo/keys',
  'dojo/i18n',
  'dojo/_base/config',
  'esri/dijit/InfoWindow',
  'esri/dijit/PopupMobile',
  'esri/InfoTemplate',
  'esri/request',
  'esri/arcgis/utils',
  'esri/geometry/Extent',
  'esri/geometry/Point',
  'require',
  './utils',
  'jimu/LayerInfos/LayerInfos',
  'jimu/dijit/Message',
  'jimu/dijit/AppStatePopup',
  './MapUrlParamsHandler',
  './AppStateManager',
  './PopupManager',
  './FilterManager'
], function(declare, lang, array, html, query, topic, on, aspect, keys, i18n, dojoConfig, InfoWindow,
  PopupMobile, InfoTemplate, esriRequest, arcgisUtils, Extent, Point, require, jimuUtils,
  LayerInfos, Message, AppStatePopup, MapUrlParamsHandler, AppStateManager, PopupManager, FilterManager) {
  var instance = null,
    clazz = declare(null, {
      appConfig: null,
      mapDivId: '',
      map: null,
      previousInfoWindow: null,
      mobileInfoWindow: null,
      isMobileInfoWindow: false,

      layerInfosObj: null,

      constructor: function( /*Object*/ options, mapDivId) {
        this.appConfig = options.appConfig;
        this.urlParams = options.urlParams;
        this.mapDivId = mapDivId;
        this.id = mapDivId;
        this.appStateManager = AppStateManager.getInstance(this.urlParams);
        this.popupManager = PopupManager.getInstance(this);
        this.filterManager = FilterManager.getInstance();
        this.nls = window.jimuNls;
        topic.subscribe("appConfigChanged", lang.hitch(this, this.onAppConfigChanged));
        topic.subscribe("syncExtent", lang.hitch(this, this.onSyncExtent));

        on(window, 'resize', lang.hitch(this, this.onWindowResize));
        on(window, 'beforeunload', lang.hitch(this, this.onBeforeUnload));
      },

      showMap: function() {
        // console.timeEnd('before map');
        this._showMap(this.appConfig);
      },

      _showMap: function(appConfig) {
        // console.timeEnd('before map');
        console.time('Load Map');
        //for now, we can't create both 2d and 3d map
        if (appConfig.map['3D']) {
          if (appConfig.map.itemId) {
            this._show3DWebScene(appConfig);
          } else {
            this._show3DLayersMap(appConfig);
          }
        } else {
          if (appConfig.map.itemId) {
            this._show2DWebMap(appConfig);
          } else {
            console.log('No webmap found. Please set map.itemId in config.json.');
          }
        }
      },

      onBeforeUnload: function() {
        if(this.appConfig.keepAppState) {
          this.appStateManager.saveWabAppState(this.map, this.layerInfosObj);
        }
      },

      onWindowResize: function() {
        if (this.map && this.map.resize) {
          this.map.resize();
          this.resetInfoWindow(false);
        }
      },

      getMapInfoWindow: function(){
        return {
          mobile: this._mapMobileInfoWindow,
          bigScreen: this._mapInfoWindow
        };
      },

      resetInfoWindow: function(isNewMap) {
        if(isNewMap){
          this._mapInfoWindow = this.map.infoWindow;
          if(this._mapMobileInfoWindow){
            this._mapMobileInfoWindow.destroy();
            // working around for bug of destroying _mapMobileInfoWindow is not completely.
            query("div.esriMobileInfoView.esriMobilePopupInfoView").forEach(function(node){
              html.destroy(node);
            });
            query("div.esriMobileNavigationBar").forEach(function(node){
              html.destroy(node);
            });
          }
          this._mapMobileInfoWindow =
          new PopupMobile(null, html.create("div", null, null, this.map.root));
          this.isMobileInfoWindow = false;
        }
        if (jimuUtils.inMobileSize() && !this.isMobileInfoWindow) {
          this.map.infoWindow.hide();
          this.map.setInfoWindow(this._mapMobileInfoWindow);
          this.isMobileInfoWindow = true;
        } else if (!jimuUtils.inMobileSize() && this.isMobileInfoWindow) {
          this.map.infoWindow.hide();
          this.map.setInfoWindow(this._mapInfoWindow);
          this.isMobileInfoWindow = false;
        }
      },

      onSyncExtent: function(map){
        if(this.map){
          var extJson = map.extent;
          var ext = new Extent(extJson);
          this.map.setExtent(ext);
        }
      },

      _visitConfigMapLayers: function(appConfig, cb) {
        array.forEach(appConfig.map.basemaps, function(layerConfig, i) {
          layerConfig.isOperationalLayer = false;
          cb(layerConfig, i);
        }, this);

        array.forEach(appConfig.map.operationallayers, function(layerConfig, i) {
          layerConfig.isOperationalLayer = true;
          cb(layerConfig, i);
        }, this);
      },

      _show3DLayersMap: function(appConfig) {
        require(['esri3d/Map'], lang.hitch(this, function(Map) {
          var initCamera = appConfig.map.mapOptions.camera,
            map;
          map = new Map(this.mapDivId, {
            camera: initCamera
          });
          this._visitConfigMapLayers(appConfig, lang.hitch(this, function(layerConfig) {
            this.createLayer(map, '3D', layerConfig);
          }));
          map.usePlugin = Map.usePlugin;
          this._publishMapEvent(map);
        }));
      },

      _show3DWebScene: function(appConfig) {
        this._getWebsceneData(appConfig.map.itemId).then(lang.hitch(this, function(data) {
          require(['esri3d/Map'], lang.hitch(this, function(Map) {
            var map = new Map(this.mapDivId, appConfig.map.mapOptions);

            array.forEach(data.itemData.operationalLayers, function(layerConfig) {
              this.createLayer(map, '3D', layerConfig);
            }, this);

            array.forEach(data.itemData.baseMap.baseMapLayers, function(layerConfig) {
              layerConfig.type = "tile";
              this.createLayer(map, '3D', layerConfig);
            }, this);

            array.forEach(data.itemData.baseMap.elevationLayers, function(layerConfig) {
              layerConfig.type = "elevation";
              this.createLayer(map, '3D', layerConfig);
            }, this);

            map.toc = data.itemData.toc;
            map.bookmarks = data.itemData.bookmarks;
            map.tours = data.itemData.tours;
          }));
        }));
      },

      _publishMapEvent: function(map) {
        //add this property for debug purpose
        window._viewerMap = map;

        MapUrlParamsHandler.postProcessUrlParams(this.urlParams, map);

        console.timeEnd('Load Map');
        if (this.map) {
          this.map = map;
          this.resetInfoWindow(true);
          console.log('map changed.');
          topic.publish('mapChanged', this.map, this.layerInfosObj);
        } else {
          this.map = map;
          this.resetInfoWindow(true);
          topic.publish('mapLoaded', this.map, this.layerInfosObj);
        }
      },

      _getWebsceneData: function(itemId) {
        return esriRequest({
          url: 'http://184.169.133.166/sharing/rest/content/items/' + itemId + '/data',
          handleAs: "json"
        });
      },

      _show2DWebMap: function(appConfig) {
        //should use appConfig instead of this.appConfig, because appConfig is new.
        // if (appConfig.portalUrl) {
        //   var url = portalUrlUtils.getStandardPortalUrl(appConfig.portalUrl);
        //   agolUtils.arcgisUrl = url + "/sharing/content/items/";
        // }
        if(!appConfig.map.mapOptions){
          appConfig.map.mapOptions = {};
        }
        var mapOptions = this._processMapOptions(appConfig.map.mapOptions) || {};
        mapOptions.isZoomSlider = false;

        var webMapPortalUrl = appConfig.map.portalUrl;
        var webMapItemId = appConfig.map.itemId;
        var webMapOptions = {
          mapOptions: mapOptions,
          bingMapsKey: appConfig.bingMapsKey,
          usePopupManager: true
        };

        if(!window.isBuilder && !appConfig.mode && appConfig.map.appProxy &&
            appConfig.map.appProxy.mapItemId === appConfig.map.itemId) {
          var layerMixins = [];
          array.forEach(appConfig.map.appProxy.proxyItems, function(proxyItem){
            if (proxyItem.useProxy && proxyItem.proxyUrl) {
              layerMixins.push({
                url: proxyItem.sourceUrl,
                mixin: {
                  url: proxyItem.proxyUrl
                }
              });
            }
          });

          if(layerMixins.length > 0) {
            webMapOptions.layerMixins = layerMixins;
          }
        }

        var mapDeferred = this._createWebMapRaw(webMapPortalUrl, webMapItemId, this.mapDivId, webMapOptions);

        mapDeferred.then(lang.hitch(this, function(response) {
          var map = response.map;

          //hide the default zoom slider
          map.hideZoomSlider();

          // set default size of infoWindow.
          map.infoWindow.resize(270, 316);
          //var extent;
          map.itemId = appConfig.map.itemId;
          map.itemInfo = response.itemInfo;
          map.webMapResponse = response;
          // enable snapping
          var options = {
            snapKey: keys.copyKey
          };
          map.enableSnapping(options);

          html.setStyle(map.root, 'zIndex', 0);

          map._initialExtent = map.extent;

          this.layerInfosObj = LayerInfos.getInstanceSyncForInit(map, map.itemInfo);
          if(appConfig.map.mapRefreshInterval && !appConfig.map.mapRefreshInterval.useWebMapRefreshInterval){
            this._updateRefreshInterval(map.itemInfo.itemData, this.layerInfosObj, appConfig.map.mapRefreshInterval);
          }
          // this.layerInfosObj.traversalLayerInfosOfWebmap(lang.hitch(this, function(layerInfo){
          //   layerInfo.getLayerObject().then(lang.hitch(this, function(layerObject){
          //     if(layerObject.url && layerObject.declaredClass === "esri.layers.FeatureLayer"){
          //       this._handleRefreshLayer(layerObject);
          //     }
          //   }), lang.hitch(this, function(err){
          //     console.error("can't get layerObject", err);
          //   }));
          // }));

          this._showUnreachableLayersTitleMessage();
          this._publishMapEvent(map);
          setTimeout(lang.hitch(this, this._checkAppState), 500);
          this._addDataLoadingOnMapUpdate(map);
        }), lang.hitch(this, function(error) {
          console.error(error);
          this._showError(error);
          topic.publish('mapCreatedFailed');
        }));
      },

      _handleRefreshLayer: function(featureLayer){
        // var layerId = "Wildfire_5334";
        //before refresh => update-start => after refresh => get data => graphic-remove => graphic-add => update-end
        var _drawFeatures = featureLayer._mode._drawFeatures;
        var _clearIf = featureLayer._mode._clearIIf;
        var _cellMap = null;
        featureLayer._mode._drawFeatures = function(response, cell) {
          /*jshint unused: false*/
          // console.log(response);
          if (cell && typeof cell.row === 'number' && typeof cell.col === 'number') {
            featureLayer._mode._removeCell(cell.row, cell.col);
          }
          _drawFeatures.apply(featureLayer._mode, arguments);
        };
        aspect.before(featureLayer, 'refresh', function() {
          // console.log("before refresh");
          _cellMap = featureLayer._mode._cellMap;
          featureLayer._mode._clearIIf = function() {};
        });
        aspect.after(featureLayer, 'refresh', function() {
          // console.log("after refresh");
          featureLayer._mode._cellMap = _cellMap;
          featureLayer._mode._clearIIf = _clearIf;
        });

        on(featureLayer, 'update-start', function(){
          // console.log('update-start');
          featureLayer.isUpdating = true;
        });

        on(featureLayer, 'update-end', function(){
          // console.log('update-end');
          featureLayer.isUpdating = false;
        });

        // on(featureLayer, 'graphic-add', function(){
        //   console.log('graphic-add');
        // });

        // on(featureLayer, 'graphic-remove', function(){
        //   console.log('graphic-remove');
        // });

        // on(featureLayer, 'graphics-clear', function(){
        //   console.log('graphics-clear');
        // });
      },

      _showError: function(err){
        if(err && err.message){
          html.create('div', {
            'class': 'app-error',
            innerHTML: err.message
          }, document.body);
        }
      },

      _createWebMapRaw: function(webMapPortalUrl, webMapItemId, mapDivId,  webMapOptions){
        var mapDef = jimuUtils.createWebMap(webMapPortalUrl, webMapItemId, mapDivId, webMapOptions);
        return mapDef.then(lang.hitch(this, function(response){
          return response;
        }), lang.hitch(this, function(error){
          console.error(error);
          if(error && error instanceof Error && error.message){
            var cache = i18n.cache;
            var key = "esri/nls/jsapi/" + dojoConfig.locale;
            /*if(dojoConfig.locale !== 'en'){
              key += "/" + dojoConfig.locale;
            }*/
            var esriLocaleNls = cache[key];
            var str = lang.getObject("arcgis.utils.baseLayerError", false, esriLocaleNls);
            if(str && error.message.indexOf(str) >= 0){
              new Message({
                message: window.jimuNls.map.basemapNotAvailable + window.jimuNls.map.displayDefaultBasemap
              });
              return arcgisUtils.getItem(webMapItemId).then(lang.hitch(this, function(itemInfo){
                itemInfo.itemData.spatialReference = {
                  wkid: 102100,
                  latestWkid: 3857
                };
                itemInfo.itemData.baseMap = {
                  baseMapLayers: [{
                    url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
                    opacity: 1,
                    layerType: "ArcGISTiledMapServiceLayer",
                    visibility: true,
                    id: "defaultBasemap_0"
                  }],
                  title: "Topographic"
                };
                return jimuUtils.createWebMap(webMapPortalUrl, itemInfo, mapDivId, webMapOptions);
              }));
            }
          }

          throw error;
        }));
      },

      _showUnreachableLayersTitleMessage: function() {
        var unreachableLayersTitle = this.layerInfosObj.getUnreachableLayersTitle();
        var layersTitleString = "";
        var message = window.jimuNls.map.layerLoadedError ||
          "The layer, ${layers} cannot be added to the map.";
        if(message && unreachableLayersTitle && unreachableLayersTitle.length > 0) {
          array.forEach(unreachableLayersTitle, lang.hitch(this, function(title) {
            layersTitleString = layersTitleString +  title + ", ";
          }));

          new Message({
            message: message.replace("${layers}", layersTitleString)
          });
        }
      },

      _addDataLoadingOnMapUpdate: function(map) {
        var loadHtml = '<div class="map-loading">Loading...</div>';
        var loadContainer = html.toDom(loadHtml);
        html.place(loadContainer, map.root);
        if(map.updating){
          html.addClass(loadContainer, 'loading');
        }
        on(map, 'update-start', lang.hitch(this, function() {
          html.addClass(loadContainer, 'loading');
        }));
        on(map, 'update-end', lang.hitch(this, function() {
          html.removeClass(loadContainer, 'loading');
        }));
        on(map, 'unload', lang.hitch(this, function() {
          html.destroy(loadContainer);
          loadContainer = null;
        }));
      },

      _checkAppState: function() {
        //URL parameters that affect map extent
        var urlKeys = ['extent', 'center', 'marker', 'find', 'query', 'scale', 'level'];
        var useAppState = this.appConfig.keepAppState;

        if(useAppState) {
          array.forEach(urlKeys, function(k){
            if(k in this.urlParams){
              useAppState = false;
            }
          }, this);
        }

        if(useAppState){
          this.appStateManager.getWabAppState().then(lang.hitch(this, function(stateData) {
            if (stateData.extent || stateData.layers) {
              var appStatePopup = new AppStatePopup({
                nls: {
                  title: this.nls.appState.title,
                  restoreMap: this.nls.appState.restoreMap
                }
              });
              appStatePopup.placeAt('main-page');
              on(appStatePopup, 'applyAppState', lang.hitch(this, function() {
                this._applyAppState(stateData, this.map);
              }));
              appStatePopup.startup();
              appStatePopup.show();
            }
          }));
        }
      },

      _applyAppState: function(stateData, map) {
        var layerOptions = stateData.layers;
        this.layerInfosObj.restoreState({
          layerOptions: layerOptions || null
        });
        if (stateData.extent) {
          map.setExtent(stateData.extent);
        }
      },

      _processMapOptions: function(mapOptions) {
        if (!mapOptions) {
          return;
        }

        if(!mapOptions.lods){
          delete mapOptions.lods;
        }
        if(mapOptions.lods && mapOptions.lods.length === 0){
          delete mapOptions.lods;
        }

        var ret = lang.clone(mapOptions);
        if (ret.extent) {
          ret.extent = new Extent(ret.extent);
        }
        if (ret.center && !lang.isArrayLike(ret.center)) {
          ret.center = new Point(ret.center);
        }
        if (ret.infoWindow) {
          ret.infoWindow = new InfoWindow(ret.infoWindow, html.create('div', {}, this.mapDivId));
        }

        return ret;
      },

      createLayer: function(map, maptype, layerConfig) {
        var layMap = {
          '2D_tiled': 'esri/layers/ArcGISTiledMapServiceLayer',
          '2D_dynamic': 'esri/layers/ArcGISDynamicMapServiceLayer',
          '2D_image': 'esri/layers/ArcGISImageServiceLayer',
          '2D_feature': 'esri/layers/FeatureLayer',
          '2D_rss': 'esri/layers/GeoRSSLayer',
          '2D_kml': 'esri/layers/KMLLayer',
          '2D_webTiled': 'esri/layers/WebTiledLayer',
          '2D_wms': 'esri/layers/WMSLayer',
          '2D_wmts': 'esri/layers/WMTSLayer',
          '3D_tiled': 'esri3d/layers/ArcGISTiledMapServiceLayer',
          '3D_dynamic': 'esri3d/layers/ArcGISDynamicMapServiceLayer',
          '3D_image': 'esri3d/layers/ArcGISImageServiceLayer',
          '3D_feature': 'esri3d/layers/FeatureLayer',
          '3D_elevation': 'esri3d/layers/ArcGISElevationServiceLayer',
          '3D_3dmodle': 'esri3d/layers/SceneLayer'
        };

        require([layMap[maptype + '_' + layerConfig.type]], lang.hitch(this, function(layerClass) {
          var layer, infoTemplate, options = {},
            keyProperties = ['label', 'url', 'type', 'icon', 'infoTemplate', 'isOperationalLayer'];
          for (var p in layerConfig) {
            if (keyProperties.indexOf(p) < 0) {
              options[p] = layerConfig[p];
            }
          }
          if (layerConfig.infoTemplate) {
            infoTemplate = new InfoTemplate(layerConfig.infoTemplate.title,
              layerConfig.infoTemplate.content);
            options.infoTemplate = infoTemplate;

            layer = new layerClass(layerConfig.url, options);

            if (layerConfig.infoTemplate.width && layerConfig.infoTemplate.height) {
              aspect.after(layer, 'onClick', lang.hitch(this, function() {
                map.infoWindow.resize(layerConfig.infoTemplate.width,
                  layerConfig.infoTemplate.height);
              }), true);
            }
          } else {
            layer = new layerClass(layerConfig.url, options);
          }

          layer.isOperationalLayer = layerConfig.isOperationalLayer;
          layer.label = layerConfig.label;
          layer.icon = layerConfig.icon;
          map.addLayer(layer);
        }));
      },

      onAppConfigChanged: function(appConfig, reason, changedJson) {
        // jshint unused:false
        this.appConfig = appConfig;
        if(reason === 'mapChange'){
          this._recreateMap(appConfig);
        }else if(reason === 'mapOptionsChange'){
          if(changedJson.lods){
            this._recreateMap(appConfig);
          }
        }else if(reason === 'mapRefreshIntervalChange'){
          var itemData = this.map && this.map.itemInfo.itemData;
          if (itemData && this.layerInfosObj) {
            this._updateRefreshInterval(itemData, this.layerInfosObj, changedJson);
          }
        }
      },

      _updateRefreshInterval: function(itemData, layerInfosObj, refreshInterval){
        var minutes = -1;

        if (refreshInterval.useWebMapRefreshInterval) {
          //Honor the individual interval of each layer
          minutes = -1;
        } else {
          //Use a single interval for all layers
          minutes = refreshInterval.minutes;
        }

        var operationalLayers = itemData.operationalLayers || [];
        array.forEach(operationalLayers, lang.hitch(this, function(operationalLayer){
          if(operationalLayer.refreshInterval > 0){
            var layerInfo = layerInfosObj.getLayerInfoById(operationalLayer.id);
            if(layerInfo){
              layerInfo.getLayerObject().then(lang.hitch(this, function(layer){
                if(layer && typeof layer.setRefreshInterval === 'function'){
                  if(minutes < 0){
                    layer.setRefreshInterval(operationalLayer.refreshInterval);
                  }else{
                    layer.setRefreshInterval(minutes);
                  }
                }
              }));
            }
          }
        }));
      },

      _recreateMap: function(appConfig){
        if(this.map){
          topic.publish('beforeMapDestory', this.map);
          this.map.destroy();
        }
        this._showMap(appConfig);
      },

      disableWebMapPopup: function() {
        this.map.setInfoWindowOnClick(false);
      },

      enableWebMapPopup: function() {
        this.map.setInfoWindowOnClick(true);
      }

    });

  clazz.getInstance = function(options, mapDivId) {
    if (instance === null) {
      instance = new clazz(options, mapDivId);
    }
    return instance;
  };

  return clazz;
});
