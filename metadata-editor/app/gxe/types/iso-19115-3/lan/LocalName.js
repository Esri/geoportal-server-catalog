define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "dojo/text!./templates/LocalName.html"],
function(declare, lang, Descriptor, Element, Attribute, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});