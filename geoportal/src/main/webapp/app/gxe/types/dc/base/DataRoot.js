define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "./DublinCoreProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputDate",
        "./GeoExtentTool",
        "app/gxe/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/iso/gmd/dataQuality/Quality",
        "esri/dijit/metadata/types/iso/gmd/distribution/Distribution",
        "esri/dijit/metadata/types/iso/gmd/identification/DataIdentification",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataSection",
        "app/gxe/form/InputDecimalPair",
        "dojo/i18n!../../../../nls/i18nDublinCore",
        "dojo/text!./templates/DataRoot.html"],
function(declare, lang, Descriptor, Element, InputDate, GeoExtentTool, CustomElement, Tabs, Quality, Distribution, 
  DataIdentification, MetadataSection, InputDecimalPair, i18nDublinCore, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});