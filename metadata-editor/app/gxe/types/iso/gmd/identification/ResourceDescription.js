define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputTextArea",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/ResourceDescription.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputTextArea, GcoElement, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.ResourceDescription", oThisClass, esriNS);
  }

  return oThisClass;
});