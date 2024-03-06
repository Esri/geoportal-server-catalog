define(["dojo/_base/declare",
        "dojo/_base/lang",
        "./ISO19115DocumentType",
        "./DataRoot",
        "dojo/i18n!../nls/i18nISO19115"],
function(declare, lang, DocumentType, RootDescriptor, i18nISO19115) {

  var oThisClass = declare(DocumentType, {

    caption: i18nISO19115.documentTypes.data.caption,
    description: i18nISO19115.documentTypes.data.description,
    key: "ISO19115",
    isService: false,
    metadataStandardName: "ISO 19139/19115 Metadata for Datasets",
    metadataStandardVersion: "2003",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});