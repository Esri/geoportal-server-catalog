define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/query",
        "dijit/registry",
        "esri/dijit/metadata/types/iso/base/PortalItemTransformer"],
function(declare, lang, query, registry, PortalItemTransformer) {

  var oThisClass = declare([PortalItemTransformer], {

    postCreate: function() {
      this.inherited(arguments);
    }

  });

  return oThisClass;
});