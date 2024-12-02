define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./CI_DateTypeCode",
        "dojo/text!./templates/CI_Date.html"],
function(declare, lang, has, Descriptor, CI_DateTypeCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});