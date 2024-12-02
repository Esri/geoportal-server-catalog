define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_DimensionNameTypeCode",
        "dojo/text!./templates/MD_Dimension.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_DimensionNameTypeCode, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});