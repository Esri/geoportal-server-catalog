define(["dojo/_base/declare",
        "./InspireDocumentType",
        "./DataRoot",
        "dojo/i18n!../../../../nls/i18nInspire"],
function(declare, DocumentType, RootDescriptor, i18nInspire) {

  var oThisClass = declare(DocumentType, {

    caption: i18nInspire.documentTypes.data_v2.caption,
    description: i18nInspire.documentTypes.data_v2.description,
    key: "inspire2-iso-19115",
    isService: false,
    metadataStandardName: "INSPIRE Metadata Implementing Rules",
    metadataStandardVersion: "Technical Guidelines based on EN ISO 19115 and EN ISO 19119 (Version 2.0)",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});