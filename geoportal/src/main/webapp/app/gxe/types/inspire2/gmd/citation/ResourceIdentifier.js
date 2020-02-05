define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/ElementChoice",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "dojo/text!./templates/ResourceIdentifier.html"],
function(declare, lang, has, Descriptor, Element, ElementChoice, InputText, AbstractObject, GcoElement, ObjectReference,
  template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});