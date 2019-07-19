define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/dom-construct",
        "esri/dijit/metadata/types/iso/base/IsoDocumentType",
        "./PortalItemTransformer",
        "dojo/i18n!../../../nls/i18nFgdc",
        "esri/dijit/metadata/form/InputSelectOne"],
function(declare, lang, domConstruct, DocumentType, PortalItemTransformer, i18nFgdc, InputSelectOne) {

  var oThisClass = declare(DocumentType, {

    caption: null,
    key: null,
    isService: false,
    metadataStandardName: null,
    metadataStandardVersion: null,

  });

  return oThisClass;
});