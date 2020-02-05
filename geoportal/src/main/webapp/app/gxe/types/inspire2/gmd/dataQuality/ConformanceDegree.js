define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "dojo/text!./templates/ConformanceDegree.html"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});