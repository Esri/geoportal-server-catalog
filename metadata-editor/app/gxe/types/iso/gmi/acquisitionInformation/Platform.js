define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/ObjectReference",
        "./MI_Platform",
        "dojo/text!./templates/Platform.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, ObjectReference, MI_Platform, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.Platform", oThisClass, esriNS);
  }

  return oThisClass;
});