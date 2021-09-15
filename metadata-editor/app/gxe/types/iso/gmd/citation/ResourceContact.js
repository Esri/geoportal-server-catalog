define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/iso/ObjectReference",
        "./CI_ResponsibleParty",
        "dojo/text!./templates/ResourceContact.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, ObjectReference, CI_ResponsibleParty, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.citation.ResourceContact", oThisClass, esriNS);
  }

  return oThisClass;
});