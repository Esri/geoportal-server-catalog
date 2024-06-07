define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "./ISO19115Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "../gmd/metadataEntity/MetadataSection",
        "../gmd/identification/DataIdentification",
        "../gmd/distribution/Distribution",
        "../gmd/dataQuality/Quality",
        "dojo/text!./templates/DataRoot.html"],
function(declare, lang, Descriptor, Element, Tabs, MetadataSection, DataIdentification, 
  Distribution, Quality, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template, 
	
	postCreate: function() {
		console.log(this.qualityNode);
	}
    
  });

  return oThisClass;
});