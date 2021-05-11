define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/query",
        "dojo/has",
        "dijit/registry",
        "dojo/dom-construct",
        "esri/dijit/metadata/form/tools/ClickableTool",
        "esri/dijit/metadata/form/tools/GeoExtentDialog",
        "esri/dijit/metadata/form/tools/GeoExtentView",
        "esri/dijit/metadata/form/tools/geoExtentUtil"],
function(declare, lang, array, query, has, registry, domConstruct,
         ClickableTool, GeoExtentDialog, GeoExtentView, geoExtentUtil) {

  var oThisClass = declare([ClickableTool], {

    postCreate: function() {
      this.inherited(arguments);
    },

    startup: function() {
      if(this._started) {
        return;
      }
      var iw = this.findInputWidget();
      if(iw && iw.parentXNode && iw.parentXNode.gxeDocument) {
        if(iw.parentXNode.gxeDocument.isViewOnly) {
          // wait for siblings to render
          setTimeout(lang.hitch(this, function() {
            this._handleRequest(iw, false);
          }), 2000);
        }
      }
    },

    whenToolClicked: function(evt, inputWidget) {
      this._handleRequest(inputWidget, true);
    },

    _findInputWgt: function(path, node) {
      var el, nl = query("[data-gxe-path='" + path + "']", node);
      if(nl && (nl.length === 1)) {
        el = registry.byNode(nl[0]);
        if(el) {
          return el.inputWidget;
        }
      }
      return null;
    },

    _findViewSection: function(node) {
      var nl = query(".gxeGeoExtentSection .gxeGeoExtentViewSection", node);
      if(nl && (nl.length === 1)) {
        return nl[0];
      }
      return null;
    },
    
    extractCornerValues: function(corner) {
      var result = [];
      
      if (!corner)
        return;
      
      var val = corner.getInputValue();
      
      if (!val) 
        return;
      
      var valSplit = val.split(/ |,/).filter(v => v && v.length>0);
      
      if (!valSplit || valSplit.length!=2) 
        return;
      
      for (var i=0; i<valSplit.length; i++) {
        var val = Number.parseFloat(valSplit[i]);
        if (!Number.isNaN(val)) {
          result.push(val);        
        }
      }
      
      if (result.length!=2)
        return;
      
      return result;
    },

    _handleRequest: function(inputWidget, bWasClick) {
      if(!inputWidget || !inputWidget.parentXNode) {
        return;
      }
      var gcoElement = inputWidget.parentXNode.getParentElement();
      if(!gcoElement) {
        return;
      }
      var boundingElement = gcoElement.getParentElement();
      if(!boundingElement) {
        return;
      }

      var pfx = boundingElement.gxePath;
      var node = boundingElement.domNode;
      
      var LowerCorner = this._findInputWgt(pfx + "/ows:WGS84BoundingBox/ows:LowerCorner", node);
      var UpperCorner = this._findInputWgt(pfx + "/ows:WGS84BoundingBox/ows:UpperCorner", node);
      
      if (!LowerCorner || !UpperCorner) {
        return;
      }
      
      var WEST, SOUTH, EAST, NORTH;
      
      var westWgt = {
        getInputValue: function() {
          var [west, south] = this.extractCornerValues(LowerCorner)||[undefined,undefined];
          WEST = west;
          return west;
        }.bind(this),
        
        setInputValue: function(value) {
          var [west, south] = this.extractCornerValues(LowerCorner)||[undefined,undefined];
          WEST = west = value;
          LowerCorner.setInputValue("" + (west||WEST) + " " + (south||SOUTH));
        }.bind(this)
      };
      
      var southWgt = {
        getInputValue: function() {
          var [west, south] = this.extractCornerValues(LowerCorner)||[undefined,undefined];
          SOUTH = south;
          return south;
        }.bind(this),
        
        setInputValue: function(value) {
          var [west, south] = this.extractCornerValues(LowerCorner)||[undefined,undefined];
          SOUTH = south = value;
          LowerCorner.setInputValue("" + (west||WEST) + " " + (south||SOUTH));
        }.bind(this)
      };
      
      var eastWgt = {
        getInputValue: function() {
          var [east, north] = this.extractCornerValues(UpperCorner)||[undefined,undefined];
          EAST = east;
          return east;
        }.bind(this),
        
        setInputValue: function(value) {
          var [east, north] = this.extractCornerValues(UpperCorner)||[undefined,undefined];
          EAST = east = value;
          UpperCorner.setInputValue("" + (east||EAST) + " " + (north||NORTH));
        }.bind(this)
      };
      
      var northWgt = {
        getInputValue: function() {
          var [east, north] = this.extractCornerValues(UpperCorner)||[undefined,undefined];
          NORTH = north;
          return north;
        }.bind(this),
        
        setInputValue: function(value) {
          var [east, north] = this.extractCornerValues(UpperCorner)||[undefined,undefined];
          NORTH = north = value;
          UpperCorner.setInputValue("" + (east||EAST) + " " + (north||NORTH));
        }.bind(this)
      };
      
      if(!westWgt || !eastWgt || !northWgt || !southWgt) {
        return;
      }

      var d, ndv = null;
      if(boundingElement.gxeDocument && boundingElement.gxeDocument.isViewOnly) {
        if(bWasClick) {
          return;
        }
        ndv = this._findViewSection(node);
        if(!ndv) {
          return;
        }
        new GeoExtentView({
          gxeDocument: boundingElement.gxeDocument,
          xmin: westWgt.getInputValue(),
          ymin: southWgt.getInputValue(),
          xmax: eastWgt.getInputValue(),
          ymax: northWgt.getInputValue()
        }, domConstruct.create("div", {}, ndv));

      } else if(bWasClick) {
        d = new GeoExtentDialog({
          gxeDocument: boundingElement.gxeDocument,
          xmin: westWgt.getInputValue(),
          ymin: southWgt.getInputValue(),
          xmax: eastWgt.getInputValue(),
          ymax: northWgt.getInputValue(),
          onChange: lang.hitch(this, function(ext) {
            westWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.xmin));
            eastWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.xmax));
            northWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.ymax));
            southWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.ymin));
          })
        });
        d.show();
      }
    }

  });

  return oThisClass;
});