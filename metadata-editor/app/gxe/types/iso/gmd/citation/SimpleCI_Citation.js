define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Attribute",
        "../../../../form/Element",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/GcoElement",
        "dojo/text!./templates/SimpleCI_Citation.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, Element, AbstractObject, GcoElement, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.citation.SimpleCI_Citation", oThisClass, esriNS);
  }

  return oThisClass;
});