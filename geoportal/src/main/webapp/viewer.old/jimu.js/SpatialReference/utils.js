define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dojo/Deferred',
  'dojo/promise/all',
  'dojo/request',
  'esri/SpatialReference',
  './unitUtils'
], function(
  declare,
  lang,
  array,
  Deferred,
  all,
  dojoRequest,
  SpatialReference,
  unitUtils
) {
  var spatialRefs = null,
    datumTrans = null;
  var _loaded = false;

  var mo = declare(null, function() {
    // nothing
  });

  var url = require.toUrl('jimu');
  var wkidDef = dojoRequest(url + '/SpatialReference/wkidDetails.json', {
    handleAs: "json"
  });
  var transformDef = dojoRequest(url + '/SpatialReference/transform.json', {
    handleAs: "json"
  });

  mo.loadResource = function() {
    var def = new Deferred();
    if (spatialRefs && datumTrans) {
      def.resolve();
      return def;
    }

    all([wkidDef, transformDef]).then(function(results) {
      spatialRefs = results[0];
      datumTrans = results[1];

      _loaded = true;
      def.resolve();
    }, function(err) {
      console.error(err);
      _loaded = false;
      def.reject(err);
    });

    return def;
  };

  mo.getAllCSUnits = function() {
    if (!_loaded) {
      return;
    }
    var units = [];
    array.forEach(spatialRefs.wkids, lang.hitch(this, function(wkid) {
      var unit = this.getCSUnit(wkid);
      if (array.indexOf(units, unit) === -1) {
        units.push(unit);
      }
    }));
    return units;
  };

  // Unit
  mo.convertUnit = function(sUnit, tUnit, num) {
    if (!_loaded) {
      return;
    }
    return unitUtils.convertUnit(sUnit, tUnit, num);
  };

  mo.getUnitRate = function(sUnit, tUnit) {
    if (!_loaded) {
      return;
    }
    return unitUtils.getUnitRate(sUnit, tUnit);
  };

  mo.isProjectUnit = function(unit) {
    if (!_loaded) {
      return;
    }
    return unitUtils.isProjectUnit(unit);
  };

  mo.isGeographicUnit = function(unit) {
    if (!_loaded) {
      return;
    }
    return unitUtils.isGeographicUnit(unit);
  };

  mo.getGeographicUnits = function() {
    if (!_loaded) {
      return;
    }
    return unitUtils.getGeographicUnits();
  };

  mo.getProjectUnits = function() {
    if (!_loaded) {
      return;
    }
    return unitUtils.getProjectUnits();
  };

  mo.getCSUnit = function(wkid) {
    if (!_loaded) {
      return;
    }
    var csStr = this.getCSStr(wkid),
      sIdx = 0,
      eIdx = 0;
    sIdx = csStr.lastIndexOf("UNIT");
    eIdx = csStr.indexOf(',', sIdx);
    return csStr.slice(sIdx + 6, eIdx - 1);
  };

  // coordinate
  mo.isSameSR = function(tWkid, sWkid) {
    if (!_loaded) {
      return;
    }
    var idx = this.indexOfWkid(tWkid),
      idx2 = this.indexOfWkid(sWkid);
    return spatialRefs.labels[idx] === spatialRefs.labels[idx2];
  };

  mo.isValidWkid = function(wkid) {
    if (!_loaded) {
      return;
    }
    return this.indexOfWkid(wkid) > -1;
  };

  mo.getSRLabel = function(wkid) {
    if (!_loaded) {
      return;
    }
    if (this.isValidWkid(wkid)) {
      var i = this.indexOfWkid(wkid);
      return spatialRefs.labels[i];
    }
  };

  mo.indexOfWkid = function(wkid) {
    if (!_loaded) {
      return;
    }
    return array.indexOf(spatialRefs.wkids, wkid);
  };

  mo.isWebMercator = function(wkid) {
    // true if this spatial reference is web mercator
    if (SpatialReference.prototype._isWebMercator) {
      return SpatialReference.prototype._isWebMercator.apply({
        wkid: parseInt(wkid, 10)
      }, []);
    } else {
      var sr = new SpatialReference(parseInt(wkid, 10));
      return sr.isWebMercator();
    }
  };

  mo.standardizeWkid = function(wkid) {
    return this.isWebMercator(wkid) ? 3857 : parseInt(wkid, 10);
  };

  mo.isValidTfWkid = function(tfWkid) {
    if (!_loaded) {
      return;
    }
    return this.indexOfTfWkid(tfWkid) > -1;
  };

  mo.getTransformationLabel = function(tfWkid) {
    if (!_loaded) {
      return;
    }
    if (this.isValidTfWkid(tfWkid)) {
      var i = this.indexOfTfWkid(tfWkid);
      return datumTrans.labels[i];
    }
    return "";
  };

  mo.indexOfTfWkid = function(tfWkid) {
    if (!_loaded) {
      return;
    }
    return array.indexOf(datumTrans.tfWkids, tfWkid);
  };

  mo.isGeographicCS = function(wkid) {
    if (!_loaded) {
      return;
    }
    if (this.isValidWkid(wkid)) {
      var detail = spatialRefs.details[this.indexOfWkid(wkid)];
      return detail.startWith("GEOGCS");
    }

    return false;
  };

  mo.isProjectedCS = function(wkid) {
    if (!_loaded) {
      return;
    }
    if (this.isValidWkid(wkid)) {
      var detail = spatialRefs.details[this.indexOfWkid(wkid)];
      return detail.startWith("PROJCS");
    }

    return false;
  };

  mo.getGeoCSByProj = function(wkid) {
    if (!_loaded) {
      return;
    }
    if (!this.isProjectedCS(wkid)) {
      return;
    }
    var spheroidStr = this.getSpheroidStr(wkid);
    var idx = array.indexOf(spatialRefs.details, spheroidStr);
    return spatialRefs.wkids[idx];
  };

  mo.getSpheroidStr = function(wkid) {
    if (!_loaded) {
      return;
    }
    if (this.isGeographicCS(wkid)) {
      return spatialRefs.details[this.indexOfWkid(wkid)];
    } else if (this.isProjectedCS(wkid)) {
      var detail = spatialRefs.details[this.indexOfWkid(wkid)];
      var start = detail.indexOf("GEOGCS"),
        end = detail.indexOf("PROJECTION") - 1;
      return detail.slice(start, end);
    }

    return null;
  };

  mo.getCSStr = function(wkid) {
    if (!_loaded) {
      return;
    }
    return spatialRefs.details[this.indexOfWkid(wkid)];
  };

  mo.isSameSpheroid = function(tWkid, sWkid) {
    if (!_loaded) {
      return;
    }
    var tSpheroid = this.getSpheroidStr(tWkid),
      sSpheroid = this.getSpheroidStr(sWkid);

    if (tSpheroid && sSpheroid && tSpheroid === sSpheroid) {
      return true;
    }

    return false;
  };

  return mo;
});