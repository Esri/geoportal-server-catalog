define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "./FgdcDocumentType",
        "./Root",
        "./PortalItemTransformer",
        "dojo/i18n!../../../nls/i18nFgdc",
        "dojo/aspect"],
function(declare, lang, has, DocumentType, RootDescriptor, PortalItemTransformer, i18nFgdc, aspect) {

  var oThisClass = declare(DocumentType, {

    caption: i18nFgdc.documentTypes.fgdc.caption,
    description: i18nFgdc.documentTypes.fgdc.description,
    key: "fgdc-blm",
    metadataStandardName: "FGDC Content Standard for Digital Geospatial Metadata",
    metadataStandardVersion: "FGDC-STD-001-1998",

    afterInitializeElement: function(gxeDocument, element) {
      var p = element.gxePath;
      
      if (p === "/metadata/idinfo/spdom/bounding/westbc") {
        element.inputWidget.setInputValue(-179.1797);
      } else if (p === "/metadata/idinfo/spdom/bounding/eastbc") {
        element.inputWidget.setInputValue(-65.4492);
      } else if (p === "/metadata/idinfo/spdom/bounding/southbc") {
        element.inputWidget.setInputValue(16.8126);
      } else if (p === "/metadata/idinfo/spdom/bounding/northbc") {
        element.inputWidget.setInputValue(71.3035);
      } else if (p === "/metadata/idinfo/descript/abstract") {
        element.inputWidget.domNode.getElementsByTagName("textarea")[0].cols=120
      }
      
      if (element && element.inputWidget) {
        aspect.after(element.inputWidget,"importValue",function(info,value){
          if (value === "unknown") {
            element.inputWidget.setInputValue("Unknown");
          }  
        },true);
      }
    },
    
    beforeInitializeElement: function(gxeDocument, element) {
      var p = element.gxePath;

      if((p === "/metadata/idinfo/citation/citeinfo/origin")) {
        element.value = "U.S. Department of the Interior, Bureau of Land Management (BLM)";
        //element.fixed = true;
      } else if((p === "/metadata/idinfo/descript/supplinf")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/idinfo/ptcontac/cntinfo")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/idinfo/ptcontac/cntinfo/cntpos")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/idinfo/ptcontac/cntinfo/cntaddr/address")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/idinfo/ptcontac/cntinfo/cntaddr/country")) {
        element.minOccurs = 1;
      } else if (p === "/metadata/idinfo/spdom/bounding/westbc") {
        element.fixed = true;
      } else if (p === "/metadata/idinfo/spdom/bounding/eastbc") {
        element.fixed = true;
      } else if (p === "/metadata/idinfo/spdom/bounding/southbc") {
        element.fixed = true;
      } else if (p === "/metadata/idinfo/spdom/bounding/northbc") {
        element.fixed = true;
      } else if((p === "/metadata/dataqual")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/dataqual/attracc/attraccr")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/dataqual/lineage/srcinfo/srccontr")) {
        element.minOccurs = 0;
      } else if((p === "/metadata/dataqual/lineage/srcinfo/typesrc")) {
        element.minOccurs = 0;
      } else if((p === "/metadata/dataqual/lineage/procstep/proccont/cntinfo")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/metrd")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/metc/cntinfo/cntaddr/address")) {
        element.minOccurs = 1;
      } else if((p === "/metadata/metc/cntinfo/cntaddr/country")) {
        element.minOccurs = 1;
      } else {
        this.inherited(arguments);
      }
    },

    newPortalItemTransformer: function(gxeDocument) {
      return new PortalItemTransformer();
    },

    newRootDescriptor: function() {
      return new RootDescriptor();
    }

  });

  return oThisClass;
});