define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputSelectMany",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListAttribute",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/iso/CodeListElement",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./ServiceCategoryOptions",
        "dojo/text!./templates/ServiceCategoryKeywords.html"],
function(declare, lang, has, Descriptor, Element, InputSelectMany, AbstractObject, CodeListAttribute,
  CodeListValueAttribute, CodeListElement, CodeListReference, ObjectReference, ServiceCategoryOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});