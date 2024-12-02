define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./MD_ExtendedElementInformation",
        "dojo/text!./templates/MD_MetadataExtensionInformation.html"],
function(declare, lang, has, Descriptor, MD_ExtendedElementInformation, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});