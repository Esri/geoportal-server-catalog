define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "../../../form/InputTextArea",
        "dojo/text!./templates/descript.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputTextArea, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.fgdc.idinfo.descript", oThisClass, esriNS);
  }

  return oThisClass;
});