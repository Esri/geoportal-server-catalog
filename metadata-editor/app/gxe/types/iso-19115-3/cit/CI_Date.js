define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "dojo/text!./templates/CI_Date.html"],
function(declare, lang, has, Descriptor, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});