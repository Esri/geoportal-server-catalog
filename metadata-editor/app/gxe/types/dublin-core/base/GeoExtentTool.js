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

    _handleRequest: function(inputWidget, bWasClick) {
      if(!inputWidget || !inputWidget.parentXNode) {
        return;
      }
      var boundingElement = inputWidget.parentXNode.getParentElement();
      if(!boundingElement) {
        return;
      }

      var pfx = boundingElement.gxePath;
      var node = boundingElement.domNode;
	  var lowerCornerWidget = this._findInputWgt("/rdf:RDF/rdf:Description/ows:WGS84BoundingBox/ows:LowerCorner", node);
      var upperCornerWidget = this._findInputWgt("/rdf:RDF/rdf:Description/ows:WGS84BoundingBox/ows:UpperCorner", node);
	  
	  var lowerCornerValue = lowerCornerWidget.getInputValue();
	  var upperCornerValue = upperCornerWidget.getInputValue();
	  
	  var westBC = lowerCornerValue.substr(0,lowerCornerValue.indexOf(' '));
	  var eastBC = upperCornerValue.substr(0,upperCornerValue.indexOf(' '));	  
	  var southBC = lowerCornerValue.substr(lowerCornerValue.indexOf(' ')+1);
	  var northBC = upperCornerValue.substr(upperCornerValue.indexOf(' ')+1);
	  
	  if(!westBC || !eastBC || !northBC	 || !southBC) {
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
          xmin: westBC,
          ymin: southBC,
          xmax: eastBC,
          ymax: northBC
        }, domConstruct.create("div", {}, ndv));

      } else if(bWasClick) {
        d = new GeoExtentDialog({
          gxeDocument: boundingElement.gxeDocument,
          xmin: westBC,
          ymin: southBC,
          xmax: eastBC,
          ymax: northBC,
          onChange: lang.hitch(this, function(ext) {
			  lowerCornerWidget.setInputValue(geoExtentUtil.formatCoordinate(ext.xmin) + " " + geoExtentUtil.formatCoordinate(ext.ymin));
			  upperCornerWidget.setInputValue(geoExtentUtil.formatCoordinate(ext.xmax) + " " + geoExtentUtil.formatCoordinate(ext.ymax));
            //westWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.xmin));
            //eastWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.xmax));
            //northWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.ymax));
            //southWgt.setInputValue(geoExtentUtil.formatCoordinate(ext.ymin));
          })
        });
        d.show();
      }
    }

  });

  return oThisClass;
});