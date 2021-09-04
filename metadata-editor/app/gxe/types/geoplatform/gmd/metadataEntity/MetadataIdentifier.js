define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataFileIdentifier",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataLanguage",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataHierarchy",
        "dojo/text!./templates/MetadataIdentifier.html"],
function(declare, lang, has, Descriptor, MetadataFileIdentifier, MetadataLanguage, MetadataHierarchy, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.metadataEntity.MetadataIdentifier", oThisClass, esriNS);
  }

  return oThisClass;
});
