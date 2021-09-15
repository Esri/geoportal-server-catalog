define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Attribute",
        "../../../../form/iso/AbstractObject",
        "../../../../form/iso/ObjectReference",
        "../../gmd/identification/SimpleMD_Identifier",
        "dojo/text!./templates/MI_PlatformPass.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Attribute, AbstractObject, ObjectReference, SimpleMD_Identifier, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmi.acquisitionInformation.MI_PlatformPass", oThisClass, esriNS);
  }

  return oThisClass;
});