define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "../../../form/Tabs",
        "../gmd/dataQuality/Quality",
        "../gmd/distribution/Distribution",
        "../gmd/metadataEntity/MetadataSection",
        "../srv/ServiceIdentification",
        "dojo/text!./templates/ServiceRoot.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, Tabs, Quality, Distribution, MetadataSection, ServiceIdentification,
  template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.base.ServiceRoot", oThisClass, esriNS);
  }

  return oThisClass;
});