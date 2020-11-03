define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataFileIdentifier",
        "./MetadataHierarchy",
        "./MetadataLanguage",
        "dojo/text!./templates/MetadataIdentifier.html"],
function(declare, lang, has, Descriptor, MetadataFileIdentifier, MetadataHierarchy, MetadataLanguage, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});