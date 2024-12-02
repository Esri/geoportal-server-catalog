define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_CellGeometryCode",
        "dojo/text!./templates/MD_GridSpatialRepresentation.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_CellGeometryCode, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});