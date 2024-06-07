define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "esri/dijit/metadata/types/iso/base/IsoDocumentType",
        "./PortalItemTransformer",
        "dojo/i18n!../nls/i18nStratML",
        "esri/dijit/metadata/form/InputSelectOne"],
function(declare, lang, domConstruct, DocumentType, PortalItemTransformer, i18nStratML,
  InputSelectOne) {

  var oThisClass = declare(DocumentType, {

    caption: null,
    key: null,
    isService: false,
    metadataStandardName: null,
    metadataStandardVersion: null,
    
    afterInitializeElement: function(gxeDocument, element) {},

    beforeInitializeAttribute: function(gxeDocument, attribute) {},

    beforeInitializeElement: function(gxeDocument, element) {},
    
    newPortalItemTransformer: function(gxeDocument) {},
    
    switchToLanguageList: function(gxeDocument,element) {}

  });

  return oThisClass;
});