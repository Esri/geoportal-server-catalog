define(["dojo/_base/declare", 
        "dojo/_base/lang",
        "esri/dijit/metadata/base/Descriptor",
        "dojo/i18n!esri/dijit/metadata/nls/i18nBase",
        "dojo/i18n!esri/dijit/metadata/nls/i18nIso"],
function(declare, lang, Descriptor, i18nBase, i18nIso) {

  var oThisClass = declare(Descriptor, {
    
    i18nBase: i18nBase,
    i18nIso: i18nIso,
    
  });

  return oThisClass;
});