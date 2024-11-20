define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_ScopeDescription",
        "dojo/text!./templates/MD_Scope.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_ScopeDescription, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});