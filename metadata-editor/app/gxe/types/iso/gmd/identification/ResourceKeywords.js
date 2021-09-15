define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/ObjectReference",
        "./MD_Keywords",
        "dojo/text!./templates/ResourceKeywords.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, ObjectReference, MD_Keywords, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.identification.ResourceKeywords", oThisClass, esriNS);
  }

  return oThisClass;
});