define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../citation/CI_RoleCode",
        "dojo/text!./templates/MetadataContact.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, domStyle, Descriptor, Element, Attribute, Tabs, AbstractObject, CodeListReference, GcoElement, ObjectReference,
  CI_RoleCode, template, i18nInspire) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template,
    i18nInspire: i18nInspire,
    
    postCreate: function() {
      this.inherited(arguments)
      
      domStyle.set(this._primaryRole.domNode, "display", "none")
      domStyle.set(this._xlinkHrefPointOfContact.domNode, "display", "none")
      
    }
    
  });

  return oThisClass;
});