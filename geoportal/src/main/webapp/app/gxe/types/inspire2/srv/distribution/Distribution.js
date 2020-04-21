define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "dojo/dom-style",
        "dojo/topic",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/distribution/DistributionFormat",
        "./TransferOptions",
        "dojo/text!./templates/Distribution.html"],
function(declare, lang, has, domStyle, topic, Descriptor, AbstractObject, ObjectReference, DistributionFormat, TransferOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template,
    storedNetworkOptionallyOff: true,
    
    postCreate: function() {
      this.inherited(arguments)
      
      this.toggle(false)
      
      this.own(topic.subscribe("inspire/service-type-changed", lang.hitch(this, function(serviceType) {
        var isOther = serviceType==="other"
        this.toggle(isOther)
      })))
    },
    
    toggle: function(isOther) {
        if (isOther) {
          this.storedNetworkOptionallyOff = this._forNetwork._isOptionallyOff
          this._forNetwork.toggleContent(false, false)
          this._forNetwork._isOptionallyOff = true
        } else {
          this._forNetwork.toggleContent(!this.storedNetworkOptionallyOff, false)
          this._forNetwork._isOptionallyOff = this.storedNetworkOptionallyOff
        }
        
        this._forNetwork._isGxeElement = !isOther
        domStyle.set(this._forNetwork.domNode, "display", isOther? "none": "block")
        

        this._forInvokable.toggleContent(isOther, false)
        this._forInvokable._isGxeElement = isOther
        this._forInvokable._isOptionallyOff = !isOther
        domStyle.set(this._forInvokable.domNode, "display", !isOther? "none": "block")
    }

  });

  return oThisClass;
});