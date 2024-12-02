define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "../base/MyProfileDescriptor",
        "./DQ_ConformanceResult",
        "./DQ_MeasureReference",
        "dojo/text!./templates/DQ_DomainConsistency.html"],
function(declare, lang, has, Descriptor, DQ_ConformanceResult, DQ_MeasureReference, template) {

  var oThisClass = declare(Descriptor, {

    templateString : template

  });

  return oThisClass;
});