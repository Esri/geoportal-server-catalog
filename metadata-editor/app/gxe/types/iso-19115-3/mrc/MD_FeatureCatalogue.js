define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "dojo/text!./templates/MD_FeatureCatalogue.html"],
function(declare, lang, Descriptor, Element, Attribute, ObjectReference,AbstractObject, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});