define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/ResourceCitation",
        "esri/dijit/metadata/types/iso/gmd/citation/ResourceContact",
        "esri/dijit/metadata/types/iso/gmd/constraints/ResourceConstraints",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceDescription",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceThumbnail",
        "esri/dijit/metadata/types/iso/gmd/identification/ResourceKeywords",
        "dojo/text!./templates/LayerIdentification.html",
        "dojo/i18n!../../../../nls/i18nGeoplatform",
        "dojo/i18n!../../../../nls/i18nIso"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, ResourceCitation, ResourceContact,
  ResourceConstraints, ResourceDescription, ResourceThumbnail, ResourceKeywords, template, i18nGeoplatform, i18nIso) {

  var oThisClass = declare(Descriptor, {
    templateString : template,
    i18nGeoplatform : i18nGeoplatform,
    i18nIso : i18nIso
  });

  return oThisClass;
});
