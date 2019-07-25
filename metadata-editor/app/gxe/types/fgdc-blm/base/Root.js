define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "./Descriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/types/fgdc/idinfo/idinfo",
        "esri/dijit/metadata/types/fgdc/dataqual/dataqual",
        "esri/dijit/metadata/types/fgdc/spref/spref",
        "../eainfo/eainfo",
        "esri/dijit/metadata/types/fgdc/distinfo/distinfo",
        "esri/dijit/metadata/types/fgdc/metainfo/metainfo",
        "dojo/text!./templates/Root.html"],
function(declare, lang, has, Descriptor, Element, Tabs, idinfo, dataqual, spref, eainfo, distinfo, metainfo, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  return oThisClass;
});