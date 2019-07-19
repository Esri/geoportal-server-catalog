define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/Section",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/tools/ClickableValueTool",
        "esri/dijit/metadata/types/fgdc/citeinfo/citeinfo",
        "esri/dijit/metadata/types/fgdc/cntinfo/cntinfo",
        "esri/dijit/metadata/types/fgdc/idinfo/bounding",
        "esri/dijit/metadata/types/fgdc/idinfo/browse",
        "esri/dijit/metadata/types/fgdc/idinfo/descript",
        "esri/dijit/metadata/types/fgdc/idinfo/keywords",
        "esri/dijit/metadata/types/fgdc/idinfo/secinfo",
        "esri/dijit/metadata/types/fgdc/idinfo/status",
        "esri/dijit/metadata/types/fgdc/idinfo/timeperd",
        "dojo/text!./templates/idinfo.html"],
function(declare, lang, has, Descriptor, Element, InputTextArea, Section, Tabs, ClickableValueTool, citeinfo, cntinfo,
  bounding, browse, descript, keywords, secinfo, status, timeperd, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});