define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./CI_Responsibility",
        "dojo/text!./templates/CI_Citation.html"],
function(declare, lang, has, Descriptor, CI_Responsibility, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});