define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../citation/ResourceContact",
        "dojo/text!./templates/distributorContact.html"],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, ObjectReference, ResourceContact, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});