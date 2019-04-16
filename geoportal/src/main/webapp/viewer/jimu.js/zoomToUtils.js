define([
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Deferred',
  'esri/config',
  'esri/graphic',
  'esri/graphicsUtils',
  'esri/geometry/Extent',
  'esri/geometry/Point',
  'esri/SpatialReference',
  'esri/geometry/webMercatorUtils',
  'esri/tasks/ProjectParameters'
], function(lang, array, Deferred, esriConfig, Graphic, graphicsUtils, Extent, Point, SpatialReference,
webMercatorUtils, ProjectParameters) {

  var mo = {};

  mo.zoomToFeatureSet = function(map, featureSet, /*optional*/extentFactor) {
    var layer = featureSet.features &&
                featureSet.features.length > 0 &&
                featureSet.features[0].getLayer &&
                featureSet.features[0].getLayer();
    var layerId = layer ? layer.id : null;
    var extent = mo.graphicsExtent(featureSet.features, extentFactor);

    return mo.zoomToExtent(map, extent, layerId);
  };

  mo.zoomToExtent = function(map, extent, /*optional*/layerId) {
    var def;
    if(!map || !mo.isValidExtent(extent)) {
      def = new Deferred();
      def.reject();
      return def;
    }
    if(layerId) {
      def = new Deferred();
      require(['jimu/LayerStructure'], function(LayerStructure) {
        var layerStructure = LayerStructure.getInstance();
        var layerNode = layerStructure.getNodeById(layerId);
        if(layerNode) {
          layerNode.zoomTo(extent).then(function() {
            def.resolve();
          }, function() {
            def.reject();
          });
        } else {
          mo.projectToMapSpatialReference(map, extent).then(function(extentResult) {
            if(extent.isSinglePoint) {
              extentResult = mo.convertSinglePointExtent(map, extentResult);
            }
            map.setExtent(extentResult, true);
            def.resolve();
          }, function() {
            def.reject();
          });
        }
      });
    } else {
      def = mo.projectToMapSpatialReference(map, extent).then(function(extentResult) {
        if(extent.isSinglePoint) {
          extentResult = mo.convertSinglePointExtent(map, extentResult);
        }
        return map.setExtent(extentResult, true);
      });
    }
    return def;
  };

  mo.isValidExtent = function(extent){
    return extent && mo.isTrueOrZero(extent.xmin) &&
      mo.isTrueOrZero(extent.ymin) &&
      mo.isTrueOrZero(extent.xmax) &&
      mo.isTrueOrZero(extent.ymax);
  };

  // Incorrect function name, keep it here for back compatibility.
  mo.isVaildExtent = mo.isValidExtent;

  mo.isTrueOrZero = function(e) {
    if (e === 0) {
      return true;
    }
    return !!e;
  };

  mo.convertSinglePointExtent = function(map, extent) {
    var mapScale = map.getScale();
    var targetScale = mo.getMedianScale(map, mapScale, 0);
    if(targetScale) {
      extent = mo.adjustHeightToAspectRatio(map, extent);
      extent = mo.getExtentForScale(extent, map.width, targetScale);
    }
    return extent;
  };

  mo.graphicsExtent = function(graphicsParam, /* optional */ factor){
    var ext = null;
    try {
      var graphics = graphicsParam;
      if(graphics &&
         graphics.length === 1 &&
         graphics[0].geometry.declaredClass === "esri.geometry.Multipoint" &&
         graphics[0].geometry.points.length === 1) {

        var mPoint = graphics[0].geometry.points[0];
        var point = new Point(mPoint[0], mPoint[1], graphics[0].geometry.spatialReference);
        graphics = [new Graphic(point)];
      }

      if(graphics && graphics.length === 1 && graphics[0].geometry.declaredClass === "esri.geometry.Point") {
        var geometry = graphics[0].geometry;
        ext = new Extent(geometry.x - 0.0001,
                         geometry.y - 0.0001,
                         geometry.x + 0.0001,
                         geometry.y + 0.0001,
                         geometry.spatialReference);
        ext.isSinglePoint = true;
      } else if(graphics && graphics.length > 0){
        ext = graphicsUtils.graphicsExtent(graphics);
        if (ext) {
          if(typeof factor === "number" && factor > 0){
            ext = ext.expand(factor);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
    return ext;
  };

  mo.projectToMapSpatialReference = function(map, extent) {
    var def = new Deferred();
    var resultExtent = extent;
    if(!map || !extent) {
      def.reject();
    } else if(map.spatialReference.equals(extent.spatialReference)) {
      def.resolve(resultExtent);
    } else if (map.spatialReference.isWebMercator() &&
          extent.spatialReference.equals(new SpatialReference(4326))) {
      resultExtent = webMercatorUtils.geographicToWebMercator(extent);
      resultExtent.isSinglePoint = extent.isSinglePoint;
      def.resolve(resultExtent);
    } else if (map.spatialReference.equals(new SpatialReference(4326)) &&
        extent.spatialReference.isWebMercator()) {
      resultExtent = webMercatorUtils.webMercatorToGeographic(extent);
      resultExtent.isSinglePoint = extent.isSinglePoint;
      def.resolve(resultExtent);
    } else {
      var geometryService = esriConfig && esriConfig.defaults && esriConfig.defaults.geometryService;
      if(geometryService && geometryService.declaredClass === "esri.tasks.GeometryService") {
        var params = new ProjectParameters();
        params.geometries = [extent];
        params.outSR = map.spatialReference;
        geometryService.project(params).then(function(geometries) {
          resultExtent = geometries && geometries.length > 0 && geometries[0];
          if(resultExtent) {
            resultExtent.isSinglePoint = extent.isSinglePoint;
            def.resolve(resultExtent);
          } else {
            def.reject();
          }
        }, function() {
        });
      } else {
        def.reject();
      }
    }
    return def;
  };

  mo.getMapLods = function(map){
    //lod:{level,resolution,scale}
    var lods = null;
    if(map._params && map._params.lods){
      lods = array.map(map._params.lods, lang.hitch(this, function(lod){
        return lod.toJson();
      }));
    }
    return lods;
  };

  /*
  mo.getMedianScale = function(map, minScale, maxScale) {
    var mapLods = mo.getMapLods(map);
    var medianScale;
    if(mapLods) {
      var visibleScales = [];
      array.forEach(mapLods, function(mapLod) {
        if ((minScale > 0 && mapLod.scale > minScale) || (mapLod.scale < maxScale)) {
          return;
        } else {
          visibleScales.push(mapLod.scale);
        }
      });
      var medianIndex;
      if(visibleScales.length >= 1) {
        medianIndex = Math.floor(visibleScales.length / 2);
        medianScale = visibleScales[medianIndex];
      } else {
        medianScale = null;
      }
    } else {
      if(minScale === 0) {
        medianScale = null;
      } else {
        medianScale = (minScale - maxScale) / 2;
      }
    }
    return medianScale;
  };
  */

  mo.getMedianScale = function(map, minScale, maxScale) {
    return mo.getTargetScale(map, 2, minScale, maxScale);
  };

  mo.getTargetScale = function(map, factor, minScale, maxScale) {
    var mapLods = mo.getMapLods(map);
    var targetScale;
    var migrationParam = 1;
    if(mapLods) {
      var visibleScales = [];
      var lessThanMaxScales = [];
      array.forEach(mapLods, function(mapLod) {
        if (minScale > 0 && mapLod.scale > minScale) {
          return;
        } else if (mapLod.scale < maxScale) {
          lessThanMaxScales.push(mapLod.scale);
          return;
        } else {
          visibleScales.push(mapLod.scale);
        }
      });
      visibleScales.reverse();
      var targetIndex;
      if(visibleScales.length >= 1) {
        migrationParam = lessThanMaxScales.length ? lessThanMaxScales.length / mapLods.length : 1;
        targetIndex = Math.floor( (visibleScales.length - 1) / (factor / migrationParam));
        targetScale = visibleScales[targetIndex];
      } else {
        targetScale = null;
      }
    } else {
      if(minScale === 0) {
        targetScale = null;
      } else {
        targetScale = (minScale - maxScale) / factor;
      }
    }
    return targetScale;
  };


  mo.getScaleForNextTileLevel = function(map, scale, zoomIn) {
    var i;
    var mapLods = mo.getMapLods(map);
    if (mapLods) {
      if (zoomIn) {
        for (i = 0; i < mapLods.length; i++) {
          if (mapLods[i].scale < scale) {
            return mapLods[i].scale - 1;
          }
        }
        return mapLods[mapLods.length - 1].scale - 1;
      } else {
        for (i = mapLods.length - 1; i >= 0; i--) {
          if (mapLods[i].scale > scale) {
            return mapLods[i].scale + 1;
          }
        }
        return mapLods[0].scale + 1;
      }
    } else {
      if (zoomIn) {
        return scale - 1;
      } else {
        return scale + 1;
      }
    }
    return scale;
  };

  mo.adjustExtentToAspectRatio = function(map, extent) {
    var mapRatio = map.width / map.height;
    var extentRatio = extent.getWidth() / extent.getHeight();

    if(extentRatio > mapRatio) {
      var yBuf = extent.getWidth() / mapRatio / 2;
      lang.mixin(extent,{ymin : extent.getCenter().y - yBuf, ymax : extent.getCenter().y + yBuf});
    } else if(extentRatio < mapRatio){
      var xBuf = extent.getHeight() * mapRatio / 2;
      lang.mixin(extent,{xmin : extent.getCenter().x - xBuf, xmax : extent.getCenter().x + xBuf});
    }

    return extent;
  };

  mo.adjustHeightToAspectRatio = function(map, extent) {
    // adjust the height of the extent so it won't mess up our scale calculations that we do with the width
    // make it a little smaller to be sure
    var buf = (extent.getWidth() * (map.height / map.width)) / 5;
    lang.mixin(extent,{ymin : extent.getCenter().y - buf, ymax : extent.getCenter().y + buf});
    return extent;
  };

  mo.getExtentForScale = function(extent, mapWidth, scale) {
    var inchesPerMeter = 39.37,
        decDegToMeters = 20015077.0 / 180.0,
        ecd = esri.config.defaults, lookup = esri.WKIDUnitConversion; // jshint ignore:line

    var wkid, wkt, sr = extent.spatialReference;
    if (sr) {
      wkid = sr.wkid;
      wkt = sr.wkt;
    }

    var unitValue = null;
    if (wkid) {
      unitValue = lookup.values[lookup[wkid]];
    } else if (wkt && (wkt.search(/^PROJCS/i) !== -1)) {
      var result = /UNIT\[([^\]]+)\]\]$/i.exec(wkt);
      if (result && result[1]) {
        unitValue = parseFloat(result[1].split(",")[1]);
      }
    }
    var newExtent = extent.expand(((scale * mapWidth) /
                    ((unitValue || decDegToMeters) * inchesPerMeter * ecd.screenDPI)) /
                    extent.getWidth());
    return newExtent;
  };

  mo.getScaleForExtent = function(extent, mapWidth) {
    var inchesPerMeter = 39.37,
        decDegToMeters = 20015077.0 / 180.0,
        ecd = esri.config.defaults, // jshint ignore:line
        lookup = esri.WKIDUnitConversion; // jshint ignore:line

    var wkid, wkt, sr = extent.spatialReference;
    if (sr) {
      wkid = sr.wkid;
      wkt = sr.wkt;
    }

    var unitValue = null;
    if (wkid) {
      unitValue = lookup.values[lookup[wkid]];
    } else if (wkt && (wkt.search(/^PROJCS/i) !== -1)) {
      var result = /UNIT\[([^\]]+)\]\]$/i.exec(wkt);
      if (result && result[1]) {
        unitValue = parseFloat(result[1].split(",")[1]);
      }
    }
    return (extent.getWidth() / mapWidth) * (unitValue || decDegToMeters) * inchesPerMeter * ecd.screenDPI;
  };

  return mo;
});
