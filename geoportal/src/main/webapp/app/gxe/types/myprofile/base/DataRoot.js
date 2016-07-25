define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "./MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/iso/gmd/dataQuality/Quality",
        "esri/dijit/metadata/types/iso/gmd/distribution/Distribution",
        "esri/dijit/metadata/types/iso/gmd/identification/DataIdentification",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataSection",
        "dojo/text!./templates/DataRoot.html"],
function(declare, lang, Descriptor, Element, Tabs, Quality, Distribution, 
  DataIdentification, MetadataSection, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});