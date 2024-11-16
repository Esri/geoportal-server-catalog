define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "../lan/LocalName",
        "dojo/text!./templates/FC_FeatureType.html"],
function(declare, lang, has, Descriptor, Element, LocalName, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});