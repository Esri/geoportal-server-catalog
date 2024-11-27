define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'esri/SpatialReference',
  'dojo/text!./wkid.json'
], function(
  declare,
  array,
  SpatialReference,
  wkids
) {
  try {
    var spatialRefs = JSON.parse(wkids);
  } catch (err) {
    throw err;
  }

  var mo = declare(null, function() {
    // nothing
  });


  // coordinate
  mo.isSameSR = function(tWkid, sWkid) {
    var idx = this.indexOfWkid(tWkid),
      idx2 = this.indexOfWkid(sWkid);
    return spatialRefs.labels[idx] === spatialRefs.labels[idx2];
  };

  mo.isValidWkid = function(wkid) {
    return this.indexOfWkid(wkid) > -1;
  };

  mo.getSRLabel = function(wkid) {
    if (this.isValidWkid(wkid)) {
      var i = this.indexOfWkid(wkid);
      return spatialRefs.labels[i];
    }
  };

  mo.indexOfWkid = function(wkid) {
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

  return mo;
});