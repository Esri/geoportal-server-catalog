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
  'jimu/LayerInfos/LayerInfoForCollection',
  'jimu/LayerInfos/LayerInfoForMapService',
  'jimu/LayerInfos/LayerInfoForKML',
  'jimu/LayerInfos/LayerInfoForGeoRSS',
  'jimu/LayerInfos/LayerInfoForDefault',
  'jimu/LayerInfos/LayerInfoForWMS',
  //'jimu/LayerInfos/LayerInfoForGroup',
  'jimu/LayerInfos/LayerInfoForDefaultDynamic',
  'jimu/LayerInfos/LayerInfoForDefaultTile',
  'jimu/LayerInfos/LayerInfoForDefaultWMS',
  'jimu/LayerInfos/LayerInfoForDefaultTable',
  'jimu/LayerInfos/LayerInfoForDefaultImage',
  'jimu/LayerInfos/LayerInfoForDefaultStream'
], function(
  declare,
  LayerInfoForCollection,
  LayerInfoForMapService,
  LayerInfoForKML,
  LayerInfoForGeoRSS,
  LayerInfoForDefault,
  LayerInfoForWMS,
  //LayerInfoForGroup,
  LayerInfoForDefaultDynamic,
  LayerInfoForDefaultTile,
  LayerInfoForDefaultWMS,
  LayerInfoForDefaultTable,
  LayerInfoForDefaultImage,
  LayerInfoForDefaultStream
) {
  var instance = null,
    clazz = declare(null, {
      constructor: function() {
        //this.map = map;
      },

      create: function(operLayer) {
        if (operLayer.featureCollection) {
          return new LayerInfoForCollection(operLayer, this.map, this, this.layerInfosInstanceWrap);
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.KMLLayer') {
          return new LayerInfoForKML(operLayer, this.map, this, this.layerInfosInstanceWrap);
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.GeoRSSLayer') {
          return new LayerInfoForGeoRSS(operLayer, this.map, this, this.layerInfosInstanceWrap);
        } else if ((operLayer.layerObject.declaredClass === 'esri.layers.WMSLayer') &&
                !operLayer.selfType) {
          return new LayerInfoForWMS(operLayer, this.map, this, this.layerInfosInstanceWrap);
          //} else if (operLayer.layerObject && operLayer.layerObject.layerInfos) {
        } else if (
            operLayer.layerObject.declaredClass === 'esri.layers.ArcGISDynamicMapServiceLayer' ||
            operLayer.layerObject.declaredClass === 'esri.layers.ArcGISTiledMapServiceLayer') {
          return new LayerInfoForMapService(operLayer, this.map, this, this.layerInfosInstanceWrap);
          //} else if (operLayer.layerObject) {
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.ArcGISImageServiceLayer' ||
         operLayer.layerObject.declaredClass === 'esri.layers.ArcGISImageServiceVectorLayer') {
          return new LayerInfoForDefaultImage(operLayer, this.map, this, this.layerInfosInstanceWrap);
        } else if (operLayer.layerObject.declaredClass === 'esri.layers.StreamLayer') {
          return new LayerInfoForDefaultStream(operLayer, this.map, this, this.layerInfosInstanceWrap);
        } else {
          if(operLayer.layerObject.type === "Table"){
            operLayer.selfType = "table";
          }
          switch (operLayer.selfType) {
          /*
          case 'mapservice_dynamic_group':
            return new LayerInfoForGroup(operLayer, this.map, this);
          case 'mapservice_tiled_group':
            return new LayerInfoForGroup(operLayer, this.map, this, true);
          */
          case 'mapservice_dynamic_group':
          case 'mapservice_dynamic':
            return new LayerInfoForDefaultDynamic(operLayer, this.map, this, this.layerInfosInstanceWrap);
          case 'mapservice_tiled_group':
          case 'mapservice_tiled':
            return new LayerInfoForDefaultTile(operLayer, this.map, this, this.layerInfosInstanceWrap);
          case 'wms':
            return new LayerInfoForDefaultWMS(operLayer, this.map, this, this.layerInfosInstanceWrap);
          case 'table':
            return new LayerInfoForDefaultTable(operLayer, this.map, this, this.layerInfosInstanceWrap);
          default:
            return new LayerInfoForDefault(operLayer, this.map, this, this.layerInfosInstanceWrap);
          }
        }
      }
    });

  clazz.getInstance = function(map, layerInfosInstanceWrap) {
    if (instance === null) {
      instance = new clazz();
    }
    // map can be changed.
    if(map) {
      instance.map = map;
    }
    if(layerInfosInstanceWrap) {
      instance.layerInfosInstanceWrap = layerInfosInstanceWrap;
    }

    return instance;
  };
  return clazz;
});
