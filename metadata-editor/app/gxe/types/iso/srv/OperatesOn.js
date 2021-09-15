define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Attribute",
        "../../../form/Element",
        "dojo/text!./templates/OperatesOn.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, Element, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.srv.OperatesOn", oThisClass, esriNS);
  }

  return oThisClass;
});