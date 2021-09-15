define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputNumber",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/GeoExtentTool",
        "../../../../form/iso/ObjectReference",
        "dojo/text!./templates/GeographicElement.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputNumber, AbstractObject, GcoElement, GeoExtentTool,
  ObjectReference, template, esriNS) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.extent.GeographicElement", oThisClass, esriNS);
  }

  return oThisClass;
});