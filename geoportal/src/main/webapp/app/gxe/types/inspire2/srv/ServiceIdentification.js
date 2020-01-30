define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/ResourceCitation",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceDescription",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceThumbnail",
        "../gmd/citation/ResourceContact",
        "../gmd/constraints/ResourceConstraints",
        "./ServiceResourceKeywords",
        "./ServiceResourceTab",
        "dojo/text!./templates/ServiceIdentification.html"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, ResourceCitation, ResourceDescription,
  ResourceThumbnail, ResourceContact, ResourceConstraints, ServiceResourceKeywords, ServiceResourceTab, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});