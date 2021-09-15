define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Attribute",
        "../../../../form/Element",
        "../../../../form/ElementChoice",
        "../../../../form/InputNumber",
        "../../../../form/InputSelectOne",
        "../../../../form/Options",
        "../../../../form/Option",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "./MD_SpatialRepresentationTypeCode",
        "dojo/text!./templates/DataRepresentation.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, Element, ElementChoice, InputNumber, InputSelectOne, Options, Option,
  AbstractObject, CodeListReference, GcoElement, ObjectReference, MD_SpatialRepresentationTypeCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.DataRepresentation", oThisClass, esriNS);
  }

  return oThisClass;
});