define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "../mrd/MD_Medium",
        "dojo/text!./templates/MD_Format.html"],
function(declare, lang, has, Descriptor, MD_Medium, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});