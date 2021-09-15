define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/types/iso/base/IsoDocumentType",
        "app/gxe/types/geoplatform/base/PortalItemTransformer",
        "dojo/i18n!app/gxe/nls/i18nGeoplatform"],
function(declare, lang, has, DocumentType, PortalItemTransformer, i18nGeoplatform) {

  var oThisClass = declare(DocumentType, {

    caption: "geolatform",
    key: "geolatform",
    isService: false,
    metadataStandardName: null,
    metadataStandardVersion: null,

	/*
    beforeInitializeAttribute: function(gxeDocument, attribute) {
      var p = attribute.gxePath;

      if(p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn/@xlink:href") {
        attribute.minOccurs = 1;
      } else {
        this.inherited(arguments);
      }
    },

    beforeInitializeElement: function(gxeDocument, element) {
      this.inherited(arguments);
      var p = element.gxePath;

      if(p === "/gmd:MD_Metadata/gmd:hierarchyLevel") {
        element.maxOccurs = 1;

      } else if(p === "/gmd:MD_Metadata/gmd:hierarchyLevelName") {
        element.maxOccurs = 1;
        if(!this.isService) {
          element.minOccurs = 1;
        }

      } else if(p === "/gmd:MD_Metadata/gmd:metadataStandardName/gco:CharacterString") {
        element.value = this.metadataStandardName;
        element.fixed = true;

      } else if(p === "/gmd:MD_Metadata/gmd:metadataStandardVersion/gco:CharacterString") {
        element.value = this.metadataStandardVersion;
        element.fixed = true;

      } else if(p === "/gmd:MD_Metadata/gmd:contact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress") {
        element.minOccurs = 1;
        element.maxOccurs = 1;

      } else if((p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact") ||
        (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact")) {
        element.minOccurs = 1;

      } else if((p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:organisationName") ||
        (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:organisationName")) {
        element.minOccurs = 1;

      } else if((p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo") ||
        (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo")) {
        element.minOccurs = 1;

      } else if((p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice") ||
        (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice")) {
        element.maxOccurs = 1;

      } else if((p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:facsimile") ||
        (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:facsimile")) {
        element.maxOccurs = 1;

      } else if((p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address") ||
        (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address")) {
        element.minOccurs = 1;

      } else if((p === "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress") ||
        (p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress")) {
        element.minOccurs = 1;
        element.maxOccurs = 1;

      } else if(p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/srv:extent/gmd:EX_Extent/gmd:temporalElement") {
        element.minOccurs = 0;

      } else if(p === "/gmd:MD_Metadata/gmd:identificationInfo/srv:SV_ServiceIdentification/srv:operatesOn") {
        element.minOccurs = 1;

      } else if(this.isService && (p === "/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:scope/gmd:DQ_Scope/gmd:levelDescription")) {
        element.minOccurs = 1;

      } else if(p === "/gmd:MD_Metadata/gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:report/gmd:DQ_DomainConsistency/gmd:result/gmd:DQ_ConformanceResult/gmd:pass/gco:Boolean") {
        element.minOccurs = 1;

      } else {
        this.inherited(arguments);
      }
    },
	*/

    initializeNamespaces: function() {
      this.addNamespace("gco", "http://www.isotc211.org/2005/gco");
      this.addNamespace("gmd", "http://www.isotc211.org/2005/gmd");
      this.addNamespace("gmi", "http://www.isotc211.org/2005/gmi");
      this.addNamespace("gml", "http://www.opengis.net/gml/3.2");
      this.addNamespace("gsr", "http://www.isotc211.org/2005/gsr");
      this.addNamespace("gss", "http://www.isotc211.org/2005/gss");
      this.addNamespace("gts", "http://www.isotc211.org/2005/gts");
      this.addNamespace("srv", "http://www.isotc211.org/2005/srv");
      this.addNamespace("xlink", "http://www.w3.org/1999/xlink");
    },

    newPortalItemTransformer: function(gxeDocument) {
      return new PortalItemTransformer();
    }

  });

  return oThisClass;
});