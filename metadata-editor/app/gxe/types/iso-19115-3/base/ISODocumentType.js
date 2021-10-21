define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "esri/dijit/metadata/types/iso/base/IsoDocumentType",
        "./PortalItemTransformer",
        "esri/dijit/metadata/form/InputSelectOne"],
function(declare, lang, domConstruct, DocumentType, PortalItemTransformer, InputSelectOne) {

  var oThisClass = declare(DocumentType, {

    caption: null,
    key: null,
    isIso: true,
    isService: false,
    metadataStandardName: null,
    metadataStandardVersion: null,
    
    beforeInitializeElement: function(gxeDocument, element) {
      this.inherited(arguments);
      var p = element.gxePath;

      if (p === "/mdb:MD_Metadata/mdb:metadataStandard/cit:CI_Citation/cit:title/gco:CharacterString") {
         element.value = "ISO 19115-3 Geographic Information - Metadata - Part 1: Fundamentals"
      }
      if (p === "/mdb:MD_Metadata/mdb:identificationInfo/mri:MD_DataIdentification/mri:citation/cit:CI_Citation/cit:title/gco:CharacterString"){
          element.isDocumentTitle = true;
      }

              
    },

    initializeNamespaces: function() {
        
      //this.addNamespace("dc4", "http://datacite.org/schema/kernel-4");
    }

  });

  return oThisClass;
});