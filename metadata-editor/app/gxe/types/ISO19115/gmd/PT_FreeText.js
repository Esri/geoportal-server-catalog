define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/ISO19115Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "dojo/text!./templates/PT_FreeText.html"],
function(declare, lang, Descriptor, Element, Attribute, InputSelectOne, Options, Option, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});
