define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Tabs",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/ObjectReference",
        "./ConformanceReport",
        "./Lineage",
        "./Scope",
        "dojo/text!./templates/Quality.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, ConformanceReport, Lineage, Scope, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.dataQuality.Quality", oThisClass, esriNS);
  }

  return oThisClass;
});