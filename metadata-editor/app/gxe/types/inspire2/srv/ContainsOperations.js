define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListAttribute",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/iso/CodeListElement",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/CodeSpaceAttribute",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_OnlineFunctionCode",
        "dojo/text!./templates/ContainsOperations.html"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, AbstractObject, CodeListAttribute,
  CodeListValueAttribute, CodeListElement, CodeListReference, CodeSpaceAttribute, GcoElement, ObjectReference,
  CI_OnlineFunctionsCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});