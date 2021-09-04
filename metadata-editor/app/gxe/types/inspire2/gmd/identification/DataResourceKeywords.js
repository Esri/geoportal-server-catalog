define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "../identification/DataThemeKeywords",
        "../identification/GemetConceptKeywords",
        "../identification/OtherKeywords",
        "dojo/text!./templates/DataResourceKeywords.html"],
function(declare, lang, has, Descriptor, Tabs, DataThemeKeywords, GemetConceptKeywords, OtherKeywords, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});