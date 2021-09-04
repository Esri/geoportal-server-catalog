define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/types/iso/gmd/maintenance/MD_ScopeCode",
        "dojo/text!./templates/MD_ScopeCode.html",
        "dojo/i18n!../../../../nls/i18nGeoplatform"
],
function(declare, lang, has, Descriptor, Element, CodeListReference, GcoElement, MD_ScopeCode, template, i18nGeoplatform) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    i18nGeoplatform : i18nGeoplatform

  });

  return oThisClass;
});
