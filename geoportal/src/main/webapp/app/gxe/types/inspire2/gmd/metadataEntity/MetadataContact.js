define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../citation/CI_RoleCode",
        "dojo/text!./templates/MetadataContact.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, Descriptor, Element, Attribute, Tabs, AbstractObject, CodeListReference, GcoElement, ObjectReference,
  CI_RoleCode, template, i18nInspire) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template,
    i18nInspire: i18nInspire
    
  });

  return oThisClass;
});