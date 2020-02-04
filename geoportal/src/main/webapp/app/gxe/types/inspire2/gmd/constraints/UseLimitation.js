define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/GcoElement",
        "dojo/text!./templates/UseLimitation.html"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, GcoElement, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});