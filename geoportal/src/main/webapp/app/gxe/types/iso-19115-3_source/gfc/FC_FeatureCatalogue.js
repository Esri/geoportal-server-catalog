define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "../lan/PT_FreeText",
        "../cit/CI_Date",
        "../gfc/FC_FeatureType",
        "dojo/text!./templates/FC_FeatureCatalogue.html"],
function(declare, lang, has, Descriptor, Element, PT_FreeText, CI_Date,FC_FeatureType, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});