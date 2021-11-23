define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "../mcc/MD_Identifier",
        "../lan/PT_FreeText",
        "dojo/text!./templates/DQ_MeasureReference.html"],
function(declare, lang, has, Descriptor, CI_Citation, PT_FreeText, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});