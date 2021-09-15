define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/ElementChoice",
        "../../../../form/Section",
        "../../../../form/iso/ObjectReference",
        "./MD_Constraints",
        "./MD_LegalConstraints",
        "./MD_SecurityConstraints",
        "dojo/text!./templates/ResourceConstraints.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, ElementChoice, Section, ObjectReference, MD_Constraints, MD_LegalConstraints,
  MD_SecurityConstraints, template, esriNS) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.constraints.ResourceConstraints", oThisClass, esriNS);
  }

  return oThisClass;
});