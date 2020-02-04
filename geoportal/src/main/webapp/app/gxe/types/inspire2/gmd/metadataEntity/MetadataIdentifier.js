define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataFileIdentifier",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataHierarchy",
        "./MetadataLanguage",
        "dojo/text!./templates/MetadataIdentifier.html"],
function(declare, lang, has, Descriptor, MetadataFileIdentifier, MetadataHierarchy, MetadataLanguage, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});