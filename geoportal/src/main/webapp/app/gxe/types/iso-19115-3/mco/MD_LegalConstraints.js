define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./MD_RestrictionCode",
        "dojo/text!./templates/MD_LegalConstraints.html"],
function(declare, lang, has, Descriptor, MD_RestrictionCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});