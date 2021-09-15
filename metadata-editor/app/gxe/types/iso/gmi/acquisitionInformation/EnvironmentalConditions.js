define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/ObjectReference",
        "./MI_EnvironmentalRecord",
        "dojo/text!./templates/EnvironmentalConditions.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, ObjectReference, MI_EnvironmentalRecord, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.EnvironmentalConditions", oThisClass, esriNS);
  }

  return oThisClass;
});