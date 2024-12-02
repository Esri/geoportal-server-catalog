define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_Dimension",
        "./MD_Georectified",
        "./MD_Georeferenceable",
        "./MD_GridSpatialRepresentation",
        "./MD_VectorSpatialRepresentation",
        "dojo/text!./templates/MD_SpatialRepresentation.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_Dimension, 
        MD_Georectified, MD_Georeferenceable, MD_GridSpatialRepresentation, 
        MD_VectorSpatialRepresentation, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});