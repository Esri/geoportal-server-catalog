define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/iso/gmd/identification/DataRepresentation",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceDescription",
        "esri/dijit/metadata/types/iso/gmd/citation/ResourceContact",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceThumbnail",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceKeywords",
        "esri/dijit/metadata/types/iso/gmd/constraints/ResourceConstraints",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceClassification",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceExtent",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceLanguage",
        "dojo/text!./templates/DataResourceTab.html"],
function(declare, lang, has, Descriptor, Tabs, DataRepresentation,
  ResourceDescription, ResourceContact, ResourceThumbnail, ResourceKeywords,
  ResourceConstraints, ResourceClassification, ResourceExtent,
  ResourceLanguage, template) {

    // "app/gxe/types/geoplatform/gmd/citation/CI_Citation",
    // CI_Citation,

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});
