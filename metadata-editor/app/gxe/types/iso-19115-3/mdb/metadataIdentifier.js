define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "dojo/text!./templates/metadataIdentifier.html"],
function(declare, lang, has, Descriptor, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});