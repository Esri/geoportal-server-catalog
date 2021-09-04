define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputDelimitedTextArea",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListAttribute",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/iso/CodeListElement",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/form/iso/gemet/GemetThemeTool",
        "dojo/text!./templates/DataThemeKeywords.html"],
function(declare, lang, has, Descriptor, Element, InputDelimitedTextArea, AbstractObject, CodeListAttribute,
  CodeListValueAttribute, CodeListElement, CodeListReference, ObjectReference, GemetThemeTool, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});