define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "../../../form/InputNumber",
        "../../../form/fgdc/GeoExtentTool",
        "dojo/text!./templates/bounding.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputNumber, GeoExtentTool, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.fgdc.idinfo.bounding", oThisClass, esriNS);
  }

  return oThisClass;
});