define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../gmd/extent/GeographicElement",
        "../gmd/extent/TemporalElement",
        "dojo/text!./templates/ServiceExtent.html"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, GeographicElement, TemporalElement, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    
    postCreate: function() {
      this.inherited(arguments)
      console.log("CUSTOM SERVICE EXTENT")
    }

  });

  return oThisClass;
});