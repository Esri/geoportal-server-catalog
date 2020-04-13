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
        "./OfficialTitleConformanceCitation",
        "../../gmd/dataQuality/ConformanceDegree",
        "dojo/text!./templates/OfficialTitleConformanceReport.html"],
function(declare, lang, has, Descriptor, Tabs, Element, InputTextArea, AbstractObject, GcoElement, ObjectReference,
  OfficialTitleConformanceCitation, ConformanceDegree, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});