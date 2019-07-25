define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "esri/dijit/metadata/types/iso/base/IsoDocumentType",
        "./PortalItemTransformer",
        "dojo/i18n!../nls/i18nDublinCore",
        "esri/dijit/metadata/form/InputSelectOne"],
function(declare, lang, domConstruct, DocumentType, PortalItemTransformer, i18nDublinCore,
  InputSelectOne) {

  var oThisClass = declare(DocumentType, {

    caption: null,
    key: null,
    isService: false,
    metadataStandardName: null,
    metadataStandardVersion: null,
    
    initializeNamespaces: function() {        
      this.addNamespace("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
      this.addNamespace("dc", "http://purl.org/dc/elements/1.1/");
      this.addNamespace("dct", "http://purl.org/dc/terms/");
      this.addNamespace("dcmiBox", "http://dublincore.org/documents/2000/07/11/dcmi-box/");
      this.addNamespace("ows", "http://www.opengis.net/ows");
      this.addNamespace("gco", "http://www.isotc211.org/2005/gco");
      this.addNamespace("gmd", "http://www.isotc211.org/2005/gmd");
    }
  });

  return oThisClass;
});