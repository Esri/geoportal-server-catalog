define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/InputNumber",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "dojo/text!./templates/EX_VerticalExtent.html"],
function(declare, lang, has, Descriptor, Element, Attribute, InputNumber, InputText, AbstractObject, ObjectReference, template) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  return oThisClass;
});