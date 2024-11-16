define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./MD_MediumFormatCode",
        "dojo/text!./templates/MD_Medium.html"],
function(declare, lang, has, Descriptor, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});