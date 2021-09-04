define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_ResponsibleParty",
        "dojo/text!./templates/MD_Distributor.html"],
function(declare, lang, has, Descriptor, ObjectReference, CI_ResponsibleParty, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});
