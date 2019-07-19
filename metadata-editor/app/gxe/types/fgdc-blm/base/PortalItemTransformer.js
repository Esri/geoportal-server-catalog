define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/types/iso/base/PortalItemTransformer"],
function(declare, lang, has, PortalItemTransformer) {

  var oThisClass = declare([PortalItemTransformer], {

    postCreate: function() {
      this.inherited(arguments);
    },

    populateTransformationInfo: function(gxeDocument, portalItem, transformationInfo) {
      this.inherited(arguments);
      var ti = transformationInfo;

      ti.id.path = "/metadata/idinfo/citation/citeinfo/edition";
      ti.title.path = "/metadata/idinfo/citation/citeinfo/title";
      ti.snippet.path = "/metadata/idinfo/descript/purpose";
      ti.description.path = "/metadata/idinfo/descript/abstract";

      ti.accessInformation.path = "/metadata/idinfo/datacred";
      ti.licenseInfo.path = "/metadata/idinfo/useconst";

      ti.tags.path = "/metadata/idinfo/keywords/theme/themekey";

      ti.url.path = "/metadata/idinfo/citation/citeinfo/onlink";

      ti.extent.xmin.path = "/metadata/idinfo/spdom/bounding/westbc";
      ti.extent.ymin.path = "/metadata/idinfo/spdom/bounding/southbc";
      ti.extent.xmax.path = "/metadata/idinfo/spdom/bounding/eastbc";
      ti.extent.ymax.path = "/metadata/idinfo/spdom/bounding/northbc";
    }

  });

  return oThisClass;
});