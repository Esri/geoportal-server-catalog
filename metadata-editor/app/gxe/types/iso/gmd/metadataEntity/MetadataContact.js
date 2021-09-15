define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "../citation/CI_RoleCode",
        "dojo/text!./templates/MetadataContact.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, AbstractObject, CodeListReference, GcoElement, ObjectReference,
  CI_RoleCode, template, esriNS) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.metadataEntity.MetadataContact", oThisClass, esriNS);
  }

  return oThisClass;
});