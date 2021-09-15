define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Attribute",
        "../../../../form/Element",
        "../../../../form/Section",
        "../../../../form/Tabs",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "../../../../form/iso/ObjectReference",
        "../../gmd/identification/SimpleMD_Identifier",
        "../../gmd/extent/GeographicElement",
        "../../gmd/extent/TemporalElement",
        "./MI_ObjectiveTypeCode",
        "./MI_Event",
        "dojo/text!./templates/MI_Objective.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, Element, Section, Tabs, AbstractObject, CodeListReference,
  GcoElement, ObjectReference, SimpleMD_Identifier, GeographicElement, TemporalElement, MI_ObjectiveTypeCode, MI_Event,
  template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.MI_Objective", oThisClass, esriNS);
  }

  return oThisClass;
});