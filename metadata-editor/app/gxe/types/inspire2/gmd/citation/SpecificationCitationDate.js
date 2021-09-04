define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputDate",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/SpecificationCitationDate.html"],
function(declare, lang, has, domStyle, Descriptor, Element, InputDate, AbstractObject, CodeListReference, GcoElement,
  template) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
    
    postCreate: function() {
      this.inherited(arguments)
      
      domStyle.set(this._dateType.domNode, "display", "none")
    }

  });

  return oThisClass;
});