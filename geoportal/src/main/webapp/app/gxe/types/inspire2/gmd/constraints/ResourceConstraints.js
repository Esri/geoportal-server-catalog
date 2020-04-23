define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListAttribute",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/iso/CodeListElement",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/CodeSpaceAttribute",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./OtherConstraints",
        "./UseLimitation",
        "dojo/text!./templates/ResourceConstraints.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, Descriptor, InputSelectOne, Options, Option, AbstractObject, CodeListAttribute,
  CodeListValueAttribute, CodeListElement, CodeListReference, CodeSpaceAttribute, ObjectReference, OtherConstraints,
  UseLimitation, template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
    i18nInspire: i18nInspire

  });

  return oThisClass;
});