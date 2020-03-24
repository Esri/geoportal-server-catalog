define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/topic",
        "../base/Descriptor",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/Element",
        "dojo/text!./templates/OperatesOn.html"],
function(declare, lang, has, topic, Descriptor, Attribute, Element, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
    
    postCreate: function() {
      this.inherited(arguments)
      
      this.own(topic.subscribe("inspire/service-type-changed", lang.hitch(this, function(serviceType) {
        console.log('OperatesOn received service type change to', serviceType, this)
        var isOther = serviceType==="other"
        this._xlinkHref.minOccurs = isOther? 1: 0
        this._placeholder.toggleContent(isOther, false)
      })))
    }

  });

  return oThisClass;
});