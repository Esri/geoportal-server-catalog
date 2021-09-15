define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "dojo/text!./templates/Identification.html",
        "dojo/i18n!../../../../nls/i18nGeoplatform",
        "dojo/i18n!../../../../nls/i18nIso"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, template, i18nGeoplatform, i18nIso) {

  var oThisClass = declare(Descriptor, {
    templateString : template,
    i18nGeoplatform : i18nGeoplatform,
    i18nIso : i18nIso
  });

  return oThisClass;
});
