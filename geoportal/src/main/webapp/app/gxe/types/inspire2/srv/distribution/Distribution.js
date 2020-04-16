define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/topic",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/distribution/DistributionFormat",
        "./TransferOptions",
        "dojo/text!./templates/Distribution.html"],
function(declare, lang, has, topic, Descriptor, AbstractObject, ObjectReference, DistributionFormat, TransferOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    
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

//        this._forNetwork._isGxeElement = !isOther
//        this._forInvokable._isGxeElement = isOther
        
//        this._forNetwork.toggleContent(isOther, true)
//        this._forInvokable.toggleContent(!isOther, true)
        this._forNetwork.domNode.style.display = isOther? "none": "block"
        this._forInvokable.domNode.style.display = !isOther? "none": "block"
    }

  });

  return oThisClass;
});