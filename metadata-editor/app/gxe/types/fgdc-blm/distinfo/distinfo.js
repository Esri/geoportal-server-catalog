define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/InputTextArea",        
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/Section",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/ElementChoice",
        "esri/dijit/metadata/types/fgdc/cntinfo/cntinfo",
        "esri/dijit/metadata/types/fgdc/timeinfo/timeinfo",
        "dojo/text!./templates/distinfo.html",
        "dojo/i18n!../../../nls/i18nFgdc"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, InputTextArea, Options, Option, Section, Tabs, ElementChoice, cntinfo, timeinfo, template, i18nFgdc) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});