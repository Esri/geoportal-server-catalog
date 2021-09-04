define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./OfficialTitleConformanceCitation",
        "dojo/text!./templates/OfficialTitleConformanceReport.html"],
function(declare, lang, has, domStyle, Descriptor, Tabs, Element, InputTextArea, AbstractObject, GcoElement, ObjectReference,
  OfficialTitleConformanceCitation, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    
    postCreate: function() {
      this.inherited(arguments)
      
      domStyle.set(this._pass.domNode, "display", "none")
    }

  });

  return oThisClass;
});