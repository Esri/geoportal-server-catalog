define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "dojo/text!./templates/CI_Address.html"
      ],
function(declare, lang, has, Descriptor, Element, AbstractObject, GcoElement, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
  
  });

  return oThisClass;
});