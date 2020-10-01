define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/context/DescriptorMixin"],
function(declare, lang, has, DescriptorMixin) {

  var oThisClass = declare([DescriptorMixin], {
    
    inspireCodeListPrefix: "http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#",
    inspireLanguageCodeList: "http://www.loc.gov/standards/iso639-2/",

    constructor: function(args) {
      lang.mixin(this, args);
    }

  });

  return oThisClass;
});