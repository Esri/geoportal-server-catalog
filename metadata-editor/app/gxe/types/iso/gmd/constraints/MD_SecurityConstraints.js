define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "./MD_ClassificationCode",
        "dojo/text!./templates/MD_SecurityConstraints.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, AbstractObject, CodeListReference, GcoElement, MD_ClassificationCode,
  template, esriNS) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.constraints.MD_SecurityConstraints", oThisClass, esriNS);
  }

  return oThisClass;
});