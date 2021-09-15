define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Element",
        "../../../form/Tabs",
        "../gmd/dataQuality/Quality",
        "../gmd/distribution/Distribution",
        "../gmd/identification/DataIdentification",
        "../gmd/metadataEntity/MetadataSection",
        "dojo/text!./templates/DataRoot.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, Tabs, Quality, Distribution, DataIdentification, MetadataSection,
  template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.base.DataRoot", oThisClass, esriNS);
  }

  return oThisClass;
});