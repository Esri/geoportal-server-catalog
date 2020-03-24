define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "../../gmd/metadataEntity/MetadataContact",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataDate",
        "../../gmd/metadataEntity/MetadataReference",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataStandard",
        "./MetadataIdentifier",
        "dojo/text!./templates/MetadataSection.html"],
function(declare, lang, has, Descriptor, Tabs, MetadataContact, MetadataDate, MetadataReference, MetadataStandard,
  MetadataIdentifier, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});