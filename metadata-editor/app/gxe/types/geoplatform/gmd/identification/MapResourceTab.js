define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/types/iso/gmd/citation/CI_OnlineResource",
        "app/gxe/types/geoplatform/gmd/citation/CI_Citation",
        "dojo/text!./templates/MapResourceTab.html"],
function(declare, lang, has, Descriptor, CI_OnlineResource, CI_Citation, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});
