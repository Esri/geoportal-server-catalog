define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_Date",
        "esri/dijit/metadata/types/iso/gmd/citation/ResourceIdentifier",
        "dojo/text!./templates/CI_Citation.html"],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, ObjectReference, CI_Date,
  ResourceIdentifier, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});
