define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/ObjectReference",
        "../extent/GeographicElement",
        "../extent/TemporalElement",
        "dojo/text!./templates/ResourceExtent.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, GeographicElement, TemporalElement, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.ResourceExtent", oThisClass, esriNS);
  }

  return oThisClass;
});