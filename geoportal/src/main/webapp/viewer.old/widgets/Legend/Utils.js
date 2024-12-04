/*
// Copyright © 2014 - 2018 Esri. All rights reserved.

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

  mo.getLayerInfosParam = function(config) {
    // summary:
    //   get layerInfos parameter for create/refresh/settingPage in legend dijit.
    // description:
    var layerInfosParamFromCurrentMap = getLayerInfosParamFromCurrentMap(config);
    return layerInfosParamFromCurrentMap;
  };

  var getLayerInfosParamFromCurrentMap = function(config) {
    var layerInfosParam     = [];
    var jimuLayerInfos      = LayerInfos.getInstanceSync();
    var jimuLayerInfoArray  = jimuLayerInfos.getLayerInfoArray();
    array.forEach(jimuLayerInfoArray, function(topLayerInfo) {
      var hideLayers = [];
      if(isShowLegend(topLayerInfo, config)) {
        // temporary code.
        if(topLayerInfo.layerObject &&
           (topLayerInfo.layerObject.declaredClass === 'esri.layers.ArcGISDynamicMapServiceLayer' ||
            topLayerInfo.layerObject.declaredClass === 'esri.layers.ArcGISTiledMapServiceLayer')) {
          // topLayerInfo.traversal(function(layerInfo) {
          //   if(layerInfo.isLeaf() && !layerInfo.getShowLegendOfWebmap()) {
          //     hideLayers.push(layerInfo.originOperLayer.mapService.subId);
          //   }
          // });
          var baseLayerInfos = topLayerInfo.layerObject.dynamicLayerInfos || topLayerInfo.layerObject.layerInfos;
          array.forEach(baseLayerInfos, function(jsapiLayerInfo) {
            var subLayerInfo = null;
            topLayerInfo.traversal(function(layerInfo) {
              if(layerInfo.subId === jsapiLayerInfo.id) {
                if(layerInfo.isLeaf() && !isShowLegend(layerInfo, config)) {
                  hideLayers.push(layerInfo.originOperLayer.mapService.subId);
                }
                subLayerInfo = layerInfo;
                return true;
              }
            });
            if(!subLayerInfo) {
              hideLayers.push(jsapiLayerInfo.id);
            }
          });
        }
        // add to layerInfosparam
        if(topLayerInfo.isMapNotesLayerInfo()) {
          array.forEach(topLayerInfo.getSubLayers(), function(mapNotesSubLayerInfo) {
            if(isShowLegend(mapNotesSubLayerInfo, config)) {
              var layerInfoParam = {
                layer: mapNotesSubLayerInfo.layerObject,
                title: "Map Notes - " + mapNotesSubLayerInfo.title
              };
              layerInfosParam.push(layerInfoParam);
            }
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

  mo.isSupportedLayerType = function(layer) {
    if (layer &&
        (layer.declaredClass === "esri.layers.ArcGISDynamicMapServiceLayer" ||
        (layer.declaredClass === "esri.layers.ArcGISImageServiceLayer" && layer.version >= 10.2) ||
        layer.declaredClass === "esri.layers.ArcGISImageServiceVectorLayer" ||
        layer.declaredClass === "esri.layers.ArcGISTiledMapServiceLayer" ||
        layer.declaredClass === "esri.layers.FeatureLayer" ||
        layer.declaredClass === "esri.layers.StreamLayer" ||
        layer.declaredClass === "esri.layers.KMLLayer" ||
        layer.declaredClass === "esri.layers.GeoRSSLayer" ||
        layer.declaredClass === "esri.layers.WMSLayer" ||
        layer.declaredClass === "esri.layers.WFSLayer" ||
        layer.declaredClass === "esri.layers.CSVLayer")) {
      return true;
    }
    return false;
  };
  /*
  function isShowLegend(layerInfo, config) {
    var isToggledOnLegend;
    var isShowLegendResult = true;
    var currentLayerInfo = layerInfo;
    while(currentLayerInfo) {
      isToggledOnLegend = config.layerState[currentLayerInfo.id] ?
                                config.layerState[currentLayerInfo.id].selected :
                                layerInfo._getShowLegendOfWebmap();
      isShowLegendResult = isShowLegendResult && isToggledOnLegend;
      currentLayerInfo = currentLayerInfo.parentLayerInfo;
    }

    return isShowLegendResult;
  }
  */

  function isShowLegend(layerInfo, config) {
    /*jshint unused: false*/
    var isShowLegendResult;
    if(layerInfo.isLeaf()) {
      isShowLegendResult = config.layerState[layerInfo.id] ?
                         config.layerState[layerInfo.id].selected :
                         layerInfo.getShowLegendOfWebmap();
    } else {
      isShowLegendResult = true;
    }
    return isShowLegendResult;
  }


  return mo;
});
