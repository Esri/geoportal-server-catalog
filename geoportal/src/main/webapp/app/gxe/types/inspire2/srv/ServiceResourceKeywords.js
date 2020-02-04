define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "dojo/has",
        "../base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "../gmd/identification/GemetConceptKeywords",
        "../gmd/identification/OtherKeywords",
        "./ServiceCategoryKeywords",
        "dojo/text!./templates/ServiceResourceKeywords.html"],
function(declare, lang, has, Descriptor, Tabs, GemetConceptKeywords, OtherKeywords, ServiceCategoryKeywords, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});