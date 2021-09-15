define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/ObjectReference",
        "./MD_BrowseGraphic",
        "dojo/text!./templates/ResourceThumbnail.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, ObjectReference, MD_BrowseGraphic, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.ResourceThumbnail", oThisClass, esriNS);
  }

  return oThisClass;
});