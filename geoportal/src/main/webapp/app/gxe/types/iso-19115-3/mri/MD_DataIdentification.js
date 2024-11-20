define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "./MD_AssociatedResource",
        "./DS_AssociationTypeCode",
        "./DS_InitiativeTypeCode",
        "./MD_KeywordClass",
        "./MD_Keywords",
        "./MD_KeywordTypeCode",
        "./MD_Resolution",
        "./MD_Usage",
        "../mcc/MD_ProgressCode",
        "../mcc/MD_SpatialRepresentationTypeCode",
        "dojo/text!./templates/MD_DataIdentification.html"],
function(declare, lang, Descriptor, Element, Attribute, MD_AssociatedResource, DS_AssociationTypeCode, DS_InitiativeTypeCode, MD_KeywordClass, MD_Keywords, MD_KeywordTypeCode, MD_Resolution, MD_Usage, MD_ProgressCode, MD_SpatialRepresentationTypeCode, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});