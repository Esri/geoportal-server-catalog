define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "dojo/text!./templates/MetadataReference.html"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, AbstractObject, GcoElement, ObjectReference, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});