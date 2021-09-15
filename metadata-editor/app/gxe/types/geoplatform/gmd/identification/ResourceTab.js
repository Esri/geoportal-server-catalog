define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/Tabs",
        "dojo/text!./templates/DataResourceTab.html",
        "dojo/text!./templates/LayerResourceTab.html",
        "dojo/text!./templates/MapResourceTab.html",
        "dojo/text!./templates/ResourceTab.html"],
function(declare, lang, has, Descriptor, Tabs, DataResourceTab, LayerResourceTab,  MapResourceTab, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});
