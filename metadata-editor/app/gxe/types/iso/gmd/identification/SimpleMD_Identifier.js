define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputText",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/SimpleMD_Identifier.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputText, AbstractObject, GcoElement, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.SimpleMD_Identifier", oThisClass, esriNS);
  }

  return oThisClass;
});