define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./MD_Keywords",
        "dojo/text!./templates/OtherKeywords.html"],
function(declare, lang, has, Descriptor, ObjectReference, MD_Keywords, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});