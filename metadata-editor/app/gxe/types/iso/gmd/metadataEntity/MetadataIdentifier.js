define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "./MetadataFileIdentifier",
        "./MetadataLanguage",
        "./MetadataHierarchy",
        "dojo/text!./templates/MetadataIdentifier.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, MetadataFileIdentifier, MetadataLanguage, MetadataHierarchy, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.metadataEntity.MetadataIdentifier", oThisClass, esriNS);
  }

  return oThisClass;
});