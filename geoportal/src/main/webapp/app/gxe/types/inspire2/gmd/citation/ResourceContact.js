define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_RoleCode",
        "dojo/text!./templates/ResourceContact.html"],
function(declare, lang, has, Descriptor, Element, AbstractObject, CodeListReference, GcoElement, ObjectReference,
  CI_RoleCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});