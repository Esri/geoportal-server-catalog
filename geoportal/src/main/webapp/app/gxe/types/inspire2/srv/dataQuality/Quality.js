define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "dojo/topic",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "../../gmd/dataQuality/ConformanceReport",
        "./ConformanceReport",
        "./ConceptualConsistency",
        "esri/dijit/metadata/types/iso/gmd/dataQuality/Lineage",
        "./Scope",
        "dojo/text!./templates/Quality.html",
        "dojo/i18n!../../../../../nls/i18nInspire"],
function(declare, lang, has, domStyle, topic, Descriptor, Tabs, AbstractObject, ObjectReference, 
         ConformanceReport, SrvConformanceReport, ConceptualConsistency, Lineage, Scope, 
         template, i18nInspire) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    i18nInspire: i18nInspire,

    
    postCreate: function() {
      this.inherited(arguments)
      
      this.toggle(false)
      
      this.own(topic.subscribe("inspire/service-type-changed", lang.hitch(this, function(serviceType) {
        var isOther = serviceType==="other"
        this.toggle(isOther)
      })))
    },
    
    toggle: function(isOther) {
      this._forNetwork._isOptionallyOff = isOther
      this._forInvokable._isOptionallyOff = !isOther
      domStyle.set(this._forNetwork.domNode, "display", isOther? "none": "block")
      domStyle.set(this._forInvokable.domNode, "display", !isOther? "none": "block")
    }

  });

  return oThisClass;
});