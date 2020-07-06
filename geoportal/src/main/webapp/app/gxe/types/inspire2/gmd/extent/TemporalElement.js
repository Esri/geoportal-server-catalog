define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojox/uuid/generateRandomUuid",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/InputDate",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "dojo/text!./templates/TemporalElement.html"],
function(declare, lang, has, generateRandomUuid, Descriptor, Attribute, Element, InputDate, InputText, AbstractObject, ObjectReference, template) {
  
  var oThisClass = declare(Descriptor, {
    
    templateString : template,
    
    postCreate: function() {
      this.inherited(arguments)
      
      if (!this._id.get('value')) {
        this._id.set('value', 'ID'+generateRandomUuid())
      }
    }
    
  });

  return oThisClass;
});