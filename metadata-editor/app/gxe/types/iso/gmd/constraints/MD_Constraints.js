define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/MD_Constraints.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, AbstractObject, MD_Constraints, template, esriNS) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.constraints.MD_Constraints", oThisClass, esriNS);
  }

  return oThisClass;
});