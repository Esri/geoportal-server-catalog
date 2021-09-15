define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Tabs",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/ObjectReference",
        "../citation/ResourceCitation",
        "../citation/ResourceContact",
        "../constraints/ResourceConstraints",
        "./ResourceDescription",
        "./ResourceThumbnail",
        "./ResourceKeywords",
        "./DataResourceTab",
        "dojo/text!./templates/DataIdentification.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Tabs, AbstractObject, ObjectReference, ResourceCitation, ResourceContact,
  ResourceConstraints, ResourceDescription, ResourceThumbnail, ResourceKeywords, DataResourceTab, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.DataIdentification", oThisClass, esriNS);
  }

  return oThisClass;
});