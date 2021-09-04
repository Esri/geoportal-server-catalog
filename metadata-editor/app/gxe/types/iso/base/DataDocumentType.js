define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "./IsoDocumentType",
        "./DataRoot",
        "dojo/i18n!../../../nls/i18nIso",
        "../../../../../kernel"],
function(declare, lang, has, DocumentType, RootDescriptor, i18nIso, esriNS) {

  var oThisClass = declare(DocumentType, {

    caption: i18nIso.documentTypes.data.caption,
    description: i18nIso.documentTypes.data.description,
    key: "iso-19115",
    isService: false,
    metadataStandardName: "ISO 19139/19115 Metadata for Datasets",
    metadataStandardVersion: "2003",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.base.DataDocumentType", oThisClass, esriNS);
  }

  return oThisClass;
});