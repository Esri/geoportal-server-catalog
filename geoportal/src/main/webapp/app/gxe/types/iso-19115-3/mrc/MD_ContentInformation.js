define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_CoverageDescription",
        "./MD_FeatureCatalogue",
        "./MD_FeatureCatalogueDescription",
        "dojo/text!./templates/MD_ContentInformation.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_CoverageDescription, MD_FeatureCatalogue, MD_FeatureCatalogueDescription, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});