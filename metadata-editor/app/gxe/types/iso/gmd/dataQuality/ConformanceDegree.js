define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../../base/Descriptor",
        "../../../../form/Element",
        "../../../../form/InputSelectOne",
        "../../../../form/Options",
        "../../../../form/Option",
        "dojo/text!./templates/ConformanceDegree.html",
        "../../../../../../kernel"],
function(declare, lang, has, Descriptor, Element, InputSelectOne, Options, Option, template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.gmd.dataQuality.ConformanceDegree", oThisClass, esriNS);
  }

  return oThisClass;
});