define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "./SpecificationCitationDate",
        "dojo/text!./templates/SpecificationCitation.html"],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, CI_Date, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});