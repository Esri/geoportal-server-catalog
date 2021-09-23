define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "../mcc/MD_Identifier",
        "dojo/text!./templates/metadataIdentifier.html"],
function(declare, lang, has, Descriptor, Element, MD_Identifier, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});