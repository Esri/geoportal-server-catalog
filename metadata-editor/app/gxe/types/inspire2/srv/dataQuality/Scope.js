define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/maintenance/MD_ScopeCode",
        "dojo/text!./templates/Scope.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, Descriptor, Element, AbstractObject, CodeListReference, ObjectReference, MD_ScopeCode, template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    i18nInspire: i18nInspire,
    templateString : template,

  });

  return oThisClass;
});