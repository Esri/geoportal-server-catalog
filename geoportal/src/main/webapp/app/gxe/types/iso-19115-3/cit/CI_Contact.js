define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/InputTextArea",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./CI_Address",
        "./CI_OnlineResource",
        "./CI_Telephone",
        "dojo/text!./templates/CI_Contact.html"
      ],
function(declare, lang, has, Descriptor, Element, Tabs, InputTextArea, AbstractObject, GcoElement,
    ObjectReference, CI_Address, CI_OnlineResource, CI_Telephone, template) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
  

  });

  return oThisClass;
});