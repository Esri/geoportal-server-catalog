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
        this._xlinkHref.minOccurs = isOther? 1: 0
        this._placeholder.toggleContent(isOther || this.xlinkHrefOrg.length>0, false)
        this._placeholder.postCreate()
        if (isOther) {
          this.xlinkHrefOrg = this._xlinkHref.inputWidget.getInputValue().trim()
          this._xlinkHref.inputWidget.setInputValue("https://inspire.ec.europa.eu/sites/default/files/md_2.0_datasets_example.xml")
        } else {
          this._xlinkHref.inputWidget.setInputValue(this.xlinkHrefOrg)
        }
      })))
    }

  });

  return oThisClass;
});