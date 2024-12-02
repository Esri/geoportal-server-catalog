define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./DQ_DomainConsistency",
        "../mcc/MD_Scope",
        "dojo/text!./templates/DQ_DataQuality.html"],
function(declare, lang, has, Descriptor, DQ_DomainConsistency, MD_Scope, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});