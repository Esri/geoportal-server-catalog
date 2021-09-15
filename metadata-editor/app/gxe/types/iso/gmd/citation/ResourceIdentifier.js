define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/ElementChoice",
        "../../../../form/InputText",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "dojo/text!./templates/ResourceIdentifier.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, ElementChoice, InputText, AbstractObject, GcoElement, ObjectReference,
  template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.citation.ResourceIdentifier", oThisClass, esriNS);
  }

  return oThisClass;
});