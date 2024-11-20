define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "../mri/MD_Resolution",
        "dojo/text!./templates/LI_Source.html"],
function(declare, lang, has, Descriptor, MD_Resolution, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});