define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./CI_Organisation",
        "./CI_RoleCode",
        "../gex/EX_Extent",
        "dojo/text!./templates/CI_Responsibility.html"],
function(declare, lang, has, Descriptor, CI_Organisation, CI_RoleCode, EX_Extent, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});