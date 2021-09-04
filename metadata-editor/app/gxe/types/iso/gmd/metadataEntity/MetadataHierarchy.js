define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "../maintenance/MD_ScopeCode",
        "dojo/text!./templates/MetadataHierarchy.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, CodeListReference, GcoElement, MD_ScopeCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.metadataEntity.MetadataHierarchy", oThisClass, esriNS);
  }

  return oThisClass;
});