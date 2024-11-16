define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./MD_StandardOrderProcess",
        "dojo/text!./templates/MD_Distributor.html"],
function(declare, lang, has, Descriptor, MD_StandardOrderProcess, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});