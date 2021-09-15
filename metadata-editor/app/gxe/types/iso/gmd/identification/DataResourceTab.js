define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Tabs",
        "./DataRepresentation",
        "./ResourceClassification",
        "./ResourceExtent",
        "./ResourceLanguage",
        "dojo/text!./templates/DataResourceTab.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Tabs, DataRepresentation, ResourceClassification, ResourceExtent,
  ResourceLanguage, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.DataResourceTab", oThisClass, esriNS);
  }

  return oThisClass;
});