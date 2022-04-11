define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./distributorFormat",
        "./TransferOptions",
        "dojo/text!./templates/MD_Distributor.html"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, DistributionFormat, TransferOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});