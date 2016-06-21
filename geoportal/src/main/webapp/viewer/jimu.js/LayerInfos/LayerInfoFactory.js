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
  'dojo/Deferred'
], function(declare, lang, Deferred) {
  var instance = null,
    clazz = declare(null, {
      constructor: function() {
        //this.map = map;
      },

      init: function() {
        var retDef = new Deferred();
        require(['jimu/LayerInfos/LayerInfoForCollection',
          'jimu/LayerInfos/LayerInfoForMapService',
          'jimu/LayerInfos/LayerInfoForKML',
          'jimu/LayerInfos/LayerInfoForGeoRSS',
          'jimu/LayerInfos/LayerInfoForDefault',
          'jimu/LayerInfos/LayerInfoForWMS',
          'jimu/LayerInfos/LayerInfoForGroup',
          'jimu/LayerInfos/LayerInfoForDefaultDynamic',
          'jimu/LayerInfos/LayerInfoForDefaultTile',
          'jimu/LayerInfos/LayerInfoForDefaultWMS',
          'jimu/LayerInfos/LayerInfoForDefaultTable',
          'jimu/LayerInfos/LayerInfoForDefaultImage',
          'jimu/LayerInfos/LayerInfoForDefaultStream'
        ], lang.hitch(this, function(
          LayerInfoForCollection,
          LayerInfoForMapService,
          LayerInfoForKML,
          LayerInfoForGeoRSS,
          LayerInfoForDefault,
          LayerInfoForWMS,
          LayerInfoForGroup,
          LayerInfoForDefaultDynamic,
          LayerInfoForDefaultTile,
          LayerInfoForDefaultWMS,
          LayerInfoForDefaultTable,
          LayerInfoForDefaultImage,
          LayerInfoForDefaultStream) {
          this.LayerInfoForCollection = LayerInfoForCollection;
          this.LayerInfoForMapService = LayerInfoForMapService;
          this.LayerInfoForKML = LayerInfoForKML;
          this.LayerInfoForGeoRSS = LayerInfoForGeoRSS;
          this.LayerInfoForDefault = LayerInfoForDefault;
          this.LayerInfoForWMS = LayerInfoForWMS;
          this.LayerInfoForGroup = LayerInfoForGroup;
          this.LayerInfoForDefaultDynamic = LayerInfoForDefaultDynamic;
          this.LayerInfoForDefaultTile = LayerInfoForDefaultTile;
          this.LayerInfoForDefaultWMS = LayerInfoForDefaultWMS;
          this.LayerInfoForDefaultTable = LayerInfoForDefaultTable;
          this.LayerInfoForDefaultImage = LayerInfoForDefaultImage;
          this.LayerInfoForDefaultStream = LayerInfoForDefaultStream;
          retDef.resolve();
        }));
        return retDef;
      },

      create: function(operLayer) {
        if (operLayer.featureCollection) {
          return new this.LayerInfoForCollection(operLayer, this.map, this.options);
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.KMLLayer') {
          return new this.LayerInfoForKML(operLayer, this.map, this.options);
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.GeoRSSLayer') {
          return new this.LayerInfoForGeoRSS(operLayer, this.map, this.options);
        } else if ((operLayer.layerObject.declaredClass === 'esri.layers.WMSLayer') &&
                !operLayer.selfType) {
          return new this.LayerInfoForWMS(operLayer, this.map, this.options);
          //} else if (operLayer.layerObject && operLayer.layerObject.layerInfos) {
        } else if (
            operLayer.layerObject.declaredClass === 'esri.layers.ArcGISDynamicMapServiceLayer' ||
            operLayer.layerObject.declaredClass === 'esri.layers.ArcGISTiledMapServiceLayer') {
          return new this.LayerInfoForMapService(operLayer, this.map, this.options);
          //} else if (operLayer.layerObject) {
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.ArcGISImageServiceLayer' ||
         operLayer.layerObject.declaredClass === 'esri.layers.ArcGISImageServiceVectorLayer') {
          return new this.LayerInfoForDefaultImage(operLayer, this.map, this.options);
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.StreamLayer') {
          return new this.LayerInfoForDefaultStream(operLayer, this.map, this.options);
        } else {
          if(operLayer.layerObject.type === "Table"){
            operLayer.selfType = "table";
          }
          switch (operLayer.selfType) {
          case 'mapservice_dynamic_group':
            return new this.LayerInfoForGroup(operLayer, this.map, this.options);
          case 'mapservice_tiled_group':
            return new this.LayerInfoForGroup(operLayer, this.map, this.options, true);
          case 'mapservice_dynamic':
            return new this.LayerInfoForDefaultDynamic(operLayer, this.map, this.options);
          case 'mapservice_tiled':
            return new this.LayerInfoForDefaultTile(operLayer, this.map, this.options);
          case 'wms':
            return new this.LayerInfoForDefaultWMS(operLayer, this.map, this.options);
          case 'table':
            return new this.LayerInfoForDefaultTable(operLayer, this.map, this.options);
          default:
            return new this.LayerInfoForDefault(operLayer, this.map, this.options);
          }
        }
      }
    });

  clazz.getInstance = function(map, options) {
    if (instance === null) {
      instance = new clazz();
      instance.options = options;
    }
    // map can be changed.
    if(map) {
      instance.map = map;
    }

    return instance;
  };
  return clazz;
});
