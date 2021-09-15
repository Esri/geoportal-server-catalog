define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "../../../../form/InputDecimalNumber",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/GeoExtentTool",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "dojo/text!./templates/GeographicElement.html"],
function(declare, lang, has, Descriptor, Element, InputDecimalNumber, AbstractObject, GcoElement, GeoExtentTool,
  ObjectReference, template) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  return oThisClass;
});