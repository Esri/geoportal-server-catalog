define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "../freeText/LanguageCode",
        "dojo/text!./templates/ResourceLanguage.html"],
function(declare, lang, has, Descriptor, CodeListReference, LanguageCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});