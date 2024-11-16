define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "../cit/CI_OnLineFunctionCode",
        "dojo/text!./templates/CI_OnlineResource.html"],
function(declare, lang, has, Descriptor, CI_OnLineFunctionCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});