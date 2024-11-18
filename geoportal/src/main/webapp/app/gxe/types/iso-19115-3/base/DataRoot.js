define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "./MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "../mdb/identificationInfo",
        "../mdb/MD_Metadata",
        "../mdb/resourceConstraints",
        "../mdb/resourceLineage",
        "dojo/text!./templates/DataRoot.html"],
function(declare, lang, Descriptor, Element, Attribute, identificationInfo, MD_Metadata, resourceConstraints, resourceLineage, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});