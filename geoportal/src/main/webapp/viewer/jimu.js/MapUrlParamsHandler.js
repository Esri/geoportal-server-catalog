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
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Deferred',
  'dojo/topic',
  'dojo/promise/all',
  'esri/geometry/Point',
  'esri/geometry/Extent',
  'esri/geometry/scaleUtils',
  'esri/SpatialReference',
  'esri/tasks/ProjectParameters',
  'esri/config',
  'esri/geometry/webMercatorUtils',
  'esri/symbols/jsonUtils',
  'esri/graphic',
  'esri/layers/GraphicsLayer',
  'esri/InfoTemplate',
  'esri/tasks/query',
  './utils',
  './LayerInfos/LayerInfos',
  './shareUtils'
], function(lang, array, Deferred, topic, all, Point, Extent, scaleUtils, SpatialReference,
  ProjectParameters, esriConfig, wmUtils, symbolJsonUtils, Graphic, GraphicsLayer, InfoTemplate,
  Query, jimuUtils, LayerInfos, shareUtils) {
  var mo = {};

  /**
   * Process the following URL parameters:
   * 1. set extent
   * 2. set point
   * 3. Find location or feature to open map
   * 4. Add point mark
   * 5. query
   */

  /* jshint maxlen: 500 */
  mo.postProcessUrlParams = function(urlParams, map){
    //urlParams have been decoded.
    if('extent' in urlParams){
      return setExtent(urlParams, map);
    }else if('center' in urlParams){
      return setCenter(urlParams, map);
    }else if('marker' in urlParams){
      return createMarker(urlParams, map);
    }else if('find' in urlParams){
      return sendMessageToSearch(urlParams);
    }else if('query' in urlParams){
      return queryFeature(urlParams, map);
    }
  };

  function setCenter(queryObject, map){
    //?center=-13044705.25,4036227.41,102113&level=12 or ?center=-13044705.25;4036227.41;102113&level=12
    //?center=-117.1825,34.0552&level=12 or ?center=-117.1825;34.0552&level=12
    var centerArray = queryObject.center.split(";");
    if (centerArray.length === 1) {
      centerArray = queryObject.center.split(",");
    }
    if (centerArray.length === 2 || centerArray.length === 3) {
      var x = parseFloat(centerArray[0]);
      var y = parseFloat(centerArray[1]);
      if (isNaN(x) || isNaN(y)) {
        x = parseFloat(centerArray[0]);
        y = parseFloat(centerArray[1]);
      }
      if (!isNaN(x) && !isNaN(y)) {
        var wkid = 4326;
        if (centerArray.length === 3 && !isNaN(centerArray[2])){
          wkid = parseInt(centerArray[2], 10);
        }

        var point = new Point(x, y, new SpatialReference(wkid));

        if(!sameSpatialReference(point.spatialReference, map.spatialReference)){
          project(point, map.spatialReference, function(geometries){
            map.centerAt(geometries[0]);
          }, function(){
            console.error('Project center point error.');
          });
        }else{
          map.centerAt(point);
        }
      }
    }
  }


  function setExtent(queryObject, map){
    //?extent=-13054125.21,4029134.71,-13032684.63,4041785.04,102100 or ?extent=-13054125.21;4029134.71;-13032684.63;4041785.04;102100
    //?extent=-117.2672,33.9927,-117.0746,34.1064 or ?extent=-117.2672;33.9927;-117.0746;34.1064
    var extArray = queryObject.extent.split(";");
    if (extArray.length === 1) {
      extArray = queryObject.extent.split(",");
    }
    if (extArray.length === 4 || extArray.length === 5) {
      var minx = parseFloat(extArray[0]);
      var miny = parseFloat(extArray[1]);
      var maxx = parseFloat(extArray[2]);
      var maxy = parseFloat(extArray[3]);
      if (isNaN(minx) || isNaN(minx) || isNaN(minx) || isNaN(minx)) {
        minx = parseFloat(extArray[0]);
        miny = parseFloat(extArray[1]);
        maxx = parseFloat(extArray[2]);
        maxy = parseFloat(extArray[3]);
      }
      if (!isNaN(minx) && !isNaN(miny) && !isNaN(maxx) && !isNaN(maxy)) {
        var wkid = 4326;
        if (extArray.length === 5 && !isNaN(extArray[4])) {
          wkid = parseInt(extArray[4], 10);
        }
        var ext = new Extent(minx, miny, maxx, maxy, new SpatialReference({wkid:wkid}));

        if (!sameSpatialReference(map.spatialReference, ext.spatialReference)) {

          var projectHandler = function(result) {
            map.setExtent(result[0]);
          };

          var projectErrorHandler = function() {
            console.error('Project extent error.');
          };
          // project extent
          project(ext, map.spatialReference, projectHandler, projectErrorHandler);
        } else {
          // same projection
          map.setExtent(ext);
        }
      } else {
        console.error('Wrong extent parameters.');
      }
    } else {
      console.error('Wrong extent parameters.');
    }
  }

  function createMarker(queryObject, map) {
    /*
    ?marker=-117;34;4326;My%20Title;http%3A//www.daisysacres.com/images/daisy_icon.gif;My%20location&level=10
    ?marker=-117,34,4326,My%20Title,http%3A//www.daisysacres.com/images/daisy_icon.gif,My%20location&level=10
    ?marker=-13044705.25,4036227.41,102100,My%20Title,http%3A//www.daisysacres.com/images/daisy_icon.gif,My%20location&level=10
    ?marker=-117,34,,My%20Title,http%3A//www.daisysacres.com/images/daisy_icon.gif,My%20location&level=10
    ?marker=-117,34,,,,My%20location&level=10
    ?marker=-117,34&level=10
    ?marker=10406557.402,6590748.134,2526&level=10
    ?marker=-118.23561805665008,34.06479896707922,,,,&markertemplate={"title":"Title","longitude":-118.23561805665008,"latitude":34.06479896707922,"isIncludeShareUrl":true}&level=14
    */
    var template = null;
    if (queryObject.markertemplate) {
      template = {
        title: "",
        content: "",
        isIncludeShareUrl: false
      };
      try {
        var temp = JSON.parse(decodeURIComponent(queryObject.markertemplate));
        lang.mixin(template, temp);
      } catch (error) {
        console.error('urlParams: &markertemplate JSON.parse error.' + error.stack);
      }
    }

    var markerArray = queryObject.marker.split(";");
    if (markerArray.length === 1) {
      markerArray = queryObject.marker.split(",");
    }

    if (markerArray.length >= 2 && markerArray.length <= 6 &&
      markerArray[0].length && !isNaN(markerArray[0]) &&
      markerArray[1].length && !isNaN(markerArray[1])) {
      var x = parseFloat(markerArray[0]);
      var y = parseFloat(markerArray[1]);
      var wkid = 4326;
      if (markerArray.length >= 3 && markerArray[2].length && !isNaN(markerArray[2])) {
        wkid = parseInt(markerArray[2], 10);
      }
      var title = "";
      if (markerArray.length >= 4) {
        title = markerArray[3];
      }
      var iconUrl = null;
      if (markerArray.length >= 5 && markerArray[4].indexOf("http") === 0) {
        iconUrl = markerArray[4];
      }
      var label = null;
      if (markerArray.length === 6) {
        label = markerArray[5];
      }

      var markerSymbol = symbolJsonUtils.fromJson({
        "type": "esriPMS",
        "url": iconUrl,
        "contentType": "image/png"
      });
      var textSymbol = null;
      if (label) {
        textSymbol = symbolJsonUtils.fromJson({
          "color": [0, 0, 0, 255],
          "type": "esriTS",
          "verticalAlignment": "baseline",
          "horizontalAlignment": "left",
          "angle": 0,
          "xoffset": 0,
          "yoffset": 0,
          "rotated": false,
          "kerning": true,
          "font": {
            "size": 12,
            "style": "normal",
            "weight": "bold",
            "family": "Arial"
          },
          "text": label
        });
      }

      initMarkerSymbol(markerSymbol).then(function(){
        var point = new Point(x, y, new SpatialReference({wkid: wkid}));

        if(!sameSpatialReference(point.spatialReference, map.spatialReference)){
          project(point, map.spatialReference, function(geometries){
            addMarker(geometries[0], markerSymbol, textSymbol, title, template, map);
          }, function(){
            console.error('Project center point error.');
          });
        }else{
          addMarker(point, markerSymbol, textSymbol, title, template, map);
        }
      });
    }
  }

  function sendMessageToSearch(queryObject){
    //?find=redlands
    topic.publish('publishData', 'framework', 'framework', {
      searchString: queryObject.find
    }, true);
  }

  function addMarker(point, markerSymbol, textSymbol, title, template, map){
    var markerG, textG;
    var infoTemplate = new InfoTemplate('', title);
    if (template) {
      var content = shareUtils.getXyContent(template);
      //shareUrl
      if (template.isIncludeShareUrl) {
        var url = shareUtils.getShareUrl(map, template, true);
        var shareUrlContent = shareUtils.getShareUrlContent(url);
        content += shareUrlContent;
      }
      infoTemplate.setContent(content);
    }

    var layer = new GraphicsLayer({id: "marker-feature-action-layer"});
    map.addLayer(layer);

    markerG = new Graphic(point, markerSymbol, null, infoTemplate);
    layer.add(markerG);
    if (textSymbol) {
      textSymbol.xoffset = markerSymbol.width / 2;
      textSymbol.yoffset = markerSymbol.height / 2 + markerSymbol.yoffset;
      textG = new Graphic(new Point(point.toJson()), textSymbol);
      layer.add(textG);

      markerG._textSymbol = textG;
    }

    map.centerAt(point);
  }

  function initMarkerSymbol(markerSymbol){
    var def = new Deferred();
    if (markerSymbol.url) {
      jimuUtils.getImagesSize(markerSymbol.url).then(function(result) {
        markerSymbol.width = result[0];
        markerSymbol.height = result[1];
        def.resolve(markerSymbol);
      }, function(){
        markerSymbol.url = require.toUrl('jimu') + "/images/EsriBluePinCircle26.png";
        markerSymbol.width = 26;
        markerSymbol.height = 26;
        markerSymbol.setOffset(0, markerSymbol.height / 2);
        def.resolve(markerSymbol);
      });
    }else{
      markerSymbol.url = require.toUrl('jimu') + "/images/EsriBluePinCircle26.png";
      markerSymbol.width = 26;
      markerSymbol.height = 26;
      markerSymbol.setOffset(0, markerSymbol.height / 2);
      def.resolve(markerSymbol);
    }
    return def;
  }

  function queryFeature(queryObject, map){
    /************************
    ?query=<layerName/layerId, fieldName, fieldValue>
    ?query=<layerName/layerId, whereClause>
    *************************/
    //?query=Cities,pop>1000&level=10
    //?query=Cities,city_name,Rome&level=10
    var queryArray = queryObject.query.split(";");
    if (queryArray.length === 1) {
      queryArray = queryObject.query.split(",");
    }

    if(queryArray.length !== 2 && queryArray.length !== 3){
      console.error('query URL parameter is not correct.');
      return;
    }

    var layerNameOrId = queryArray[0];
    //by name first
    getLayerByNameOrId('name', layerNameOrId, map).then(function(layer){
      if(layer === null){
        getLayerByNameOrId('id', layerNameOrId, map).then(function(layer2){
          if(layer2 === null){
            console.error('Invalid layer name or id.');
          }else{
            selectFeatures(map, layer2, queryArray);
          }
        });
      }else{
        selectFeatures(map, layer, queryArray);
      }
    });
  }

  function selectFeatures(map, layer, queryArray){
    var query = new Query();
    var prefix = '';

    query.outSpatialReference = map.spatialReference;
    if(queryArray.length === 2){
      query.where = queryArray[1];
    }else if(queryArray.length === 3){
      if(layer.layerObject.url && jimuUtils.isHostedService(layer.layerObject.url) &&
        jimuUtils.containsNonLatinCharacter(queryArray[2])){
        prefix = 'N';
      }
      array.forEach(layer.layerObject.fields, function(field){
        if(field.alias.toLowerCase() !== queryArray[1].toLowerCase() &&
          field.name.toLowerCase() !== queryArray[1].toLowerCase()){
          return;
        }
        if(["esriFieldTypeSmallInteger", "esriFieldTypeInteger", "esriFieldTypeSingle",
          "esriFieldTypeDouble", "esriFieldTypeOID"].indexOf(field.type) > -1){
          query.where = field.name + '=' + queryArray[2];
        }else if(["esriFieldTypeString"].indexOf(field.type) > -1){
          query.where = queryArray[1] + "=" + prefix + "'" + queryArray[2].replace(/\'/g, "''") + "'";
        }
      }, this);
      if(!query.where){
        console.error('Invalid field name or type in query URL parameter.');
        return;
      }
    }

    query.maxAllowableOffset = 0.00001;
    layer.layerObject.queryFeatures(query).then(function(featureSet){
      var features = featureSet.features;
      if(features.length === 0){
        console.log('No result from query URL parameter.');
        return;
      }
      if(layer.layerObject.geometryType === 'esriGeometryPoint' && features.length === 1){
        map.setExtent(scaleUtils.getExtentForScale(map, 1000));//same scale with search dijit
        map.centerAt(features[0].geometry);
      }else{
        var resultExtent = jimuUtils.graphicsExtent(features);
        map.setExtent(resultExtent);
      }

      showSelections(map, layer, features);
    }, function(err){
      console.error(err);
    });
  }

  function showSelections(map, layer, features){
    if(!map.getLayer(layer.layerInfo.id)){//feature layer doesn't exist in map
      var infoTemplate = layer.layerInfo.getInfoTemplate();
      if(!infoTemplate){
        layer.layerInfo.loadInfoTemplate().then(function(it){
          setFeaturesInfoTemplate(it);
          doShow();
        });
      }else{
        setFeaturesInfoTemplate(infoTemplate);
        doShow();
      }
    }else{
      doShow();
    }

    function setFeaturesInfoTemplate(infoTemplate){
      array.forEach(features, function(f){
        f.setInfoTemplate(infoTemplate);
      });
    }

    function doShow(){
      map.infoWindow.setFeatures(features);
      map.infoWindow.show(getFeatureCenter(features[0]));
    }
  }

  function getFeatureCenter(feature){
    var geometry = feature.geometry;
    var centerPoint;
    if(geometry.type === 'point'){
      centerPoint = geometry;
    }else if(geometry.type === 'multipoint'){
      centerPoint = geometry.getPoint(0);
    }else if(geometry.type === 'polyline'){
      centerPoint = geometry.getExtent().getCenter();
    }else if(geometry.type === 'polygon'){
      centerPoint = geometry.getExtent().getCenter();
    }else if(geometry.type === 'extent'){
      centerPoint = geometry.getCenter();
    }else{
      console.error('Can not get layer geometry type, unknow error.');
      return null;
    }
    return centerPoint;
  }

  function getLayerByNameOrId(flag, layerNameOrId, map){
    var def = new Deferred();
    var defs = [];
    LayerInfos.getInstance(map, map.itemInfo).then(function(layerInfosObj) {
      layerInfosObj.traversal(function(layerInfo) {
        if(def.isResolved()){
          return true;
        }

        if(flag === 'id' && layerInfo.id.toLowerCase() === layerNameOrId.toLowerCase() ||
          flag === 'name' && layerInfo.title.toLowerCase() === layerNameOrId.toLowerCase()){
          defs.push(all({
            layerType: layerInfo.getLayerType(),
            layerObject: layerInfo.getLayerObject()
          }).then(function(result){
            if(result.layerType === 'FeatureLayer'){
              def.resolve({
                layerInfo: layerInfo,
                layerObject: result.layerObject
              });
            }
          }, function(err){
            console.error('Find layer error from query URL parameter', err);
            def.resolve(null);
          }));
        }

      });

      all(defs).then(function(){
        if(!def.isResolved()){
          def.resolve(null);
        }
      });
    });
    return def;
  }

  function project(geometry, outSR, handler, errHandler){
    var mercator = [102113, 102100, 3857], geom, info, dif1, dif2, projectParam;

    if(geometry.spatialReference.wkid === 4326 && contains(mercator, outSR.wkid)) {
      // clip it, so it's not going to Infinity
      geometry.ymin = Math.max(geometry.ymin, -89.99);
      geometry.ymax = Math.min(geometry.ymax, 89.99);
      geom = wmUtils.geographicToWebMercator(geometry);
      info = geom.spatialReference._getInfo();
      if (info) {
        if (geom.xmin > geom.xmax) {
          // wrap around
          dif1 = info.valid[1] - geom.xmin;
          dif2 = geom.xmax - info.valid[0];
          if (dif1 > dif2) {
            geom.xmax = info.valid[1] + dif2;
          } else {
            geom.xmin = info.valid[0] - dif1;
          }
        }
      }
      // geographicToWebMercator returns 102100; make sure it's what we want
      geom.spatialReference.wkid = outSR.wkid;

      handler([geom], null);
    } else if (contains(mercator, geometry.spatialReference.wkid) && outSR.wkid === 4326) {
      geom = wmUtils.webMercatorToGeographic(geometry);
      info = geom.spatialReference._getInfo();
      if (info) {
        if (geom.xmin > geom.xmax) {
          // wrap around
          dif1 = info.valid[1] - geom.xmin;
          dif2 = geom.xmax - info.valid[0];
          if (dif1 > dif2) {
            geom.xmax = info.valid[1] + dif2;
          } else {
            geom.xmin = info.valid[0] - dif1;
          }
        }
      }
      handler([geom], null);
    } else {
      projectParam = new ProjectParameters();
      projectParam.geometries = [geometry];
      projectParam.outSR = outSR;
      esriConfig.defaults.geometryService.project(projectParam, function(result) {
        // check if response is valid
        if (result && result.length > 0 && result[0] && result[0].type === 'extent' &&
            !isNaN(result[0].xmin) && !isNaN(result[0].ymin) &&
            !isNaN(result[0].xmax) && !isNaN(result[0].ymax)) {
          handler(result, null);
        } else if (result && result.length > 0 && result[0] && result[0].type === 'point' &&
            !isNaN(result[0].x) && !isNaN(result[0].y)) {
          handler(result, null);
        }
      }, errHandler);
    }
  }

  function sameSpatialReference(sp1, sp2) {
    var mercator = [102113, 102100, 3857];
    if(sp1 && sp2 && sp1.wkt === sp2.wkt &&
      (sp1.wkid === sp2.wkid ||
        (sp1.latestWkid && sp1.latestWkid === sp2.wkid) ||
        (sp2.latestWkid && sp1.wkid === sp2.latestWkid) ||
        (sp1.latestWkid && sp1.latestWkid === sp2.latestWkid))){
      return true;
    }else if(sp1 && sp2 && sp1.wkid && sp2.wkid &&
        contains(mercator, sp1.wkid) && contains(mercator, sp2.wkid)){
      return true;
    }

    return false;
  }

  function contains(array, obj) {
    var i = array.length;
    while (i--) {
      if (array[i] === obj) {
        return true;
      }
    }
    return false;
  }

  return mo;
});