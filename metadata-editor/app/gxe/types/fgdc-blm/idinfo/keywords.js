define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputDelimitedTextArea",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/tools/ClickableValueTool",
        "esri/dijit/metadata/form/fgdc/IsoTopicTool",
        "dojo/text!./templates/keywords.html"],
function(declare, lang, has, Descriptor, Element, InputDelimitedTextArea, InputText, Tabs, ClickableValueTool,
  IsoTopicTool, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});