///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
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
  'dojo/_base/html',
  'dojo/Deferred',
  './LayerInfoForDefault',
  'esri/layers/FeatureLayer'
], function(declare, lang, html, Deferred, LayerInfoForDefault, FeatureLayer) {
  return declare(LayerInfoForDefault, {
    isTable:         null,
    constructor: function() {
      this.newSubLayers = [];
      this.isTable = true;
    },

    init: function() {
    },

    getLayerObject: function() {
      var def = new Deferred();
      if(this.layerObject.empty) {
        if(this.layerObject.url) {
          this.layerObject = new FeatureLayer(this.layerObject.url,
                                              this.originOperLayer.options || {});
          this.layerObject.on('load', lang.hitch(this, function() {
            def.resolve(this.layerObject);
          }));
          this.layerObject.on('error', lang.hitch(this, function(/*err*/) {
            //def.reject(err);
            def.resolve(null);
          }));
        } else if(this.layerObject.featureCollectionData){
          this.layerObject = new FeatureLayer(this.layerObject.featureCollectionData,
                                              this.originOperLayer.options || {});
          // this.layerObject.on('load', lang.hitch(this, function() {
          //   def.resolve(this.layerObject);
          // }));
          // this.layerObject.on('error', lang.hitch(this, function(/*err*/) {
          //   //def.reject(err);
          //   def.resolve(null);
          // }));
          def.resolve(this.layerObject);
        } else {
          def.resolve(null);
        }
      } else {
        def.resolve(this.layerObject);
      }
      return def;
    },

    getLayerType: function() {
      var def = new Deferred();
      def.resolve("Table");
      return def;
    },

    isVisible: function() {
      return false;
    },

    isLeaf: function() {
      return true;
    },

    isRootLayer: function() {
      return false;
    },

    createLegendsNode: function() {
      var legendsNode = html.create("div", {
        "class": "legends-div"
      });
      return legendsNode;
    },

    _initControlPopup: function() {
      this.controlPopupInfo = {
        enablePopup: undefined,
        infoTemplate: undefined
      };
    }
  });
});
