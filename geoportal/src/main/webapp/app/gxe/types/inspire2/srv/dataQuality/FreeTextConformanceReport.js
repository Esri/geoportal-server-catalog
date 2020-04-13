define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./FreeTextConformanceCitation",
        "../../gmd/dataQuality/ConformanceDegree",
        "dojo/text!./templates/FreeTextConformanceReport.html"],
function(declare, lang, has, Descriptor, Tabs, Element, InputTextArea, AbstractObject, GcoElement, ObjectReference,
  FreeTextConformanceCitation, ConformanceDegree, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});