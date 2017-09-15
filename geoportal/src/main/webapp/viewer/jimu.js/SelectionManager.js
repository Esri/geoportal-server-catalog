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
    'dojo/_base/Deferred',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/geometry/geometryEngine',
    'esri/graphic',
    'esri/Color',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol'
  ],
  function(declare, Deferred, lang, array, topic, FeatureLayer, GraphicsLayer, geometryEngine,
    Graphic, Color, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol) {
    var instance = null;

    var clazz = declare(null, {

      constructor: function(){
        if(window.isBuilder){
          topic.subscribe("app/mapLoaded", lang.hitch(this, this._onMapLoaded));
          topic.subscribe("app/mapChanged", lang.hitch(this, this._onMapChanged));
        }else{
          topic.subscribe("mapLoaded", lang.hitch(this, this._onMapLoaded));
          topic.subscribe("mapChanged", lang.hitch(this, this._onMapChanged));
        }
      },

      /**
       * The display layers(GraphicsLayer) for layer in mapService. The display layer is used for show highlight.
       * For feature layer in map, we don't need display layer because the feature layer will show the highlight.
       * @type {Object}
       */
      _displayLayers: {},

      setSelectionSymbol: function(layer){
        var type = layer.geometryType;
        var markerCircleStyle = SimpleMarkerSymbol.STYLE_CIRCLE;
        var pointSymbol = new SimpleMarkerSymbol(markerCircleStyle, 16, null, Color.fromArray([0, 255, 255]));

        var lineSolidStyle = SimpleLineSymbol.STYLE_SOLID;
        var lineSymbol = new SimpleLineSymbol(lineSolidStyle, Color.fromArray([0, 255, 255]), 2);

        var fillSolidStyle = SimpleFillSymbol.STYLE_SOLID;
        var fillSymbol = new SimpleFillSymbol(fillSolidStyle, lineSymbol, Color.fromArray([0, 255, 255, 0.3]));

        if (type === 'esriGeometryPoint') {
          layer.setSelectionSymbol(pointSymbol);
        } else if (type === 'esriGeometryPolyline') {
          layer.setSelectionSymbol(lineSymbol);
        } else if (type === 'esriGeometryPolygon') {
          layer.setSelectionSymbol(fillSymbol);
        }
      },

      //features must have objectIdField attribute, such as OBJECTID
      updateSelectionByFeatures: function(layer, features, selectionMethod){
        if(features.length > 0){
          features = array.map(features, lang.hitch(this, function(feature){
            var value = null;
            if(layer.graphics.indexOf(feature) >= 0){
              value = new Graphic(feature.toJson());
            }else{
              value = feature;
            }
            value.wabIsTemp = true;
            return value;
          }));
        }

        //selectionMethod default value is SELECTION_NEW
        //def must be a dojo/_base/Deferred object, because it has callback method and API will call this method
        if(!layer.getSelectionSymbol()){
          this.setSelectionSymbol(layer);
        }
        var def = new Deferred();
        //def.then(function() {}, function() {});
        var response = {
          features: features
        };
        layer._selectHandler(response, selectionMethod, null, null, def);
        if(this._isLayerNeedDisplayLayer(layer)){
          if(!this._displayLayers[layer.id]){
            this._displayLayers[layer.id] = this._createDisplayLayer(layer);
          }
          this._updateDisplayLayer(layer);
        }
        return def;
      },

      //private method
      getDisplayLayer: function(featureLayerId){
        return this._displayLayers[featureLayerId];
      },

      setSelection: function(layer, features){
        return this.updateSelectionByFeatures(layer, features, FeatureLayer.SELECTION_NEW);
      },

      addFeaturesToSelection: function(layer, features){
        return this.updateSelectionByFeatures(layer, features, FeatureLayer.SELECTION_ADD);
      },

      removeFeaturesFromSelection: function(layer, features){
        return this.updateSelectionByFeatures(layer, features, FeatureLayer.SELECTION_SUBTRACT);
      },

      clearSelection: function(featureLayer){
        this.clearDisplayLayer(featureLayer);
        return this.updateSelectionByFeatures(featureLayer, [], FeatureLayer.SELECTION_NEW);
      },

      clearDisplayLayer: function(featureLayer){
        var displayLayer = this._displayLayers[featureLayer.id];
        if(displayLayer){
          displayLayer.clear();
        }
      },

      getClientFeaturesByGeometry: function(layer, geometry, fullyWithinGeometry){
        var features = array.filter(layer.graphics, lang.hitch(this, function(g) {
          if(fullyWithinGeometry){
            return geometryEngine.contains(geometry, g.geometry);
          }else{
            return geometryEngine.intersects(geometry, g.geometry);
          }
        }));
        return features;
      },

      getUnionGeometryBySelectedFeatures: function(layer){
        var unionGeometry = null;
        var features = layer.getSelectedFeatures();
        if (features.length > 0) {
          var geometries = array.map(features, lang.hitch(this, function(feature) {
            return feature.geometry;
          }));
          unionGeometry = geometryEngine.union(geometries);
        }
        return unionGeometry;
      },

      _createDisplayLayer: function(featureLayer){
        var displayLayer = new GraphicsLayer();
        displayLayer.id = "displayLayer_of_" + featureLayer.id;
        this.map.addLayer(displayLayer);
        return displayLayer;
      },

      _updateDisplayLayer: function(featureLayer){
        var selectFeatures = featureLayer.getSelectedFeatures();
        var displayLayer = this._displayLayers[featureLayer.id];
        this.clearDisplayLayer(featureLayer);
        var selectionSymbol = featureLayer.getSelectionSymbol();
        array.forEach(selectFeatures, lang.hitch(this, function(feature){
          feature.setSymbol(null);
          var graphic = new Graphic(feature.toJson());
          graphic.setSymbol(selectionSymbol);
          displayLayer.add(graphic);
        }));
      },

      _isLayerNeedDisplayLayer: function(featureLayer){
        return !featureLayer.getMap();
      },

      _onMapLoaded: function(map){
        this.map = map;
      },

      _onMapChanged: function(map){
        this.map = map;
      }
    });

    clazz.getInstance = function(){
      if(!instance){
        instance = new clazz();
        window._selectionManager = instance;
      }
      return instance;
    };

    return clazz;
  });