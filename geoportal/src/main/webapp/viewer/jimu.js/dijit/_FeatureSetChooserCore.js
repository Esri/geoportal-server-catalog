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

define([
  'dojo/on',
  'dojo/sniff',
  'dojo/Evented',
  'dojo/Deferred',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/_base/declare',
  'jimu/utils',
  'jimu/symbolUtils',
  'jimu/SelectionManager',
  'jimu/LayerInfos/LayerInfos',
  'esri/graphic',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'esri/layers/FeatureLayer',
  'esri/symbols/jsonUtils',
  'esri/geometry/geometryEngine'
],
function(on, sniff, Evented, Deferred, lang, array, declare, jimuUtils, symbolUtils, SelectionManager,
  LayerInfos, Graphic, EsriQuery, QueryTask, FeatureLayer, symbolJsonUtils, geometryEngine) {

  return declare([Evented], {
    baseClass: 'jimu-featureset-chooser-core',
    _middleFeatureLayer: null,//FeatureLayer, _middleFeatureLayer is used when updateSelection is false
    _isLoading: false,
    _def: null,
    _isDestroyed: false,
    _handles: null,
    selectionManager: null,
    layerInfosObj: null,

    //constructor options:
    map: null,
    featureLayer: null,//featureLayer maybe under map service
    drawBox: null,
    updateSelection: false,
    fullyWithin: false,

    //public methods:
    //clear
    //isLoading
    //destroy
    //getFeatures, return a deferred object which resolves features

    //events:
    //loading
    //unloading

    //test urls:
    //http://sampleserver6.arcgisonline.com/arcgis/rest/services/Military/FeatureServer/2

    constructor: function(options){
      lang.mixin(this, options);

      this.layerInfosObj = LayerInfos.getInstanceSync();

      this.selectionManager = SelectionManager.getInstance();
      if(!this.featureLayer.getSelectionSymbol()){
        this.selectionManager.setSelectionSymbol(this.featureLayer);
      }

      //init _middleFeatureLayer
      var layerDefinition = jimuUtils.getFeatureLayerDefinition(this.featureLayer);
      delete layerDefinition.id;
      this._middleFeatureLayer = new FeatureLayer({
        layerDefinition: layerDefinition,
        featureSet: null
      }, {
        id: "featureLayer_" + jimuUtils.getRandomString()
      });
      var middleLayerSelectionSymbol = null;
      var geometryType = this._middleFeatureLayer.geometryType;
      if (geometryType === 'esriGeometryPoint') {
        middleLayerSelectionSymbol = symbolUtils.getDefaultMarkerSymbol();
      } else if (geometryType === 'esriGeometryPolyline') {
        middleLayerSelectionSymbol = symbolUtils.getDefaultLineSymbol();
      } else if (geometryType === 'esriGeometryPolygon') {
        middleLayerSelectionSymbol = symbolJsonUtils.fromJson({
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
      }
      this._middleFeatureLayer.setSelectionSymbol(middleLayerSelectionSymbol);

      //init DrawBox
      var handle1 = on(this.drawBox, 'user-clear', lang.hitch(this, this._onDrawBoxUserClear));
      var handle2 = on(this.drawBox, 'draw-end', lang.hitch(this, this._onDrawEnd));
      this._handles = [handle1, handle2];

      // this.own(on(this.featureLayer, 'visibility-change', lang.hitch(this, function(){
      //   if(this.featureLayer.visible){
      //     this.drawBox.enable();
      //   }else{
      //     this.drawBox.disable();
      //   }
      // })));
    },

    //private method
    hideMiddleFeatureLayer: function(){
      if(this._middleFeatureLayer){
        this._middleFeatureLayer.hide();
        var displayLayer = this.selectionManager.getDisplayLayer(this._middleFeatureLayer.id);
        if(displayLayer){
          displayLayer.hide();
        }
      }
    },

    //private method
    showMiddleFeatureLayer: function(){
      if(this._middleFeatureLayer){
        this._middleFeatureLayer.show();
        var displayLayer = this.selectionManager.getDisplayLayer(this._middleFeatureLayer.id);
        if(displayLayer){
          displayLayer.show();
        }
      }
    },

    clear: function(shouldClearSelection){
      this.drawBox.clear();
      this._clearMiddleFeatureLayer();
      //should not clear this.featureLayer's display layer
      //this.selectionManager.clearDisplayLayer(this.featureLayer);
      if(shouldClearSelection){
        this.selectionManager.clearSelection(this.featureLayer);
      }
    },

    getFeatures: function(){
      var def = new Deferred();
      var callback = lang.hitch(this, function(){
        var selectedFeatures = this.syncGetFeatures();
        def.resolve(selectedFeatures);
      });
      var errback = lang.hitch(this, function(err){
        def.reject(err);
      });
      if(this._getDeferredStatus(this._def) === 1){
        this._def.then(callback, errback);
      }else{
        callback();
      }
      return def;
    },

    syncGetFeatures: function(){
      var layer = this.updateSelection ? this.featureLayer : this._middleFeatureLayer;
      var selectedFeatures = layer.getSelectedFeatures();
      return selectedFeatures;
    },

    isLoading: function(){
      return this._getDeferredStatus(this._def) === 1;
    },

    _onLoading: function(){
      this.drawBox.deactivate();
      this.emit('loading');
    },

    _onUnloading: function(){
      this.emit('unloading');
    },

    //-1: def is rejected
    //0: def is null
    //1: def is not fullfilled
    //2: def is resolved
    _getDeferredStatus: function(def){
      var status = 0;
      if(def){
        if(def.isResolved()){
          status = 2;
        }else if(def.isRejected()){
          status = -1;
        }else{
          status = 1;
        }
      }else{
        status = 0;
      }
      return status;
    },

    _onDrawEnd: function(g, geotype, commontype, shiftKey, ctrlKey, metaKey){
      console.log(geotype, commontype);
      if(this.isLoading()){
        //should throw exception here
        throw "should not draw when loading";
      }

      if(!this.featureLayer.visible){
        return;
      }

      var def = new Deferred();
      this._def = def;

      var selectionMethod = FeatureLayer.SELECTION_NEW;

      if (shiftKey) {
        selectionMethod = FeatureLayer.SELECTION_ADD;
      }

      if(sniff('mac')){
        if (metaKey) {
          selectionMethod = FeatureLayer.SELECTION_SUBTRACT;
        }
      }else{
        if (ctrlKey) {
          selectionMethod = FeatureLayer.SELECTION_SUBTRACT;
        }
      }

      this.emit('loading');

      this._getFeaturesByGeometry(g.geometry).then(lang.hitch(this, function(features){
        var layer = this.updateSelection ? this.featureLayer : this._middleFeatureLayer;
        this.selectionManager.updateSelectionByFeatures(layer, features, selectionMethod);
        this._onUnloading();
        def.resolve(features);
      }), lang.hitch(this, function(err){
        console.error(err);
        this._onUnloading();
        def.reject(err);
      }));
    },

    _addTolerance: function(geometry) {
      // Add tolorence of 10px based on current map scale, use fixed dpi 96
      var resolution = this.map.getScale() * 2.54 / 9600; // meters of each pixel
      return geometryEngine.buffer(geometry, 10 * resolution, 'meters');
    },

    _getFeaturesByGeometry: function(geometry){
      if (geometry.type === 'point') {
        geometry = this._addTolerance(geometry);
      }
      var def = new Deferred();
      var features = [];
      if(this.featureLayer.getMap()){
        //layer is a normal FeatureLayer or a FeatureCollection
        var graphics = this.selectionManager.getClientFeaturesByGeometry(this.featureLayer, geometry, this.fullyWithin);
        //we should copy features
        if(graphics.length > 0){
          features = array.map(graphics, lang.hitch(this, function(g){
            return new Graphic(g.toJson());
          }));
        }
        def.resolve(features);
      }else{
        //layer is a virtual FeatureLayer under MapService
        var queryParams = new EsriQuery();
        queryParams.geometry = geometry;
        queryParams.outSpatialReference = this.map.spatialReference;
        queryParams.returnGeometry = true;
        if(this.fullyWithin){
          queryParams.spatialRelationship = EsriQuery.SPATIAL_REL_CONTAINS;
        }else{
          queryParams.spatialRelationship = EsriQuery.SPATIAL_REL_INTERSECTS;
        }
        var where = this.featureLayer.getDefinitionExpression();
        if(!where){
          where = "1=1";
        }
        var layerInfo = this.layerInfosObj.getLayerInfoById(this.featureLayer.id);
        if(layerInfo){
          var filter = layerInfo.getFilter();
          if(filter){
            where = "(" + where + ") AND (" + filter + ")";
          }
        }
        if(where){
          queryParams.where = where;
        }
        //queryParams.outFields should include required fields, such as OBJECTID
        //OBJECTID is used when call _selectHandler method
        queryParams.outFields = ['*'];
        var queryTask = new QueryTask(this.featureLayer.url);
        queryTask.execute(queryParams).then(lang.hitch(this, function(response){
          def.resolve(response.features);
        }), lang.hitch(this, function(err){
          def.reject(err);
        }));
      }
      return def;
    },

    _onDrawBoxUserClear: function(){
      this.clear();
    },

    _clearMiddleFeatureLayer: function(){
      if(this._middleFeatureLayer){
        this._middleFeatureLayer.clear();
        this.selectionManager.clearSelection(this._middleFeatureLayer);
      }
    },

    destroy: function(){
      if (!this._isDestroyed) {
        array.forEach(this._handles, lang.hitch(this, function(handle){
          handle.remove();
        }));
        this._handles = null;
        this.clear();
      }
      this._isDestroyed = true;
    }

  });
});