define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/InputSelectOne",
        "esri/dijit/metadata/form/Options",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/iso/CodeListAttribute",
        "esri/dijit/metadata/form/iso/CodeListValueAttribute",
        "esri/dijit/metadata/form/iso/CodeListElement",
        "esri/dijit/metadata/form/iso/CodeSpaceAttribute",
        "dojo/text!./templates/MD_CellGeometryCode.html"],
function(declare, lang, has, Descriptor,InputSelectOne,Options, Option, CodeListAttribute, CodeListValueAttribute, CodeListElement, CodeSpaceAttribute, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});