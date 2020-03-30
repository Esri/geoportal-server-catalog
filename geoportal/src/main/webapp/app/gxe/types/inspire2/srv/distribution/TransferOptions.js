define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/topic",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_OnlineFunctionCode",
        "dojo/text!./templates/TransferOptions.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, topic, Descriptor, Element, Attribute, AbstractObject, CodeListReference, GcoElement, ObjectReference,
  CI_OnlineFunctionCode, template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    i18nInspire: i18nInspire,
    
    postCreate: function() {
      this.inherited(arguments)
      
      this.own(topic.subscribe("inspire/service-type-changed", lang.hitch(this, function(serviceType) {
        var isOther = serviceType==="other"
        this._forInvokable._isOptionallyOff = !isOther
        this._forInvokable.domNode.style.display = !isOther? "none": "block"
      })))
      
    }

  });

  return oThisClass;
});