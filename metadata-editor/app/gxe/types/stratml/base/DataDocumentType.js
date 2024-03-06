define(["dojo/_base/declare",
        "dojo/_base/lang",
        "./MyProfileDocumentType",
        "./DataRoot",
        "dojo/i18n!../nls/i18nStratML"],
function(declare, lang, DocumentType, RootDescriptor, i18nStratML) {

  var oThisClass = declare(DocumentType, {

    caption: i18nStratML.documentTypes.data.caption,
    description: i18nStratML.documentTypes.data.description,
    key: "stratml-iso-17469",
    isService: false,
    metadataStandardName: "StratML",
    metadataStandardVersion: "1.0",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});