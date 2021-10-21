define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "../mcc/MD_ScopeCode",
        "dojo/text!./templates/MD_MetadataScope.html"],
function(declare, lang, has, Descriptor, Element, MD_ScopeCode, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});