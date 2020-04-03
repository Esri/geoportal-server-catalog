define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "dojo/text!./templates/browse.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.fgdc.idinfo.browse", oThisClass, esriNS);
  }

  return oThisClass;
});