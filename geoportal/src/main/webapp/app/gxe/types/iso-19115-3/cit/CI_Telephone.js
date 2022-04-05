define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "dojo/text!./templates/CI_Telephone.html"
      ],
function(declare, lang, has, Descriptor, Element, AbstractObject, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
  

  });

  return oThisClass;
});