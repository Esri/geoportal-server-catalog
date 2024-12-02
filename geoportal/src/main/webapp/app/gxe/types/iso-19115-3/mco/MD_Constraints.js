define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_LegalConstraints",
        "./MD_Releasability",
        "./MD_SecurityConstraints",
        "dojo/text!./templates/MD_Constraints.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_LegalConstraints, MD_Releasability, MD_SecurityConstraints, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});