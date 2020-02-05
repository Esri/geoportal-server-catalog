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
        "esri/dijit/metadata/types/iso/gmd/citation/CI_Date",
        "dojo/text!./templates/ConformanceCitation.html"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, AbstractObject, GcoElement, ObjectReference, CI_Date,
  template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});