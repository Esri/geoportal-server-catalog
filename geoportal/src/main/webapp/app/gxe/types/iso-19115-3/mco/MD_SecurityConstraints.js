define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./MD_ClassificationCode",
        "dojo/text!./templates/MD_SecurityConstraints.html"],
function(declare, lang, has, Descriptor, MD_ClassificationCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});