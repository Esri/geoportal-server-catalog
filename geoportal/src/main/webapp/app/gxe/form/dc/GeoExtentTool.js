define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/query",
        "dojo/has",
        "dijit/registry",
        "dojo/dom-construct",
        "../tools/ClickableTool",
        "../tools/GeoExtentDialog",
        "../tools/GeoExtentView",
        "../tools/geoExtentUtil",
        "../../../../kernel"],
function(declare, lang, array, query, has, registry, domConstruct,
         ClickableTool, GeoExtentDialog, GeoExtentView, geoExtentUtil, esriNS) {

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
      var westWgt = this._findInputWgt(pfx + "/gmd:westBoundLongitude/gco:Decimal", node);
      var eastWgt = this._findInputWgt(pfx + "/gmd:eastBoundLongitude/gco:Decimal", node);
      var northWgt = this._findInputWgt(pfx + "/gmd:northBoundLatitude/gco:Decimal", node);
      var southWgt = this._findInputWgt(pfx + "/gmd:southBoundLatitude/gco:Decimal", node);
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

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.form.iso.GeoExtentTool", oThisClass, esriNS);
  }

  return oThisClass;
});