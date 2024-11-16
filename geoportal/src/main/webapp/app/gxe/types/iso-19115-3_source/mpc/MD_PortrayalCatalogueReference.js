define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "dojo/text!./templates/MD_PortrayalCatalogueReference.html"],
function(declare, lang, has, Descriptor, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});