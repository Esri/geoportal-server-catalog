define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "dojo/text!./templates/FC_PropertyType.html"],
function(declare, lang, has, Descriptor, Element, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});