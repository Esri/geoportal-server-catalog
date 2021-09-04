define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Attribute",
        "../../../../form/Element",
        "../../../../form/InputDate",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "../../gmd/identification/SimpleMD_Identifier",
        "./MI_ContextCode",
        "./MI_SequenceCode",
        "./MI_TriggerCode",
        "dojo/text!./templates/MI_Event.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, Element, InputDate, AbstractObject, CodeListReference, GcoElement,
  ObjectReference, SimpleMD_Identifier, MI_ContextCode, MI_SequenceCode, MI_TriggerCode, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.MI_Event", oThisClass, esriNS);
  }

  return oThisClass;
});