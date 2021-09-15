define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Attribute",
        "../../../../form/Element",
        "../../../../form/InputTextArea",
        "../../../../form/Section",
        "../../../../form/Tabs",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "../../gmd/citation/SimpleCI_Citation",
        "../../gmd/identification/SimpleMD_Identifier",
        "../../gmd/citation/CI_ResponsibleParty",
        "dojo/text!./templates/MI_Platform.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, Element, InputTextArea, Section, Tabs, AbstractObject, GcoElement,
  ObjectReference, SimpleCI_Citation, SimpleMD_Identifier, CI_ResponsibleParty, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.MI_Platform", oThisClass, esriNS);
  }

  return oThisClass;
});