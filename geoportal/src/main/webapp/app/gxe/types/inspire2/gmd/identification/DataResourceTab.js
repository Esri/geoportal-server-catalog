define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "./DataRepresentation",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceClassification",
        "./ResourceExtent",
        "../identification/ResourceLanguage",
        "dojo/text!./templates/DataResourceTab.html"],
function(declare, lang, has, Descriptor, Tabs, DataRepresentation, ResourceClassification, ResourceExtent,
  ResourceLanguage, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});