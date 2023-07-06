define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/form/Tabs",
        "./DistributionFormat",
        "./TransferOptions",
        "dojo/text!./templates/Distribution.html"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, Tabs, DistributionFormat, TransferOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});