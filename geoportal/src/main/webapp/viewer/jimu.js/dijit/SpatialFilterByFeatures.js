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
  'dojo/_base/array',
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/SpatialFilterByFeatures.html',
  'dojo/on',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/_base/html',
  'dojo/_base/lang',
  'jimu/utils',
  'jimu/Query',
  'jimu/dijit/CheckBox',
  'jimu/dijit/FeaturelayerChooserFromMap',
  'jimu/dijit/LayerChooserFromMapWithDropbox',
  'jimu/dijit/SearchDistance',
  'jimu/LayerInfos/LayerInfos',
  'esri/graphic',
  'esri/tasks/query',
  'esri/symbols/jsonUtils',
  'esri/layers/GraphicsLayer',
  'esri/renderers/SimpleRenderer',
  'esri/geometry/geometryEngine',
  'jimu/dijit/FeatureSetChooserForSingleLayer'
],
function(array, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, on, Evented,
  Deferred, html, lang, jimuUtils, JimuQuery, CheckBox, FeaturelayerChooserFromMap,
  LayerChooserFromMapWithDropbox, SearchDistance, LayerInfos, Graphic, EsriQuery, symbolJsonUtils, GraphicsLayer,
  SimpleRenderer, geometryEngine, FeatureSetChooserForSingleLayer) {

  var clazz = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
    baseClass: 'jimu-dijit-spatial-filter-features',
    templateString: template,
    _bufferLayer: null,//GraphicsLayer
    _defaultRelationship: 'SPATIAL_REL_INTERSECTS',
    drawBox: null,
    selectionRadio: null,
    _selectionHandle: null,
    layerInfosObj: null,
    _layerAllFeaturesCache: null,//{featureLayerId:features}

    //constructor options:
    map: null,
    types: null,//available values:['point','polyline','polygon']
    enableBuffer: false,
    distance: 0,
    unit: '',
    showLoading: false,
    ignoredFeaturelayerIds: null,//an array of ignored feature layer ids

    //public methods:
    //reset
    //getGeometryInfo
    //isLoading

    //events:
    //loading
    //unloading
    //search-distance-change

    postMixInProperties:function(){
      this.inherited(arguments);
      this.nls = window.jimuNls.spatialFilterByFeatures;
      if(!this.ignoredFeaturelayerIds){
        this.ignoredFeaturelayerIds = [];
      }
      this._layerAllFeaturesCache = {};
    },

    postCreate:function(){
      this.inherited(arguments);

      this.selectionRadio = new CheckBox({
        label: this.nls.selectedFeatures
      });
      this.selectionRadio.placeAt(this.selectionOptionDiv);
      this.selectionRadio.setStatus(false);
      this.own(on(this.selectionRadio, 'change', lang.hitch(this, this._onRadioChanged)));

      html.setStyle(this.domNode, 'position', 'relative');

      //init renderer
      var bufferSymbol = symbolJsonUtils.fromJson({
        "style": "esriSFSSolid",
        "color": [79, 129, 189, 77],
        "type": "esriSFS",
        "outline": {
          "style": "esriSLSSolid",
          "color": [54, 93, 141, 255],
          "width": 1.5,
          "type": "esriSLS"
        }
      });
      var renderer = new SimpleRenderer(bufferSymbol);

      //init _bufferLayer
      this._bufferLayer = new GraphicsLayer();
      this._bufferLayer.setRenderer(renderer);
      this.map.addLayer(this._bufferLayer);

      //init FeaturelayerChooserFromMap
      var layerChooser = new FeaturelayerChooserFromMap({
        createMapResponse: this.map.webMapResponse,
        types: this.types,
        showLayerFromFeatureSet: true,
        onlyShowVisible: false,
        updateWhenLayerInfosIsShowInMapChanged: true,
        ignoredFeaturelayerIds: this.ignoredFeaturelayerIds
      });
      this.layerChooserFromMapWithDropbox = new LayerChooserFromMapWithDropbox({
        layerChooser: layerChooser
      });
      this.layerChooserFromMapWithDropbox.placeAt(this.layerSelectDiv);
      this.own(on(this.layerChooserFromMapWithDropbox,  'selection-change', lang.hitch(this, this._onLayerChanged)));
      this.layerInfosObj = LayerInfos.getInstanceSync();
      this.own(on(this.layerInfosObj,
                  'layerInfosIsShowInMapChanged',
                  lang.hitch(this, this._onLayerInfosIsShowInMapChanged)));

      //init SearchDistance
      this.searchDistance = new SearchDistance({
        tip: window.jimuNls.searchDistance.applySearchDistanceToFeatures,
        distance: this.distance,
        unit: this.unit
      });
      this.searchDistance.placeAt(this.searchDistanceDiv);
      if(this.enableBuffer){
        this.searchDistance.enable();
        this.own(on(this.searchDistance, 'change', lang.hitch(this, this._onSearchDistanceChange)));
      }else{
        this.searchDistance.disable();
        html.setStyle(this.searchDistanceDiv, 'display', 'none');
      }

      this._onLayerChanged();
    },

    reset: function(resetSearchDistance){
      if(resetSearchDistance){
        this.searchDistance.reset();
        this.searchDistance.setDistance(this.distance);
        this.searchDistance.setUnit(this.unit);
      }
      this.clearAllGraphics();
    },

    hideTempLayers: function(){
      if(this._bufferLayer){
        this._bufferLayer.hide();
      }
      if(this.drawBox){
        this.drawBox.hideLayer();
      }
      if(this.featureSetChooserForSingleLayer){
        this.featureSetChooserForSingleLayer.hideMiddleFeatureLayer();
      }
    },

    showTempLayers: function(){
      if(this._bufferLayer){
        this._bufferLayer.show();
      }
      if(this.drawBox){
        this.drawBox.showLayer();
      }
      if(this.featureSetChooserForSingleLayer){
        this.featureSetChooserForSingleLayer.showMiddleFeatureLayer();
      }
    },

    disable: function(hideLayers){
      if(hideLayers){
        this._hideAllLayers();
      }
    },

    enable: function(){
      // this.drawBox.enable();
      this._showAllLayers();
    },

    deactivate: function(){
      if(this.featureSetChooserForSingleLayer){
        this.featureSetChooserForSingleLayer.deactivate();
      }
    },

    clearAllGraphics: function(){
      // this.drawBox.clear();
      this._clearBufferLayer();
      if(this.featureSetChooserForSingleLayer){
        this.featureSetChooserForSingleLayer.clearAllGraphics();
      }
    },

    setSelectedLayer: function(layer){
      return this.layerChooserFromMapWithDropbox.setSelectedLayer(layer);
    },

    getSelectedLayer: function(){
      var info = this._getSelectedLayerInfomation();
      return info.layer;
    },

    checkSelectedFeaturesRadio: function(){
      if(!this.selectionRadio.getValue()){
        this.selectionRadio.check();
      }
    },

    uncheckSelectedFeaturesRadio: function(){
      if(this.selectionRadio.getValue()){
        this.selectionRadio.uncheck();
      }
    },

    isValidSearchDistance: function(){
      return this.searchDistance.getStatus() >= 0;
    },

    /*
    return a Deferred object which resolves {status,geometry}
    geometry is the buffer geometry
    status 1 means geometry is not null
    status 0 means we don't select any features and geometry is null
    status -1 means user doesn't select a feature layer, geometry is null
    status -2 means search distance is invalid, geometry is null
    */
    //if silent is true, it won't show message box
    getGeometryInfo: function(silent){
      var def = new Deferred();
      var result = {
        status: null,
        geometry: null
      };

      this._updateBuffer();

      var info = this._getSelectedLayerInfomation();
      var type = info.type;
      if(type === 0){
        result.status = -1;
        def.resolve(result);
        return def;
      }

      var searchData = this.searchDistance.getData();
      if(searchData.status < 0){
        result.status = -2;
        def.resolve(result);
        return def;
      }

      this._getFeatures(silent).then(lang.hitch(this, function(){
        result.geometry = this._updateBuffer();
        if(result.geometry){
          result.status = 1;
        }else{
          result.status = 0;
        }
        def.resolve(result);
      }), lang.hitch(this, function(err){
        def.reject(err);
      }));
      return def;
    },

    //resolve a FeasureSet object, maybe resolve null
    //if silent is true, it won't show message box
    getFeatureSet: function(silent){
      var def = new Deferred();
      var featureSet = null;
      var info = this._getSelectedLayerInfomation();
      var layer = info.layer;
      if(layer){
        this._getFeatures(silent).then(lang.hitch(this, function(features){
          featureSet = jimuUtils.getFeatureSetByLayerAndFeatures(layer, features);
          def.resolve(featureSet);
        }), lang.hitch(this, function(err){
          def.reject(err);
        }));
      }else{
        def.resolve(featureSet);
      }
      return def;
    },

    //return a deferred object which resolves features
    //if silent is true, it won't show message box
    _getFeatures: function(/*silent*/){
      var def = new Deferred();
      var features = [];
      var info = this._getSelectedLayerInfomation();
      var type = info.type;
      if(type === 0){
        def.resolve(features);
      }else{
        if(this.selectionRadio.getStatus() && this.selectionRadio.getValue()){
          features = info.layer.getSelectedFeatures();
          def.resolve(features);
        }else{
          if(this.featureSetChooserForSingleLayer.isLoading()){
            def = this.featureSetChooserForSingleLayer.getFeatures();
          }else{
            var fs = this.featureSetChooserForSingleLayer.syncGetFeatures();
            if(fs.length > 0){
              features = fs;
              def.resolve(features);
            }else{
              if(type === 3){
                features = info.layer.graphics;
                def.resolve(features);
              }else{
                /*if(!silent){
                  new Message({
                    message: this.nls.selectFeaturesOrDrawShapesTip
                  });
                }
                def.reject({
                  type: clazz.NONE_SELECTED_FEATURES_NOT_DRAW_SHAPES,
                  message: this.nls.selectFeaturesOrDrawShapesTip
                });*/
                //type is 1 or 2
                def = this._getAllFeaturesFromFeaturelayer(info.layer);
              }
            }
          }
        }
      }
      return def;
    },

    _getAllFeaturesFromFeaturelayer: function(featureLayer){
      var def = new Deferred();

      if(this._layerAllFeaturesCache[featureLayer.id]){
        def.resolve(this._layerAllFeaturesCache[featureLayer.id]);
      }else{
        var layerDefinition = jimuUtils.getFeatureLayerDefinition(featureLayer);
        if(!layerDefinition){
          layerDefinition = {
            currentVersion: featureLayer.currentVersion,
            fields: lang.clone(featureLayer.fields)
          };
        }

        // var options = {};
        // options.url = featureLayer.url;
        // options.layerInfo = layerDefinition;
        // options.spatialReference = this.map.spatialReference;
        // options.where = featureLayer.getDefinitionExpression();
        // if(!options.where){
        //   options.where = "1=1";
        // }
        // options.geometry = null;
        // options.outFields = [];

        this.emit("loading");
        // var query = new JimuQuery(options);
        // //return a deferred object which resolves {status,count,features}
        // //if status > 0, means we get all features
        // //if status < 0, means count is big, so we can't get features
        // query.getFeatures().then(lang.hitch(this, function(result){
        //   this.emit("unloading");
        //   if(result.status > 0){
        //     var features = result.features || [];
        //     this._layerAllFeaturesCache[featureLayer.id] = features;
        //     def.resolve(features);
        //   }else{
        //     def.reject("Can't get all features from featureLayer " + featureLayer.id);
        //   }
        // }), lang.hitch(this, function(err){
        //   this.emit("unloading");
        //   def.reject(err);
        // }));
        var query = new EsriQuery();
        query.where = featureLayer.getDefinitionExpression() || "1=1";
        query.geometry = null;
        query.outSpatialReference = this.map.spatialReference;
        query.returnGeometry = true;
        // query.spatialRelationship = this.query.spatialRelationship;
        // query.outFields = ["*"];
        var loader = new JimuQuery({
          url: featureLayer.url,
          query: query
        });
        loader.getAllFeatures().then(lang.hitch(this, function(response){
          this.emit("unloading");
          if(response){
            var features = response.features || [];
            this._layerAllFeaturesCache[featureLayer.id] = features;
            def.resolve(features);
          }else{
            def.reject("Can't get all features from featureLayer " + featureLayer.id);
          }
        }), lang.hitch(this, function(err){
          this.emit("unloading");
          def.reject(err);
        }));
      }

      return def;
    },

    _syncGetFeatures: function(){
      var features = [];
      var info = this._getSelectedLayerInfomation();
      var type = info.type;
      if (type !== 0) {
        if(this.selectionRadio.getStatus() && this.selectionRadio.getValue()){
          features = info.layer.getSelectedFeatures();
        }else{
          features = this.featureSetChooserForSingleLayer.syncGetFeatures();

          if(features.length === 0){
            if(type === 3){
              features = info.layer.graphics;
            }else{
              var cachedFeatures = this._layerAllFeaturesCache[info.layer.id];
              if(cachedFeatures){
                features = cachedFeatures;
              }
            }
          }
        }
      }
      return features;
    },

    isLoading: function(){
      return this.featureSetChooserForSingleLayer && this.featureSetChooserForSingleLayer.isLoading();
    },

    _onLoading: function(){
      // this.drawBox.deactivate();
      if (this.showLoading) {
        this.loading.show();
      }
      this.emit('loading');
    },

    _onUnloading: function(){
      this.loading.hide();
      this.emit('unloading');
    },

    _showAllLayers: function(){
      if(this._bufferLayer){
        this._bufferLayer.show();
      }
    },

    _hideAllLayers: function(){
      if(this._bufferLayer){
        this._bufferLayer.hide();
      }
    },

    _onRadioChanged: function(){
      if(this.selectionRadio.getValue()){
        if(this.featureSetChooserForSingleLayer){
          this.featureSetChooserForSingleLayer.deactivate();
          this.featureSetChooserForSingleLayer.clearAllGraphics();
        }
      }
      this._updateBuffer();
    },

    /*-----------------------------layerChooserFromMapWithDropbox------------------------------------------*/

    //type 0 means doesn't select any layer
    //type 1 means layer exist in map
    //type 2 means layer exist in MapService
    //type 3 means feature collection
    _getSelectedLayerInfomation: function(){
      var type = 0;//0 means doesn't select any layer
      var layerItem = null;
      var layer = null;
      var items = this.layerChooserFromMapWithDropbox.getSelectedItems();
      if(items.length > 0){
        layerItem = items[0];
      }
      if(layerItem){
        var layerInfo = layerItem.layerInfo;
        layer = layerInfo.layerObject;
        if(layer.url){
          if(this.map.graphicsLayerIds.indexOf(layer.id) >= 0){
            //layer exist in map
            type = 1;
          }else{
            //layer exist in MapService
            type = 2;
          }
        }else{
          //feature collection
          type = 3;
        }
      }

      return {
        type: type,
        layerItem: layerItem,
        layer: layer
      };
    },

    _onLayerChanged: function(){
      this.clearAllGraphics();
      this._clearSelectionHandle();
      this._updateSelectedFeaturesCount();
      if(this.featureSetChooserForSingleLayer){
        this.featureSetChooserForSingleLayer.destroy();
      }
      this.featureSetChooserForSingleLayer = null;
      var info = this._getSelectedLayerInfomation();
      var type = info.type;
      if(type > 0){
        this.featureSetChooserForSingleLayer = new FeatureSetChooserForSingleLayer({
          map: this.map,
          featureLayer: info.layer,
          updateSelection: false
        });
        this._selectionHandle = on(info.layer, 'selection-complete', lang.hitch(this, function() {
          var oldUseSelectedChecked = this.selectionRadio.getStatus() && this.selectionRadio.getValue();
          this._updateSelectedFeaturesCount();
          if(oldUseSelectedChecked){
            this._updateBuffer();
          }
        }));

        this.own(on(this.featureSetChooserForSingleLayer, 'user-clear', lang.hitch(this, this._onUserClear)));
        this.own(on(this.featureSetChooserForSingleLayer, 'loading', lang.hitch(this, lang.hitch(this, function(){
          this._clearBufferLayer();
          this._onLoading();
        }))));
        this.own(on(this.featureSetChooserForSingleLayer, 'unloading', lang.hitch(this, lang.hitch(this, function(){
          this._onUnloading();
          this._updateBuffer();
        }))));
        this.featureSetChooserForSingleLayer.placeAt(this.featureSetChooserDiv);
        //uncheck "Use selected features" option when begin drawing
        this.own(on(this.featureSetChooserForSingleLayer, 'draw-activate', lang.hitch(this, function(){
          this.uncheckSelectedFeaturesRadio();
        })));
      }
      this._updateFeatureSetChooserForSingleLayerStatus();
      this._updateBuffer();
    },

    _onLayerInfosIsShowInMapChanged: function(){
      this._updateFeatureSetChooserForSingleLayerStatus();
    },

    _onSearchDistanceChange: function(){
      this._updateBuffer();
      this.emit('search-distance-change');
    },

    _updateFeatureSetChooserForSingleLayerStatus: function(){
      if(!this.featureSetChooserForSingleLayer){
        return;
      }
      var shouldEnable = false;
      var featureLayer = this.featureSetChooserForSingleLayer.getFeatureLayer();
      var layerInfo = this.layerInfosObj.getLayerInfoById(featureLayer.id);
      if (layerInfo) {
        shouldEnable = layerInfo.isShowInMap();
      }
      if(shouldEnable){
        this.featureSetChooserForSingleLayer.enable();
        html.removeClass(this.featureSetChooserForSingleLayer.domNode, 'not-visible');
      }else{
        this.featureSetChooserForSingleLayer.disable();
        this.featureSetChooserForSingleLayer.clearAllGraphics();
        html.addClass(this.featureSetChooserForSingleLayer.domNode, 'not-visible');
        this._updateBuffer();
      }
    },

    //geometry is the combined geometry of selected features
    _updateBuffer: function(){
      this._clearBufferLayer();

      var data = this.searchDistance.getData();
      var status = data.status;
      var distance = data.distance;
      var bufferUnit = data.bufferUnit;

      if(status < 0){
        //satatus < 0 means SearchDistance is enabled with valid distance number
        return null;
      }

      var features = this._syncGetFeatures();

      var combinedFeatureGeometry = null;
      var geometries = [];

      array.forEach(features, lang.hitch(this, function(feature){
        if(feature && feature.geometry){
          geometries.push(feature.geometry);
        }
      }));

      if(geometries.length > 0){
        if(geometries[0].type === 'polygon'){
          //#7394
          combinedFeatureGeometry = geometryEngine.union(geometries);
        }else{
          combinedFeatureGeometry = jimuUtils.combineGeometries(geometries);
        }
      }

      if(status === 0){
        return combinedFeatureGeometry;
      }

      if(combinedFeatureGeometry){
        combinedFeatureGeometry = geometryEngine.simplify(combinedFeatureGeometry);
        var sr = combinedFeatureGeometry.spatialReference;
        var bufferGeometry = null;
        if(sr.isWebMercator() || sr.wkid === 4326){
          bufferGeometry = geometryEngine.geodesicBuffer(combinedFeatureGeometry, distance, bufferUnit, true);
        }else{
          bufferGeometry = geometryEngine.buffer(combinedFeatureGeometry, distance, bufferUnit, true);
        }
        var bufferGraphic = new Graphic(bufferGeometry);
        this._bufferLayer.add(bufferGraphic);
        return bufferGeometry;
      }

      return null;
    },

    _onUserClear: function(){
      this.clearAllGraphics();
    },

    _clearBufferLayer: function(){
      if(this._bufferLayer){
        this._bufferLayer.clear();
      }
    },

    _updateSelectedFeaturesCount: function(){
      this.selectionRadio.setStatus(true);
      var info = this._getSelectedLayerInfomation();
      var count = 0;
      if(info.layer){
        var features = info.layer.getSelectedFeatures();
        if(features){
          count = features.length;
        }
      }
      if(count === 0){
        if(this.selectionRadio.getValue()){
          this.selectionRadio.uncheck();
        }
        this.selectionRadio.setStatus(false);
        html.addClass(this.selectionOptionDiv, 'not-visible');
      }else{
        html.removeClass(this.selectionOptionDiv, 'not-visible');
      }
      var flag = window.isRTL ? "&rlm;" : " ";
      var label = this.nls.selectedFeatures + flag + "(" + count + ")";
      this.selectionRadio.setLabel(label);
    },

    _clearSelectionHandle: function(){
      if(this._selectionHandle){
        this._selectionHandle.remove();
      }
      this._selectionHandle = null;
    },

    destroy: function(){
      if(this._bufferLayer){
        this.map.removeLayer(this._bufferLayer);
      }
      this._bufferLayer = null;
      this._clearSelectionHandle();
      this.inherited(arguments);
    }

  });

  clazz.NONE_SELECTED_FEATURES_NOT_DRAW_SHAPES = "NONE_SELECTED_FEATURES_NOT_DRAW_SHAPES";

  return clazz;
});