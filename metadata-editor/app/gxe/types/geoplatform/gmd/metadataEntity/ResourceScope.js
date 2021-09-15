define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/base/Descriptor",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "dojo/text!./templates/ResourceScope.html",
        "dojo/i18n!../../../../nls/i18nGeoplatform"
      ],
function(declare, lang, has, Descriptor, AbstractObject, CodeListReference, ObjectReference, template, i18nGeoplatform) {

  var oThisClass = declare(Descriptor, {
    templateString : template,
    i18nGeoplatform : i18nGeoplatform
  });

  return oThisClass;
});
