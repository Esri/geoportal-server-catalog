define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/InputSelectOne",
        "../../../../form/Options",
        "../../../../form/Option",
        "../../../../form/iso/CodeListAttribute",
        "../../../../form/iso/CodeListValueAttribute",
        "../../../../form/iso/CodeListElement",
        "../../../../form/iso/CodeSpaceAttribute",
        "dojo/text!./templates/MD_ProgressCode.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, InputSelectOne, Options, Option, CodeListAttribute, CodeListValueAttribute,
  CodeListElement, CodeSpaceAttribute, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.MD_ProgressCode", oThisClass, esriNS);
  }

  return oThisClass;
});