define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/form/Option",
        "esri/dijit/metadata/form/Options",
        "dojo/text!./templates/ServiceCategoryOptions.html"],
function(declare, lang, has, Option, Options, template, i18nInspire) {

  var oThisClass = declare(Options, {

    i18nInspire: i18nInspire,
    templateString: template

  });

  return oThisClass;
});
