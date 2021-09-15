define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputSelectMany",
        "../../../../form/IsoTopicCategoryOptions",
        "dojo/text!./templates/ResourceClassification.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputSelectMany, IsoTopicCategoryOptions, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.ResourceClassification", oThisClass, esriNS);
  }

  return oThisClass;
});