define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/types/iso/gmd/maintenance/MD_ScopeCode",
        "dojo/text!./templates/MetadataHierarchy.html"],
function(declare, lang, has, Descriptor, Element, CodeListReference, GcoElement, MD_ScopeCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});