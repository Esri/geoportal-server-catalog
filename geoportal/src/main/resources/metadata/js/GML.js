var GML = {
  
  toGeoJson: function(task, root) {
    var geojson = null;
    var points = GML._readPoints(task, root);

    if (points.length==1) {
      geojson = {
        "type": "point",
        "coordinates": points[0]
      }
    } else if (points.length>=4) {
      if (points[0][0]!=points[points.length-1][0] || points[0][1]!=points[points.length-1][1]) {
        points.push(points[0]);
      }
      geojson = {
        "type": "polygon",
        "coordinates": [points]
      }
    }
    
    return geojson;
  },
  
  _readPoints: function(task, root) {
    var points = [];
    G.forEachNode(task, root, "gmd:polygon/gml32:Point", function(pointNode) {
      var point = GML._readPoint(task,pointNode);
      if (point)
        points.push(point);
    });
    return points;
  },
  
  _readPoint: function(task, pointNode) {
      var point = GML._readPos(task,pointNode);
      if (!point) point = GML._readCoordinates(task,pointNode);
      return point;
  },
  
  _readPos: function(task, pointNode) {
    var point = null;
    var pos = G.getString(task,pointNode,"gml32:pos");
    if (pos && pos.length>0) {
      var xy = pos.split(" ");
      if (xy && xy.length>=2) {
        point = [Number(xy[0]), Number(xy[1])];
      }
    }
    return point;
  },
  
  _readCoordinates: function(task, pointNode) {
    var point = null;
    var pos = G.getString(task,pointNode,"gml32:coordinates");
    if (pos && pos.length>0) {
      var xy = pos.split(",");
      if (xy && xy.length>=2) {
        point = [Number(xy[0]), Number(xy[1])];
      }
    }
    return point;
  }
}