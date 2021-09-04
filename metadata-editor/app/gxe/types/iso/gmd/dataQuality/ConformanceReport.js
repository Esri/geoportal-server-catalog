define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputTextArea",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "../citation/SpecificationCitation",
        "./ConformanceDegree",
        "dojo/text!./templates/ConformanceReport.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputTextArea, AbstractObject, GcoElement, ObjectReference,
  SpecificationCitation, ConformanceDegree, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.dataQuality.ConformanceReport", oThisClass, esriNS);
  }

  return oThisClass;
});