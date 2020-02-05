define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/iso/gmd/dataQuality/Quality",
        "../gmd/distribution/Distribution",
        "../gmd/metadataEntity/MetadataSection",
        "../srv/ServiceIdentification",
        "dojo/text!./templates/ServiceRoot.html"],
function(declare, lang, has, Descriptor, Element, Tabs, Quality, Distribution, MetadataSection, ServiceIdentification,
  template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});