define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./CI_RoleCode",
        "dojo/text!./templates/ResourceContact.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, Descriptor, Element, AbstractObject, CodeListReference, GcoElement, ObjectReference,
  CI_RoleCode, template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
    i18nInspire: i18nInspire

  });

  return oThisClass;
});