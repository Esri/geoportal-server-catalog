define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../citation/ResourceCitation",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceDescription",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceThumbnail",
        "../citation/ResourceContact",
        "../constraints/ResourceConstraints",
        "../identification/DataResourceKeywords",
        "../identification/DataResourceTab",
        "dojo/text!./templates/DataIdentification.html"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, ResourceCitation, ResourceDescription,
  ResourceThumbnail, ResourceContact, ResourceConstraints, DataResourceKeywords, DataResourceTab, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});