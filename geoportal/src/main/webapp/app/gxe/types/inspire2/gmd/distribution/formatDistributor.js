define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_OnlineFunctionCode",
        "./distributorContact",
        "./distributorTransferOptions",
        "dojo/text!./templates/formatDistributor.html"],
function(declare, lang, has, Descriptor, Element, AbstractObject, 
         GcoElement, ObjectReference, CI_OnlineFunctionCode, 
         DistributorContact, DistributorTransferOptions, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});