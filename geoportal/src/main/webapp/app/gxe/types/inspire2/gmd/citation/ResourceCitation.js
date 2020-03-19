define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./CI_Date",
        "./ResourceIdentifier",
        "dojo/text!./templates/ResourceCitation.html"],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, ObjectReference, CI_Date,
  ResourceIdentifier, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});