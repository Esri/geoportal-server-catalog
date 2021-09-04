define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../../../base/Descriptor",
        "../../../form/Tabs",
        "./ContainsOperations",
        "./CouplingType",
        "./OperatesOn",
        "./ServiceType",
        "./ServiceExtent",
        "dojo/text!./templates/ServiceResourceTab.html",
        "../../../../../kernel"],
function(declare, lang, has, Descriptor, Tabs, ContainsOperations, CouplingType, OperatesOn, ServiceType, ServiceExtent,
  template, esriNS) {

  var oThisClass = declare(Descriptor, {

    templateString: template

  });

  if(has("extend-esri")) {
    lang.setObject("dijit.metadata.types.iso.srv.ServiceResourceTab", oThisClass, esriNS);
  }

  return oThisClass;
});