define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "./CI_Date",
        "dojo/text!./templates/SpecificationCitation.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, CI_Date, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.citation.SpecificationCitation", oThisClass, esriNS);
  }

  return oThisClass;
});