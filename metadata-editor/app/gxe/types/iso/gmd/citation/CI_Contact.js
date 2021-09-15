define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/Tabs",
        "../../../../form/InputTextArea",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "./CI_Address",
        "./CI_OnlineResource",
        "./CI_Telephone",
        "dojo/text!./templates/CI_Contact.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, Tabs, InputTextArea, AbstractObject, GcoElement, ObjectReference,
  CI_Address, CI_OnlineResource, CI_Telephone, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.citation.CI_Contact", oThisClass, esriNS);
  }

  return oThisClass;
});