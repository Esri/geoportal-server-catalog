define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/InputSelectOne",
        "../../../../form/Options",
        "../../../../form/Option",
        "../../../../form/iso/CodeListAttribute",
        "../../../../form/iso/CodeListValueAttribute",
        "../../../../form/iso/CodeListElement",
        "../../../../form/iso/CodeSpaceAttribute",
        "dojo/text!./templates/MD_ScopeCode.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, InputSelectOne, Options, Option, CodeListAttribute, CodeListValueAttribute,
  CodeListElement, CodeSpaceAttribute, template, esriNS) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template
    
  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.maintenance.MD_ScopeCode", oThisClass, esriNS);
  }

  return oThisClass;
});