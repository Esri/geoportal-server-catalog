define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./LI_ProcessStep",
        "./LI_Source",
        "dojo/text!./templates/LI_Lineage.html"],
function(declare, lang, Descriptor, Element, Attribute, LI_ProcessStep, LI_Source, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});