define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_GeometricObjects",
        "./MD_TopologyLevelCode",
        "dojo/text!./templates/MD_VectorSpatialRepresentation.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_GeometricObjects, 
        MD_TopologyLevelCode, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});