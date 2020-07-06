define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./ConformanceCitation",
        "./ConformanceDegree",
        "dojo/text!./templates/ConformanceReport.html"],
function(declare, lang, has, Descriptor, Element, InputTextArea, AbstractObject, GcoElement, ObjectReference,
  ConformanceCitation, ConformanceDegree, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});