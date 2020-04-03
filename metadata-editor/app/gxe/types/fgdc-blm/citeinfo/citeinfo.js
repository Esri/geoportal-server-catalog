define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/fgdc/InputDate",
        "esri/dijit/metadata/form/fgdc/InputTime",
        "esri/dijit/metadata/form/tools/ClickableValueTool",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/InputTextArea",        
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "dojo/text!./templates/citeinfo.html"],
function(declare, lang, has, Descriptor, Element, InputDate, InputTime, ClickableValueTool, InputSelectOne, InputTextArea, Options, Option, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});