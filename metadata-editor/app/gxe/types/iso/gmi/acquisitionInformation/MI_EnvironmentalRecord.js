define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputNumber",
        "../../../../form/InputTextArea",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/MI_EnvironmentalRecord.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputNumber, InputTextArea, AbstractObject, GcoElement, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.MI_EnvironmentalRecord", oThisClass, esriNS);
  }

  return oThisClass;
});