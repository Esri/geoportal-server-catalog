define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Tabs",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/ObjectReference",
        "./AcquisitionPlan",
        "./AcquisitionRequirement",
        "./EnvironmentalConditions",
        "./Instrument",
        "./Objective",
        "./Operation",
        "./Platform",
        "dojo/text!./templates/Acquisition.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, AcquisitionPlan, AcquisitionRequirement,
  EnvironmentalConditions, Instrument, Objective, Operation, Platform, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.Acquisition", oThisClass, esriNS);
  }

  return oThisClass;
});