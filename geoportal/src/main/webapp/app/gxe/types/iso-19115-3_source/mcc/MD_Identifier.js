define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "../cit/CI_Citation",
        "dojo/text!./templates/MD_Identifier.html"],
function(declare, lang, has, Descriptor, CI_Citation ,template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});