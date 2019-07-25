define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/fgdc/InputDate",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/Section",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/fgdc/cntinfo/cntinfo",
        "dojo/text!./templates/metainfo.html"],
function(declare, lang, has, Descriptor, Element, InputDate, InputSelectOne, InputText, InputTextArea, Options, Option,
  Section, Tabs, cntinfo, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});