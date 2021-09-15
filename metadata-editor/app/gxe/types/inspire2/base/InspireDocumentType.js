define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "esri/dijit/metadata/types/iso/base/IsoDocumentType",
        "./PortalItemTransformer",
        "dojo/i18n!../../../../nls/i18nInspire"],
function(declare, lang, has, domStyle, DocumentType, PortalItemTransformer, i18nInspire) {

  var oThisClass = declare(DocumentType, {

    caption: null,
    key: null,
    isService: false,
    metadataStandardName: null,
    metadataStandardVersion: null,

    beforeInitializeAttribute: function(gxeDocument, attribute) {
      var p = attribute.gxePath;

      if(!this.isService && (p === "/gmd:MD_Metadata/gmd:hierarchyLevel/gmd:MD_ScopeCode/@codeListValue")) {
        attribute.optionsFilter = "dataset,series";
      } else if(!this.isService && (p === "/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:scope/gmd:DQ_Scope/gmd:level/gmd:MD_ScopeCode/@codeListValue")) {
        attribute.optionsFilter = "dataset,series";
      } else {
        this.inherited(arguments);
      }
    },

    beforeInitializeElement: function(gxeDocument, element) {
      var p = element.gxePath;

      if(p === "/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress") {
        element.minOccurs = 1;
      } else if(!this.isService && (p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:identifier")) {
        element.minOccurs = 1;
      } else if(p === "/gmd:MD_Metadata/gmd:dataQualityInfo") {
        element.minOccurs = 1;
      } else if(p === "/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report") {
        element.minOccurs = 1;
      } else if(this.isService && (p === "/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:statement")) {
        element.minOccurs = 0;
      } else {
        this.inherited(arguments);
      }
    },

    newPortalItemTransformer: function(gxeDocument) {
      return new PortalItemTransformer();
    },

    initializeNamespaces: function() {
      this.addNamespace("gmd", "http://www.isotc211.org/2005/gmd");
      this.addNamespace("gco", "http://www.isotc211.org/2005/gco");
      this.addNamespace("srv", "http://www.isotc211.org/2005/srv");
      this.addNamespace("gml","http://www.opengis.net/gml");
      this.addNamespace("gmx","http://www.isotc211.org/2005/gmx");
      
      this.addNamespace("xlink", "http://www.w3.org/1999/xlink");
      this.addNamespace("xsi", "http://www.w3.org/2001/XMLSchema-instance");
    },

  });

  return oThisClass;
});