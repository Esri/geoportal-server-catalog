define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "./MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "../mdb/MD_Metadata",
        "dojo/text!./templates/DataRoot.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_Metadata, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});