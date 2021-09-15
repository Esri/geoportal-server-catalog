define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/ObjectReference",
        "../maintenance/MD_ScopeCode",
        "dojo/text!./templates/Scope.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, AbstractObject, CodeListReference, ObjectReference, MD_ScopeCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.dataQuality.Scope", oThisClass, esriNS);
  }

  return oThisClass;
});