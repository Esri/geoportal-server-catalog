define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/Tabs",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "./CI_Contact",
        "./CI_RoleCode",
        "dojo/text!./templates/CI_ResponsibleParty.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, Tabs, AbstractObject, CodeListReference, GcoElement, ObjectReference,
  CI_Contact, CI_RoleCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.citation.CI_ResponsibleParty", oThisClass, esriNS);
  }

  return oThisClass;
});
