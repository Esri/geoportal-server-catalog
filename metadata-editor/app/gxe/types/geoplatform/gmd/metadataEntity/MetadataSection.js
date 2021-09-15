define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "./MetadataIdentifier",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataContact",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataDate",
        "./MetadataStandard",
        "esri/dijit/metadata/types/iso/gmd/metadataEntity/MetadataReference",
        "dojo/text!./templates/MetadataSection.html"],
function(declare, lang, has, Descriptor, Tabs, MetadataIdentifier, MetadataContact, MetadataDate, MetadataStandard,
  MetadataReference, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});