define(["dojo/_base/declare",
        "dojo/_base/lang",
        "./DublinCoreDocumentType",
        "./DataRoot",
        "dojo/i18n!../nls/i18nDublinCore"],
function(declare, lang, DocumentType, RootDescriptor, i18nDublinCore) {

  var oThisClass = declare(DocumentType, {

    caption: i18nDublinCore.documentTypes.data.caption,
    description: i18nDublinCore.documentTypes.data.description,
    key: "dublin-core",
    isService: false,
    metadataStandardName: "Dublin Core",
    metadataStandardVersion: "1.1",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});