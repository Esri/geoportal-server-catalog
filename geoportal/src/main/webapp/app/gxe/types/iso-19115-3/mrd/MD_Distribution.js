define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./MD_DigitalTransferOptions",
        "./MD_Distributor",
        "../mri/MD_Format",
        "dojo/text!./templates/MD_Distribution.html"],
function(declare, lang, has, Descriptor, MD_DigitalTransferOptions, MD_Distributor, MD_Format, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});