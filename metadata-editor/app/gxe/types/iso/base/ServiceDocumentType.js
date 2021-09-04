define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "./IsoDocumentType",
        "./ServiceRoot",
        "dojo/i18n!../../../nls/i18nIso",
        "../../../../../kernel"],
function(declare, lang, has, DocumentType, RootDescriptor, i18nIso, esriNS) {

  var oThisClass = declare(DocumentType, {

    caption: i18nIso.documentTypes.service.caption,
    description: i18nIso.documentTypes.service.description,
    key: "iso-19119",
    isService: true,
    metadataStandardName: "ISO 19139/19119 Metadata for Web Services",
    metadataStandardVersion: "2005",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.base.ServiceDocumentType", oThisClass, esriNS);
  }

  return oThisClass;
});