define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/MD_BrowseGraphic.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.MD_BrowseGraphic", oThisClass, esriNS);
  }

  return oThisClass;
});