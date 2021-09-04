define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./DistributionFormat",
        "./TransferOptions",
        "dojo/text!./templates/Distribution.html"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, DistributionFormat, TransferOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});
