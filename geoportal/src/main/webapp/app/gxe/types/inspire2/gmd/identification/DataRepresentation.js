define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/ElementChoice",
        "esri/dijit/metadata/form/InputNumber",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/identification/MD_SpatialRepresentationTypeCode",
        "dojo/text!./templates/DataRepresentation.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, Descriptor, Attribute, Element, ElementChoice, InputNumber, InputSelectOne, Options, Option,
  AbstractObject, CodeListReference, GcoElement, ObjectReference, MD_SpatialRepresentationTypeCode, template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    i18nInspire: i18nInspire

  });

  return oThisClass;
});