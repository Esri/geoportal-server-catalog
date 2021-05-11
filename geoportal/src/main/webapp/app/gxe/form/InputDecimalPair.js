define(["dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/has",
        "esri/dijit/metadata/form/InputText",
        "esri/dijit/metadata/base/etc/docUtil",
        "dojo/i18n!esri/dijit/metadata/nls/i18nBase"],
function(declare, lang, has, InputText, docUtil, i18nBase) {

  var oThisClass = declare([InputText], {
    DEFAULT_DECIMAL_PLACE: 2,

    postCreate: function() {
      this.inherited(arguments);
    },

    postMixInProperties: function() {
      this.inherited(arguments);
    },
    
    getInputValue: function() {
      var val = this.inherited(arguments);
      var valSplit = val.split(/ |,/).filter(v => v && v.length>0);
      
      if (!valSplit || valSplit.length!=2) {
        return null;
      }
      
      for (var i=0; i<valSplit.length; i++) {
        var val = valSplit[i];
        if (Number.isNaN(Number.parseFloat(val))) {
          return null;
        }
      }
      
      return valSplit.join(" ");
    }
  });

  return oThisClass;
});