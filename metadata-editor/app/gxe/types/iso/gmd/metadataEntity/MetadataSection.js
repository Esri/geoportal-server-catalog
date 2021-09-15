define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Tabs",
        "./MetadataIdentifier",
        "./MetadataContact",
        "./MetadataDate",
        "./MetadataStandard",
        "./MetadataReference",
        "dojo/text!./templates/MetadataSection.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Tabs, MetadataIdentifier, MetadataContact, MetadataDate, MetadataStandard,
  MetadataReference, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.metadataEntity.MetadataSection", oThisClass, esriNS);
  }

  return oThisClass;
});