define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_Date",
        "dojo/text!./templates/HarmonisedConformanceCitation.html"],
function(declare, lang, has, domStyle, Descriptor, Element, Attribute, InputText, InputSelectOne, Options, Option, AbstractObject, GcoElement, ObjectReference, CI_Date,
  template) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
    
    postCreate: function() {
      this.inherited(arguments)
      
      domStyle.set(this._titleAnchorLink.domNode, "display", "none")
    }

  });

  return oThisClass;
});