define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "esri/dijit/metadata/form/Element",
        "esri/dijit/metadata/form/Tabs",
        "esri/dijit/metadata/form/iso/AbstractObject",
        "esri/dijit/metadata/form/iso/CodeListReference",
        "esri/dijit/metadata/form/iso/GcoElement",
        "esri/dijit/metadata/form/iso/ObjectReference",
        "./CI_Contact",
        "./CI_RoleCode",
        "dojo/text!./templates/CI_Individual.html"
      ],
function(declare, lang, has, Descriptor, 
  Element, Tabs, AbstractObject, CodeListReference, GcoElement, ObjectReference, CI_Contact,  CI_RoleCode, 
  template) {

  var oThisClass = declare(Descriptor, {

    templateString: template,
  

  });

  return oThisClass;
});