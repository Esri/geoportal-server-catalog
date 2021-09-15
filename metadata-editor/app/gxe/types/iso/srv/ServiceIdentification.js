define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Tabs",
        "../../../form/iso/AbstractObject",
        "../../../form/iso/ObjectReference",
        "../gmd/citation/ResourceCitation",
        "../gmd/citation/ResourceContact",
        "../gmd/constraints/ResourceConstraints",
        "../gmd/identification/ResourceDescription",
        "../gmd/identification/ResourceThumbnail",
        "../gmd/identification/ResourceKeywords",
        "./ServiceResourceTab",
        "dojo/text!./templates/ServiceIdentification.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, ResourceCitation, ResourceContact,
  ResourceConstraints, ResourceDescription, ResourceThumbnail, ResourceKeywords, ServiceResourceTab, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.srv.ServiceIdentification", oThisClass, esriNS);
  }

  return oThisClass;
});