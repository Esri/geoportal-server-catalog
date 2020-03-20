define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "./Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "../gmd/dataQuality/Quality",
        "../gmd/distribution/Distribution",
        "../srv/metadataEntity/MetadataSection",
        "../srv/ServiceIdentification",
        "dojo/text!./templates/ServiceRoot.html"],
function(declare, lang, has, Descriptor, Element, Tabs, Quality, Distribution, MetadataSection, ServiceIdentification,
  template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});