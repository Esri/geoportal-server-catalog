define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "./GeoplatformDocumentType",
        "./DataRoot",
		"dojo/i18n!../../../nls/i18nGeoplatform"
		],
function(declare, lang, has, DocumentType, RootDescriptor, i18nGeoplatform) {

  var oThisClass = declare(DocumentType, {

    caption: i18nGeoplatform.documentTypes.data.caption,
    description: i18nGeoplatform.documentTypes.data.description,
    key: "geoplatform",
    isService: false,
    metadataStandardName: "GeoPlatform Profile of ISO 19115-1",
    metadataStandardVersion: "1.0.0",

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});