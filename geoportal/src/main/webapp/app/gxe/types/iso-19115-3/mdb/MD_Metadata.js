define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Attribute",
        "esri/dijit/metadata/form/iso/CodeListReference",        
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "./metadataIdentifier",
        "../lan/PT_Locale",
        "../cit/CI_Citation",
        "../cit/CI_Responsibility",
        "../cit/CI_Date",
        "../cit/CI_OnlineResource",
        "../msr/MD_SpatialRepresentation",
        "../mrs/MD_ReferenceSystem",
        "../mri/MD_MetadataExtensionInformation",
        "../mrc/MD_ContentInformation",
        "../mrd/MD_Distribution",
        "../mdq/DQ_DataQuality",
        "../mpc/MD_PortrayalCatalogueReference",
        "../mco/MD_Constraints",
        "../mas/MD_ApplicationSchemaInformation",
        "../mmi/MD_MaintenanceInformation",
        "../mrl/LI_Lineage",
        "../mdb/MD_MetadataScope",
        "dojo/text!./templates/MD_Metadata.html"],
function(declare, lang, Descriptor, Element, Attribute, CodeListReference, ObjectReference, GcoElement,
        metadataIdentifier, PT_Locale, CI_Citation, CI_Responsibility, CI_Date, 
        CI_OnlineResource, MD_SpatialRepresentation, MD_ReferenceSystem, 
        MD_MetadataExtensionInformation, MD_ContentInformation, MD_Distribution, 
        DQ_DataQuality, MD_PortrayalCatalogueReference, MD_Constraints, 
        MD_ApplicationSchemaInformation, MD_MaintenanceInformation, 
        LI_Lineage, MD_MetadataScope, template) {

  var oThisClass = declare(Descriptor, {
    
    templateString: template
    
  });

  return oThisClass;
});