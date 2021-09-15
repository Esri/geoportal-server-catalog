define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputTextArea",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "./CI_OnlineFunctionCode",
        "dojo/text!./templates/CI_OnlineResource.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputTextArea, AbstractObject, CodeListReference, GcoElement,
  CI_OnlineFunctionCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.citation.CI_OnlineResource", oThisClass, esriNS);
  }

  return oThisClass;
});
