define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/ISO19115Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/CodeListElement",
        "esri/dijit/metadata/form/iso/CodeListAttribute",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "../citation/CI_Date",
        "../maintenance/MD_ScopeCode",
        "../PT_FreeText",
        "../citation/CI_ResponsibleParty",
        "dojo/text!./templates/MD_MaintenanceInformation.html"],
function(declare, lang, has, Descriptor, 
  Element, CodeListElement, CodeListAttribute, CodeListValueAttribute,
  InputSelectOne, Options, Option, 
  CI_Date,
  MD_ScopeCode,
  PT_FreeText, 
  CI_ResponsibleParty,
  template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});