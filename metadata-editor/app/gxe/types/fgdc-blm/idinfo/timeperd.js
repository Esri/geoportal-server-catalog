define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "../../../form/InputSelectOne",
        "../../../form/Options",
        "../../../form/Option",
        "../timeinfo/timeinfo",
        "dojo/text!./templates/timeperd.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, timeinfo, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.fgdc.idinfo.timeperd", oThisClass, esriNS);
  }

  return oThisClass;
});