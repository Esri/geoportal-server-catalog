var GML = {
  FLIP_SRS: [
    "urn:ogc:def:crs:EPSG::4326", "EPSG:4326"
  ],
  
  toGeoJson: function(task, root) {
    var geojson = null;
    var points = GML._readPoints(task, root);
    
    if (points && points.length>0) {
      geojson = {
        "type": "multipoint",
        "coordinates": points
      }
    } else {
      points = GML._readPolygon(task, G.getNode(task, root, "gmd:polygon/gml32:Polygon"));
      if (points && points.length>0) {
        geojson = {
          "type": "polygon",
          "coordinates": [GML._balancePoints(points)]
        }
      } else {
        points = GML._readMultiPoint(task, G.getNode(task, root, "gmd:polygon/gml32:MultiPoint"));
        if (points && points.length>0) {
          geojson = {
            "type": "multipoint",
            "coordinates": points
          }
        }
      }
    }

    task.bbox = GML._calcBbox(points);
    
    return geojson;
  },
  
  _calcBbox: function(points) {
    var bbox = null;
    
    if (points) {
      points.forEach(function(pt) {
        if (!bbox) {
          bbox = [pt, pt];
        } else {
          bbox[0] = [Math.min(bbox[0][0], pt[0]), Math.min(bbox[0][1], pt[1])];
          bbox[1] = [Math.max(bbox[1][0], pt[0]), Math.max(bbox[1][1], pt[1])];
        }
      });
    }
    
    return bbox;
  },
  
  _balancePoints: function(points) {
    if (!points) return null;
    
    var outPoints = [];
    points.forEach(function(pt) {
      if (outPoints.length==0 || !GML._eqPoints(pt, outPoints[outPoints.length-1])) {
        outPoints.push(pt);
      }
    });
    if (!GML._eqPoints(outPoints[0], outPoints[outPoints.length-1])) {
      outPoints.push(outPoints[0]);
    }
    
    return outPoints;
  },
  
  _eqPoints: function(p1, p2) {
    if (!p1 && !p2) return true;
    if (p1 && p1.length>=2 && p2 && p2.length>=2) {
      return p1[0]===p2[0] && p1[1]===p2[1];
    }
    return false;
  },
  
  _readMultiPoint: function(task, multiPointNode) {
    if (!multiPointNode) return null;
    
    var points = [];
    G.forEachNode(task, multiPointNode, "gml32:pointMembers/gml32:Point", function(pointNode) {
      var point = GML._readPoint(task, pointNode, GML._checkFlip(task, multiPointNode));
      if (point)
        points.push(point);
    });
    
    return points;
  },
  
  _readPolygon: function(task, polygonNode) {
    if (!polygonNode) return null;
    return GML._readLinearRing(task, G.getNode(task, polygonNode, "gml32:exterior/gml32:LinearRing"), GML._checkFlip(task, polygonNode));
  },
  
  _readLinearRing: function(task, linearRingNode, flip) {
    if (!linearRingNode) return null;
    
    var points = [];
    G.forEachNode(task, linearRingNode, "gml32:pos", function(posNode) {
      var point = GML._readPos(task, posNode, flip);
      if (point)
        points.push(point);
    });
    return points;
  },
  
  _readPoints: function(task, root, flip) {
    var points = [];
    G.forEachNode(task, root, "gmd:polygon/gml32:Point", function(pointNode) {
      var point = GML._readPoint(task, pointNode, flip);
      if (point)
        points.push(point);
    });
    return points;
  },
  
  _readPoint: function(task, pointNode, flip) {
      flip = flip==undefined? GML._checkFlip(task, pointNode): flip;
      var point = GML._readPos(task, G.getNode(task, pointNode, "gml32:pos"), flip);
      if (!point) {
        var coordinates = GML._readCoordinates(task, G.getNode(task, pointNode, "gml32:coordinates"), flip);
        point = coordinates && coordinates.length>0? coordinates[0]: null;
      }
      return point;
  },
  
  _readPos: function(task, posNode, flip) {
    if (!posNode) return null;
    
    var point = null;
    var pos = G.getString(task, posNode, ".");
    if (pos && pos.length>0) {
      var xy = pos.split(/\s+/);
      if (xy && xy.length>=2) {
        point = flip? [Number(xy[1]), Number(xy[0])]: [Number(xy[0]), Number(xy[1])];
      }
    }
    return point;
  },
  
  _readCoordinates: function(task, coordinatesNode, flip) {
    if (!coordinatesNode) return null;
    
    var points = [];
    var coordinates = G.getString(task, coordinatesNode, ".");
    if (coordinates && coordinates.length>0) {
      coordinates.split(/\s+/).forEach(function(coordinate){
        var xy = coordinate.split(",");
        if (xy && xy.length>=2) {
          point = flip? [Number(xy[1]), Number(xy[0])]: [Number(xy[0]), Number(xy[1])];
          point.push(point);
        }
      });
    }
    return points;
  },
  
  _checkFlip: function(task, gmlNode) {
    var srsName = G.getString(task, gmlNode, "@srsName");
    return srsName && GML.FLIP_SRS.indexOf(srsName) >= 0;
  }
}