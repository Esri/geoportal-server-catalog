define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputDelimitedTextArea",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/ObjectReference",
        "../citation/SpecificationCitation",
        "./MD_KeywordTypeCode",
        "dojo/text!./templates/MD_Keywords.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputDelimitedTextArea, AbstractObject, CodeListReference,
  ObjectReference, SpecificationCitation, MD_KeywordTypeCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.MD_Keywords", oThisClass, esriNS);
  }

  return oThisClass;
});