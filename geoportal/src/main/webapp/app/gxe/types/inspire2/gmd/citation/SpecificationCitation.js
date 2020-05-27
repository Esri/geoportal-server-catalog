define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "./SpecificationCitationDate",
        "dojo/text!./templates/SpecificationCitation.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, CI_Date, template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
    i18nInspire: i18nInspire

  });

  return oThisClass;
});