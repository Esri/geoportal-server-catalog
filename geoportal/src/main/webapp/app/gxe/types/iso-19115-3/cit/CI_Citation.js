define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./CI_PresentationFormCode",
        "./CI_Series",
        "../mcc/MD_BrowseGraphic",
        "dojo/text!./templates/CI_Citation.html"],
function(declare, lang, has, Descriptor, CI_PresentationFormCode, CI_Series, MD_BrowseGraphic, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});