define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./EX_GeographicExtent",
        "./EX_TemporalExtent",
        "./EX_VerticalExtent",
        "dojo/text!./templates/EX_Extent.html"],
function(declare, lang, has, Descriptor, EX_GeographicExtent, EX_TemporalExtent, EX_VerticalExtent, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});