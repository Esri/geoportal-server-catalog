/*
Copyright ©2014 Esri. All rights reserved.

TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
Unpublished material - all rights reserved under the
Copyright Laws of the United States and applicable international
laws, treaties, and conventions.

For additional information, contact:
Attn: Contracts and Legal Department
Environmental Systems Research Institute, Inc.
380 New York Street
Redlands, California, 92373
USA

email: contracts@esri.com
*/

define([
  'dojo/_base/array',
  'jimu/LayerInfos/LayerInfos'
], function(array, LayerInfos) {

  var mo = {};

  mo.getLayerInfosParam = function() {
    // summary:
    //   get layerInfos parameter for create/refresh/settingPage in legend dijit.
    // description:
    var layerInfosParamFromCurrentMap = getLayerInfosParamFromCurrentMap();
    return layerInfosParamFromCurrentMap;
  };

  mo.getLayerInfosParamByConfig = function(legendConfig) {
    var layerInfosParam     = [];
    var layerInfosParamFromCurrentMap;
    if(legendConfig.layerInfos && legendConfig.layerInfos.length) {
      layerInfosParamFromCurrentMap = getLayerInfosParamFromCurrentMap();
      // respect config
      array.forEach(layerInfosParamFromCurrentMap, function(layerInfoParam) {
        var layerInfoConfig = getLayerInfoConfigById(legendConfig, layerInfoParam.jimuLayerInfo.id);
        if(layerInfoConfig) {
          layerInfoParam.hideLayers = layerInfoConfig.hideLayers;
          layerInfosParam.push(layerInfoParam);
        }
      });
    }
    return layerInfosParam;
  };

  var getLayerInfosParamFromCurrentMap = function() {
    var layerInfosParam     = [];
    var jimuLayerInfos      = LayerInfos.getInstanceSync();
    var jimuLayerInfoArray  = jimuLayerInfos.getLayerInfoArray();
    array.forEach(jimuLayerInfoArray, function(topLayerInfo) {
      var hideLayers = [];
      if(topLayerInfo.getShowLegendOfWebmap()) {
        // temporary code.
        if(topLayerInfo.layerObject &&
           (topLayerInfo.layerObject.declaredClass === 'esri.layers.ArcGISDynamicMapServiceLayer' ||
            topLayerInfo.layerObject.declaredClass === 'esri.layers.ArcGISTiledMapServiceLayer')) {
          topLayerInfo.traversal(function(layerInfo) {
            if(layerInfo.isLeaf() && !layerInfo.getShowLegendOfWebmap()) {
              hideLayers.push(layerInfo.originOperLayer.mapService.subId);
            }
          });
        }
        // add to layerInfosparam
        if(topLayerInfo.isMapNotesLayerInfo()) {
          array.forEach(topLayerInfo.getSubLayers(), function(mapNotesSubLayerInfo) {
            var layerInfoParam = {
              layer: mapNotesSubLayerInfo.layerObject,
              title: "Map Notes - " + mapNotesSubLayerInfo.title
            };
            layerInfosParam.push(layerInfoParam);
          });
        } else {
          var layerInfoParam = {
            hideLayers: hideLayers,
            layer: topLayerInfo.layerObject,
            title: topLayerInfo.title
          };
          layerInfosParam.push(layerInfoParam);
        }
      }
    });
    return layerInfosParam.reverse();
  };

  var getLayerInfoConfigById = function(legendConfig, id) {
    var layerInfoConfig = array.filter(legendConfig.layerInfos, function(layerInfoConfig) {
      var result = false;
      if(layerInfoConfig.id === id) {
        result = true;
      }
      return result;
    });
    return layerInfoConfig[0];
  };
  return mo;
});
