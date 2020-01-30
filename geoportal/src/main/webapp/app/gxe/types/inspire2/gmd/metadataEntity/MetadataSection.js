define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataContact",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataDate",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataReference",
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