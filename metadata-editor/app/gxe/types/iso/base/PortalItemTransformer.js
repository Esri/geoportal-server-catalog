define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/has",
        "../../../base/etc/docUtil",
        "../../../arcgis/portal/PortalItemTransformer",
        "../../../../../kernel"],
function(declare, lang, array, has, docUtil, PortalItemTransformer, esriNS) {

  var oThisClass = declare([PortalItemTransformer], {

    postCreate: function() {
      this.inherited(arguments);
    },

    checkVisibility: function(inputWidget, path) {
      this.inherited(arguments);
      var el;
      if(path.indexOf("/gmd:resourceConstraints/gmd:MD_Constraints/gmd:useLimitation/gco:CharacterString") !== -1) {
        docUtil.findElementChoice(inputWidget, true);
      } else if(path.indexOf("/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword") !== -1) {
        try {
          el = inputWidget.parentXNode.parentElement.parentElement;
          if(el.toggleContent) {
            el.toggleContent(true);
          }
        } catch(ex) {
          console.error(ex);
        }
      } else if(path.indexOf("/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox") !== -1) {
        try {
          el = inputWidget.parentXNode.parentElement.parentElement.parentElement;
          if(el.toggleContent) {
            el.toggleContent(true);
          }
        } catch(ex) {
          console.error(ex);
        }
      } else if(path.indexOf("/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL") != -1) {
        try {
          el = inputWidget.parentXNode.parentElement.parentElement.parentElement;
          if(el.toggleContent) {
            el.toggleContent(true);
          }
          el = el.parentElement.parentElement.parentElement.parentElement;
          if(el.toggleContent) {
            el.toggleContent(true);
          }
        } catch(ex) {
          console.error(ex);
        }
      }
    },

    populateTransformationInfo: function(gxeDocument, portalItem, transformationInfo) {
      this.inherited(arguments);
      var ti = transformationInfo;
      var isService = gxeDocument.documentType.isService;

      var iw;
      var pfx = gxeDocument.rootElement.gxePath;
      var pfxI = pfx + "/gmd:identificationInfo/gmd:MD_DataIdentification";
      var pfxE = pfxI + "/gmd:extent/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox";
      if(isService) {
        pfxI = pfx + "/gmd:identificationInfo/srv:SV_ServiceIdentification";
        pfxE = pfxI + "/srv:extent/gmd:EX_Extent/gmd:geographicElement/gmd:EX_GeographicBoundingBox";
      }

      ti.id.path = pfx + "/gmd:fileIdentifier/gco:CharacterString";
      ti.title.path = pfxI + "/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString";
      ti.snippet.path = pfxI + "/gmd:purpose/gco:CharacterString";
      ti.description.path = pfxI + "/gmd:abstract/gco:CharacterString";

      ti.accessInformation.path = pfxI + "/gmd:credit/gco:CharacterString";
      ti.licenseInfo.path = pfxI + "/gmd:resourceConstraints/gmd:MD_Constraints/gmd:useLimitation/gco:CharacterString";

      ti.tags.path = pfxI + "/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword";

      ti.extent.xmin.path = pfxE + "/gmd:westBoundLongitude/gco:Decimal";
      ti.extent.ymin.path = pfxE + "/gmd:southBoundLatitude/gco:Decimal";
      ti.extent.xmax.path = pfxE + "/gmd:eastBoundLongitude/gco:Decimal";
      ti.extent.ymax.path = pfxE + "/gmd:northBoundLatitude/gco:Decimal";

      if(!isService) {
        ti.url.path = pfx + "/gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine/gmd:CI_OnlineResource/gmd:linkage/gmd:URL";
      } else {
        ti.url.path = pfxI + "/srv:containsOperations/srv:SV_OperationMetadata/srv:connectPoint/gmd:CI_OnlineResource/gmd:linkage/gmd:URL";
        if(portalItem && portalItem.url) {
          iw = this.findInputWidget(null, pfxI + "/srv:containsOperations/srv:SV_OperationMetadata/srv:operationName/gco:CharacterString", true);
          if(iw) {
            iw.setInputValue("na"); // TODO what value should we set for the default?
          }
        }
        if(portalItem && portalItem.typeKeywords) {
          array.some(portalItem.typeKeywords, function(kw) {
            if(kw === "Service") {
              ti.type.path = pfxI + "/srv:serviceType/gco:LocalName";
              return true;
            }
          });
        }
      }
    }

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.base.PortalItemTransformer", oThisClass, esriNS);
  }

  return oThisClass;
});