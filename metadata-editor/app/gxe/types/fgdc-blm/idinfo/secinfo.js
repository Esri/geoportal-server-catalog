define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "../../../form/InputSelectOne",
        "../../../form/InputTextArea",
        "../../../form/Options",
        "../../../form/Option",
        "dojo/text!./templates/secinfo.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, InputTextArea, Options, Option, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.fgdc.idinfo.secinfo", oThisClass, esriNS);
  }

  return oThisClass;
});