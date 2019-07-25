define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/InputNumber",
        "esri/dijit/metadata/form/tools/ClickableValueTool",
        "dojo/text!./templates/eainfo.html"],
function(declare, lang, has, Descriptor, Element, InputTextArea, InputNumber, ClickableValueTool, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});