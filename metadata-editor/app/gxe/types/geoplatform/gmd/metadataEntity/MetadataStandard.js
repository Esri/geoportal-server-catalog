define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/iso/GcoElement",
        "dojo/text!./templates/MetadataStandard.html"],
function(declare, lang, has, Descriptor, Element, InputText, GcoElement, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});
