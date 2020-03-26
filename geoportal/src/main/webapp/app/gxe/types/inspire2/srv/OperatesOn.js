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
    xlinkHrefOrg: "",
    
    postCreate: function() {
      this.inherited(arguments)
      
      this.own(topic.subscribe("inspire/service-type-changed", lang.hitch(this, function(serviceType) {
        var isOther = serviceType==="other"
        this._forNetwork._isOptionallyOff = isOther
        this._forInvokable._isOptionallyOff = !isOther
        this._forNetwork.domNode.style.display = isOther? "none": "block"
        this._forInvokable.domNode.style.display = !isOther? "none": "block"
      })))
    }

  });

  return oThisClass;
});