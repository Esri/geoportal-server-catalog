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

    _handleRequest: function (a, c) {
      if (a && a.parentXNode && (a = a.parentXNode.getParentElement()) && (a = a.getParentElement())) {
        var d = a.gxePath,
        e =
          a.domNode,
        b = this._findInputWgt(d + "/gex:westBoundLongitude/gco:Decimal", e),
        g = this._findInputWgt(d + "/gex:eastBoundLongitude/gco:Decimal", e),
        h = this._findInputWgt(d + "/gex:northBoundLatitude/gco:Decimal", e),
        k = this._findInputWgt(d + "/gex:southBoundLatitude/gco:Decimal", e);
        b && g && h && k && (d = null, a.gxeDocument && a.gxeDocument.isViewOnly ? c || (d = this._findViewSection(e)) && new u({
            gxeDocument: a.gxeDocument,
            xmin: b.getInputValue(),
            ymin: k.getInputValue(),
            xmax: g.getInputValue(),
            ymax: h.getInputValue()
          }, domConstruct.create("div", {},
              d)) : c && (c = new GeoExtentDialog({
                gxeDocument: a.gxeDocument,
                xmin: b.getInputValue(),
                ymin: k.getInputValue(),
                xmax: g.getInputValue(),
                ymax: h.getInputValue(),
                onChange: lang.hitch(this, function (a) {
                  b.setInputValue(geoExtentUtil.formatCoordinate(a.xmin));
                  g.setInputValue(geoExtentUtil.formatCoordinate(a.xmax));
                  h.setInputValue(geoExtentUtil.formatCoordinate(a.ymax));
                  k.setInputValue(geoExtentUtil.formatCoordinate(a.ymin))
                })
              }), c.show()))
      }
    }

  });

  return oThisClass;
});