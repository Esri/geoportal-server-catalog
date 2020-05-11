define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../extent/GeographicElement",
        "../extent/TemporalElement",
        "dojo/text!./templates/ResourceExtent.html"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, GeographicElement, TemporalElement, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});