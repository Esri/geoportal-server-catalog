define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_GeometricObjectTypeCode",
        "dojo/text!./templates/MD_GeometricObjects.html"],
function(declare, lang, Descriptor, Element, Attribute, 
        MD_GeometricObjectTypeCode, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});