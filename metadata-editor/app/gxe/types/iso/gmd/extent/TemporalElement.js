define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Attribute",
        "../../../../form/Element",
        "../../../../form/InputDate",
        "../../../../form/InputText",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/ObjectReference",
        "dojo/text!./templates/TemporalElement.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, Element, InputDate, InputText, AbstractObject, ObjectReference, template, esriNS) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.extent.TemporalElement", oThisClass, esriNS);
  }

  return oThisClass;
});