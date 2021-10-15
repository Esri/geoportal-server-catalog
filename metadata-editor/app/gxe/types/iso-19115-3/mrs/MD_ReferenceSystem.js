define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "app/gxe/types/iso-19115-3/mcc/MD_Identifier",
        "dojo/text!./templates/MD_ReferenceSystem.html"],
function(declare, lang, Descriptor, Element, Attribute, ObjectReference,AbstractObject, CodeListValueAttribute, 
         InputSelectOne, Options, Option, MD_Identifier, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});