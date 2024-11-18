define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "../mri/MD_DataIdentification",
        "dojo/text!./templates/identificationInfo.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_DataIdentification, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});