define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/DocumentType",
        "./PortalItemTransformer",
        "dojo/i18n!../../../nls/i18nIso"],
function(declare, lang, has, DocumentType, PortalItemTransformer, i18nIso, esriNS) {

  var oThisClass = declare(DocumentType, {

    caption: null,
    key: null,
    isIso: true,
    isService: false,
    isGmi: false,
    metadataStandardName: null,
    metadataStandardVersion: null,

    afterInitializeAttribute: function(gxeDocument, attribute) {
      this.inherited(arguments);
    },

    afterInitializeElement: function(gxeDocument, element) {
      this.inherited(arguments);
    },

    beforeInitializeAttribute: function(gxeDocument, attribute) {
      var p = attribute.gxePath;
      var pfx = gxeDocument.rootElement.gxePath;

      if(this.isService && (p === pfx + "/gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue")) {
        attribute.optionsFilter = "service";
      } else if(this.isService && (p === pfx + "/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:scope/gmd:DQ_Scope/gmd:level/gmd:MD_ScopeCode/@codeListValue")) {
        attribute.optionsFilter = "service";
      } else {
        this.inherited(arguments);
      }
    },

    beforeInitializeElement: function(gxeDocument, element) {
      var p = element.gxePath;
      var pfx = gxeDocument.rootElement.gxePath;

      if(this.isService && (p === pfx + "/gmd:hierarchyLevel")) {
        element.maxOccurs = 1;
      } else if(this.isService && (p === pfx + "/gmd:hierarchyLevelName")) {
        element.maxOccurs = 1;
      } else if(p === pfx + "/gmd:metadataStandardName/gco:CharacterString") {
        if(this.metadataStandardName) {
          element.value = this.metadataStandardName;
        }
      } else if(p === pfx + "/gmd:metadataStandardVersion/gco:CharacterString") {
        if(this.metadataStandardVersion) {
          element.value = this.metadataStandardVersion;
        }
      } else if(p === pfx + "/gmd:identificationInfo/srv:SV_ServiceIdentification/srv:extent/gmd:EX_Extent/gmd:geographicElement") {
        element.minOccurs = 0;
      } else {
        this.inherited(arguments);
      }
    },

    initializeNamespaces: function() {
      this.addNamespace("gmd", "http://www.isotc211.org/2005/gmd");
      this.addNamespace("gco", "http://www.isotc211.org/2005/gco");
      this.addNamespace("srv", "http://www.isotc211.org/2005/srv");
      this.addNamespace("gml", "http://www.opengis.net/gml");
      //this.addNamespace("gml","http://www.opengis.net/gml/3.2");
      this.addNamespace("xlink", "http://www.w3.org/1999/xlink");

      //this.addNamespace("gmx","http://www.isotc211.org/2005/gmx");
      //this.addNamespace("gsr","http://www.isotc211.org/2005/gsr");
      //this.addNamespace("gss","http://www.isotc211.org/2005/gss");
      //this.addNamespace("gts","http://www.isotc211.org/2005/gts");
    },

    newPortalItemTransformer: function(gxeDocument) {
      return new PortalItemTransformer();
    }

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.base.IsoDocumentType", oThisClass, esriNS);
  }

  return oThisClass;
});