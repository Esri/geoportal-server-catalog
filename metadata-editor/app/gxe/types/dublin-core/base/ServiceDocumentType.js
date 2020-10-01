define(["dojo/_base/declare",
        "dojo/_base/lang",
        "./MyProfileDocumentType",
        "./ServiceRoot",
        "dojo/i18n!../nls/i18nMyProfile"],
function(declare, lang, DocumentType, RootDescriptor, i18nMyProfile) {

  var oThisClass = declare(DocumentType, {

    caption: i18nMyProfile.documentTypes.service.caption,
    description: i18nMyProfile.documentTypes.service.description,
    key: "myprofile-iso-19119",
    isService: false,
    metadataStandardName: "MyProfile",
    metadataStandardVersion: "1.0",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});