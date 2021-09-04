define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/ObjectReference",
        "./DistributionFormat",
        "./TransferOptions",
        "dojo/text!./templates/Distribution.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, DistributionFormat, TransferOptions, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.distribution.Distribution", oThisClass, esriNS);
  }

  return oThisClass;
});