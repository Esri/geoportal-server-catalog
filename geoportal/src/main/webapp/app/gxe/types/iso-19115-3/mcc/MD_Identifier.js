define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/iso/GcoElement",
        "../lan/PT_FreeText",
        "dojo/text!./templates/MD_Identifier.html"],
function(declare, lang, has, Descriptor, GcoElement, PT_FreeText, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});