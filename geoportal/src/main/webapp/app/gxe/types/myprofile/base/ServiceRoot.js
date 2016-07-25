define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "./MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/iso/gmd/dataQuality/Quality",
        "esri/dijit/metadata/types/iso/gmd/distribution/Distribution",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataSection",
        "esri/dijit/metadata/types/iso/srv/ServiceIdentification",
        "dojo/text!./templates/ServiceRoot.html"],
function(declare, lang, has, Descriptor, Element, Quality, Distribution, 
  MetadataSection, ServiceIdentification, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });
  
  return oThisClass;
});