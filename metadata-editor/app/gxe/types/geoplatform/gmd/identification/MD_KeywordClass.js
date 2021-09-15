define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/types/iso/gmd/citation/ResourceCitation",
        "dojo/text!./templates/MD_KeywordClass.html"],
function(declare, lang, has, Descriptor, Element, CI_Citation, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});
