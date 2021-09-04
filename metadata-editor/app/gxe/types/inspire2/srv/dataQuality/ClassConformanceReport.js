define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/ElementChoice",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./InvocableConformanceCitation",
        "./InteroperableConformanceCitation",
        "./HarmonisedConformanceCitation",
        "../../gmd/dataQuality/ConformanceDegree",
        "dojo/text!./templates/ClassConformanceReport.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, domStyle, Descriptor, Tabs, Element, ElementChoice, InputTextArea, AbstractObject, GcoElement, ObjectReference,
  InvocableConformanceCitation, InteroperableConformanceCitation, HarmonisedConformanceCitation, ConformanceDegree, template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    i18nInspire: i18nInspire,
    
    postCreate: function() {
      this.inherited(arguments)
      
      domStyle.set(this._invocablePass.domNode, "display", "none")
      domStyle.set(this._interoperablePass.domNode, "display", "none")
      domStyle.set(this._harmonisedPass.domNode, "display", "none")
    }

  });

  return oThisClass;
});