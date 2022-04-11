define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./formatDistributor",
        "./TransferOptions",
        "dojo/text!./templates/MD_Format.html"],
function(declare, lang, has, Descriptor, AbstractObject, ObjectReference, formatDistributor, TransferOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});