define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputDate",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/MetadataDate.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputDate, GcoElement, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.metadataEntity.MetadataDate", oThisClass, esriNS);
  }

  return oThisClass;
});