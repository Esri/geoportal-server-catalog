define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "../../../form/InputSelectOne",
        "../../../form/Options",
        "../../../form/Option",
        "../../../form/iso/AbstractObject",
        "../../../form/iso/CodeListAttribute",
        "../../../form/iso/CodeListValueAttribute",
        "../../../form/iso/CodeListElement",
        "../../../form/iso/CodeListReference",
        "../../../form/iso/CodeSpaceAttribute",
        "../../../form/iso/GcoElement",
        "../../../form/iso/ObjectReference",
        "../gmd/citation/CI_OnlineFunctionCode",
        "dojo/text!./templates/ContainsOperations.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, AbstractObject, CodeListAttribute,
  CodeListValueAttribute, CodeListElement, CodeListReference, CodeSpaceAttribute, GcoElement, ObjectReference,
  CI_OnlineFunctionsCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.srv.ContainsOperations", oThisClass, esriNS);
  }

  return oThisClass;
});